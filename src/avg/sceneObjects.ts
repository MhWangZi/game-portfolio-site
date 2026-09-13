import { records } from "./story";
import { works } from "../data/works";

// Percentages refer to the visible room, not the entire atlas. Edit placement here.
export type SceneRegion = {
  id: string;
  label: string;
  panel: string;
  x: number;
  y: number;
  w: number;
  h: number;
};
const files = [
  ...records.map((r) => ({ panel: `record:${r.id}`, label: r.title })),
  ...works.map((w) => ({ panel: `work:${w.id}`, label: w.title })),
  { panel: "manual", label: "助手使用说明" },
];
const columns = [
  { x: 0, w: 9.4 },
  { x: 9.5, w: 8.1 },
  { x: 17.9, w: 6.8 },
  { x: 24.8, w: 6.4 },
];
export const archiveDrawers: SceneRegion[] = files
  .slice(0, 16)
  .map((file, i) => {
    const column = i % 4,
      row = Math.floor(i / 4),
      c = columns[column];
    return {
      id: `drawer-${i}`,
      label: `打开第${i + 1}格档案：${file.label}`,
      panel: file.panel,
      x: c.x,
      y: 8 + column * 2.9 + row * 18.1,
      w: c.w,
      h: 15.4,
    };
  });
export const embeddedMusic: SceneRegion = {
  id: "music",
  label: "打开音乐盒",
  panel: "music",
  x: 50.5,
  y: 48,
  w: 7.5,
  h: 5.7,
};
