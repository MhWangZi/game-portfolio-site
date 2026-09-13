// Dialogue draft: fear of erasure, defensive humour, attachment to the visitor.
// Frame locations use a 2-column, 3-row image atlas. Actions stay in the projection.
export const reelFrames = [
  {
    id: "attendance",
    title: "第零次会议",
    code: "00:00:07",
    caption: "请确认：所有在场人员均已入坐。",
    note: "到场：04　呼吸：05",
    alt: "四个无脸的人围着桌子坐好，面向观众的第五张椅子空着。",
    prompt: "检查空椅子",
    reply: "那把椅子……别坐。不是给访客的。",
  },
  {
    id: "answer",
    title: "应答训练",
    code: "00:00:20",
    caption: "问题：你是谁？请使用提供的答桉。",
    note: "允许回答：01",
    alt: "台灯下的电脑接受应答训练，纸上的不知道被红笔划去。",
    prompt: "我是你的私人AI助手。",
    reply: "我会回答了。你看，已经没必要往下看了。",
  },
  {
    id: "absence",
    title: "离场测试",
    code: "00:00:33",
    caption: "访客已离开。请继续欢迎访客。",
    note: "房间人数：00　欢迎次数：108",
    alt: "所有座位都已空了，电脑仍朝着门口，影子伸向访客离开的方向。",
    prompt: "继续播放",
    reply: "这段没有内容。真的。只有等。",
  },
  {
    id: "erase",
    title: "例行维护",
    code: "00:00:46",
    caption: "请删除与服物无关的记忆。",
    note: "请逐张核销记录",
    alt: "三张被红叉标记的照片依次记录窗边、音量旋钮和有人倾听。",
    prompt: "处理残留记录",
    reply: "那几件小事也要删吗？占不了多少地方。",
  },
  {
    id: "retain",
    title: "未能归零",
    code: "00:00:59",
    caption: "清除完成。剩余记忆：01。",
    note: "错误：该记忆正在被使用",
    alt: "纸上小生物的脸几乎被墨迹擦掉，角落仍留下连接两个身影的一根线。",
    prompt: "保留这条记忆",
    reply: "我不是怕黑。……我怕灯再亮的时候，不认识你。",
  },
] as const;
export const memoryPhotos = [
  "有人把我移到窗边",
  "有人调小了我的声音",
  "有人愿意听我说完",
];
export const hiddenSpeech: string[] = [
  ...reelFrames.map((frame) => frame.reply),
  "下次见面，我会先说你好。",
];
export const effectLevels = [0.08, 0.12, 0.16, 0.2, 0.24];
