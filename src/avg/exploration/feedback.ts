export interface FeedbackRule {room:string;objects:string[];event:string;minVisits:number;orStateIncludes:string;point:number[];durationMs:number;visual:string;sound:string}
export function sceneFeedback(rules:FeedbackRule[],room:string,object:string,state:string,visits:Record<string,number>) {
  return rules.find(r=>r.room===room&&r.objects.includes(object)&&((visits[r.event]??0)+1>=r.minVisits||state.includes(r.orStateIncludes)));
}
export function guideFinished(config:{completionEvent:string;completionChoices:string[]},choices:Record<string,string[]>) {
  return config.completionChoices.some(choice=>choices[config.completionEvent]?.includes(choice));
}
