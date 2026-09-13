const cache=new Map<string,Promise<void>>();
export function preloadSceneImage(src:string) {
  if(!cache.has(src))cache.set(src,new Promise<void>((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve();image.onerror=()=>{cache.delete(src);reject(Error('图像没有接通，请再试一次。'));};image.src=src;
  }));
  return cache.get(src)!;
}
