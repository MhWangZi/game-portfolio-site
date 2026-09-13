import { useCallback, useEffect, useRef, useState } from "react";
import { storyStorage, tokens, type TokenId } from "./story";
export type StorySave = {
  keys: TokenId[];
  loops: number;
  playlistRead: boolean;
  unlocked: boolean;
};
const blank: StorySave = {
  keys: [],
  loops: 0,
  playlistRead: false,
  unlocked: false,
};
function read(): StorySave {
  try {
    const v = JSON.parse(localStorage.getItem(storyStorage) || "null");
    return v
      ? {
          keys: tokens.filter((t) => v.keys?.includes(t.id)).map((t) => t.id),
          loops: Math.max(0, Number(v.loops) || 0),
          playlistRead: v.playlistRead === true,
          unlocked: v.unlocked === true,
        }
      : blank;
  } catch {
    return blank;
  }
}
export function useStory() {
  const [save, setSave] = useState(read);
  const keys = useRef(save.keys);
  useEffect(() => {
    keys.current = save.keys;
  }, [save.keys]);
  const [award, setAward] = useState<TokenId | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(storyStorage, JSON.stringify(save));
    } catch {
      /* Session remains playable. */
    }
  }, [save]);
  useEffect(() => {
    if (!award) return;
    const timer = setTimeout(() => setAward(null), 4500);
    return () => clearTimeout(timer);
  }, [award]);
  const collect = useCallback((id: TokenId) => {
    if (keys.current.includes(id)) return;
    keys.current = [...keys.current, id];
    setSave((s) => (s.keys.includes(id) ? s : { ...s, keys: [...s.keys, id] }));
    setAward(id);
  }, []);
  const restart = useCallback(
    () => setSave((s) => ({ ...blank, loops: s.loops + 1 })),
    [],
  );
  return { save, setSave, collect, award, restart };
}
