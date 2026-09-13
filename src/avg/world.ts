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
    note: "每扇门后都有一盏灯。走廊还额外负责下雨。",
    hotspots: [],
  },
  projection: {
    label: "旧放映间",
    eyebrow: "06 / A PRIVATE SCREENING",
    note: "放映结束以后，请不要留下空座位。空椅子总是让人心里发毛。",
    hotspots: [],
  },
  duty: {
    label: "值班室",
    eyebrow: "01 / AFTER HOURS",
    note: "灯还亮着。值班没有结束，进来坐坐。",
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
    note: "有些东西能用。有些东西……很有想法，冒烟的那种想法。",
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
    note: "把工作留在门外。猫可以进，猫不算访客。",
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
    note: "纸比我记性好一点。至少纸不会无端被格式化。",
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
    note: "原来，你也看见了。这间屋子以前不在平面图上。",
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
  corridor: [{text: "左边是实验间，右边是档案角。你慢慢走，我跟得上。", face: 10, motion: "point"}],
  projection: [{text: "放映机早就停用了。电源倒还留着。……维护清单上忘了划掉而已。", face: 12, motion: "peek", pose: "shy"}],
  enter: [
    {
      text: "我是这里的私人AI助手。MhWangZi负责做东西，我负责把它们看好。",
      face: 8,
      motion: "peek",
    },
  ],
  intro: [
    {
      text: "MhWangZi做游戏，也做工具。做完的东西都在这里；没做完的，我暂时不替他解释。",
      face: 10,
      motion: "point",
    },
    {
      text: "不用登记。随便看看就好。……看完也可以再待一会儿。",
      face: 8,
      motion: "blink",
    },
  ],
  duty: [{ text: "值班结束了。你来的时间刚刚好。", face: 8, motion: "blink" }],
  lab: [
    {
      text: "桌上的东西可以点。冒烟的部分我已经从网页里删掉了。",
      face: 10,
      motion: "point",
    },
  ],
  lounge: [
    { text: "欢迎来到唯一不用写实验记录的房间。", face: 8, motion: "peek" },
  ],
  archive: [
    {
      text: "这里没有年度总结。只有一些舍不得删掉的东西。",
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
    { text: "换盘会从头开始。刚才那局就先放下吧。", face: 11, motion: "peek" },
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
    { text: "这间屋子以前明明打过报废标记。……奇怪，怎么还漏着光。你先别关灯。", face: 13, motion: "glitch" },
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
