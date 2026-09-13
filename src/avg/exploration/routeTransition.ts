export interface RouteStyle {kind:string;duration:number;swap:number;material:string}
export function routeStyle(config:{default:RouteStyle;routes:(RouteStyle&{rooms:string[]})[]},from:string,to:string,still:boolean) {
  const route=config.routes.find(r=>r.rooms.includes(from)&&r.rooms.includes(to));
  const style=route??config.default;
  return {...style,direction:route?.rooms[0]===to?-1:1,duration:still?180:style.duration,swap:still?90:style.swap,kind:still?'still':style.kind};
}
