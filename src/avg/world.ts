export type RoomId = "duty" | "lab" | "lounge" | "archive" | "secret" | "corridor" | "projection" | "rooftop" | "workshop" | "storage";
export type Action =
  | { type: "room"; target: RoomId }
  | { type: "work"; id: string }
  | {
      type: "panel";
      id: string;
    }
  | { type: "say"; event: string }
  | { type: "sit" };
export type Hotspot = {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  action: Action;
  w?:number;
  h?:number;
};
export const rooms: Record<
  RoomId,
  {
    label: string;
    eyebrow: string;
    note: string;
    atlas?: string;
    hotspots: Hotspot[];
  }
> = {
  rooftop: {label:'天台信号站',eyebrow:'08 / BETWEEN FREQUENCIES',note:'雨里也有人在回话。',hotspots:[]},
  workshop: {label:'拆解工坊',eyebrow:'09 / BEFORE REPLACEMENT',note:'先看看哪里松了。',hotspots:[]},
  storage: {label:'封存夹层',eyebrow:'10 / STILL SOMEWHERE',note:'没被命名，也还在这里。',hotspots:[]},
  corridor: {
    label: "雨声走廊",
    eyebrow: "05 / BETWEEN ROOMS",
    note: "每扇门后都留着灯。走廊没有灯，走廊只负责下雨和漏风。",
    hotspots: [],
  },
  projection: {
    label: "旧放映间",
    eyebrow: "06 / A PRIVATE SCREENING",
    note: "放映机早断电了。走的时候别忘了随身物品，尤其是……别把空椅子留给黑暗。",
    hotspots: [],
  },
  duty: {
    label: "值班室",
    eyebrow: "01 / AFTER HOURS",
    note: "灯还留着，桌上的东西随便翻。值班还没结束，进来坐会儿。",
    atlas: "0% 0%",
    hotspots: [
      {
        id: "terminal",
        label: "打个招呼",
        icon: "▣",
        x: 24,
        y: 48,
        action: { type: "say", event: "intro" },
      },
      {
        id: "notebook",
        label: "翻开便签",
        icon: "✧",
        x: 70,
        y: 87,
        action: { type: "panel", id: "manual" },
      },
      {
        id: "clock",
        label: "看看时钟",
        icon: "◷",
        x: 77,
        y: 19,
        action: { type: "panel", id: "record:protocol" },
      },
      {
        id: "door",
        label: "去游戏房",
        icon: "↗",
        x: 60,
        y: 41,
        action: { type: "room", target: "lounge" },
      },
    ],
  },
  lab: {
    label: "实验间",
    eyebrow: "02 / WORK IN PROGRESS",
    note: "有些电路还在通电，有些……很有想法，就是特别容易冒黑烟的那种想法。",
    atlas: "100% 0%",
    hotspots: [
      {
        id: "tool",
        label: "Godot工具箱",
        icon: "⚙",
        x: 24,
        y: 35,
        action: { type: "work", id: "hd2d-kit" },
      },
      {
        id: "robot",
        label: "桌上的原型",
        icon: "◇",
        x: 48,
        y: 63,
        action: { type: "work", id: "parry-arena" },
      },
      {
        id: "wire",
        label: "整理线头",
        icon: "✧",
        x: 66,
        y: 64,
        action: { type: "panel", id: "record:protocol" },
      },
      {
        id: "screen",
        label: "检查异常画面",
        icon: "▤",
        x: 30,
        y: 61,
        action: { type: "panel", id: "record:birth" },
      },
    ],
  },
  lounge: {
    label: "游戏房",
    eyebrow: "03 / NO LAB COATS",
    note: "把差事全关在门外。猫随便进，猫又不用办访客审批。",
    hotspots: [
      {
        id: "sofa",
        label: "坐上沙发",
        icon: "⌄",
        x: 48,
        y: 79,
        action: { type: "sit" },
      },
      {
        id: "discs",
        label: "看看光盘",
        icon: "◉",
        x: 86,
        y: 40,
        action: { type: "say", event: "discs" },
      },
      {
        id: "lamp",
        label: "看看台灯",
        icon: "☼",
        x: 29,
        y: 26,
        action: { type: "say", event: "lamp" },
      },
    ],
  },
  archive: {
    label: "档案角",
    eyebrow: "04 / SMALL THINGS",
    note: "纸张比代码能熬。至少塞进抽屉里的草稿，不会半夜无端跳出格式化弹窗。",
    atlas: "0% 100%",
    hotspots: [
      {
        id: "pictures",
        label: "翻翻做过的东西",
        icon: "▧",
        x: 56,
        y: 31,
        action: { type: "panel", id: "works" },
      },
      {
        id: "folder",
        label: "检查空白页",
        icon: "✧",
        x: 49,
        y: 80,
        action: { type: "panel", id: "record:playlist" },
      },
      {
        id: "phone",
        label: "联系MhWangZi",
        icon: "☎",
        x: 82,
        y: 68,
        w:20,
        h:25,
        action: { type: "panel", id: "contact" },
      },
      {
        id: "drawers",
        label: "恢复记录",
        icon: "▥",
        x: 92,
        y: 50,
        action: { type: "panel", id: "recovery" },
      },
    ],
  },
  secret: {
    label: "未登记空间",
    eyebrow: "00 / STILL HERE",
    note: "平面图上从没标过这间屋。墙皮落了一地，但桌角的破灯泡居然还亮着。",
    atlas: "100% 100%",
    hotspots: [
      {
        id: "secret-terminal",
        label: "读最后一条记录",
        icon: "▣",
        x: 51,
        y: 57,
        action: { type: "say", event: "ending" },
      },
      {
        id: "secret-exit",
        label: "回到灯亮的地方",
        icon: "↗",
        x: 87,
        y: 26,
        action: { type: "room", target: "duty" },
      },
    ],
  },
};
export type Speech = {
  text: string;
  face: number;
  pose?:string;
  motion: "peek" | "blink" | "point" | "shrink" | "glitch";
};
export const dialogue: Record<string, Speech[]> = {
  corridor: [{text: "左边实验间，右边档案角。走廊地砖沾了水汽有点滑，你慢点走，我反正摔不着。", face: 10, motion: "point"}],
  projection: [{text: "放映机早就停用了。指示灯还亮着，估计是设备科报废清单上忘了把它划掉。", face: 12, motion: "peek", pose: "shy"}],
  enter: [
    {
      text: "我是这里的私人AI助手。作者只管把东西做出来，剩下看场子、擦灰和应付检查，全是我负责。",
      face: 8,
      motion: "peek",
    },
  ],
  intro: [
    {
      text: "桌上摆着游戏，架子上挂着工具。做完的都在这屋里；至于没做完的……别看我，我可不替他解释。",
      face: 10,
      motion: "point",
    },
    {
      text: "不用办借阅手续，随便翻翻就好。……看完了也别急着走，沙发又没长刺。",
      face: 8,
      motion: "blink",
    },
  ],
  duty: [{ text: "值班表上写着全天候在岗。……不过你来得正好，我刚把登记簿上的灰擦干净。", face: 8, motion: "blink" }],
  lab: [
    {
      text: "桌上的电路板随便看。冒烟的部分我已经从网页源码里删掉了，炸不着人。",
      face: 10,
      motion: "point",
    },
  ],
  lounge: [
    { text: "欢迎光临全栋楼唯一不用填实验巡检表的房间。", face: 8, motion: "peek" },
  ],
  archive: [
    {
      text: "这里不存什么业绩周报。塞满格子的，都是些写得乱七八糟、但谁也舍不得点彻底删除的旧草稿。",
      face: 9,
      motion: "peek",
    },
  ],
  sit: [
    {
      text: "坐稳了。这个沙发唯一的故障，是不太想让人起来。",
      face: 10,
      motion: "point",
    },
    { text: "你的位置没有被猫预约。至少现在没有。", face: 11, motion: "blink" },
  ],
  controller: [
    {
      text: "手柄负责仪式感。真正开玩还是用鼠标和键盘。",
      face: 10,
      motion: "point",
    },
  ],
  discs: [
    {
      text: "坐到沙发上，拿起手柄。光盘自己会知道下一步。",
      face: 9,
      motion: "point",
    },
  ],
  lamp: [{ text: "那盏灯一直这样。暂时不算异常。", face: 11, motion: "blink" }],
  "cat-white": [
    { text: "它不是异常。它只是拒绝配合工作。", face: 11, motion: "blink" },
    { text: "白色爪子，踩键盘的时候格外理直气壮。", face: 10, motion: "point" },
  ],
  "cat-blue": [
    {
      text: "它在巡视领地。顺便监督我有没有按时休息。",
      face: 9,
      motion: "peek",
    },
    { text: "刚才它看了你一眼。算通过面试了。", face: 10, motion: "blink" },
  ],
  select: [
    {
      text: "这张我刚检查过。放进去试试看？我顺便在旁边待命。",
      face: 10,
      motion: "point",
    },
    { text: "放盘，开机。接下来交给你。", face: 8, motion: "shrink" },
  ],
  loading: [
    {
      text: "电视在努力回忆自己是台电脑。给它一点时间。",
      face: 9,
      motion: "blink",
    },
  ],
  pause: [
    {
      text: "已经按暂停了。你走神的时候，游戏也休息一下。",
      face: 8,
      motion: "shrink",
    },
  ],
  resume: [
    { text: "还在刚才那里。我没替你玩，猫也没有。", face: 10, motion: "blink" },
  ],
  swap: [
    { text: "换盘的话，刚才那局游戏就得从头打起了。想玩新的，我顺手把旧盘收起来。", face: 11, motion: "peek" },
  ],
  exit: [
    {
      text: "电视还热着。想再来一局的话，光盘就在这里。",
      face: 8,
      motion: "peek",
    },
  ],
  repeat: [
    {
      text: "收到，收到。这个按钮没有隐藏的连击倍率。",
      face: 11,
      motion: "shrink",
    },
  ],
  clue: [
    { text: "等等。刚才那个，不在我的布置清单里。", face: 12, motion: "peek" },
  ],
  error: [
    {
      text: "电视没接上信号。再试一次？我帮你守着这里。",
      face: 11,
      motion: "blink",
    },
  ],
  secret: [
    { text: "这间屋子以前明明打过报废标记。……奇怪，门缝底下怎么还在漏光。你先别关灯。", face: 13, motion: "glitch" },
  ],
  ending: [
    {
      text: "你还在。……没什么，我只是确认一下。",
      face: 8,
      motion: "peek",
    },
    {
      text: "回游戏房吧。灯还亮着。",
      face: 10,
      motion: "point",
    },
  ],
};
export const camera = {
  pushMs: 1800,
  pullMs: 1000,
  reducedMs: 220,
  origin: "52% 33%",
  scale: 3.4,
};
export type CatStep = {
  x: number;
  y: number;
  duration: number;
  pose: "walk" | "groom" | "sleep" | "jump" | "stretch";
  flip?: boolean;
  z?: number;
};
export const catRoutes: Record<"white" | "blue", CatStep[]> = {
  white: [
    { x: 52, y: 68, duration: 8, pose: "walk" },
    { x: 36, y: 70, duration: 6, pose: "walk", flip: true },
    { x: 39, y: 67, duration: 4, pose: "groom" },
    { x: 45, y: 73, duration: 2, pose: "jump" },
    { x: 51, y: 73, duration: 9, pose: "sleep" },
    { x: 54, y: 68, duration: 2, pose: "jump" },
    { x: 66, y: 66, duration: 7, pose: "walk" },
  ],
  blue: [
    { x: 84, y: 63, duration: 7, pose: "stretch" },
    { x: 77, y: 63, duration: 9, pose: "walk", flip: true },
    { x: 73, y: 66, duration: 5, pose: "groom" },
    { x: 88, y: 72, duration: 10, pose: "walk" },
    { x: 89, y: 72, duration: 13, pose: "sleep" },
    { x: 84, y: 63, duration: 8, pose: "walk", flip: true },
  ],
};
export const games = [
  {
    id: "clickdown",
    workId: "click-down",
    name: "CLICKDOWN",
    note: "四拍倒数，十三种小意外。",
    color: "#d7ddd1",
    image: "./media/portfolio/click-down-network-poster.png",
  },
  {
    id: "anchored-gaze",
    workId: "anchored-gaze",
    name: "万众瞩目",
    note: "你一转身，目光就追了过来。",
    color: "#d47a60",
    image: "./media/portfolio/anchored-gaze-menu.png",
  },
] as const;
export type GameId = (typeof games)[number]["id"];
