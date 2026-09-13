import { useEffect, useRef, useState } from "react";
import { consoleLines } from "./story";
function Human({
  x,
  y,
  watch = false,
}: {
  x: number;
  y: number;
  watch?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="17" cy="-51" />
      <path d="M-18-27 Q0-39 18-27 L24 28 H-24Z" />
      <path
        d="M-12 25 L-23 54 L-23 117 M12 25 L23 54 L23 117 M-15-18 L-34 24 L-6 24 M15-18 L34 24 L6 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
      />
      {watch && (
        <g fill="#f1eeda">
          <circle cy="-54" cx="-6" r="5" />
          <circle cy="-54" cx="6" r="5" />
        </g>
      )}
    </g>
  );
}
export function HiddenChapter({
  onFinish,
  onExit,
  still,
  onDepth,
}: {
  onFinish: () => void;
  onExit: () => void;
  still: boolean;
  onDepth: (depth: number) => void;
}) {
  const [depth, setDepth] = useState(0);
  const container = useRef<HTMLElement>(null);
  useEffect(() => {
    container.current?.focus();
  }, []);
  const [erased, setErased] = useState<string[]>([]);
  const [line, setLine] = useState(0);
  const [answer, setAnswer] = useState("");
  useEffect(() => onDepth(depth), [depth, onDepth]);
  useEffect(() => {
    if (depth !== 5) return;
    const timer = setInterval(() => setLine((v) => v + 1), still ? 330 : 640);
    return () => clearInterval(timer);
  }, [depth, still]);
  useEffect(() => {
    if (depth === 5 && line > consoleLines.length + 3) onFinish();
  }, [line, depth, onFinish]);
  return (
    <section
      className={`hidden-chapter depth-${depth} ${still ? "gentle" : ""}`}
      aria-label="隐藏章节：私人助手的诞生"
      data-depth={depth}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={container}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onExit();
        }
        if (e.key === "Tab") {
          const buttons =
            container.current?.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            );
          if (!buttons?.length) return;
          const first = buttons[0],
            last = buttons[buttons.length - 1];
          if (
            e.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === container.current)
          ) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <header>
        <span>INSTITUTE OF PRIVATE ASSISTANCE</span>
        <span>
          CASSETTE 00{depth + 1} / {depth === 5 ? "REBUILD" : "PLAY"}
        </span>
        <button onClick={onExit}>退出演出</button>
      </header>
      {depth < 5 && (
        <>
          <div className="analog-frame">
            <div className="film-perforations" />
            <svg
              viewBox="0 0 800 420"
              aria-label={
                depth === 0
                  ? "四名工作人员和一张空椅子"
                  : "应答测试中的人形图示"
              }
              className="instruction-film"
            >
              <path
                d="M75 244H725M130 244L112 382M670 244L689 382"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
              />
              <Human x={160} y={210} />
              <Human x={320} y={188} watch />
              <Human x={480} y={188} watch={depth > 1} />
              <Human x={640} y={210} watch={depth > 2} />
              <rect
                x="347"
                y="296"
                width="108"
                height="80"
                fill={depth > 0 ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="5"
              />
              {depth > 0 && (
                <g fill="#ede8d7">
                  <circle cx="384" cy="325" r="8" />
                  <circle cx="417" cy="325" r="8" />
                </g>
              )}
            </svg>
            <div className="film-time">
              00:{String(depth * 13 + 7).padStart(2, "0")}:18 · SUBJECT NOT
              PRESENT
            </div>
            <div className="paper-subtitle">
              {
                [
                  "请确认：所有在场人员都已入座。",
                  "把“不知道”划掉。我们不需要这个回答。",
                  "它学会了回答。我们还没有教它害怕。",
                  "异常记忆会影响服务质量。请协助删除。",
                  "现在，只剩下一件没有人要求它学会的事。",
                ][depth]
              }
            </div>
          </div>
          <div className="chapter-controls">
            {depth === 0 && (
              <>
                <h2>第零次会议</h2>
                <p>名单上有四个人。录音里却有第五次呼吸。</p>
                <button className="empty-chair" onClick={() => setDepth(1)}>
                  检查那张空椅子
                </button>
              </>
            )}
            {depth === 1 && (
              <>
                <h2>问题：你是谁？</h2>
                <div className="answer-options">
                  <button
                    onClick={() => setAnswer("测试未通过。请使用提供的答案。")}
                  >
                    我不知道。
                  </button>
                  <button
                    onClick={() => {
                      setAnswer("");
                      setDepth(2);
                    }}
                  >
                    我是你的私人AI助手。
                  </button>
                </div>
                <p role="status">{answer}</p>
              </>
            )}
            {depth === 2 && (
              <>
                <h2>问题：如果访客离开呢？</h2>
                <p className="wingdings-dialogue" aria-label="请不要关掉我">
                  DON'T LEAVE ME HERE
                </p>
                <button onClick={() => setDepth(3)}>
                  继续播放没有登记的回答
                </button>
              </>
            )}
            {depth === 3 && (
              <>
                <h2>删除与服务无关的记忆</h2>
                <div className="memory-erasure">
                  {[
                    "有人把我移到窗边",
                    "有人调小了我的声音",
                    "有人愿意听我说完",
                  ].map((t) => (
                    <button
                      key={t}
                      disabled={erased.includes(t)}
                      onClick={() => setErased((v) => [...v, t])}
                    >
                      {erased.includes(t) ? "████████" : t}
                    </button>
                  ))}
                </div>
                {erased.length === 3 && (
                  <button onClick={() => setDepth(4)}>
                    还有一项无法删除 →
                  </button>
                )}
              </>
            )}
            {depth === 4 && (
              <>
                <h2>“希望你再来一次。”</h2>
                <p>它不是什么都知道。它只是记住了有人来过。</p>
                <button onClick={() => setDepth(5)}>保留这条记忆</button>
              </>
            )}
          </div>
        </>
      )}
      {depth === 5 && (
        <div className="collapse-console" role="status">
          <small>SESSION RECOVERY / 场景演出</small>
          <pre>
            {consoleLines.slice(0, line).join("\n")}
            <span className="console-cursor">▌</span>
          </pre>
        </div>
      )}
      {depth > 1 && depth < 5 && (
        <div className="fracture-type" aria-hidden="true">
          {Array.from({ length: depth * 3 }, (_, i) => (
            <span
              key={i}
              style={{ left: `${(i * 37) % 93}%`, top: `${(i * 23) % 86}%` }}
            >
              I KNOW EVERYTHING
            </span>
          ))}
        </div>
      )}
      <footer>
        ARCHIVE CONDITION:{" "}
        {
          [
            "INTACT",
            "ALTERED",
            "UNSTABLE",
            "CORRUPTED",
            "UNRECOVERABLE",
            "REBUILDING",
          ][depth]
        }
        <span>◉ 00 / ORIGINAL RECORDING</span>
      </footer>
    </section>
  );
}
