import type { Speech } from '../world';

export interface CompanionPresentationInput {
  speech: Speech;
  visible: boolean;
  dragging: boolean;
  settling: boolean;
  adjust: boolean;
  corrupt: boolean;
  listening: boolean;
  musicFocused?:boolean;
  listeningPose?:string;
  remembering?:boolean;
  resting: boolean;
  depth: number;
  scenePose?: string;
}

/** Dialogue expressions expire with the dialogue; physical and film states are independent. */
export function resolveCompanionPresentation(input: CompanionPresentationInput): { pose: string; index: number; motion: string; gesture?: string } {
  const { speech, visible, dragging, settling, adjust, corrupt, listening, resting, depth } = input;
  const neutral = { pose: resting ? 'sleep' : 'idle', index: resting ? 11 : 8, motion: 'idle' };
  if (corrupt) return { pose: depth >= 3 ? 'breakdown' : 'guard', index: speech.face === 19 ? 19 : 18, motion: speech.motion };
  if (dragging) return { pose: 'carried', index: 12, motion: 'idle' };
  if (settling) return { pose: 'landing', index: 8, motion: 'idle' };
  if (adjust) return { pose: 'sizing', index: 8, motion: 'idle' };
  const musicPose=input.listeningPose??'music';
  const musicPresentation=musicPose==='music'?{pose:'music',index:16,motion:'idle'}:{pose:musicPose,gesture:musicPose,index:8,motion:'idle'};
  if(listening&&input.musicFocused&&!input.remembering&&(!visible||speech.priority!=='immediate'))return musicPresentation;
  if (visible && speech.pose) return { pose: speech.pose, gesture: speech.pose, index: 8, motion: 'idle' };
  if(input.remembering)return {pose:'listen',gesture:'listen',index:8,motion:'idle'};
  if (listening) return musicPresentation;
  if (!visible && input.scenePose) return {pose:input.scenePose,gesture:input.scenePose,index:8,motion:'idle'};
  if (!visible) return neutral;
  return {
    pose: speech.face >= 12 ? 'cower' : speech.motion === 'point' ? 'explain' : 'talk',
    index: speech.face === 12 ? 17 : speech.face,
    motion: speech.motion,
  };
}
