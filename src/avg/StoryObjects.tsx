import { useId, useState } from "react";
import { bootOrder, records, tokens, type TokenId } from "./story";
import { NativeObject } from "./NativeObject";
import { archiveDrawers, embeddedMusic } from "./sceneObjects";
import type { RoomId } from "./world";
import type { StorySave } from "./useStory";
import { contactItems } from "../data/siteContent";
import {TerminalStamp} from './exploration/TerminalStamp';
import { isPatchComplete } from './exploration/patching';
function Prop({ index }: { index: number }) {
  const clip = useId();
  const boxes = [
    [35, 65, 645, 670],
    [755, 20, 365, 760],
    [65, 775, 295, 435],
    [370, 825, 290, 388],
    [715, 798, 510, 430],
  ];
  const [x, y, w, h] = boxes[index];
  return (
    <svg
      aria-hidden="true"
      className="prop-art"
      viewBox={boxes[index].join(" ")}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <clipPath id={clip}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <image
        clipPath={`url(#${clip})`}
        href="./media/avg/room-props.webp"
        width="1254"
        height="1254"
      />
    </svg>
  );
}
export function StoryObjects({
  room,
  dark,
  toggleLamp,
  onOpen,
  collect,
  keys,
  playing = false,
}: {
  room: RoomId;
  dark: boolean;
  toggleLamp: () => void;
  onOpen: (id: string) => void;
  collect: (id: TokenId) => void;
  keys: TokenId[];
  playing?: boolean;
}) {
  return (
    <div className="physical-objects">
      {room === "lounge" && (
        <>
          <button
            className="physical lamp-switch"
            aria-label={dark ? "打开台灯" : "关闭台灯"}
            onClick={toggleLamp}
          >
            <span className="pull-cord" />
            <i />
          </button>
          {dark && (
            <button
              className="uv-mark"
              onClick={() => collect("dark")}
              aria-label="拾取检修印记"
            >
              ☾<small>00</small>
            </button>
          )}
          <NativeObject
            region={embeddedMusic}
            source="lounge"
            onOpen={onOpen}
            active={playing}
          />
          <button
            className="trophy-shelf"
            onClick={() => onOpen("collection")}
            aria-label="查看奖杯与纪念物"
          >
            {["clickdown", "anchored-gaze"].map((id, i) => (
              <span
                key={id}
                className={keys.includes(id as TokenId) ? "earned" : ""}
              >
                <Prop index={i ? 3 : 2} />
              </span>
            ))}
          </button>
        </>
      )}
      {room === "archive" &&
        archiveDrawers.map((region) => (
          <NativeObject key={region.id} region={region} onOpen={onOpen} />
        ))}
      {room === "lab" && (
        <>
          <button
            className="physical lab-reel"
            aria-label="检查启动接线板"
            onClick={() => onOpen("recovery")}
          >
            <span className="native-label">检查启动接线板</span>
          </button>
          <button
            className="physical lab-paper"
            aria-label="阅读应答测试"
            onClick={() => onOpen("record:birth")}
          >
            <span className="native-label">阅读应答测试</span>
          </button>
        </>
      )}
    </div>
  );
}
export function ArchiveRecord({
  id,
  collect,
  readBefore=false,
}: {
  id: string;
  collect: (id: TokenId) => void;
  readBefore?:boolean;
}) {
  const record = records.find((r) => r.id === id);
  if (!record) return null;
  return (
    <article className={`artifact-document ${record.skin} ${readBefore?'read-before':''}`}>
      <div className="document-stamp">{record.stamp}</div>
      <h3>{record.title}</h3>
      {record.text.map((text, i) => (
        <p key={text} style={{ animationDelay: `${i * 90}ms` }}>
          {text}
        </p>
      ))}
      {id === "postcard" && (
        <div className="postcard-links">
          {contactItems
            .filter((c) => ["video", "radio"].includes(c.kind))
            .map((c) => (
              <a
                key={c.kind}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => collect("visitor")}
              >
                {c.label} ↗
              </a>
            ))}
        </div>
      )}
      <footer>
        MW / {String(records.indexOf(record) + 1).padStart(3, "0")}
        <span>KEEP THIS SIDE UP</span>
      </footer>
    </article>
  );
}
export function KeyConsole({
  save,
  onEnter,
  onReact,
  slots,
  onChange,
  onFailed,
}: {
  save: StorySave;
  onEnter: () => void;
  onReact: (text: string) => void;
  slots:TokenId[];
  onChange:(slots:TokenId[])=>void;
  onFailed?:()=>void;
}) {
  const [error, setError] = useState("");
  return (
    <div className="key-console" data-patch-count={slots.length} data-powered={save.unlocked}>
      <p>{save.unlocked?'放映机已经接通。回到房间，从右侧的门继续走。':'把记得的事，按它诞生的顺序放回去。'}</p>
      <div className="memory-thread" aria-hidden="true">从第一次回应，到灯亮起来</div>
      <div className="memory-sockets">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            aria-label={`第${i + 1}个记忆插槽${slots[i] ? "，点击取回" : ""}`}
            disabled={save.unlocked||!slots[i]}
            onClick={() => {onChange(slots.filter((_,j)=>j!==i));setError('');}}
          >
            <TerminalStamp/><small>{["一","二","三","四","五"][i]}</small>
            <strong>
              {tokens.find((t) => t.id === slots[i])?.icon || "·"}
            </strong>
          </button>
        ))}
      </div>
      <div className="memory-tokens">
        {tokens.map((t) => (
          <button
            key={t.id}
            disabled={save.unlocked || !save.keys.includes(t.id) || slots.includes(t.id)}
            onClick={() => {
              onChange([...slots, t.id]);
              setError("");
            }}
          >
            {save.keys.includes(t.id)&&<TerminalStamp/>}<span>{save.keys.includes(t.id) ? t.icon : "?"}</span>
            <strong>{save.keys.includes(t.id) ? t.name : "未找到"}</strong>
            <small>{save.keys.includes(t.id)?t.hint:"还有一件小东西，留在房间里。"}</small>
          </button>
        ))}
      </div>
      <button
        className="boot-memory"
        disabled={save.unlocked}
        onClick={() => {
          if (!isPatchComplete(slots,bootOrder)) {
            setError("顺序未匹配。启动流程的旧纸在左侧小柜最下层。");
            onReact("对。接不上。这非常好。我们可以把它忘掉。");
            onFailed?.();
            return;
          }
          onEnter();
        }}
      >
        让记忆亮起来
      </button>
      <p role="status">{error}</p>
    </div>
  );
}
