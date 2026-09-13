import settings from './acoustics.json';
/** Crossfade room tails instead of replacing a sounding impulse response. */
export class RoomAcoustics {
  readonly input:GainNode;
  private branches:{convolver:ConvolverNode;gain:GainNode}[];
  private cache=new Map<string,AudioBuffer>();
  private active=0;
  private context:AudioContext;
  constructor(context:AudioContext,output:AudioNode){
    this.context=context;this.input=context.createGain();this.input.connect(output);
    this.branches=[0,1].map(()=>{const convolver=context.createConvolver(),gain=context.createGain();gain.gain.value=0;convolver.normalize=false;this.input.connect(convolver).connect(gain).connect(output);return{convolver,gain};});
  }
  setRoom(room:string){
    const cfg=settings.rooms[room as keyof typeof settings.rooms]??settings.rooms.duty,c=this.context;
    let buffer=this.cache.get(room);
    if(!buffer){
      buffer=c.createBuffer(2,Math.ceil(c.sampleRate*cfg.rt60),c.sampleRate);
      const alpha=1-Math.exp(-2*Math.PI*cfg.damp/c.sampleRate);
      for(let ch=0;ch<2;ch++){const samples=buffer.getChannelData(ch);let low=0;
        for(let i=0;i<samples.length;i++){low+=alpha*(Math.random()*2-1-low);samples[i]=low*Math.exp(-Math.log(1000)*i/(c.sampleRate*cfg.rt60))*.08;}
      }
      this.cache.set(room,buffer);
    }
    const now=c.currentTime,old=this.branches[this.active],next=this.branches[1-this.active];
    old.gain.gain.cancelScheduledValues(now);old.gain.gain.setTargetAtTime(0,now,.06);
    next.gain.gain.cancelScheduledValues(now);next.gain.gain.setValueAtTime(0,now);next.convolver.buffer=buffer;next.gain.gain.linearRampToValueAtTime(cfg.wet,now+.25);this.active=1-this.active;
  }
  dispose(){this.input.disconnect();this.branches.forEach(b=>{b.convolver.disconnect();b.gain.disconnect();});this.cache.clear();}
}
