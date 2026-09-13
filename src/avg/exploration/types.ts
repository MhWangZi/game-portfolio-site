import type { Action, RoomId } from '../world';
import type { TokenId } from '../story';

/** All positions are percentages of the unscaled illustration. */
export type Point = [number, number];
export type WorldAction = Action | { type: 'collect'; id: TokenId } | { type: 'hidden' } | {type:'event';id:string} | {type:'cabinet'};
export type SceneObject = {
  id: string;
  label: string;
  polygon: Point[];
  approach: Point;
  action: WorldAction;
  depth?: number;
  kind?: 'door' | 'drawer' | 'phone' | 'lamp' | 'screen' | 'item';
  when?: 'dark';
};
export type SceneDefinition = {
  id: RoomId;
  image: string;
  spawn: Point;
  floor: Point[];
  obstacles: Point[][];
  objects: SceneObject[];
  foreground?: { id: string; polygon: Point[]; depth: number }[];
  arrivals?: Partial<Record<RoomId, Point>>;
  tint: string;
  sound: number;
};
