import { useEffect, useRef, useState } from "react";
import { listeningOrder, tracks } from "./story";
import keepsake from "./reel-keepsake.json";
export function useMusicBox(onHeard: (id: string) => void) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [encoreUnlocked,setEncoreUnlocked]=useState(()=>{try{return localStorage.getItem(keepsake.storage)==='true';}catch{return false;}});
  const [library,setLibrary]=useState(()=>{try{return localStorage.getItem(keepsake.storage)==='true'?[...tracks,keepsake.track]:tracks;}catch{return tracks;}});
  const [selected, setSelected] = useState(tracks[0].id);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration,setDuration]=useState(0),[rate,setRate]=useState(1);
  const opening=useRef({eligible:true,last:0,seconds:0});
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const urls = useRef<string[]>([]);
  const heard = useRef(false);
  const callback = useRef(onHeard);
  callback.current = onHeard;
  useEffect(() => {
    const element = new Audio();
    const ownedUrls = urls.current;
    element.preload = "metadata";
    audio.current = element;
    const changed = () => setPlaying(!element.paused);
    const failure = () => {
      setError("这段声音暂时无法播放。可以重试或导入音频。");
      setPlaying(false);
    };
    const time = () => {
      setElapsed(element.currentTime);
      const progress=opening.current,delta=element.currentTime-progress.last;
      if(!element.paused&&delta>0&&delta<1.5)progress.seconds+=delta/element.playbackRate;
      progress.last=element.currentTime;
      if (!heard.current && progress.eligible && progress.seconds >= 2 && !element.paused) {
        heard.current = true;
        callback.current(element.dataset.track || "");
      }
    };
    const metadata=()=>setDuration(Number.isFinite(element.duration)?element.duration:0);
    element.addEventListener("loadedmetadata",metadata);
    element.addEventListener("durationchange",metadata);
    element.addEventListener("emptied",()=>setDuration(0));
    element.addEventListener("play", changed);
    element.addEventListener("pause", changed);
    element.addEventListener("ended", changed);
    element.addEventListener("error", failure);
    element.addEventListener("timeupdate", time);
    element.src=tracks[0].src;
    element.dataset.track=tracks[0].id;
    return () => {
      element.pause();
      element.removeAttribute("src");
      element.load();
      audio.current = null;
      ownedUrls.forEach(URL.revokeObjectURL);
    };
  }, []);
  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);
  const play = async (id: string, restart = false) => {
    if (locked) return;
    const track = library.find((t) => t.id === id);
    if (!track || !audio.current) return;
    const el = audio.current;
    setError("");
    setSelected(id);
    if (el.dataset.track !== id || restart) {
      el.src = track.src;
      el.dataset.track = id;
      heard.current = false;
      opening.current={eligible:true,last:0,seconds:0};
      setDuration(0);setElapsed(0);
    }
    el.playbackRate=rate;
    el.loop = false;
    try {
      await el.play();
    } catch {
      setError("点一下播放，让浏览器接通声音。");
    }
  };
  const pause = () => {
    if (!locked) audio.current?.pause();
  };
  const importFiles = (files: FileList | null) => {
    if (locked || !files) return;
    const valid = Array.from(files).filter(
      (f) =>
        f.type.startsWith("audio/") ||
        /\.(mp3|wav|ogg|m4a|flac)$/i.test(f.name),
    );
    const items = valid.map((f) => {
      const src = URL.createObjectURL(f);
      urls.current.push(src);
      return {
        id: "import-" + crypto.randomUUID(),
        title: f.name,
        credit: "本机导入 · 不上传",
        src,
      };
    });
    setLibrary((v) => [...v, ...items]);
    if (!items.length) setError("请选择浏览器支持的音频文件。");
  };
  const enterHidden = async () => {
    setLocked(true);
    setVolume((v) => Math.max(0.35, v));
    const chosen = library.find((t) => /childishly fresh eyes/i.test(t.title));
    const el = audio.current;
    if (!el) return;
    el.pause();
    el.src = chosen?.src || "./music/childishly-fresh-eyes.mp3";
    el.dataset.track = "hidden";
    el.playbackRate=1;
    el.loop = true;
    setSelected("hidden");
    setError("");
    try {
      await el.play();
    } catch {
      setError("隐藏音轨尚未接通。可以继续探索。");
    }
  };
  const release = () => {
    audio.current?.pause();
    if (audio.current) audio.current.loop = false;
    setLocked(false);
    if (selected === "hidden") setSelected(library[0].id);
  };
  return {
    audio,
    library,encoreUnlocked,
    unlockEncore:(persist=true)=>{setEncoreUnlocked(true);setLibrary(v=>v.some(t=>t.id===keepsake.track.id)?v:[...v,keepsake.track]);if(persist)try{localStorage.setItem(keepsake.storage,'true');}catch{/* Session unlock remains available. */}},
    selected,
    playing,
    elapsed,
    duration,rate,
    setRate:(value:number)=>{if(locked||!Number.isFinite(value))return;const next=Math.min(2,Math.max(.5,value));setRate(next);if(audio.current)audio.current.playbackRate=next;},
    seek:(value:number)=>{const el=audio.current;if(locked||!el||!Number.isFinite(value)||!Number.isFinite(el.duration))return;const next=Math.max(0,Math.min(value,el.duration));el.currentTime=next;setElapsed(next);opening.current={eligible:next<.05,last:next,seconds:0};},
    error,
    locked,
    volume,
    setVolume,
    play,
    select: (id: string) => {
      const track = library.find(t => t.id === id);
      if (locked || !track) return;
      const element = audio.current;
      element?.pause();
      if (element && element.dataset.track !== id) {
        element.src = track.src;
        element.dataset.track = id;
        heard.current = false;
        opening.current={eligible:true,last:0,seconds:0};
        setDuration(0);setElapsed(0);
      }
      setSelected(id);
    },
    pause,
    importFiles,
    enterHidden,
    lockSilently:()=>{audio.current?.pause();setLocked(true);setError('');},
    release,
  };
}
export type MusicController = ReturnType<typeof useMusicBox>;
export function MusicBox({ music }: { music: MusicController }) {
  const current = music.library.find((t) => t.id === music.selected);
  return (
    <div className={`music-machine ${music.playing ? "playing" : ""}`}>
      <div className="music-lid">
        <span>MW AUDIO / PERSONAL SELECTION</span>
      </div>
      <div className="turntable">
        <div className="record">
          <i>m·w</i>
        </div>
        <div className="tonearm" />
        <div className="equalizer">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${i * 0.11}s` }} />
          ))}
        </div>
      </div>
      <div className="music-display">
        <small>{music.locked ? "SOURCE OVERRIDE" : "NOW PLAYING"}</small>
        <strong>
          {music.locked
            ? "Childishly fresh eyes"
            : current?.title || "选择一段声音"}
        </strong>
        <output aria-label="音乐播放时间">
          {Math.floor(music.elapsed / 60)}:
          {String(Math.floor(music.elapsed % 60)).padStart(2, "0")}
        </output>
      </div>
      <div className="music-controls">
        <button
          disabled={music.locked}
          onClick={() =>
            music.playing ? music.pause() : void music.play(music.selected)
          }
        >
          {music.playing ? "Ⅱ 暂停" : "▶ 播放"}
        </button>
        <label>
          音量
          <input
            aria-label="音乐盒音量"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={music.volume}
            disabled={music.locked}
            onChange={(e) => music.setVolume(Number(e.target.value))}
          />
        </label>
        <label className="import-music">
          ＋ 导入
          <input
            type="file"
            accept="audio/*,.mp3,.ogg,.wav,.flac,.m4a"
            multiple
            disabled={music.locked}
            onChange={(e) => music.importFiles(e.target.files)}
          />
        </label>
      </div>
      <ol className="track-list">
        {music.library.map((t, i) => (
          <li key={t.id}>
            <button
              aria-current={t.id === music.selected ? "true" : undefined}
              disabled={music.locked}
              onClick={() => void music.play(t.id, true)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>
                {t.title}
                <small>{t.credit}</small>
              </strong>
              <i>{t.id === music.selected && music.playing ? "♫" : "▷"}</i>
            </button>
          </li>
        ))}
      </ol>
      {music.error && <p role="status">{music.error}</p>}
      <small className="music-note">
        导入的音频只在本次浏览器会话中使用，不会上传。曲序卡在档案柜里。
      </small>
    </div>
  );
}
export function checkListening(history: string[], next: string) {
  const sequence = [...history, next].slice(-listeningOrder.length);
  return {
    sequence,
    complete: sequence.join("|") === listeningOrder.join("|"),
  };
}
