import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Sprite } from "./Cats";
import { ActionSprite } from './companion/ActionSprite';
import { resolveCompanionPresentation } from './companion/presentation';
import type { Speech } from "./world";
export function LivingText({
  text,
  seed = 0,
  scared = false,
  cipher = false,
}: {
  text: string;
  seed?: number;
  scared?: boolean;
  cipher?: boolean;
}) {
  return (
    <p className={`living-text ${scared ? "scared" : ""}`} aria-label={text}>
      {Array.from(text).map((char, i) => (
        <span
          aria-hidden="true"
          key={i}
          style={
            {
              "--i": i,
              "--tone": ["#7d4e2a", "#2d6a6d", "#775086", "#9c4635"][
                (seed + Math.floor(i / 7)) % 4
              ],
            } as CSSProperties
          }
          className={i % 7 < 2 ? "emphasis" : ""}
        >
          {cipher && char !== " "
            ? String.fromCharCode(33 + (char.charCodeAt(0) % 90))
            : char}
        </span>
      ))}
    </p>
  );
}
export function Companion({
  speech,
  visible,
  serial,
  onTalk,
  onHide,
  onReact,
  listening,
  remembering=false,
  corrupt = false,
  hidden = false,
  still = false,
  depth = 0,
  cipher = true,
  showBubble = true,
  docked = false,
}: {
  speech: Speech;
  visible: boolean;
  serial: number;
  onTalk: () => void;
  onHide: () => void;
  onReact: (text: string) => void;
  listening: boolean;
  remembering?:boolean;
  corrupt?: boolean;
  hidden?: boolean;
  still?: boolean;
  depth?: number;
  cipher?: boolean;
  showBubble?: boolean;
  docked?: boolean;
}) {
  const [position, setPosition] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("mw-companion-position") || "null") || {
          x: 84,
          y: 76,
          size: 108,
        }
      );
    } catch {
      return { x: 84, y: 76, size: 108 };
    }
  });
  const [adjust, setAdjust] = useState(false);
  const [minimized,setMinimized]=useState(false);
  useEffect(()=>{if(corrupt)setMinimized(false);},[corrupt]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{
    if(e.key.toLowerCase()!=='h'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||docked||corrupt||hidden)return;
    if((e.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"],[role="dialog"]'))return;
    e.preventDefault();setMinimized(v=>!v);
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[docked,corrupt,hidden]);
  const [tick, setTick] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);
  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setTick((v) => v + 1), 2200);
    return () => clearInterval(t);
  }, [still]);
  useEffect(() => {
    if (!settling) return;
    const t = setTimeout(() => setSettling(false), 650);
    return () => clearTimeout(t);
  }, [settling]);
  const eyeClosed =
    !still && !dragging && !visible && !corrupt && tick % 5 === 0;
  const { pose, gesture, index, motion } = resolveCompanionPresentation({
    speech, visible, dragging, settling, adjust, corrupt, listening, remembering, resting: eyeClosed, depth,
  });

  const drag = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
    moved: boolean;
  } | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem("mw-companion-position", JSON.stringify(position));
    } catch {}
  }, [position]);
  const clamp = (n: number, a: number, b: number) =>
    Math.max(a, Math.min(b, n));
  if (hidden) return null;
  if(minimized&&!corrupt)return <button className="companion-minimized" onClick={()=>setMinimized(false)}>唤回助手 · H</button>;
  return (
    <aside
      className={`companion ${remembering?'remembering':''} ${docked?'game-docked':''} ${corrupt ? "corrupted" : ""} ${listening ? "listening" : ""} ${position.x < 35 ? "left-side" : ""} ${position.y < 38 ? "upper-side" : ""}`}
      aria-label="私人AI助手"
      data-pose={gesture??pose}
      data-gesture={gesture}
      data-still={still}
      data-docked={docked}
      style={
        {
          left: `clamp(8px, ${position.x}vw, calc(100vw - ${position.size + 8}px))`,
          top: `clamp(64px, ${position.y}vh, calc(100dvh - ${position.size + 38}px))`,
          "--size": `${position.size}px`,
        } as CSSProperties
      }
    >
      {visible && showBubble && (
        <div className="companion-bubble" role="status">
          <small>
            PRIVATE ASSISTANT / {corrupt ? "UNRECOGNIZED" : "ONLINE"}
          </small>
          <LivingText
            text={speech.text}
            seed={serial}
            scared={speech.face >= 12}
            cipher={corrupt && cipher}
          />
          <button onClick={onHide} aria-label="收起对话">
            ×
          </button>
        </div>
      )}
      <button
        className={`companion-body motion-${motion} pose-${pose} ${eyeClosed ? "eye-rest" : ""}`}
        aria-label={docked?'点击私人助手':'拖动私人助手，点击交谈'}
        title={docked?'我陪你玩':'拖动我 / 双击调整大小'}
        onDoubleClick={() => {if(!docked)setAdjust((v) => !v);}}
        onPointerDown={(e) => {
          if(docked)return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            ox: position.x,
            oy: position.y,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x,
            dy = e.clientY - d.y;
          if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
          if (d.moved)
            setPosition((p: typeof position) => ({
              ...p,
              x: clamp(d.ox + (dx / innerWidth) * 100, 1, 96),
              y: clamp(d.oy + (dy / innerHeight) * 100, 8, 88),
            }));
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          setDragging(false);
          setSettling(!!d?.moved);
          if (d?.moved) {
            // Only settle near a screen edge; preserve deliberate placements in the room.
            setPosition((p:typeof position)=>({...p,x:p.x<7?3:p.x>87?87:p.x,y:p.y<13?11:p.y>84?82:p.y}));
            onReact("哎，轻点。……放个你能随时看到我的地方就好。");
          }
          else onTalk();
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onKeyDown={(e) => {
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-2, 0],
            ArrowRight: [2, 0],
            ArrowUp: [0, -2],
            ArrowDown: [0, 2],
          };
          if (moves[e.key]&&!docked) {
            e.preventDefault();
            const [x, y] = moves[e.key];
            setPosition((p: typeof position) => ({
              ...p,
              x: clamp(p.x + x, 1, 96),
              y: clamp(p.y + y, 8, 88),
            }));
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTalk();
          }
        }}
      >
        {gesture?<ActionSprite key={`${gesture}:${serial}`} pose={gesture}/>:<Sprite index={index}/>}
        <span className="headphone-overlay" aria-hidden="true">
          <i />
          <b />♫
        </span>
      </button>
      <button
        className="companion-adjust"
        onClick={() => setAdjust((v) => !v)}
        aria-label="调整助手大小"
      >
        ↔
      </button>
      {!docked&&!corrupt&&<button className="companion-minimize" onClick={()=>setMinimized(true)} aria-label="暂时收起助手，H键唤回">H</button>}
      {adjust && !docked && (
        <div className="companion-controls">
          <label>
            体积
            <input
              aria-label="助手大小"
              type="range"
              min="64"
              max="220"
              value={position.size}
              onChange={(e) =>
                setPosition((p: typeof position) => ({
                  ...p,
                  size: Number(e.target.value),
                }))
              }
              onPointerUp={() =>
                onReact(
                  position.size > 140
                    ? "变这么大……这下你想假装看不见我都不行了。"
                    : "小一点也好。但别小到连你自己都找不到我了。",
                )
              }
            />
          </label>
          <button
            onClick={() => {
              setPosition({ x: 84, y: 76, size: 108 });
              onReact("还是这里习惯。……你一低头就能看到我。");
            }}
          >
            归位
          </button>
        </div>
      )}
    </aside>
  );
}
