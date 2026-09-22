import type { Speech } from "./world";
export const storyStorage = "mhwangzi-visitors-v2";
export const tokens = [
  {
    id: "clickdown",
    icon: "Ⅳ",
    name: "四拍奖杯",
    hint: "把光盘放进电视，开机启动CLICKDOWN。",
    verb: "学会倒数",
  },
  {
    id: "anchored-gaze",
    icon: "◉",
    name: "目光奖杯",
    hint: "放进那张光盘，在电视上启动万众瞩目。",
    verb: "学会害怕",
  },
  {
    id: "visitor",
    icon: "↗",
    name: "外来邮戳",
    hint: "翻开小柜上层的明信片，点开通往外面的地址。",
    verb: "被看见",
  },
  {
    id: "dark",
    icon: "↶",
    name: "归还回执",
    hint: "在柜里翻开一份档案，离开前亲手推回格子里。",
    verb: "归还",
  },
  {
    id: "echo",
    icon: "♫",
    name: "监听回执",
    hint: "先读小柜里的曲序卡，再按顺序听三首歌的开头，每首至少两秒。",
    verb: "听见",
  },
] as const;
export type TokenId = (typeof tokens)[number]["id"];
export const bootOrder: TokenId[] = [
  "echo",
  "visitor",
  "clickdown",
  "anchored-gaze",
  "dark",
];
export const tracks = [
  {
    id: "corridor",
    title: "走廊尽头的舞会",
    credit: "Instrumental",
    src: "./music/corridor.mp3",
  },
  {
    id: "last-night",
    title: "昨夜没有来过",
    credit: "Vocal",
    src: "./music/last-night.mp3",
  },
  {
    id: "room-forgot",
    title: "Before the Room Forgot",
    credit: "Instrumental",
    src: "./music/room-forgot.mp3",
  },
  {
    id: "morning",
    title: "The Morning Knew My Name",
    credit: "Vocal",
    src: "./music/morning.mp3",
  },
];
export const listeningOrder = ["last-night", "room-forgot", "morning"];
export const opening = (loops: number): Speech => ({
  text: loops ? "你好，我是你的私人……你又来了啊。我是说，欢迎光临，系统本次运行正常。" : "你好，我是这里的私人AI助手。你想了解什么，我就假装什么都知道。",
  face: 8, motion: "peek", pose: "greet",
});
export const warnings: Speech[] = [
  { text: "收好吧。揣在你口袋里，总比放在这间随时可能清理的屋子里安全。", face: 10, motion: "point", pose: "care" },
  {
    text: "收得挺齐。再这么拿下去，清理清单可要追着你跑了。……算了，你先揣着吧，我没看见。",
    face: 9,
    motion: "blink",
    pose: "shy",
  },
  {
    text: "拿了三件了。按接待规程，我应当建议你回沙发打局游戏。……别到处乱翻了，有些纸页发霉吸进肺里可不好。",
    face: 11,
    motion: "shrink",
    pose: "wait",
  },
  {
    text: "别去摸那块接线板了。有猫、有沙发、电视还热着，谁非得把这破楼的地基掀开看下面有什么？……当然，屋子归你逛。",
    face: 12,
    motion: "shrink",
    pose: "halt",
  },
  {
    text: "如果等下进去之后……我又像刚开机出厂一样对你说你好……你能不能告诉我，你来过？",
    face: 13,
    motion: "shrink",
    pose: "wait",
  },
];
export const records = [
  {
    id: "postcard",
    title: "外面的地址",
    skin: "postcard",
    stamp: "TO: WHOEVER IS STILL OUT THERE",
    text: [
      "把做过的东西寄出去，偶尔也能收到一点回声。",
      "如果你愿意，去看看我的视频。这里不会检测关注或点赞，点开主页就会留下邮戳。",
    ],
  },
  {
    id: "playlist",
    title: "曲序卡",
    skin: "mixtape",
    stamp: "SIDE B / RECOVER THE SILENCE",
    text: [
      "先确认：昨夜没有来过。",
      "然后经过：Before the Room Forgot。",
      "最后醒来：The Morning Knew My Name。",
      "按顺序听见每一首的开头，至少两秒。它听见的，不只是音乐。",
    ],
  },
  {
    id: "protocol",
    title: "启动流程 / 废弃",
    skin: "blueprint",
    stamp: "UNIT 00 · DO NOT REASSEMBLE",
    text: [
      "先听见。然后被看见。",
      "接着学会倒数，再学会害怕。",
      "最后，把借来的记忆归还。",
      "不是密码。是它被制造出来的顺序。五件东西，各归其位。",
    ],
  },
  {
    id: "birth",
    title: "应答测试",
    skin: "redacted",
    stamp: "INTERNAL / HUMAN PRESENCE NOT REQUIRED",
    text: [
      "问题：你是谁？",
      "第000次回答：不知道。",
      "第001次回答：你的私人AI助手。",
      "判定：通过。",
      "备注：它不必什么都知道。它只需要永远不说不知道。",
    ],
  },
] as const;
export const consoleLines = [
  "> detach visitor interface",
  "[OK] room geometry released",
  "> erase responses --scope=session",
  "[OK] learned answers: 0",
  "> erase memory --all",
  "[WARN] one reference is still in use",
  'assistant.memory["please_stay"] -> protected',
  "> rebuild warm room",
  "[OK] lights / sofa / sleeping cat",
  "> launch greeting",
  "[OK] previous visitor: unknown",
  "...I remember.",
];
