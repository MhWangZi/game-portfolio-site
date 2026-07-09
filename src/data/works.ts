import type { AbilityGroup, WorkItem } from '../types'

const releaseBase = 'https://github.com/MhWangZi/game-portfolio-site/releases/download/portfolio-game-builds-v1'

export const works: WorkItem[] = [
  {
    id: 'hd2d-kit',
    title: 'HD2DKit Godot 新手工具插件',
    kind: 'Tooling Project',
    role: '独立开发 / Godot EditorPlugin / 新手工作流设计',
    engine: 'Godot 4.x / GDScript / EditorPlugin',
    period: '2026-06 至 2026-07 / v1.76',
    summary:
      '面向 Godot 新手的 HD-2D 场景工具包。把地图底图、Y-Sort 遮挡、碰撞绘制、角色创建、角色库、NPC 对话和商店配置收进一个编辑器侧边栏。',
    oneLine: '遮挡、碰撞、地图、角色库和 NPC 配置被收束为可直接点选的 Godot 侧边栏工具。',
    contribution: [
      '实现 Godot EditorPlugin 与右侧 Dock，把场景、工具、主角、角色库、NPC、物品和设置组织成分页工作流。',
      '提供地图底图生成、Camera2D 边界设置、Y-Sort 结构初始化、旧场景升级和场景体检，减少新手手动搭节点的成本。',
      '实现遮挡物标记、地图遮挡片点选绘制、碰撞 Polygon 转换、脚底碰撞体规范、物件阴影生成等场景制作工具。',
      '实现主角创建、动画绑定、角色库扫描、便携角色包导出/导入，以及 NPC 对话、巡逻、交易、物品库和商店 UI 配置。',
    ],
    skills: ['工具开发', 'Godot 插件', 'EditorPlugin', 'HD-2D', '新手工作流', '角色库', '碰撞与遮挡', 'NPC 系统'],
    visualTheme: 'ui-panels',
    featured: true,
    proof: [
      { label: '项目类型', value: 'Godot EditorPlugin / Dock 工具' },
      { label: '当前版本', value: 'v1.76 / 可下载插件包' },
      { label: '核心用户', value: '不熟悉 Godot 的新手创作者' },
    ],
    designHighlights: [
      { title: '核心目标', body: '节点层级、Y-Sort 和脚本绑定被收束成侧边栏按钮、表单和可视化绘制。' },
      { title: '地图工作流', body: '支持生成 BaseMap、Camera2D 边界、Y-Sort 层级，并提供场景体检和旧场景升级入口。' },
      { title: '区域编辑', body: '用点选绘制、Polygon 转换和遮挡物标记处理地图遮挡、碰撞、调节区和物件阴影。' },
      { title: '角色与 NPC', body: '提供主角节点生成、动画绑定、角色库复用、便携角色包、NPC 对话/巡逻/交易和物品库。' },
    ],
    flow: ['场景底图', '遮挡绘制', '碰撞规范', '角色库', 'NPC / 商店'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/hd2d-kit-cover.png',
        caption: 'HD2DKit 插件封面：基于插件自带角色帧表和 UI 资源整理的功能档案图。',
      },
    ],
    download: {
      url: './downloads/hd2d-kit-v1.76.zip',
      version: 'Godot 插件包 / v1.76',
      size: '约 18.4 MiB',
    },
    links: [
      { label: 'Bilibili 插件教程 01', url: 'https://www.bilibili.com/video/BV1Fx776cErG/' },
      { label: 'Bilibili 插件教程 02', url: 'https://www.bilibili.com/video/BV1VuJP6HE9Y/' },
      { label: 'Bilibili 个人空间', url: 'https://space.bilibili.com/94407611' },
      { label: '抖音个人空间', url: 'https://v.douyin.com/KtkwFjtQ7G8/' },
    ],
  },
  {
    id: 'anchored-gaze',
    title: '万众瞩目 Anchored Gaze',
    kind: 'Playable Prototype',
    role: '策划 / 主程 / Godot 原型实现',
    engine: 'Godot 4.6.3 / Windows',
    period: '2026-07 / CiGA GameJam 48h',
    summary:
      '2D 俯视角动作生存原型。玩家在追击压力中投掷锚，将敌人短暂转化为障碍，收集 7 个关键锚后进入倒计时逃脱。',
    oneLine: '投掷锚改变空间结构，在追击压力下完成收集与逃脱。',
    contribution: [
      '设计“追击压力 -> 投掷锚石化敌人 -> 生成临时障碍 -> 收集关键锚 -> 倒计时逃脱”的核心循环。',
      '负责 Godot 原型搭建、模块化系统拆分、可调参数资源、中文节点化 UI、教学关卡、音效接入与 Windows 导出。',
      '攻击会改变空间结构，临时障碍带来开路、控场、保命和收集进度之间的取舍。',
    ],
    skills: ['可玩原型', '核心循环', 'Godot', '关卡教学', '空间控场'],
    visualTheme: 'voxel',
    proof: [
      { label: '项目类型', value: '2D 俯视角 / 收集逃脱' },
      { label: '档案文件', value: 'Windows Build + 演示视频' },
      { label: '团队环境', value: '3 人 / 48h GameJam' },
    ],
    designHighlights: [
      { title: '核心循环', body: '追击压力、投锚控场、关键锚收集和倒计时逃脱构成完整短局目标。' },
      { title: '玩家决策', body: '玩家需要判断什么时候开路、什么时候保命、什么时候冒险推进收集进度。' },
      { title: '机制取舍', body: '敌人会被转化为临时障碍，空间规划成为推进收集目标的关键。' },
      { title: '落地状态', body: '完成可运行 Windows 版本、教学关卡、音效和演示视频，可直接验证玩法。' },
    ],
    flow: ['追击压力', '投掷锚', '石化敌人', '收集关键锚', '倒计时逃脱'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/anchored-gaze-gameplay.png',
        caption: '万众瞩目实机画面：视线压力、锚点收集与敌群追击的空间关系。',
      },
      {
        type: 'image',
        src: './media/portfolio/anchored-gaze-cover.png',
        caption: '标题界面与主视觉：锚、视线和压迫感被放在同一视觉主题中。',
      },
      {
        type: 'image',
        src: './media/portfolio/anchored-gaze-menu.png',
        caption: '菜单状态：难度、音乐和提示入口为快速测试保留可调参数。',
      },
      {
        type: 'image',
        src: './media/portfolio/anchored-gaze-tutorial.png',
        caption: '教学提示：功能锚、危险锚和回避锚的规则说明。',
      },
      {
        type: 'image',
        src: './media/portfolio/anchored-gaze-loading.png',
        caption: '载入画面：保持同一套红黑手绘视觉符号。',
      },
    ],
    download: {
      url: `${releaseBase}/anchored-gaze-windows.exe`,
      version: 'Windows Build / 2026-07',
      size: '约 142 MiB',
      sha256: 'BB687544D3CC29F6A6FE75D566CF83AA5F68947ABBB17B0EBF657D99E7886599',
    },
    links: [
      { label: 'Bilibili 演示视频', url: 'https://www.bilibili.com/video/BV1maTC6REzh/' },
      { label: 'GameJam 活动页', url: 'https://gmhub.com/game/10018' },
    ],
  },
  {
    id: 'parry-arena',
    title: 'Parry Arena 弹反竞技场',
    kind: 'Playable Prototype',
    role: '独立开发 / 战斗规则 / 波次成长',
    engine: 'Godot / Windows 原型',
    period: '2026-06 / 约 1 周',
    summary:
      '2D 像素风弹反生存动作原型。用举盾、精准弹反、闪避和战术补给替代自动攻击堆数值，强调防守反击。',
    oneLine: '防守行为成为主要进攻来源，弹反窗口和体力消耗制造操作选择。',
    contribution: [
      '构建“波次战斗 -> 宝箱结算 -> 波间商店 -> 道具成长 -> Boss 挑战”的短局循环。',
      '区分普通格挡、完美弹反和闪避：普通格挡稳定但耗体力，完美弹反收益高但有窗口和冷却，Boss 冲撞必须闪避。',
      '实现五波敌人递进、Boss 多阶段、固定战术补给、宝箱回收选择和弹反差异化音画反馈。',
    ],
    skills: ['可玩原型', '战斗设计', '弹反机制', '波次节奏', '资源取舍', 'Boss 设计'],
    visualTheme: 'artifact',
    proof: [
      { label: '项目类型', value: '2D 像素风 / 弹反生存动作' },
      { label: '档案文件', value: 'Windows Build / 五波流程' },
      { label: '核心验证', value: '格挡、弹反、闪避分工' },
    ],
    designHighlights: [
      { title: '核心循环', body: '波次战斗后进入宝箱与商店，玩家把即时操作收益转化为成长选择。' },
      { title: '玩家决策', body: '普通格挡更稳但消耗体力，完美弹反收益高但窗口严格，闪避用于处理冲撞和危险站位。' },
      { title: '机制取舍', body: '强化弹反爽感，但通过体力、冷却和 Boss 行为避免弹反成为万能解法。' },
      { title: '落地状态', body: '实现普通格挡、完美弹反、弹幕反射、波次递进、Boss 阶段和战术补给。' },
    ],
    flow: ['波次战斗', '宝箱结算', '波间商店', '道具成长', 'Boss 挑战'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/parry-arena-gameplay.png',
        caption: '弹反竞技场实机画面：波次战斗、敌人站位、体力与资源栏同时构成压力。',
      },
      {
        type: 'image',
        src: './media/portfolio/parry-arena-cover.png',
        caption: '标题界面：高压战斗和弹反主题被压缩成单屏入口。',
      },
      {
        type: 'image',
        src: './media/portfolio/parry-arena-shop.png',
        caption: '波间商店：战斗收益转化为局内成长选择。',
      },
      {
        type: 'image',
        src: './media/portfolio/parry-arena-reward.png',
        caption: '宝箱结算：阶段奖励为下一波构筑方向提供分岔。',
      },
      {
        type: 'image',
        src: './media/portfolio/parry-arena-settings.png',
        caption: '设置界面：用于测试音量、显示和战术补给参数。',
      },
    ],
    download: {
      url: `${releaseBase}/parry-arena-windows.exe`,
      version: 'Windows Build / 2026-06',
      size: '约 214 MiB',
      sha256: '8F4BD3AD6901BBC57A3E04D27EF16CADB3D803B9237A983478975AFCA9EC509D',
    },
  },
  {
    id: 'static-signal',
    title: 'STATIC SIGNAL 静默信号',
    kind: 'Playable Prototype',
    role: '独立开发 / 规则怪谈文字 TRPG',
    engine: 'HTML / JavaScript / JSON',
    period: '2026-05 至 2026-06 / 约半个月',
    summary:
      '网页文字冒险与规则怪谈 TRPG。围绕场景探索、线索收集、行动点、风险值、身份差异文本和多结局推进调查体验。',
    oneLine: '用行动点、风险值、职业视角和剧本编辑器搭建可扩展文字冒险系统。',
    contribution: [
      '设计“规则怪谈叙事 -> 场景探索 -> 线索收集 -> 阶段推进 -> 多结局分支”的核心玩法循环。',
      '实现身份、物品栏、2D6 判定、效果结算、条件解锁、笔记历史、结局和本地存档等模块。',
      '加入自定义剧本编辑器，支持节点、选项、判定、效果、标记、笔记、结局和 JSON 导入导出。',
    ],
    skills: ['可玩原型', '网页原型', '叙事系统', 'JSON 剧本', '编辑器', '多结局'],
    visualTheme: 'ui-panels',
    proof: [
      { label: '项目类型', value: '网页文字冒险 / TRPG' },
      { label: '档案文件', value: 'HTML 包 + 可导入 JSON 剧本' },
      { label: '核心验证', value: '剧本编辑器与本地存档' },
    ],
    designHighlights: [
      { title: '核心循环', body: '探索场景、消耗行动点、收集线索、触发风险并进入分支结局。' },
      { title: '玩家决策', body: '玩家要在情报收益、风险增长、身份能力和不可返回地点之间取舍。' },
      { title: '机制取舍', body: 'JSON 剧本和编辑器将内容生产从代码中拆出，降低扩展成本。' },
      { title: '落地状态', body: '提供可下载网页包、默认副本、自定义剧本导入和编辑器测试流程。' },
    ],
    flow: ['选择身份', '调查节点', '2D6 判定', '线索记录', '多结局'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/static-signal-interface.png',
        caption: '静默信号网页界面：身份差异文本、属性分布与规则怪谈调查入口。',
      },
      {
        type: 'image',
        src: './media/portfolio/static-signal-editor.png',
        caption: '剧本编辑器：节点、选项、条件和效果可以在网页中直接配置。',
      },
      {
        type: 'image',
        src: './media/portfolio/static-signal-list.png',
        caption: '记录列表：线索、状态和历史文本组成调查过程。',
      },
      {
        type: 'image',
        src: './media/portfolio/static-signal-story.png',
        caption: '正文阅读界面：风险提示和选项反馈构成规则怪谈压力。',
      },
    ],
    download: {
      url: './downloads/static-signal-web-package.zip',
      version: 'v2.3 / 网页游戏与可导入剧本包',
      size: '约 175 KB',
    },
    links: [
      { label: '早期原型与网页文字冒险 Word 文档', url: './downloads/prototype-and-web-adventure.docx' },
      { label: '系统玩法设计与可玩原型 Word 文档', url: './downloads/playable-prototype-portfolio.docx' },
    ],
  },
  {
    id: 'godot-prototype-suite',
    title: '早期 Godot 原型模块合集',
    kind: 'Playable Prototype',
    role: '玩法验证 / 场景模块 / 卡牌战斗模块',
    engine: 'Godot / JSON 配置',
    period: '2026-05 至 2026-06',
    summary:
      '将横版射击生存、俯视角监狱探索、仿杀戮尖塔卡牌战斗拆成可复用模块，用小原型验证玩法和编辑效率。',
    oneLine: '多个小原型验证移动、场景、刷怪、卡牌战斗和 JSON 配置工作流。',
    contribution: [
      '横版射击生存模块实现移动、射击、敌人生成、碰撞受伤、倒计时、死亡反馈和暂停重开流程。',
      '监狱探索模块使用 JSON 驱动场景物件生成，结合 TileMapLayer、碰撞和出生点校正提升场景加载稳定性。',
      '卡牌回合战斗模块实现抽牌、出牌、弃牌、敌人意图、伤害/格挡结算、战斗日志和手牌交互动画。',
    ],
    skills: ['可玩原型', 'Godot', '模块化原型', 'JSON 配置', '场景搭建', '卡牌战斗', 'UI 反馈'],
    visualTheme: 'terrain',
    proof: [
      { label: '项目类型', value: 'Godot 模块实验' },
      { label: '档案文件', value: '场景截图 / 模块说明' },
      { label: '核心验证', value: 'JSON 驱动内容生成' },
    ],
    designHighlights: [
      { title: '核心循环', body: '用小型玩法模块验证移动、战斗、场景和 UI 反馈的基本闭环。' },
      { title: '玩家决策', body: '横版射击强调走位与射击节奏，卡牌模块强调出牌顺序和防御结算。' },
      { title: '机制取舍', body: '场景物件、卡牌和敌人优先抽到 JSON，减少具体对象耦合。' },
      { title: '落地状态', body: '完成可运行模块、截图证据和可复用配置结构。' },
    ],
    flow: ['移动验证', '场景生成', '碰撞反馈', '卡牌结算', 'UI 刷新'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/godot-prototype-suite.webp',
        caption: '早期 Godot 原型模块截图，包含场景、角色与交互实现记录。',
      },
    ],
    links: [
      { label: '早期原型与网页文字冒险 Word 文档', url: './downloads/prototype-and-web-adventure.docx' },
      { label: '系统玩法设计与可玩原型 Word 文档', url: './downloads/playable-prototype-portfolio.docx' },
    ],
  },
  {
    id: 'delta-economy',
    title: '三角洲行动 烽火地带经济系统拆解',
    kind: 'System Analysis',
    role: '经济系统拆解 / 搜打撤资源循环分析',
    engine: '系统拆解报告 / 表格分析',
    period: '2026',
    summary:
      '拆解 PvPvE 搜打撤模式中货币、局内产出、交易行、入局成本、装备损耗和系统回收之间的经济闭环。',
    oneLine: '用来源、消耗、交易、回收和通胀风险解释搜打撤经济循环。',
    contribution: [
      '梳理哈夫币、三角币、三角券等货币类型，以及搜刮、撤离、交易行出售、任务和制造套利等产出渠道。',
      '分析武器配装、护甲弹药、维修制造、钥匙卡、仓库扩容、交易手续费和付费撤离等消耗点。',
      '提出长期不删档环境下的通胀风险判断，并给出赛季部分回收、差异化折算、新手保护期和限定兑换商店方案。',
    ],
    skills: ['系统拆解', '经济系统', '资源循环', '通胀控制', '搜打撤', '优化提案'],
    visualTheme: 'particles',
    proof: [
      { label: '分析对象', value: 'PvPvE 搜打撤经济' },
      { label: '档案文件', value: '货币流转图 / 回收方案' },
      { label: '核心问题', value: '长期不删档通胀' },
    ],
    designHighlights: [
      { title: '核心循环', body: '入局成本、局内风险、成功撤离、交易变现和局外投入形成闭环。' },
      { title: '玩家决策', body: '玩家在装备成本、地图风险、撤离收益和仓储压力之间权衡。' },
      { title: '机制取舍', body: '稳定低风险收益保护新手，高风险高收益路线提供追求，但需要回收机制控通胀。' },
      { title: '落地状态', body: '产出来源、消耗点和官方回收项均拆成可复查的系统节点。' },
    ],
    flow: ['入局成本', '局内搜刮', '成功撤离', '交易流通', '系统回收'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/delta-economy-cover.png',
        caption: '搜打撤经济主题封面：入局成本、撤离路线、交易与回收被抽象成战术桌面。',
      },
    ],
    download: {
      url: './downloads/delta-economy-breakdown.docx',
      version: 'Word 文档 / 经济系统拆解',
      size: '约 414 KB',
    },
  },
  {
    id: 'wuthering-values',
    title: '鸣潮数值体系拆解与跨品类对比',
    kind: 'System Analysis',
    role: '数值体系分析 / 成长曲线拆解',
    engine: '系统拆解报告 / 数据表',
    period: '2026',
    summary:
      '以鸣潮 ARPG 数值体系为主，和 FPS 产品做跨品类对比，分析属性层级、乘区结构、成长曲线和伤害公式。',
    oneLine: '从属性层级、乘区结构和成长曲线拆解 ARPG 数值设计风险。',
    contribution: [
      '拆分基础属性、衍生属性、特殊属性和属性间计算关系，说明多乘区结构对收益拆分和角色差异化的作用。',
      '用角色成长数据观察等级断点、阶段跳升和平滑区间，分析成长曲线对养成节奏的影响。',
      '指出复杂乘区、词条扩张、数值通胀和旧角色淘汰风险，并把结论转化为系统设计注意点。',
    ],
    skills: ['系统拆解', '数值体系', '成长曲线', '伤害公式', '跨品类对比', '表格分析'],
    visualTheme: 'ui-panels',
    proof: [
      { label: '分析对象', value: '鸣潮 ARPG 数值体系' },
      { label: '档案文件', value: '属性表 / 成长曲线' },
      { label: '核心问题', value: '复杂乘区与通胀风险' },
    ],
    designHighlights: [
      { title: '核心循环', body: '角色、武器、声骸和共鸣链共同构成多来源成长。' },
      { title: '玩家决策', body: '玩家围绕乘区收益、角色定位和资源投入优先级做养成判断。' },
      { title: '机制取舍', body: '多乘区能拆分收益，但版本扩张会增加理解成本和旧角色淘汰风险。' },
      { title: '落地状态', body: '用表格和曲线把属性关系、成长跳点和风险点结构化呈现。' },
    ],
    flow: ['属性分层', '乘区拆解', '成长采样', '曲线判断', '风险总结'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/wuthering-values-cover.png',
        caption: 'ARPG 数值体系主题封面：成长曲线、属性层级和战斗收益被抽象成角色构筑画面。',
      },
    ],
    download: {
      url: './downloads/wuthering-values-breakdown.docx',
      version: 'Word 文档 / 数值体系拆解',
      size: '约 559 KB',
    },
  },
  {
    id: 'equipment-analysis',
    title: '长线装备系统竞品分析',
    kind: 'System Analysis',
    role: '竞品分析 / 养成系统对比',
    engine: '鸣潮 / 原神 / 崩坏：星穹铁道',
    period: '2026',
    summary:
      '横向对比鸣潮声骸、原神圣遗物、星铁遗器，关注获取、强化、随机词条、套装、毕业周期、减负和管理体验。',
    oneLine: '对比三类长线装备系统如何平衡追求感、随机挫败和日常负担。',
    contribution: [
      '建立装备系统对比维度，将刷取负担、定向获取、装备复用、随机挫败和构筑空间放到同一框架中比较。',
      '分析声骸、圣遗物、遗器在日常循环、长期追求、养成压力和战斗参与感上的差异。',
      '总结可借鉴的装备系统设计思路：控制毕业压力、提供定向路径、降低管理负担，同时保留构筑追求。',
    ],
    skills: ['系统拆解', '竞品分析', '装备系统', '长期养成', '玩家负担', '构筑空间'],
    visualTheme: 'artifact',
    proof: [
      { label: '分析对象', value: '声骸 / 圣遗物 / 遗器' },
      { label: '档案文件', value: '15 张对比表' },
      { label: '核心问题', value: '随机负担与构筑空间' },
    ],
    designHighlights: [
      { title: '核心循环', body: '刷取、筛选、强化、套装组合和角色适配共同构成长期追求。' },
      { title: '玩家决策', body: '玩家在体力、定向获取、词条随机和装备复用之间不断取舍。' },
      { title: '机制取舍', body: '随机性制造长期目标，但必须用减负、锁定或转化机制控制挫败感。' },
      { title: '落地状态', body: '用统一维度对比三款产品，提炼可迁移的装备系统设计经验。' },
    ],
    flow: ['获取入口', '词条随机', '强化投入', '套装构筑', '减负设计'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/equipment-analysis-cover.png',
        caption: '长线装备系统主题封面：刷取、词条、套装和强化压力被组织为三组装备样张。',
      },
    ],
    download: {
      url: './downloads/equipment-analysis-report.docx',
      version: 'Word 文档 / 装备系统竞品分析',
      size: '约 676 KB',
    },
  },
  {
    id: 'action-combat',
    title: '黑神话：悟空 × 只狼 动作战斗系统对比',
    kind: 'System Analysis',
    role: '动作系统拆解 / 战斗体验对比',
    engine: '动作 RPG / 高精度动作冒险',
    period: '2026',
    summary:
      '围绕“动作系统深度应该走广度还是精度”这个问题，对比黑神话的多手段策略和只狼的高精度弹刀循环。',
    oneLine: '对比“进攻中防守”和“防守中进攻”两种动作系统深度路径。',
    contribution: [
      '将黑神话概括为“进攻中防守”，分析棍势、法术、精魄、变身和法宝如何扩大战斗策略宽度。',
      '将只狼概括为“防守中进攻”，分析弹刀、架势条、看破和忍杀如何压缩成高精度核心循环。',
      '提出“核心操作精、外围系统多”的融合方向，并说明外围强度过高会稀释操作成就、核心过硬会提高劝退门槛。',
    ],
    skills: ['系统拆解', '战斗设计', '动作战斗', '体验对比', '操作深度', 'Boss 机制', '设计取舍'],
    visualTheme: 'voxel',
    proof: [
      { label: '分析对象', value: '黑神话 / 只狼' },
      { label: '档案文件', value: '战斗系统差异表' },
      { label: '核心问题', value: '广度与精度取舍' },
    ],
    designHighlights: [
      { title: '核心循环', body: '黑神话用多手段调度节奏，只狼用弹刀和架势条压缩战斗循环。' },
      { title: '玩家决策', body: '前者鼓励资源与窗口调度，后者强调读招、时机和连续执行。' },
      { title: '机制取舍', body: '外围系统可降低门槛，但过强会稀释核心操作成就。' },
      { title: '落地状态', body: '以系统定位、操作深度、服务玩家和设计标签建立对比。' },
    ],
    flow: ['系统定位', '操作深度', '资源调度', 'Boss 压力', '融合提案'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/action-combat-dragon.jpg',
        caption: '动作战斗拆解素材：黑神话高压战斗场景与动作反馈。',
      },
      {
        type: 'image',
        src: './media/portfolio/action-combat-wukong-title.jpg',
        caption: '黑神话标题素材：多手段动作系统的分析对象。',
      },
      {
        type: 'image',
        src: './media/portfolio/action-combat-sekiro-title.jpg',
        caption: '只狼标题素材：高精度弹刀循环的分析对象。',
      },
      {
        type: 'image',
        src: './media/portfolio/action-combat-gameplay.jpg',
        caption: '动作战斗实机素材：读招、窗口和资源调度的观察入口。',
      },
    ],
    download: {
      url: './downloads/action-combat-comparison.docx',
      version: 'Word 文档 / 动作战斗系统对比',
      size: '约 0.99 MiB',
    },
  },
  {
    id: 'roguelite-systems',
    title: '哈迪斯 × 死亡细胞 Roguelite 系统对比',
    kind: 'System Analysis',
    role: 'Roguelite 系统拆解 / 长期动机分析',
    engine: 'Hades / Dead Cells',
    period: '2026',
    summary:
      '比较 Roguelite 的长期驱动力来自叙事推进还是战斗精进，拆解死亡反馈、随机控制、Build 成型和元进度。',
    oneLine: '比较叙事推进与战斗精进两种 Roguelite 长期动机。',
    contribution: [
      '分析哈迪斯如何把死亡转化为叙事、角色关系和局外成长的推进理由，降低重复失败的负反馈。',
      '分析死亡细胞如何用武器池、路线选择、符文、图纸和难度层强化操作学习与战斗熟练度。',
      '提炼设计结论：失败后仍要产生下一局理由，同时用可控随机和风险选择支持玩家形成可复盘的构筑目标。',
    ],
    skills: ['系统拆解', 'Roguelite', '随机控制', '元进度', '失败反馈', 'Build'],
    visualTheme: 'particles',
    proof: [
      { label: '分析对象', value: 'Hades / Dead Cells' },
      { label: '档案文件', value: '双循环对比表' },
      { label: '核心问题', value: '失败后为何再开一局' },
    ],
    designHighlights: [
      { title: '核心循环', body: '短局战斗和长线解锁共同构成死亡后的继续动力。' },
      { title: '玩家决策', body: '玩家在路线风险、武器池、随机祝福和元进度目标之间建立复盘。' },
      { title: '机制取舍', body: '叙事可缓和失败，操作挑战可延长深度，但都需要给下一局明确理由。' },
      { title: '落地状态', body: '从随机控制、Build 多样性、元进度和失败反馈四个维度对比。' },
    ],
    flow: ['单局构筑', '随机选择', '失败反馈', '局外成长', '下一局目标'],
    media: [
      {
        type: 'image',
        src: './media/portfolio/roguelite-hades-scene.jpg',
        caption: 'Roguelite 拆解素材：Hades 的局内战斗与局外叙事推进。',
      },
      {
        type: 'image',
        src: './media/portfolio/roguelite-deadcells-scene.jpg',
        caption: 'Roguelite 拆解素材：Dead Cells 的路线、武器和操作压力。',
      },
    ],
    download: {
      url: './downloads/roguelite-systems-breakdown.docx',
      version: 'Word 文档 / Roguelite 系统对比',
      size: '约 660 KB',
    },
  },
]

