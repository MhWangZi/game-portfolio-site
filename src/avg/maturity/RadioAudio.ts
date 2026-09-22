import {signalStrength} from './model';
import config from './config.json';
/** Original synthesized reed melody and call signal. Each close releases this graph. */
export class RadioAudio {
 private ctx:AudioContext|null=null;
 private master:GainNode|null=null;
 private noise:AudioBufferSourceNode|null=null;
 private hiss:GainNode|null=null;
 private filter:BiquadFilterNode|null=null;
 private timer:ReturnType<typeof setInterval>|undefined;
 private voices=new Set<OscillatorNode>();
 private frequency=88;private beat=0;private enabled=true;
 start(){
  if(this.ctx){void this.ctx.resume();return;}
  const c=new AudioContext();this.ctx=c;const master=c.createGain();master.gain.value=this.enabled?.2:0;master.connect(c.destination);this.master=master;
  const buffer=c.createBuffer(1,c.sampleRate*3,c.sampleRate),data=buffer.getChannelData(0);let low=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;low=(low+.035*white)/1.035;data[i]=white*.25+low*2;}
  const source=c.createBufferSource();source.buffer=buffer;source.loop=true;const filter=c.createBiquadFilter();filter.type='bandpass';filter.Q.value=.65;
  const gain=c.createGain();source.connect(filter).connect(gain).connect(master);source.start();this.noise=source;this.filter=filter;this.hiss=gain;this.tune(this.frequency);
  this.timer=setInterval(()=>this.step(),340);void c.resume();
 }
 tune(f:number){this.frequency=f;const c=this.ctx;if(!c)return;const signal=Math.max(...config.radio.stations.map(s=>signalStrength(f,s.frequency,config.radio.tolerance)));this.filter?.frequency.setTargetAtTime(450+(f-88)*145,c.currentTime,.08);this.hiss?.gain.setTargetAtTime(.4*(1-signal)+.025,c.currentTime,.12);}
 enable(value:boolean){this.enabled=value;if(this.ctx)this.master?.gain.setTargetAtTime(value?.2:0,this.ctx.currentTime,.1);}
 suspend(){void this.ctx?.suspend();}
 resume(){if(this.ctx)void this.ctx.resume();}
 private step(){
  const c=this.ctx;if(!c||document.hidden||c.state!=='running'||!this.master)return;
  const jazz=signalStrength(this.frequency,98.6,config.radio.tolerance),call=signalStrength(this.frequency,92.4,config.radio.tolerance),n=this.beat++;
  const melody=[58,62,65,69,67,65,62,0,60,63,67,70,69,65,62,0,58,65,69,72,70,67,65,0,60,63,67,65,62,60,58,0];
  if(jazz>0&&melody[n%melody.length])this.note(440*2**((melody[n%melody.length]-69)/12),jazz*.35,n%3===0?.45:.27,true);
  if(jazz>0&&n%4===0)[46,53,57].forEach(m=>this.note(440*2**((m-69)/12),jazz*.05,1.25,false));
  if(call>0&&n%8!==7)this.note(720,call*.13,n%4===2?.24:.07,false);
 }
 private note(hz:number,gain:number,length:number,reed:boolean){
  const c=this.ctx;if(!c||!this.master)return;const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
  if(reed){const real=new Float32Array(12),imag=new Float32Array([0,1,.42,.32,.17,.12,.08,.05,.04,.02,.01,.008]);o.setPeriodicWave(c.createPeriodicWave(real,imag));}else o.type='sine';
  o.frequency.value=hz;o.frequency.setValueAtTime(hz*.988,c.currentTime);o.frequency.exponentialRampToValueAtTime(hz,c.currentTime+.055);f.type='lowpass';f.frequency.value=reed?1800:650;
  const t=c.currentTime;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.045);g.gain.exponentialRampToValueAtTime(.0001,t+length);
  o.connect(f).connect(g).connect(this.master);this.voices.add(o);o.onended=()=>{o.disconnect();f.disconnect();g.disconnect();this.voices.delete(o);};o.start();o.stop(t+length+.02);
 }
 dispose(){clearInterval(this.timer);this.noise?.stop();this.noise?.disconnect();for(const v of this.voices){try{v.stop();}catch{/* Already ended. */}v.disconnect();}this.voices.clear();this.filter?.disconnect();this.hiss?.disconnect();this.master?.disconnect();if(this.ctx)void this.ctx.close();this.ctx=null;}
}
