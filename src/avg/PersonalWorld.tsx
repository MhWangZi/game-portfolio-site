import performance from './companion/performance.json';
import feedbackConfig from './exploration/feedback.json';
import {guideFinished} from './exploration/feedback';
import {TerminalStamp} from './exploration/TerminalStamp';
import keepsake from './reel-keepsake.json';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { rooms, dialogue, games, camera } from "./world";
import type { RoomId, Speech, GameId } from "./world";
import { CinematicScene } from "./exploration/CinematicScene";
import { cinematicRooms } from "./exploration/cinematicData";
import { readCinematic, cinematicStorage, commitTransition, resolveSceneState } from "./exploration/cinematicTypes";
import type { SceneTransition } from "./exploration/cinematicTypes";
import { AtmosphereAudio } from "./exploration/AtmosphereAudio";
import { MechanicalMusicBox } from "./exploration/MechanicalMusicBox";
import type { WorldAction } from "./exploration/types";
import { useGameHost } from "./useGameHost";
import { works } from "../data/works";
import { ContactBook } from './ContactBook';
import { ArchiveCabinet } from './exploration/ArchiveCabinet';

import { useStory } from "./useStory";
import { opening, warnings, tokens, storyStorage } from "./story";
import { Companion } from "./Companion";
import { useMusicBox, checkListening } from "./MusicBox";
import { ArchiveRecord, KeyConsole } from "./StoryObjects";
import { HiddenChapter } from "./HiddenProjection";
import { hiddenSpeech } from "./reel";
import { narrativeEvents } from "./narrative/data";
import { readNarrative, narrativeStorage, blankNarrative, beginEvent, advanceEvent, responseFor, recordResponse, resolveEventNode } from "./narrative/types";
import type { EventSession, ResponseSet } from "./narrative/types";
import interactionResponses from './narrative/interaction-responses.json';
import { NarrativeEventView } from "./narrative/NarrativeEventView";
import reactionData from './companion/reactions.json';
import { resolveReaction, markRecordClosed } from './companion/context';
import type { CompanionContext, ReactionRule } from './companion/context';
import { patchStorage, sanitizePatch, patchStage } from './exploration/patching';
import { bootOrder, type TokenId } from './story';
import "./immersive.css";
import "./continuation.css";
import "./exploration/cinematic.css";
import './material-interactions.css';
import routeConfig from './exploration/route-transitions.json';
import { routeStyle } from './exploration/routeTransition';
import { preloadSceneImage } from './exploration/sceneImages';
import './exploration/route-transitions.css';
import {BlueprintMap} from './exploration/BlueprintMap';
import './immersive-upgrade.css';

const storageKey = "mhwangzi-room-v1";
const SceneEditor = lazy(() => import("./exploration/SceneEditor"));
const thumbnail = (src: string) =>
  src
    .replace("/media/portfolio/", "/media/avg-archive/")
    .replace(/\.(png|jpe?g)$/i, ".webp");
