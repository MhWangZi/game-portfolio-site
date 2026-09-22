import type { Foley } from './cinematicTypes';
import profiles from './room-sound.json';
import settings from './acoustics.json';
import feedback from './feedback.json';
import { RoomAcoustics } from './RoomAcoustics';
/** Original low-level room tone and physical Foley. No network samples. */
export class AtmosphereAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private roomGain: GainNode | null = null;
  private hissGain: GainNode | null = null;
  private loop: AudioBufferSourceNode | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private themeIndex = 0;
  private profile=profiles.duty;
  private roomFilter:BiquadFilterNode|null=null;
  private acoustics:RoomAcoustics|null=null;
  private room='duty';
  private doorEnvelope:{target:string;until:number}|null=null;
  enabled = true;
  tape = false;
  musicPlaying = false;
  private buffer(c: AudioContext, seconds: number, air=false) {
    const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
    const data = buffer.getChannelData(0); let low = 0;
    for (let i = 0; i < data.length; i++) { const white = Math.random() * 2 - 1; low = (low + .02 * white) / 1.02; data[i] = low * 4 + (air ? white*.16 : 0); }
    return buffer;
  }
  unlock() {
    if (!this.context) {
      const c = new AudioContext(); this.context = c;
      const master = c.createGain(); master.gain.value = this.enabled ? .55 : 0; master.connect(c.destination); this.master = master;
      this.acoustics=new RoomAcoustics(c,master);this.acoustics.setRoom(this.room);
      const source = c.createBufferSource(); source.buffer = this.buffer(c, 9, true); source.loop = true;
      const room = c.createGain(); room.gain.value = this.profile.gain; this.roomGain = room;
      const lowpass = c.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 570;
      this.roomFilter=lowpass;lowpass.frequency.value=this.profile.filter;
      const hiss = c.createGain(); hiss.gain.value = this.tape ? .23 : 0; this.hissGain = hiss;
      const band = c.createBiquadFilter(); band.type = 'highpass'; band.frequency.value = 1450;
      source.connect(lowpass).connect(room).connect(master); source.connect(band).connect(hiss).connect(master); source.start(); this.loop = source;
      // Widely spaced, soft original notes sit below the rain and disappear during the cassette.
      this.interval = setInterval(() => {
        if (!this.context || this.tape || this.musicPlaying || !this.enabled || document.hidden) return;
        const notes = this.profile.notes;
        this.note(notes[this.themeIndex++ % notes.length], .025, 3.2);
      }, 4200);
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }
  private note(frequency: number, volume: number, duration: number) {
    const c = this.context; if (!c || !this.master) return;
    const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = frequency;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(volume,t+.1); g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g).connect(this.master); o.start(t); o.stop(t+duration+.02);
  }
  setEnabled(enabled: boolean) { this.enabled = enabled; if (this.context) this.master?.gain.setTargetAtTime(enabled ? .55 : 0, this.context.currentTime, .25); }
  setRoom(room:string){this.room=room;this.acoustics?.setRoom(room);this.profile=profiles[room as keyof typeof profiles]??profiles.duty;this.themeIndex=0;if(this.context&&!(this.doorEnvelope?.target===room&&this.context.currentTime<this.doorEnvelope.until)){this.roomFilter?.frequency.setTargetAtTime(this.profile.filter,this.context.currentTime,.9);this.roomGain?.gain.setTargetAtTime(this.tape?.014:this.musicPlaying?this.profile.gain*.4:this.profile.gain,this.context.currentTime,.9);}}
  setTape(tape: boolean) { this.tape = tape; if (this.context) { this.hissGain?.gain.setTargetAtTime(tape ? .26 : 0, this.context.currentTime, 1.2); this.roomGain?.gain.setTargetAtTime(tape ? .014 : this.profile.gain, this.context.currentTime, .8); } }
  setMusic(playing: boolean) { this.musicPlaying=playing; if (this.context && !this.tape) this.roomGain?.gain.setTargetAtTime(playing ? this.profile.gain*.4 : this.profile.gain, this.context.currentTime, .7); }
  playDoor(material:string,durationMs:number,target:string,swapMs=durationMs/2) {
    this.unlock();const c=this.context;if(!c||!this.master||!this.enabled)return;
    const cfg=settings.doors[material as keyof typeof settings.doors]??settings.doors.wood;
    const out=this.acoustics?.input??this.master,now=c.currentTime,duration=Math.max(.18,durationMs/1000);
    const tone=(at:number,frequency:number,gain:number,length:number)=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(frequency,at);o.frequency.exponentialRampToValueAtTime(frequency*.55,at+length);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+length);o.connect(g).connect(out);o.start(at);o.stop(at+length+.01);o.onended=()=>{o.disconnect();g.disconnect();};};
    tone(now,cfg.latch,cfg.gain*.5,.07);
    const friction=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain(),length=duration*.65;
    friction.buffer=this.buffer(c,length);filter.type='bandpass';filter.Q.value=2;filter.frequency.setValueAtTime(cfg.hinge,now+.04);filter.frequency.linearRampToValueAtTime(cfg.hinge*1.8,now+length);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(cfg.gain*1.2,now+.08);g.gain.exponentialRampToValueAtTime(.0001,now+length);friction.connect(filter).connect(g).connect(out);friction.start(now+.04);friction.stop(now+length+.05);friction.onended=()=>{friction.disconnect();filter.disconnect();g.disconnect();};
    tone(now+duration*.72,cfg.impact,cfg.gain,.14);
    // Automate the existing rain bed across the visual cut, not a second unrelated loop.
    const profile=profiles[target as keyof typeof profiles]??profiles.duty;
    const swap=now+swapMs/1000,reveal=Math.min(feedback.door.revealMs/1000,duration-swapMs/1000),end=swap+reveal;
    this.doorEnvelope={target,until:end};
    const cutoff=this.roomFilter?.frequency,level=this.roomGain?.gain;
    if(cutoff){cutoff.cancelAndHoldAtTime(now);cutoff.exponentialRampToValueAtTime(feedback.door.muffledHz,swap);cutoff.exponentialRampToValueAtTime(profile.filter,end);}
    if(level){level.cancelAndHoldAtTime(now);level.linearRampToValueAtTime(level.value*.6,swap);level.linearRampToValueAtTime(this.tape?.014:this.musicPlaying?profile.gain*.4:profile.gain,end);}
  }
  playPurr(){
    this.unlock();const c=this.context;if(!c||!this.master||!this.enabled)return;
    const cfg=feedback.purr,t=c.currentTime;
    const voice=c.createOscillator(),pulse=c.createOscillator(),depth=c.createGain(),body=c.createGain(),low=c.createBiquadFilter(),envelope=c.createGain();
    voice.type='triangle';voice.frequency.value=cfg.frequency;pulse.frequency.value=cfg.pulseHz;depth.gain.value=.28;body.gain.value=.7;
    low.type='lowpass';low.frequency.value=cfg.lowpass;
    envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(cfg.gain,t+.16);envelope.gain.exponentialRampToValueAtTime(.0001,t+cfg.duration);
    pulse.connect(depth).connect(body.gain);voice.connect(body).connect(low).connect(envelope).connect(this.acoustics?.input??this.master);
    voice.start(t);pulse.start(t);voice.stop(t+cfg.duration);pulse.stop(t+cfg.duration);
    voice.onended=()=>{voice.disconnect();pulse.disconnect();depth.disconnect();body.disconnect();low.disconnect();envelope.disconnect();};
  }

  play(kind: Foley) {
    this.unlock(); const c = this.context; if (!c || !this.master || !this.enabled) return;
    const durations: Record<Foley, number> = {paper:.48,drawer:.58,door:.8,take:.25,insert:.65,switch:.13,wind:.95,cylinder:.6};
    const length = durations[kind], t = c.currentTime, source = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain();
    source.buffer = this.buffer(c,length); filter.type = 'bandpass'; filter.frequency.value = kind === 'paper' ? 2200 : kind === 'wind' ? 1400 : 450;
    gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(kind === 'paper' ? .35 : .25,t+.02); gain.gain.exponentialRampToValueAtTime(.0001,t+length);
    source.connect(filter).connect(gain).connect(this.acoustics?.input??this.master); source.start(); source.stop(t+length);
    if (['door','insert','switch','drawer','take'].includes(kind)) this.note(kind === 'door' ? 75 : 180,.055,.14);
    if (kind === 'wind' || kind === 'cylinder') for(let i=0;i<6;i++) {
      const o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=kind === 'wind' ? 1250 : 780;
      const start=t+i*.095; g.gain.setValueAtTime(.017,start); g.gain.exponentialRampToValueAtTime(.0001,start+.04); o.connect(g).connect(this.master); o.start(start); o.stop(start+.05);
    }
  }
  suspend() { if (this.context?.state === 'running') void this.context.suspend(); }
  dispose() { if(this.interval) clearInterval(this.interval); this.loop?.stop(); this.acoustics?.dispose(); if(this.context) void this.context.close(); }
}
