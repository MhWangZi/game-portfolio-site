import { useCallback, useEffect, useRef, useState } from "react";
import type { GameId } from "./world";
export type GameStatus =
  "empty" | "shell" | "loading" | "ready" | "paused" | "error" | "exit";
type HostEvent = {
  channel: string;
  type: string;
  requestId?: string;
  message?: string;
  loaded?: number;
  total?: number;
  [key: string]: unknown;
};
const channel = "mhwangzi-avg-v1";
export function useGameHost(onEvent: (event: string) => void) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [game, setGame] = useState<GameId | null>(null);
  const [status, setStatus] = useState<GameStatus>("empty");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<HostEvent | null>(null);
  const pending = useRef(
    new Map<
      string,
      {
        resolve: () => void;
        reject: (error: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );
  const callback = useRef(onEvent);
  const shellSeen = useRef(false);
  useEffect(() => {
    callback.current = onEvent;
  }, [onEvent]);
  const command = useCallback(
    (action: "pause" | "resume" | "inspect") =>
      new Promise<void>((resolve, reject) => {
        const target = frame.current?.contentWindow;
        if (!target) {
          reject(new Error("游戏窗口尚未就绪"));
          return;
        }
        const requestId = crypto.randomUUID();
        const timer = setTimeout(() => {
          pending.current.delete(requestId);
          reject(new Error("游戏没有确认操作，请重试。"));
        }, 5000);
        pending.current.set(requestId, { resolve, reject, timer });
        target.postMessage({ channel, action, requestId }, location.origin);
      }),
    [],
  );
  useEffect(() => {
    const listener = (event: MessageEvent<HostEvent>) => {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== channel
      )
        return;
      const data = event.data;
      if (data.requestId) {
        const entry = pending.current.get(data.requestId);
        if (entry) {
          clearTimeout(entry.timer);
          pending.current.delete(data.requestId);
          if (data.type === "unavailable")
            entry.reject(new Error("游戏仍在载入"));
          else entry.resolve();
        }
      }
      if (
        data.type === "snapshot" ||
        data.type === "paused" ||
        data.type === "resumed"
      )
        setSnapshot(data);
      if (data.type === "shell-ready") {
        shellSeen.current = true;
        setStatus("shell");
      }
      if (data.type === "progress" && Number(data.total) > 0)
        setProgress(Math.min(1, Number(data.loaded) / Number(data.total)));
      if (["loading", "ready", "paused", "error", "exit"].includes(data.type))
        setStatus(data.type as GameStatus);
      if (data.type === "resumed") setStatus("ready");
      if (data.type === "error") setError(String(data.message || "加载失败"));
      if (
        ["loading", "ready", "exit", "error", "return-request"].includes(
          data.type,
        )
      )
        callback.current(data.type);
    };
    window.addEventListener("message", listener);
    const entries = pending.current;
    return () => {
      window.removeEventListener("message", listener);
      for (const entry of entries.values()) {
        clearTimeout(entry.timer);
        entry.reject(new Error("游戏窗口已关闭"));
      }
      entries.clear();
    };
  }, []);
  useEffect(() => {
    if (!game) return;
    const timer = setTimeout(() => {
      if (!shellSeen.current) {
        setError("游戏页面未能接通");
        setStatus("error");
        callback.current("error");
      }
    }, 20000);
    return () => clearTimeout(timer);
  }, [game]);
  const clear = useCallback(() => {
    shellSeen.current = false;
    setGame(null);
    setStatus("empty");
    setProgress(0);
    setError("");
    setSnapshot(null);
  }, []);
  const load = useCallback((id: GameId) => {
    shellSeen.current = false;
    setGame(id);
    setStatus("shell");
    setProgress(0);
    setError("");
    setSnapshot(null);
  }, []);
  return {
    frame,
    game,
    status,
    progress,
    error,
    snapshot,
    command,
    clear,
    load,
  };
}
