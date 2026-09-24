export type TextTone = 'wave'|'shake'|'warm'|'cold'|'whisper'|'glitch'|'heavy';
export type LivingGlyph = {char:string;tone?:TextTone;delayMs:number};

const tones = new Set<TextTone>(['wave','shake','warm','cold','whisper','glitch','heavy']);
const tag = /\{(\/?(?:wave|shake|warm|cold|whisper|glitch|heavy)|pause:(?:xs|\d+(?:\.\d+)?s))\}/g;

/** Parses authored speech without interpreting markup as HTML or showing tags to players. */
export function parseLivingText(source:string):{plain:string;glyphs:LivingGlyph[]} {
  const glyphs:LivingGlyph[]=[];
  const stack:TextTone[]=[];
  let offset=0,delayMs=0;
  const append=(part:string)=>{
    for(const char of Array.from(part)){
      glyphs.push({char,tone:stack.at(-1),delayMs});
      delayMs+=14;
    }
  };
  for(const match of source.matchAll(tag)){
    const index=match.index??0;
    append(source.slice(offset,index));
    const token=match[1];
    if(token.startsWith('pause:')) delayMs+=token==='pause:xs'?260:Math.min(1600,Number(token.slice(6,-1))*1000);
    else if(token.startsWith('/')){
      const i=stack.lastIndexOf(token.slice(1) as TextTone);
      if(i>=0)stack.splice(i,1);
    } else if(tones.has(token as TextTone))stack.push(token as TextTone);
    offset=index+match[0].length;
  }
  append(source.slice(offset));
  return {plain:glyphs.map(g=>g.char).join(''),glyphs};
}
