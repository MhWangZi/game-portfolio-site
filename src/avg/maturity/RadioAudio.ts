import {signalStrength} from './model';
import config from './config.json';

/** Recorded station material, mixed by frequency; no synthesized melody or generated static. */
export class RadioAudio {
  private ctx:AudioContext|null=null;
  private master:GainNode|null=null;
  private gains:Partial<Record<'static'|'call'|'jazz',GainNode>>={};
  private sources:AudioBufferSourceNode[]=[];
  private frequency=88;
  private enabled=true;
  private generation=0;
  start(){
    if(this.ctx){void this.ctx.resume();return;}
    const ctx=new AudioContext();this.ctx=ctx;
    const master=ctx.createGain();master.gain.value=this.enabled?.25:0;master.connect(ctx.destination);this.master=master;
    const tracks={static:'radio-static.ogg',call:'radio-call.ogg',jazz:'radio-jazz.ogg'} as const;
    const generation=++this.generation;
    for(const [kind,file] of Object.entries(tracks) as [keyof typeof tracks,string][]) {
      const gain=ctx.createGain();gain.gain.value=0;gain.connect(master);this.gains[kind]=gain;
      void fetch(`./media/game-sfx/${file}`).then(response=>{
        if(!response.ok)throw new Error(`Radio ${file}: ${response.status}`);
        return response.arrayBuffer();
      }).then(data=>ctx.decodeAudioData(data)).then(buffer=>{
        if(this.ctx!==ctx||generation!==this.generation||ctx.state==='closed')return;
        const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
        if(kind==='jazz'){
          const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;
          source.connect(filter).connect(gain);
        }else source.connect(gain);
        source.start();this.sources.push(source);this.tune(this.frequency);
      }).catch(error=>console.warn('Radio sample unavailable',file,error));
    }
    this.tune(this.frequency);void ctx.resume();
  }
  tune(frequency:number){
    this.frequency=frequency;const ctx=this.ctx;if(!ctx)return;
    const jazz=signalStrength(frequency,98.6,config.radio.tolerance);
    const call=signalStrength(frequency,92.4,config.radio.tolerance);
    this.gains.static?.gain.setTargetAtTime(.3*(1-Math.max(jazz,call))+.025,ctx.currentTime,.12);
    this.gains.jazz?.gain.setTargetAtTime(jazz*.75,ctx.currentTime,.18);
    this.gains.call?.gain.setTargetAtTime(call*.48,ctx.currentTime,.18);
  }
  enable(value:boolean){this.enabled=value;if(this.ctx)this.master?.gain.setTargetAtTime(value?.25:0,this.ctx.currentTime,.1);}
  suspend(){void this.ctx?.suspend();}
  resume(){if(this.ctx)void this.ctx.resume();}
  dispose(){
    this.generation++;
    for(const source of this.sources){try{source.stop();}catch{/* Already ended. */}source.disconnect();}
    this.sources=[];for(const gain of Object.values(this.gains))gain?.disconnect();this.gains={};
    this.master?.disconnect();if(this.ctx)void this.ctx.close();this.ctx=null;this.master=null;
  }
}