type Save = { clues: number[]; unlocked: boolean; still: boolean };
const empty: Save = { clues: [], unlocked: false, still: false };
function readSave(): Save {
  try {
    const s = JSON.parse(localStorage.getItem(storageKey) || "null");
    return s
      ? {
          clues: [
            ...new Set<number>(
              (s.clues || []).filter(
                (x: unknown) =>
                  Number.isInteger(x) && Number(x) >= 0 && Number(x) < 5,
              ),
            ),
          ],
          unlocked: s.unlocked === true,
          still: s.still === true,
        }
      : empty;
  } catch {
    return empty;
  }
}
type Stage = "room" | "seated" | "zooming" | "pulling" | "choose" | "playing";
function Modal({
  title,
  children,
  onClose,
  material = 'utility',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  material?:string;
}) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const root = element.current;
    root?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div className={`modal-shade shade-${material}`} onClick={onClose}>
      <div
        className={`avg-modal material-${material}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={element}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
          if (e.key === "Tab") {
            const all = element.current?.querySelectorAll<HTMLElement>(
              "button,a[href],input,summary",
            );
            if (!all?.length) return;
            const first = all[0],
              last = all[all.length - 1];
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === element.current)
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
          <span className="micro">{({dossier:'制作档案 / WORKING FILE',map:'楼层手绘图',settings:'设备偏好',recovery:'灯下的记忆',collection:'随身纪念物'} as Record<string,string>)[material]||''}</span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="关闭面板"
          >
            ×
          </button>
        </header>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
export function PersonalWorld() {
  const story = useStory();
  const [narrative,setNarrative]=useState(readNarrative);
  const [eventSession,setEventSession]=useState<EventSession|null>(null);
  useEffect(()=>{try{localStorage.setItem(narrativeStorage,JSON.stringify(narrative));}catch{/* In-memory conversations remain available. */}},[narrative]);
  const [cinematic, setCinematic] = useState(readCinematic);
  const [patch,setPatch]=useState<TokenId[]>(()=>{try{return sanitizePatch(JSON.parse(localStorage.getItem(patchStorage)||'null'),story.save.keys) as TokenId[];}catch{return [];}});
  useEffect(()=>{try{localStorage.setItem(patchStorage,JSON.stringify(patch));}catch{/* Optional storage. */}},[patch]);
  useEffect(()=>{const state=patchStage(patch,story.save.unlocked);setCinematic(s=>s.states.projection===state?s:{...s,states:{...s.states,projection:state}});},[patch,story.save.unlocked]);
  const [atmosphere] = useState(() => new AtmosphereAudio());
  useEffect(() => {
    try {localStorage.setItem(cinematicStorage,JSON.stringify(cinematic));} catch { /* Memory-only play remains possible. */ }
    atmosphere.setEnabled(cinematic.sound);
  },[cinematic,atmosphere]);
  useEffect(() => {
    const resume = () => { if(document.hidden) atmosphere.suspend(); else atmosphere.unlock(); };
    document.addEventListener("visibilitychange",resume);
    return () => {document.removeEventListener("visibilitychange",resume);atmosphere.dispose();};
  },[atmosphere]);
  const commitScene = (id:RoomId, change:SceneTransition) => {
    setEventSession(null);
    if (change.action?.type === "hidden") music.lockSilently();
    setCinematic(s => commitTransition(s,id,change));
  };
  const listened = useRef<string[]>([]);
  const music = useMusicBox((id) => {
    if (!story.save.playlistRead) return;
    const result = checkListening(listened.current, id);
    listened.current = result.sequence;
    if (result.complete) story.collect("echo");
  });
  useEffect(()=>{atmosphere.setTape(music.locked);atmosphere.setMusic(music.playing);},[music.locked,music.playing,atmosphere]);
  const [hidden, setHidden] = useState(false);
  const [depth, setDepth] = useState(0);
  const [travelMusic,setTravelMusic]=useState(false);
  const travelMusicElement=useRef<HTMLElement>(null);
  useEffect(()=>{if(travelMusic)travelMusicElement.current?.focus();},[travelMusic]);
  const [transition, setTransition] = useState<RoomId | null>(null);
  const [routeVisual,setRouteVisual]=useState(()=>routeStyle(routeConfig,'duty','lounge',false));
  const routePending=useRef(false),routeAlive=useRef(true);
  useEffect(()=>{routeAlive.current=true;return()=>{routeAlive.current=false;};},[]);
  const transitionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => transitionTimers.current.forEach(clearTimeout), []);
  const [save, setSave] = useState(readSave);
  const [systemStill, setSystemStill] = useState(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const still = save.still || systemStill;
  const [room, setRoom] = useState<RoomId>("duty");
  useEffect(()=>atmosphere.setRoom(room),[atmosphere,room]);
  const dark=room==='lounge'&&resolveSceneState(cinematicRooms.find(r=>r.id==='lounge')!,cinematic).includes('dark');
  const [guideAllowed,setGuideAllowed]=useState(true);
  useEffect(()=>{if(room!==feedbackConfig.guidance.room)setGuideAllowed(false);},[room]);
  const [stage, setStage] = useState<Stage>("room");
  const [panel, setPanel] = useState<string | null>(null);
  const [archiveView,setArchiveView]=useState(false);
  const [sceneEpoch,setSceneEpoch]=useState(0);
  const [objects, setObjects] = useState(false);
  const [speech, setSpeech] = useState<Speech>(()=>resolveReaction(reactionData as ReactionRule[],'opening',{room:'duty',dark:false,tension:story.save.keys.length,flags:narrative.flags,inventory:cinematic.inventory,loops:story.save.loops},opening(story.save.loops)));
  const [speechKey, setSpeechKey] = useState(0);
  const [speechVisible, setSpeechVisible] = useState(true);
  useEffect(() => {
    if (!hidden) return;
    setSpeech({
      text: hiddenSpeech[Math.min(depth, 5)],
      face: depth >= 3 ? 19 : 18,
      motion: "glitch",
    });
    setSpeechVisible(true);
    setSpeechKey((v) => v + 1);
  }, [hidden, depth]);
  const remembering=music.playing&&music.selected===keepsake.track.id&&!hidden;
  useEffect(()=>{
    if(!remembering)return;
    const pending=keepsake.reactions.map(c=>setTimeout(()=>{setSpeech({text:c.text,face:9,motion:'blink',pose:c.pose});setSpeechVisible(true);setSpeechKey(v=>v+1);},c.afterMs));
    return()=>{pending.forEach(clearTimeout);};
  },[remembering]);
  const spoken = useRef<Record<string, { time: number; count: number }>>({});
  const lastSpeech = useRef(0);
  const returnRequest = useRef<() => void>(() => {});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [swapTo, setSwapTo] = useState<GameId | null>(null);

  const television = stage === "choose" || stage === "playing";
  const contextRef=useRef<CompanionContext>({room,dark,tension:0,flags:[],inventory:[],loops:0});
  contextRef.current={room,dark,tension:story.save.keys.length,flags:narrative.flags,inventory:cinematic.inventory,loops:story.save.loops};
  const sceneRef=useRef(cinematic);sceneRef.current=cinematic;
  const contextual=useCallback((event:string,fallback:Speech)=>{
    let context=contextRef.current;
    if(event in rooms){const target=event as RoomId;context={...context,room:target,dark:target==='lounge'&&resolveSceneState(cinematicRooms.find(r=>r.id===target)!,sceneRef.current).includes('dark')};}
    const resolved=resolveReaction(reactionData as ReactionRule[],event,context,fallback);
    const pose=(performance.events as Record<string,string>)[event];
    return resolved.pose||resolved.face>=12||!pose?resolved:{...resolved,pose};
  },[]);
  const speak=useCallback((event:string,fallback:Speech)=>{
    setSpeech(contextual(event,fallback));setSpeechKey(k=>k+1);setSpeechVisible(true);
  },[contextual]);
  const responseTimes=useRef<Record<string,number>>({});
  const showResponse=(reply:Speech)=>{setSpeech(reply);setSpeechKey(k=>k+1);setSpeechVisible(true);};
  const respond=(key:string,facts:string[]=[])=>{
    const definition=(interactionResponses as Record<string,ResponseSet>)[key];
    if(!definition)return;
    const now=Date.now();
    if(now-(responseTimes.current[key]??0)<(definition.cooldownMs??0))return;
    responseTimes.current[key]=now;
    showResponse(responseFor(definition,narrative.responses?.[key]??0,narrative,{keys:story.save.keys.length,inventory:cinematic.inventory,loops:story.save.loops,dark,room,facts}));
    setNarrative(s=>recordResponse(s,key));
  };
  const say = useCallback((event: string, priority = false) => {
    const now = Date.now(),
      record = spoken.current[event] || { time: 0, count: 0 };
    if (
      !priority &&
      (now - record.time < 4200 || now - lastSpeech.current < 1300)
    ) {
      record.count++;
      spoken.current[event] = record;
      if (record.count === 4 && now - lastSpeech.current > 1500) {
        setSpeech(contextual('repeat',dialogue.repeat[0]));
        setSpeechKey((k) => k + 1);
        setSpeechVisible(true);
        lastSpeech.current = now;
      }
      return;
    }
    const variants = dialogue[event] || dialogue.intro;
    setSpeech(contextual(event,variants[record.count % variants.length]));
    setSpeechKey((k) => k + 1);
    setSpeechVisible(true);
    spoken.current[event] = { time: now, count: record.count + 1 };
    lastSpeech.current = now;
  }, [contextual]);
  const host = useGameHost((event) => {
    if (event === "return-request") returnRequest.current();
    else if (event === "ready") {
      setSpeechVisible(false);
      music.pause();
      const id = hostRef.current.game;
      if (id) story.collect(id);
    } else if (event === "error") say("error", true);
    else if (event === "exit") say("exit", true);
    else if (event === "loading") say("loading");
  });
  const hostRef = useRef(host);
  const stageRef = useRef(stage);
  useEffect(() => {
    hostRef.current = host;
    stageRef.current = stage;
  }, [host, stage]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(save));
    } catch {
      /* Private browsing may disable storage. */
    }
  }, [save]);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemStill(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!speechVisible || eventSession || hidden) return;
    const timer = setTimeout(() => setSpeechVisible(false), 8500);
    return () => clearTimeout(timer);
  }, [speechVisible, speechKey, eventSession, hidden]);
  useEffect(() => {
    if (stage !== "zooming") return;
    const timer = setTimeout(
      () => {
        setStage(hostRef.current.game ? "playing" : "choose");
        setSpeechVisible(false);
      },
      still ? camera.reducedMs : camera.pushMs,
    );
    return () => clearTimeout(timer);
  }, [stage, still]);
  const react = useCallback((text: string) => {
    setSpeech({ text, face: 10, motion: "point" });
    setSpeechVisible(true);
    setSpeechKey((v) => v + 1);
  }, []);
  const previousKeys = useRef(story.save.keys.length);
  useEffect(() => {
    if (story.save.keys.length <= previousKeys.current) {
      previousKeys.current = story.save.keys.length;
      return;
    }
    previousKeys.current = story.save.keys.length;
    setSpeech(warnings[Math.min(4, story.save.keys.length - 1)]);
    setSpeechVisible(true);
    setSpeechKey((v) => v + 1);
  }, [story.save.keys.length]);
  const reelTest = ["localhost","127.0.0.1"].includes(location.hostname)&&new URLSearchParams(location.search).has("reel-test");
  const finishHidden = () => {
    music.unlockEncore(!reelTest);
    setSpeech({text:'……灯亮了。你还在。',face:8,motion:'blink',pose:'relief'});setSpeechVisible(true);setSpeechKey(v=>v+1);
    if(reelTest){music.release();setHidden(false);setDepth(0);setRoom("duty");setNotice("录像测试完成，八音盒已加入纪念滚筒；原存档未重置。");return;}
    setPatch([]);try{localStorage.removeItem(patchStorage);}catch{/* In-memory reset. */}
    setNarrative(blankNarrative());
    setEventSession(null);
    try{localStorage.removeItem(narrativeStorage);}catch{/* In-memory reset. */}
    setCinematic({inventory:[],states:{},sound:cinematic.sound});
    try { localStorage.removeItem(cinematicStorage); } catch { /* Memory-only restart. */ }
    music.release();
    story.restart();
    setHidden(false);
    setDepth(0);
    setRoom("duty");
    setStage("room");
    setSpeech(opening(story.save.loops + 1));
    setSpeechVisible(true);
    setSpeechKey((v) => v + 1);
    listened.current = [];
    try {
      localStorage.setItem(
        storyStorage,
        JSON.stringify({
          keys: [],
          loops: story.save.loops + 1,
          playlistRead: false,
          unlocked: false,
        }),
      );
      history.replaceState(null, "", location.pathname);
      location.reload();
    } catch {
      /* Restricted storage keeps the in-memory restart. */
    }
  };
  const enterHidden = () => {
    setArchiveView(false);
    setEventSession(null);
    host.clear();
    setPanel(null);
    setStage("room");
    if(!reelTest)story.setSave((s) => ({ ...s, unlocked: true }));
    setHidden(true);
    setDepth(0);
    music.lockSilently();
    setSpeech({
      text: hiddenSpeech[0],
      face: 13,
      motion: "glitch",
    });
    setSpeechVisible(true);
  };
  useEffect(() => {
    const hidden = () => {
      if (document.hidden && hostRef.current.status === "ready") {
        void hostRef.current
          .command("pause")
          .catch((e) => setNotice(e.message));
      }
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  // A startup completed in a background tab must also await an explicit resume.
  useEffect(() => {
    if (
      host.status === "ready" &&
      (document.hidden || ["choose", "room"].includes(stageRef.current))
    )
      void hostRef.current.command("pause").catch((e) => setNotice(e.message));
  }, [host.status]);
  const leave = useCallback(
    async (target: RoomId = "lounge") => {
      if (busy) return;
      setBusy(true);
      setNotice("");
      try {
        const current = hostRef.current;
        if (current.status === "ready") await current.command("pause");
        else if (current.game && current.status !== "paused") current.clear();
        setRoom(target);
        setPanel(null);
        setObjects(false);
        if (target === "lounge" && stageRef.current !== "room") {
          setStage("pulling");
          await new Promise((resolve) =>
            setTimeout(resolve, still ? camera.reducedMs : camera.pullMs),
          );
        }
        setStage("room");
        say(
          target === "lounge"
            ? ["ready", "paused"].includes(current.status)
              ? "pause"
              : "exit"
            : target,
          true,
        );
      } catch (e) {
        setNotice((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [busy, say, still],
  );
  useEffect(() => {
    returnRequest.current = () => void leave();
  }, [leave]);
  const navigate = useCallback(
    async (target: RoomId) => {
      if(routePending.current)return;
      setArchiveView(false);
      setEventSession(null);
      if (hostRef.current.status === "ready" || stageRef.current !== "room") {
        void leave(target);
        return;
      }
      if(target===contextRef.current.room)return;
      routePending.current=true;
      setBusy(true);
      try {
        const targetRoom=cinematicRooms.find(r=>r.id===target)!;
        await preloadSceneImage(targetRoom.variants[resolveSceneState(targetRoom,sceneRef.current)]);
      } catch {
        routePending.current=false;setBusy(false);setNotice('那边的画面还没准备好，请再试一次。');return;
      }
      if(!routeAlive.current)return;
      const style=routeStyle(routeConfig,contextRef.current.room,target,still||window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      setRouteVisual(style);
      atmosphere.playDoor(style.material,style.duration,target,style.swap);
      transitionTimers.current.forEach(clearTimeout);
      setTransition(target);
      setPanel(null);
      setObjects(false);
      transitionTimers.current = [
        setTimeout(
          () => {
            setRoom(target);
            say(target, true);
          },
          style.swap,
        ),
        setTimeout(() => {setTransition(null);setBusy(false);routePending.current=false;}, style.duration),
      ];
    },
    [leave, say, still, atmosphere],
  );
  const routeRef = useRef(navigate);
  useEffect(() => {
    routeRef.current = navigate;
  }, [navigate]);
  useEffect(() => {
    const route = () => {
      const hash = decodeURIComponent(location.hash.slice(1)).replace(
        /^\//,
        "",
      );
      if (hash === "play") {
        const openChooser = () => {
          setRoom("lounge");
          setPanel(null);
          setStage("choose");
          setSpeechVisible(false);
        };
        if (hostRef.current.status === "ready") {
          void hostRef.current.command("pause").then(openChooser).catch((error) => {
            setNotice((error as Error).message);
          });
        } else {
          openChooser();
        }
        return;
      }
      if (works.some((w) => w.id === hash)) {
        setPanel("work:" + hash);
        return;
      }
      if (hash === "recovery" || hash === "case-00") {
        setPanel("collection");
        return;
      }
      if (hash === "contact") {
        setPanel("contact");
        return;
      }
      if (hash in rooms && !['secret','storage'].includes(hash)) routeRef.current(hash as RoomId);
      else if (["projects", "cases", "radar", "notes"].includes(hash))
        setPanel("works");
    };
    route();
    addEventListener("hashchange", route);
    return () => removeEventListener("hashchange", route);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !panel && stageRef.current !== "room")
        void leave();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [leave, panel]);
  const act = (action: WorldAction) => {
    if(action.type!=='event')setEventSession(null);
    switch (action.type) {
      case 'cabinet':setArchiveView(true);setPanel(null);break;
      case "event": {
        const event=narrativeEvents.find(e=>e.id===action.id);
        if(!event||event.enabled===false)break;
        const next=beginEvent(event,narrative,{keys:story.save.keys.length,inventory:cinematic.inventory,loops:story.save.loops});
        setNarrative(next.save);setEventSession(next.session);setPanel(null);
        break;
      }
      case "collect": story.collect(action.id); break;
      case "hidden": enterHidden(); break;
      case "room":
        navigate(action.target);
        break;
      case "panel":
        setPanel(action.id);
        if (action.id === "record:playlist")
          story.setSave((s) => ({ ...s, playlistRead: true }));
        break;
      case "work":
        setPanel("work:" + action.id);
        break;
      case "say":
        say(action.event,true);
        break;
      case "sit":
        setStage("seated");
        say("sit", true);
        break;
    }
  };
  const pick = (id: GameId) => {
    if (host.game) {
      setSwapTo(id);
      say("swap", true);
      return;
    }
    host.load(id);
    setStage("playing");
    say("select", true);
  };
  const resume = async () => {
    setBusy(true);
    try {
      await host.command("resume");
      setSpeechVisible(false);
      host.frame.current?.focus();
      say("resume", true);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const activeWork = panel?.startsWith("work:")
    ? works.find((w) => w.id === panel.slice(5))
    : undefined;
  const closePanel=()=>{
    const closed=panel;setPanel(null);
    if(!closed?.startsWith('record:'))return;
    const record=closed.slice(7),flags=markRecordClosed(narrative.flags,record);
    if(!flags)return;
    setNarrative(s=>({...s,flags:[...new Set([...s.flags,...flags])]}));
    speak(`record:${record}:closed`,{text:'我在这里。',face:12,motion:'shrink'});
  };
  const roomData = rooms[room];
  const activeEvent=eventSession&&!panel&&!archiveView&&stage==='room'?narrativeEvents.find(e=>e.id===eventSession.id):undefined;
  const activeNode=useMemo(()=>activeEvent&&eventSession?resolveEventNode(activeEvent.nodes[eventSession.node],narrative,{keys:story.save.keys.length,inventory:cinematic.inventory,loops:story.save.loops,dark,room}):undefined,[activeEvent,eventSession,narrative,story.save.keys.length,cinematic.inventory,story.save.loops,dark,room]);
  const qa = new URLSearchParams(location.search).has("qa");
  const review =
    ["localhost", "127.0.0.1"].includes(location.hostname) &&
    new URLSearchParams(location.search).has("review");
  const sceneEditor = ["localhost","127.0.0.1"].includes(location.hostname) && new URLSearchParams(location.search).has("scene-editor");
  if (sceneEditor) return <Suspense fallback={<p>正在打开编辑台…</p>}><SceneEditor/></Suspense>;
  return (
    <div
      className={`avg-site immersive cinematic-site ${room === "lounge" ? "warm" : ""} ${still ? "reduced-motion" : ""} ${dark && room === "lounge" ? "lights-out" : ""} mood-${story.save.keys.length}`}
      data-room={room}
      data-stage={stage}
      data-game-status={host.status}
      data-music-playing={music.playing}
      data-music-track={music.selected}
      data-music-time={music.elapsed.toFixed(1)}
      data-music-locked={music.locked}
      data-inventory={cinematic.inventory.join(",")}
      data-ambience={cinematic.sound ? "on" : "off"}
      data-narrative-count={Object.keys(narrative.visits).length}
      data-archive-view={archiveView}
      onPointerDownCapture={()=>atmosphere.unlock()}
    >
      {reelTest&&!hidden&&<button className="local-reel-preview" onClick={enterHidden}>开始录像测试 · 不重置存档</button>}
      {review && !reelTest && !hidden && (
        <button className="local-reel-preview" onClick={()=>navigate("secret")}>
          本地验收：旧录像带起点
        </button>
      )}
      <header className="site-masthead" inert={hidden || television || !!panel}>
        <a className="wordmark" href="#duty" aria-label="返回值班室">
          <span className="mark">
            m<span>·</span>w
          </span>
          <span>
            MhWangZi<small>的异常工作区</small>
          </span>
        </a>
        <div className="masthead-right">
          <span className="live-dot" /> <span>这里还亮着</span>
          <button onClick={() => setPanel("contact")}>打个招呼 ↗</button>
        </div>
      </header>
      <main inert={hidden || television || !!panel || archiveView}>
        <div className="room-heading">
          <div>
            <span className="micro">{roomData.eyebrow}</span>
            <h1>
              {roomData.label}
              <span> / {roomData.note}</span>
            </h1>
          </div>
          <button className="map-button" onClick={() => setPanel("map")}>
            ⌘ <span>房间地图</span>
          </button>
        </div>
        <section
          className={`scene-window ${stage === "zooming" ? "camera-push" : stage === "pulling" ? "camera-pull" : ""} `}
          style={
            {
              "--camera-origin": camera.origin,
              "--camera-scale": camera.scale,
              "--camera-time": camera.pushMs + "ms",
            } as CSSProperties
          }
          aria-label={roomData.label + "互动场景"}
        >
          {stage === "room" ? (
            <CinematicScene guide={guideAllowed&&room===feedbackConfig.guidance.room&&story.save.loops===0&&!guideFinished(feedbackConfig.guidance,narrative.choices)} visits={narrative.visits} key={`${room}:${sceneEpoch}`} room={room} save={cinematic}
              disabled={hidden || !!panel || !!transition || busy || archiveView} still={still} hints={objects}
              audio={atmosphere} onCommit={commitScene} onAction={act} onSpeak={(text,object)=>{
                if(object.transition.response){respond(object.transition.response);return;}
                speak(`scene:${object.id}`,{text,face:room==='secret'?12:9,motion:room==='secret'?'shrink':'point'});
              }}/>

          ) : (
            <div className="scene-picture" style={{backgroundImage: `url('./media/exploration/lounge-tv-close${cinematic.inventory.includes("musicbox") ? "-taken" : ""}${dark?'-dark':''}.png')`}}/>
          )}
          {stage === "seated" && (
            <>
              <div className="seated-caption">坐好了。现在，拿起手柄。</div>
              <button
                className="controller-pick"
                onClick={() => {
                  setStage("zooming");
                  say("controller", true);
                }}
                aria-label="拿起手柄"
              >
                <span>拿起手柄</span> ↗
              </button>
            </>
          )}
          <div className="scene-corner top-left" />
          <div className="scene-corner bottom-right" />
        </section>
        <div className="scene-under">
          
          <button onClick={() => setPanel("map")}>楼层图</button>
          <button onClick={() => setObjects(v => !v)} aria-expanded={objects}>
            {objects ? "收起强调" : "寻找物件"}
          </button>
        </div>
      </main>
      <footer className="site-footer" inert={hidden || television || !!panel || archiveView}>
        <span>游戏 / 像素 / 没做完的小念头</span>
        <div>
          <button className="inventory-item quiet-pocket" onClick={()=>setPanel("collection")}>口袋</button>
          {cinematic.inventory.includes("musicbox") && <button className="inventory-item" onClick={()=>{if(!travelMusic)respond('CONTROL.music-open');setTravelMusic(v=>!v);setEventSession(null);}}>♫ 八音盒</button>}
          {cinematic.inventory.includes("tape") && <button className="inventory-item" onClick={()=>react("录像带在你手里。录像机的入口就在屏幕下面。……真的还要继续吗？")}>▣ 旧录像带</button>}
          <button onClick={() => setPanel("settings")}>⚙ 偏好</button>
          <a href="#/admin" aria-label="管理终端">
            ·
          </a>
        </div>
      </footer>

      {/* Keep the same iframe mounted while its paused game waits in the room. */}
      {(television || host.game) && (
        <div
          className={`television-layer ${television ? "visible" : "parked"}`}
          aria-hidden={!television}
          inert={!television}
        >
          <header className="tv-toolbar">
            <button onClick={() => void leave()} disabled={busy}>
              ←{" "}
              {busy
                ? "正在暂停…"
                : host.status === "loading"
                  ? "取消加载，返回房间"
                  : "返回房间"}
            </button>
            <span>
              <i className="live-dot" />
              {host.game
                ? games.find((g) => g.id === host.game)?.name
                : "今晚玩哪张？"}
            </span>
            {host.game ? (
              <button
                onClick={async () => {
                  try {
                    if (host.status === "ready") await host.command("pause");
                    setStage("choose");
                  } catch (e) {
                    setNotice((e as Error).message);
                  }
                }}
              >
                更换光盘 ◉
              </button>
            ) : (
              <span />
            )}
          </header>
          <div className="tv-set">
            <div className="tv-aperture">
              {host.game && host.status === "shell" && (
                <div
                  className="disc-insertion"
                  key={"disc-" + host.game}
                  aria-hidden="true"
                >
                  <div
                    className="disc-art"
                    style={{
                      backgroundImage: `url('${thumbnail(games.find((g) => g.id === host.game)!.image)}')`,
                    }}
                  >
                    <span />
                  </div>
                </div>
              )}
              {host.game && (
                <iframe
                  key={host.game}
                  ref={host.frame}
                  src={`./games/${host.game}/index.html?embed=1${qa ? "&diagnostics=1" : ""}`}
                  title={
                    games.find((g) => g.id === host.game)?.name + "在线游戏"
                  }
                  allow="autoplay; fullscreen; gamepad"
                  className={stage === "choose" ? "frame-covered" : ""}
                />
              )}
              {stage === "choose" && (
                <div className="disc-selector">
                  <span className="micro">INSERT A LITTLE WORLD</span>
                  <h2>今晚，玩哪张？</h2>
                  <div className="disc-rack">
                    {games.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => pick(g.id)}
                        className="disc-choice"
                        aria-label={"放入" + g.name + "光盘"}
                      >
                        <div
                          className="disc-art"
                          style={{
                            backgroundImage: `url('${thumbnail(g.image)}')`,
                            borderColor: g.color,
                          }}
                        >
                          <span />
                        </div>
                        <strong>{g.name}</strong>
                        <small>{g.note}</small>
                        <em>放入光盘 ↗</em>
                      </button>
                    ))}
                  </div>
                  <p className="input-note">
                    ⌨ ＋ ◇ 鼠标 / 键盘操作 · 手柄只是入场仪式
                  </p>
                  {host.game && (
                    <button onClick={() => setStage("playing")}>
                      回到当前游戏 →
                    </button>
                  )}
                </div>
              )}
              {host.status === "paused" && stage === "playing" && (
                <div className="tv-overlay">
                  <span className="micro">TAKE YOUR TIME</span>
                  <h2>停在刚才那里。</h2>
                  <p>游戏与声音已暂停。</p>
                  <button
                    className="primary"
                    onClick={() => void resume()}
                    disabled={busy}
                  >
                    继续游戏 ▷
                  </button>
                </div>
              )}
              {["error", "exit"].includes(host.status) &&
                stage === "playing" && (
                  <div className="tv-overlay">
                    <span className="micro">
                      {host.status === "error"
                        ? "SIGNAL LOST"
                        : "SEE YOU NEXT ROUND"}
                    </span>
                    <h2>
                      {host.status === "error"
                        ? "信号暂时断开了。"
                        : "这局先到这里。"}
                    </h2>
                    <p>
                      {host.status === "error"
                        ? "检查连接后，可以重新放盘。"
                        : "想再玩一局，光盘就在旁边。"}
                    </p>
                    <button
                      className="primary"
                      onClick={() => {
                        host.clear();
                        setStage("choose");
                      }}
                    >
                      返回选盘 ◉
                    </button>
                    <a
                      href={`./games/${host.game}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      独立试玩入口 ↗
                    </a>
                  </div>
                )}
            </div>
            <div className="tv-brand">MW / LITTLE WORLDS INSIDE</div>
            <span className="tv-power" />
          </div>
          <div className="tv-footnote">
            {host.status === "loading"
              ? `游戏资源准备中 · ${Math.round(host.progress * 100)}%`
              : host.status === "ready"
                ? "好好玩。其他事情待会儿再说。"
                : "电脑鼠标与键盘游玩体验更完整。"}
            <span>ESC 返回房间</span>
          </div>
          {qa && (
            <div className="qa-host">
              <button
                onClick={() =>
                  void host
                    .command("inspect")
                    .catch((e) => setNotice(e.message))
                }
              >
                检查游戏状态
              </button>
              <output data-testid="game-snapshot">
                {JSON.stringify(host.snapshot)}
              </output>
            </div>
          )}
        </div>
      )}
      {travelMusic&&!hidden&&!television&&!panel&&<div className="music-table-shade" onClick={()=>setTravelMusic(false)}><aside onClick={e=>e.stopPropagation()} ref={travelMusicElement} tabIndex={-1} className="music-travel-drawer" role="dialog" aria-modal="true" aria-label="随身八音盒" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setTravelMusic(false);}if(e.key==='Tab'){const items=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),[tabindex="0"]')).filter(el=>el.getClientRects().length>0);const first=items[0],last=items[items.length-1];if(first&&(!items.includes(document.activeElement as HTMLElement)||(e.shiftKey&&document.activeElement===first)||(!e.shiftKey&&document.activeElement===last))){e.preventDefault();(e.shiftKey?last:first).focus();}}}}><header><span>随身八音盒</span><button onClick={()=>setTravelMusic(false)} aria-label="合上八音盒抽屉" title="关闭">×</button></header><MechanicalMusicBox music={music} audio={atmosphere}/></aside></div>}
      <Companion
        speech={speech}
        visible={speechVisible}
        showBubble={true}
        serial={speechKey}
        onTalk={() => {
          if(television){react('我在这里。你先玩，想回房间就按一下ESC。');return;}
          if(!hidden){say('intro',true);return;}
          setSpeech(
            hidden
              ? {
                  text: "我还记得你。别让他们知道。",
                  face: 19,
                  motion: "glitch",
                }
              : story.save.keys.length
                ? warnings[Math.min(4, story.save.keys.length - 1)]
                : opening(story.save.loops),
          );
          setSpeechVisible(true);
          setSpeechKey((v) => v + 1);
        }}
        onHide={() => setSpeechVisible(false)}
        onReact={react}
        listening={music.playing&&room!=="secret"}
        musicFocused={travelMusic}
        musicElapsed={music.elapsed}
        remembering={remembering}
        hidden={hidden}
        corrupt={hidden}
        cipher={false}
        still={still}
        depth={depth}
        docked={television}
      />
      {archiveView&&<ArchiveCabinet audio={atmosphere} still={still} disabled={!!panel} onRead={act} onReturn={id=>{story.collect(id);speak('cabinet:return',{text:'放回原位了。',face:9,motion:'blink'});}} onExit={state=>{setArchiveView(false);setSceneEpoch(v=>v+1);respond('CONTROL.archive-exit',state.selected?[state.read?'unreturned':'unread']:[]);}}/>}
      {activeEvent&&eventSession&&<NarrativeEventView key={`${activeEvent.id}:${eventSession.node}`} still={still} event={activeEvent} session={eventSession}
        nodeOverride={activeNode}
        onSpeak={node=>{const reply:Speech={text:node.assistant,face:node.face??(room==='secret'?12:9),pose:node.pose,motion:room==='secret'?'shrink':'point'};if(node.contextual===false)showResponse(reply);else speak(`event:${activeEvent.id}`,reply);}}
        onClose={()=>{setEventSession(null);setSpeechVisible(false);}}
        onChoose={choiceId=>{const next=advanceEvent(activeEvent,eventSession,narrative,choiceId,{keys:story.save.keys.length,inventory:cinematic.inventory,loops:story.save.loops,dark,room});if(!next)return;atmosphere.play('paper');setNarrative(next.save);setEventSession(next.session);if(next.action)act(next.action);if(next.speech)showResponse(next.speech);}}/>}
      {story.award && !television && (
        <div className="award-toast" role="status">
          <span>{tokens.find((t) => t.id === story.award)?.icon}</span>
          <div>
            已留下纪念物
            <strong>{tokens.find((t) => t.id === story.award)?.name}</strong>
          </div>
        </div>
      )}
      {transition && (
        <div
          className={`room-transition route-motion kind-${routeVisual.kind}`}
          style={{'--route-time':`${routeVisual.duration}ms`,'--route-direction':routeVisual.direction} as CSSProperties}
          data-direction={routeVisual.direction}
          aria-hidden="true"
        >
          <div />
          <span>
            {rooms[transition].label}
            <small>PLEASE MIND THE GAP</small>
          </span>
          <div />
        </div>
      )}
      {hidden && (
        <HiddenChapter
          still={still}
          onDepth={setDepth}
          onFinish={finishHidden}
          audioError={music.error}
          onRetryAudio={() => void music.enterHidden()}
          onDislocation={() => void music.enterHidden()}
          sound={cinematic.sound}
          onExit={() => {
            music.release();
            setHidden(false);
            setDepth(0);
            setRoom("lab");
            setSpeech({text:"你回来了。那段录像，不用再看了。",face:8,motion:"blink",pose:"relief"});setSpeechVisible(true);setSpeechKey(v=>v+1);
          }}
        />
      )}

      {notice && (
        <div className="notice" role="alert">
          {notice}
          <button onClick={() => setNotice("")}>知道了</button>
        </div>
      )}
      {swapTo && (
        <Modal title="换一张，从头开始？" onClose={() => setSwapTo(null)}>
          <p>当前游戏实例会关闭，本次关卡进度会重置。</p>
          <div className="modal-actions">
            <button onClick={() => setSwapTo(null)}>继续留着</button>
            <button
              className="primary"
              onClick={() => {
                const next = swapTo;
                host.clear();
                setSwapTo(null);
                setStage("choose");
                setTimeout(() => {
                  hostRef.current.load(next);
                  setStage("playing");
                }, 0);
              }}
            >
              确认换盘
            </button>
          </div>
        </Modal>
      )}
      {panel && (
        <Modal
          material={panel==='contact'?'contact':activeWork?'dossier':panel.startsWith('record:')||panel==='manual'?'record':panel}
          title={
            activeWork
              ? activeWork.shortTitle || activeWork.title
              : panel.startsWith("clue:")
                ? "捡到一小段记录"
                : {
                    map: "走到哪儿，算哪儿。",
                    contact: "可以来打个招呼。",
                    collection: "口袋里的东西",
                    recovery: "把记得的事放回灯下",
                    music: "随身八音盒",
                    manual: "使用说明",
                    settings: "舒服一点。",
                    works: "一些做过的东西。",
                  }[panel] || "档案"
          }
          onClose={closePanel}
        >
          {panel === "map" && (
            <>
              <p>你在{rooms[room].label}。沿房间里的门继续走，灯亮着的地方都可以停留。</p>
              <BlueprintMap current={room} unlocked={story.save.unlocked}/>
            </>
          )}
          {panel === "contact" && <ContactBook collect={story.collect}/>}
          {panel === "music" && <MechanicalMusicBox music={music} audio={atmosphere} />}
          {panel?.startsWith("record:") && (
            <ArchiveRecord id={panel.slice(7)} collect={story.collect} />
          )}
          {panel === "manual" && (
            <article className="artifact-document manual">
              <small>HELLO, HUMAN / QUICK START</small>
              <h3>你的私人助手</h3>
              <p>灯还留着，桌上的东西随便翻。拿走的小物件都在随身口袋里，不用办领用手续。</p><p>右下角晃来晃去的是私人助手。嫌挡屏幕可以直接拽开，双击可以缩放；用Tab选中它后，方向键也能推它。</p>
              <p>它平时话比较密，放歌的时候会发呆。别跟它提“报废”或者“格式化”，它胆子很小，真会当场缩成一团。</p>
              <p>游戏房柜上的八音盒可以带走。换好滚筒后，拧动右侧发条钥匙就能响。</p>
            </article>
          )}
          {panel==='collection'&&<div className="pocket-catalog">{tokens.filter(t=>story.save.keys.includes(t.id)).map(t=><article key={t.id}><TerminalStamp/><span>{t.icon}</span><h3>{t.name}</h3><p>{t.hint}</p></article>)}<p>{story.save.keys.length ? "这些是你沿途留下的东西。" : "口袋还是空的。"}</p></div>}
          {panel === "recovery" && (
            <KeyConsole
              save={story.save}
              slots={story.save.unlocked?[...bootOrder]:patch}
              onChange={next=>{atmosphere.play(next.length>patch.length?'insert':'take');setPatch(next);}}
              onEnter={() => {
                story.setSave(s => ({...s, unlocked: true}));
                atmosphere.play('switch');setPanel(null);
                speak('patch:powered',{text:'接通了。右边那扇门……现在我没法再说它只是仓库了。',face:12,motion:'shrink',pose:'halt'});
              }}
              onReact={react}
            />
          )}
          {panel === "settings" && (
            <>
              <label className="setting-row"><span>环境音乐与物件声音<small>雨声、低音旋律、胶片底噪和拿取声音。</small></span><input aria-label="环境音乐与物件声音" type="checkbox" checked={cinematic.sound} onChange={e=>setCinematic(s=>({...s,sound:e.target.checked}))}/></label>
              <label className="setting-row">
                <span>
                  减少动态效果<small>短淡入、静止小猫，保留所有入口。</small>
                </span>
                <input
                  type="checkbox"
                  checked={still}
                  disabled={systemStill}
                  onChange={(e) =>
                    setSave((s) => ({ ...s, still: e.target.checked }))
                  }
                />
              </label>
              {systemStill && (
                <p className="muted">正在跟随设备的减少动态效果设置。</p>
              )}
              <details>
                <summary>重新探索这个小世界</summary>
                <p>清除纪念物、拿取状态与本轮对话记录。它记得你来过的次数会保留。</p>
                <button
                  onClick={() => {
                    story.setSave((s) => ({
                      ...s,
                      keys: [],
                      unlocked: false,
                      playlistRead: false,
                    }));
                    setCinematic(s=>({...s,inventory:[],states:{}}));
                    setPatch([]);
                    setNarrative(blankNarrative());
                    setEventSession(null);
                    music.pause();
                    listened.current = [];
                    setPanel(null);
                    navigate("duty");
                    say("enter", true);
                  }}
                >
                  重置探索记录
                </button>
              </details>
              <p className="muted">
                纪念物保存在当前浏览器。刷新不会恢复游戏关卡进度。
              </p>
            </>
          )}
          {panel === "works" && (
            <div className="work-grid">
              {works.map((w) => (
                <button key={w.id} onClick={() => setPanel("work:" + w.id)}>
                  {w.media[0] && (
                    <img
                      loading="lazy"
                      src={thumbnail(w.media[0].poster || w.media[0].src)}
                      alt=""
                    />
                  )}
                  <strong>{w.shortTitle || w.title}</strong>
                  <small>{w.archiveSummary || w.oneLine}</small>
                </button>
              ))}
            </div>
          )}
          {activeWork && (
            <div className="work-detail">
              {activeWork.media[0] && (
                <img
                  src={thumbnail(
                    activeWork.media[0].poster || activeWork.media[0].src,
                  )}
                  alt={activeWork.media[0].caption || activeWork.title}
                />
              )}
              <p>{activeWork.archiveSummary || activeWork.oneLine}</p>
              <div className="modal-actions">
                {activeWork.playUrl && (
                  <button
                    className="primary"
                    onClick={() => navigate("lounge")}
                  >
                    去游戏房玩 ↗
                  </button>
                )}
                {activeWork.playUrl && (
                  <a href={activeWork.playUrl} target="_blank" rel="noreferrer">
                    独立试玩 ↗
                  </a>
                )}
                {activeWork.download && (
                  <a href={activeWork.download.url} title={activeWork.download.version}>下载文件 ↓</a>
                )}
              </div>
              <details>
                <summary>展开制作记录与链接</summary>
                <p>{activeWork.summary}</p>
                {activeWork.media
                  .slice(1)
                  .map((m) =>
                    m.type === "video" ? (
                      <video
                        key={m.src}
                        controls
                        preload="none"
                        poster={m.poster}
                        src={m.src}
                      />
                    ) : (
                      <img
                        key={m.src}
                        loading="lazy"
                        src={thumbnail(m.poster || m.src)}
                        alt={m.caption || ""}
                      />
                    ),
                  )}
                {activeWork.links?.map((l) => (
                  <p key={l.url}>
                    <a href={l.url} target="_blank" rel="noreferrer">
                      {l.label} ↗
                    </a>
                  </p>
                ))}
              </details>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
