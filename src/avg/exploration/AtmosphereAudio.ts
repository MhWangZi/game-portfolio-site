import type { Foley } from './cinematicTypes';
import profiles from './room-sound.json';
import settings from './acoustics.json';
import feedback from './feedback.json';
import samples from './audio-samples.json';
import { RoomAcoustics } from './RoomAcoustics';

/** Licensed recordings share one graph so room fades, muting and tab suspension stay in sync. */
export class AtmosphereAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private roomGain: GainNode | null = null;
  private hissGain: GainNode | null = null;
  private loop: AudioBufferSourceNode | null = null;
  private buffers = new Map<string, Promise<AudioBuffer>>();
  private profile = profiles.duty;
  private roomFilter: BiquadFilterNode | null = null;
  private acoustics: RoomAcoustics | null = null;
  private room = 'duty';
  private doorEnvelope: {target:string;until:number} | null = null;
  enabled = true;
  tape = false;
  musicPlaying = false;
  private dramaticSilence = false;
  private tension = 0;

  private level(profile = this.profile) { return profile.gain * 2.8 * (this.tension >= 3 ? .82 : 1); }
  private async load(file: string, context: AudioContext) {
    let request = this.buffers.get(file);
    if (!request) {
      request = fetch(`./media/game-sfx/${file}`)
        .then(response => { if (!response.ok) throw new Error(`Audio ${file}: ${response.status}`); return response.arrayBuffer(); })
        .then(data => context.decodeAudioData(data));
      this.buffers.set(file, request);
      void request.catch(() => this.buffers.delete(file));
    }
    return request;
  }
  private async playSample(file: string, volume: number, destination?: AudioNode) {
    const context = this.context;
    if (!context || !this.enabled) return;
    try {
      const buffer = await this.load(file, context);
      if (context !== this.context || context.state === 'closed' || !this.enabled) return;
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; gain.gain.value = volume;
      source.connect(gain).connect(destination ?? this.acoustics?.input ?? this.master!);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start();
    } catch (error) { console.warn('Sound sample unavailable', file, error); }
  }
  unlock() {
    if (!this.context) {
      const context = new AudioContext(); this.context = context;
      const master = context.createGain(); master.gain.value = this.enabled ? .55 : 0;
      master.connect(context.destination); this.master = master;
      this.acoustics = new RoomAcoustics(context, master); this.acoustics.setRoom(this.room);
      const room = context.createGain(); room.gain.value = this.level(); this.roomGain = room;
      const lowpass = context.createBiquadFilter(); lowpass.type = 'lowpass';
      lowpass.frequency.value = this.profile.filter; this.roomFilter = lowpass;
      const hiss = context.createGain(); hiss.gain.value = this.tape ? .11 : 0; this.hissGain = hiss;
      const band = context.createBiquadFilter(); band.type = 'highpass'; band.frequency.value = 1450;
      lowpass.connect(room).connect(master); band.connect(hiss).connect(master);
      // One continuous field recording is filtered by the current room and the tape path.
      void this.load(samples.rain, context).then(buffer => {
        if (this.context !== context || context.state === 'closed') return;
        const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
        source.connect(lowpass); source.connect(band); source.start(); this.loop = source;
      }).catch(error => console.warn('Rain recording unavailable', error));
      for (const file of Object.values(samples).filter((value): value is string => typeof value === 'string' && value !== samples.rain)) {
        void this.load(file, context).catch(() => undefined);
      }
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.context) this.master?.gain.setTargetAtTime(enabled && !this.dramaticSilence ? .55 : 0, this.context.currentTime, .25);
  }
  setRoom(room: string) {
    this.room = room; this.acoustics?.setRoom(room);
    this.profile = profiles[room as keyof typeof profiles] ?? profiles.duty;
    if (this.context && !(this.doorEnvelope?.target === room && this.context.currentTime < this.doorEnvelope.until)) {
      this.roomFilter?.frequency.setTargetAtTime(this.profile.filter, this.context.currentTime, .9);
      this.roomGain?.gain.setTargetAtTime(this.tape ? .015 : this.musicPlaying ? this.level() * .4 : this.level(), this.context.currentTime, .9);
    }
  }
  setTape(tape: boolean) {
    this.tape = tape;
    if (this.context) {
      this.hissGain?.gain.setTargetAtTime(tape ? .11 : 0, this.context.currentTime, 1.2);
      this.roomGain?.gain.setTargetAtTime(tape ? .015 : this.musicPlaying ? this.level() * .4 : this.level(), this.context.currentTime, .8);
    }
  }
  setMusic(playing: boolean) {
    this.musicPlaying = playing;
    if (this.context && !this.tape) this.roomGain?.gain.setTargetAtTime(playing ? this.level() * .4 : this.level(), this.context.currentTime, .7);
  }
  setTension(value: number) {
    this.tension = value;
    if (this.context && !this.tape) this.roomGain?.gain.setTargetAtTime(this.musicPlaying ? this.level() * .4 : this.level(), this.context.currentTime, 2);
  }
  setDramaticSilence(value: boolean) {
    this.dramaticSilence = value;
    if (this.context) this.master?.gain.setTargetAtTime(value ? 0 : this.enabled ? .55 : 0, this.context.currentTime, .12);
  }
  playDoor(material: string, durationMs: number, target: string, swapMs = durationMs / 2) {
    this.unlock(); const context = this.context;
    if (!context || !this.enabled) return;
    const cfg = settings.doors[material as keyof typeof settings.doors] ?? settings.doors.wood;
    const file = samples.doorMaterials[material as keyof typeof samples.doorMaterials] ?? samples.door;
    void this.playSample(file, Math.max(.22, cfg.gain * 3));
    const now = context.currentTime, duration = Math.max(.18, durationMs / 1000);
    const profile = profiles[target as keyof typeof profiles] ?? profiles.duty;
    const swap = now + swapMs / 1000;
    const reveal = Math.max(.01, Math.min(feedback.door.revealMs / 1000, duration - swapMs / 1000));
    const end = swap + reveal;
    this.doorEnvelope = {target, until:end};
    const cutoff = this.roomFilter?.frequency, level = this.roomGain?.gain;
    if (cutoff) {
      cutoff.cancelAndHoldAtTime(now);
      cutoff.exponentialRampToValueAtTime(feedback.door.muffledHz, swap);
      cutoff.exponentialRampToValueAtTime(profile.filter, end);
    }
    if (level) {
      level.cancelAndHoldAtTime(now);
      level.linearRampToValueAtTime(level.value * .6, swap);
      level.linearRampToValueAtTime(this.tape ? .015 : this.musicPlaying ? this.level(profile) * .4 : this.level(profile), end);
    }
  }
  playPurr() { this.unlock(); void this.playSample(samples.purr, .55); }
  playAchievement() { this.unlock(); void this.playSample(samples.achievement, .65, this.master ?? undefined); }
  play(kind: Foley) { this.unlock(); void this.playSample(samples[kind], kind === 'paper' ? .55 : .45); }
  suspend() { if (this.context?.state === 'running') void this.context.suspend(); }
  dispose() {
    try { this.loop?.stop(); } catch { /* The recording may still be loading. */ }
    this.loop?.disconnect(); this.acoustics?.dispose();
    this.roomFilter?.disconnect(); this.roomGain?.disconnect(); this.hissGain?.disconnect(); this.master?.disconnect();
    if (this.context) void this.context.close();
    this.context = null; this.loop = null; this.master = null; this.acoustics = null;
    this.buffers.clear();
  }
}