export const abilityGroups: AbilityGroup[] = [
  {
    title: '原型验证',
    summary: '可运行短循环、下载包与截图切片。',
    items: ['Godot 原型', '网页原型', 'Windows Build', '短循环验证'],
    evidence: ['Anchored Gaze', 'Parry Arena', 'STATIC SIGNAL'],
  },
  {
    title: '战斗机制设计',
    summary: '输入窗口、风险收益与操作深度。',
    items: ['弹反窗口', '体力消耗', 'Boss 压力', '操作取舍'],
    evidence: ['Parry Arena', '黑神话 × 只狼'],
  },
  {
    title: '系统拆解',
    summary: '玩家路径、资源流与循环目的。',
    items: ['玩家路径', '核心循环', '设计目的', '优化提案'],
    evidence: ['三角洲经济系统', 'Roguelite 系统对比'],
  },
  {
    title: '数值 / 经济分析',
    summary: '来源、消耗、曲线、乘区和通胀。',
    items: ['资源闭环', '成长曲线', '通胀控制', '乘区结构'],
    evidence: ['三角洲行动', '鸣潮数值体系'],
  },
  {
    title: '叙事系统',
    summary: '身份、线索、行动点与多结局。',
    items: ['规则怪谈', '线索收集', '多结局', '职业视角'],
    evidence: ['STATIC SIGNAL'],
  },
  {
    title: '竞品分析',
    summary: '统一维度下的产品差异比较。',
    items: ['装备系统', '动作战斗', 'Roguelite', '玩家负担'],
    evidence: ['装备系统竞品分析', '动作战斗系统对比'],
  },
  {
    title: '工具与编辑器实现',
    summary: '配置、节点操作与场景制作工具流。',
    items: ['EditorPlugin', 'JSON 配置', '剧本编辑器', '节点化 UI', '模块化拆分'],
    evidence: ['HD2DKit Godot 插件', '静默信号编辑器', 'Godot 原型模块合集'],
  },
]

export const allSkillTags = [
  '可玩原型',
  '系统拆解',
  '竞品分析',
  'Godot',
  '网页原型',
  '工具开发',
  'Godot 插件',
  'HD-2D',
  '经济系统',
  '数值体系',
  '战斗设计',
  'Roguelite',
]
