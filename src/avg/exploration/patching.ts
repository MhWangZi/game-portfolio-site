/** Preserve order, reject unknown/unowned/duplicate tokens when restoring a patch. */
export function sanitizePatch(value:unknown,owned:readonly string[]):string[] {
  return Array.isArray(value)?[...new Set(value.filter((id):id is string=>typeof id==='string'&&owned.includes(id)))].slice(0,5):[];
}
export function isPatchComplete(slots:readonly string[],order:readonly string[]) {
  return slots.length===order.length&&slots.every((id,i)=>id===order[i]);
}
export function patchStage(slots:readonly string[],powered:boolean) {return powered?'powered':slots.length?'standby':'idle';}
export const patchStorage='mw-projection-patch-v1';
