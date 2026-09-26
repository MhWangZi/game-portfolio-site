import type { Point, WorldAction } from './types';
import type { RoomId } from '../world';
export type Foley = 'paper' | 'drawer' | 'door' | 'take' | 'insert' | 'switch' | 'wind' | 'cylinder';
export type SceneTransition = {
  state?: string;
  trace?: string;
  sound?: Foley;
  speech?: string;
  response?: string;
  give?: string;
  remove?: string;
  action?: WorldAction;
  wait?: number;
  camera?: { x: number; y: number; scale: number; duration: number };
};
export type CinematicObject = {
  id: string; label: string; polygon: Point[];
  point?: Point;
  mobilePoint?: Point;
  states?: string[];
  requiresItem?: string;
  excludesItem?: string;
  transition: SceneTransition;
};
export type CinematicRoom = {
  id: RoomId;
  initial: string;
  variants: Record<string, string>;
  objects: CinematicObject[];
  stateWithItem?: Record<string, Record<string, string>>;
};
export type CinematicSave = { inventory: string[]; states: Partial<Record<RoomId, string>>; traces: string[]; sound: boolean };
export const cinematicStorage = 'mw-cinematic-rooms-v1';
export function commitTransition(save:CinematicSave, room:RoomId, transition:SceneTransition):CinematicSave {
  return {...save,states:transition.state?{...save.states,[room]:transition.state}:save.states,
    traces:transition.trace?[...new Set([...save.traces,transition.trace])]:save.traces,
    inventory:[...new Set([...save.inventory.filter(id=>id!==transition.remove),...(transition.give?[transition.give]:[])])]};
}
export function resolveSceneState(room:CinematicRoom, save:CinematicSave) {
  let state=save.states[room.id]??room.initial;
  if(!room.variants[state]) state=room.initial;
  for(const item of save.inventory) state=room.stateWithItem?.[item]?.[state]??state;
  return state;
}
export function readCinematic(): CinematicSave {
  try {
    const data = JSON.parse(localStorage.getItem(cinematicStorage) || 'null');
    if (data) return { inventory: Array.isArray(data.inventory) ? data.inventory.filter((s: unknown) => typeof s === 'string') : [], states: data.states && typeof data.states === 'object' ? data.states : {}, traces: Array.isArray(data.traces) ? data.traces.filter((s:unknown)=>typeof s==='string') : [], sound: data.sound !== false };
  } catch { /* The room also works without storage. */ }
  return { inventory: [], states: {}, traces: [], sound: true };
}
