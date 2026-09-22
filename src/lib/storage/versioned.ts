/** Storage failure never prevents the current session from continuing. */
export function readStored<T>(key:string, migrate:(value:unknown)=>T):T {
  try{return migrate(JSON.parse(localStorage.getItem(key)||'null'));}catch{return migrate(null);}
}
export function writeStored(key:string,value:unknown):boolean {
  try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}
}
