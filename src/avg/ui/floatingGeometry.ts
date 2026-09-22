export const fit = (value:number,min:number,max:number) => Math.max(min,Math.min(Math.max(min,max),value));
export function placeBubble(anchor:{left:number;top:number;width:number;height:number},box:{width:number;height:number},viewport:{width:number;height:number},margin=12,gap=18){
  const center=anchor.left+anchor.width/2;
  const left=fit(center-box.width/2,margin,viewport.width-box.width-margin);
  const above=anchor.top-gap-box.height;
  const below=anchor.top+anchor.height+gap;
  const side=above>=margin||anchor.top>viewport.height-anchor.top-anchor.height?'above':'below';
  return {left:left-anchor.left,top:fit(side==='above'?above:below,margin,viewport.height-box.height-margin)-anchor.top,tail:fit(center-left,22,box.width-22),side};
}
