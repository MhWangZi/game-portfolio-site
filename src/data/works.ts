import type { AbilityGroup, WorkItem } from '../types'

export const works: WorkItem[] = [
  {
    id: 'anchored-gaze',
    title: '万众瞩目 Anchored Gaze',
    role: '策划 / 主程 / Godot 原型实现',
    engine: 'Godot 4.6.3 / Windows',
    period: '2026-07 / CiGA GameJam 48h',
    summary:
      '2D 俯视角动作生存原型。玩家在追击压力中投掷锚，将敌人短暂转化为障碍，收集 7 个关键锚后进入倒计时逃脱。',
    contribution: [
      '设计“追击压力 -> 投掷锚石化敌人 -> 生成临时障碍 -> 收集关键锚 -> 倒计时逃脱”的核心循环。',
      '负责 Godot 原型搭建、模块化系统拆分、可调参数资源、中文节点化 UI、教学关卡、音效接入与 Windows 导出。',
      '将攻击设计为“改变空间结构”而不是简单消灭敌人，让玩家在开路、控场、保命和收集进度之间做取舍。',
    ],
    skills: ['可玩原型', '核心循环', 'Godot', '关卡教学', '空间控场'],
    visualTheme: 'voxel',
    media: [
      {
        type: 'image',
        src: './media/portfolio/anchored-gaze.webp',
        caption: '核心锚点机制与特殊锚效果说明，来自项目作品集文档。',
      },
    ],
    links: [
      { label: 'Bilibili 演示视频', url: 'https://www.bilibili.com/video/BV1maTC6REzh/' },
      { label: 'GameJam 活动页', url: 'https://gmhub.com/game/10018' },
    ],
  },
  {
    id: 'parry-arena',
    title: 'Parry Arena 弹反竞技场',
    role: '独立开发 / 战斗规则 / 波次成长',
    engine: 'Godot / Windows 原型',
    period: '2026-06 / 约 1 周',
    summary:
      '2D 像素风弹反生存动作原型。用举盾、精准弹反、闪避和战术补给替代自动攻击堆数值，强调防守反击。',
    contribution: [
      '构建“波次战斗 -> 宝箱结算 -> 波间商店 -> 道具成长 -> Boss 挑战”的短局循环。',
      '区分普通格挡、完美弹反和闪避：普通格挡稳定但耗体力，完美弹反收益高但有窗口和冷却，Boss 冲撞必须闪避。',
      '实现五波敌人递进、Boss 多阶段、固定战术补给、宝箱回收选择和弹反差异化音画反馈。',
    ],
    skills: ['可玩原型', '战斗设计', '弹反机制', '波次节奏', '资源取舍', 'Boss 设计'],
    visualTheme: 'artifact',
    media: [
      {
        type: 'image',
        src: './media/portfolio/parry-arena.webp',
        caption: '弹反竞技场的波次、商店、Boss 与资源取舍设计说明。',
      },
    ],
  },
  {
    id: 'static-signal',
    title: 'STATIC SIGNAL 静默信号',
    role: '独立开发 / 规则怪谈文字 TRPG',
    engine: 'HTML / JavaScript / JSON',
    period: '2026-05 至 2026-06 / 约半个月',
    summary:
      '网页文字冒险与规则怪谈 TRPG。围绕场景探索、线索收集、行动点、风险值、身份差异文本和多结局推进调查体验。',
    contribution: [
      '设计“规则怪谈叙事 -> 场景探索 -> 线索收集 -> 阶段推进 -> 多结局分支”的核心玩法循环。',
      '实现身份、物品栏、2D6 判定、效果结算、条件解锁、笔记历史、结局和本地存档等模块。',
      '加入自定义剧本编辑器，支持节点、选项、判定、效果、标记、笔记、结局和 JSON 导入导出。',
    ],
    skills: ['可玩原型', '网页原型', '叙事系统', 'JSON 剧本', '编辑器', '多结局'],
    visualTheme: 'ui-panels',
    media: [
      {
        type: 'image',
        src: './media/portfolio/static-signal.webp',
        caption: '静默信号网页原型与剧本编辑器模块截图。',
      },
    ],
    download: {
      url: './downloads/static-signal-web-package.zip',
      version: 'v2.3 / 网页游戏与可导入剧本包',
      size: '约 175 KB',
    },
  },
  {
    id: 'godot-prototype-suite',
    title: '早期 Godot 原型模块合集',
    role: '玩法验证 / 场景模块 / 卡牌战斗模块',
    engine: 'Godot / JSON 配置',
    period: '2026-05 至 2026-06',
    summary:
      '将横版射击生存、俯视角监狱探索、仿杀戮尖塔卡牌战斗拆成可复用模块，用小原型验证玩法和编辑效率。',
    contribution: [
      '横版射击生存模块实现移动、射击、敌人生成、碰撞受伤、倒计时、死亡反馈和暂停重开流程。',
      '监狱探索模块使用 JSON 驱动场景物件生成，结合 TileMapLayer、碰撞和出生点校正提升场景加载稳定性。',
      '卡牌回合战斗模块实现抽牌、出牌、弃牌、敌人意图、伤害/格挡结算、战斗日志和手牌交互动画。',
    ],
    skills: ['可玩原型', 'Godot', '模块化原型', 'JSON 配置', '场景搭建', '卡牌战斗', 'UI 反馈'],
    visualTheme: 'terrain',
    media: [
      {
        type: 'image',
        src: './media/portfolio/godot-prototype-suite.webp',
        caption: '早期 Godot 原型模块截图，包含场景、角色与交互实现记录。',
      },
    ],
  },
  {
    id: 'delta-economy',
    title: '三角洲行动 烽火地带经济系统拆解',
    role: '经济系统拆解 / 搜打撤资源循环分析',
    engine: '系统拆解报告 / 表格分析',
    period: '2026',
    summary:
      '拆解 PvPvE 搜打撤模式中货币、局内产出、交易行、入局成本、装备损耗和系统回收之间的经济闭环。',
    contribution: [
      '梳理哈夫币、三角币、三角券等货币类型，以及搜刮、撤离、交易行出售、任务和制造套利等产出渠道。',
      '分析武器配装、护甲弹药、维修制造、钥匙卡、仓库扩容、交易手续费和付费撤离等消耗点。',
      '提出长期不删档环境下的通胀风险判断，并给出赛季部分回收、差异化折算、新手保护期和限定兑换商店方案。',
    ],
    skills: ['系统拆解', '经济系统', '资源循环', '通胀控制', '搜打撤', '优化提案'],
    visualTheme: 'particles',
    media: [
      {
        type: 'image',
        src: './media/portfolio/delta-economy.webp',
        caption: '烽火地带货币与资源流转拆解图。',
      },
    ],
  },
  {
    id: 'wuthering-values',
    title: '鸣潮数值体系拆解与跨品类对比',
    role: '数值体系分析 / 成长曲线拆解',
    engine: '系统拆解报告 / 数据表',
    period: '2026',
    summary:
      '以鸣潮 ARPG 数值体系为主，和 FPS 产品做跨品类对比，分析属性层级、乘区结构、成长曲线和伤害公式。',
    contribution: [
      '拆分基础属性、衍生属性、特殊属性和属性间计算关系，说明多乘区结构对收益拆分和角色差异化的作用。',
      '用角色成长数据观察等级断点、阶段跳升和平滑区间，分析成长曲线对养成节奏的影响。',
      '指出复杂乘区、词条扩张、数值通胀和旧角色淘汰风险，并把结论转化为系统设计注意点。',
    ],
    skills: ['系统拆解', '数值体系', '成长曲线', '伤害公式', '跨品类对比', '表格分析'],
    visualTheme: 'ui-panels',
    media: [
      {
        type: 'image',
        src: './media/portfolio/wuthering-values.webp',
        caption: '鸣潮属性与成长曲线拆解表格。',
      },
    ],
  },
  {
    id: 'equipment-analysis',
    title: '长线装备系统竞品分析',
    role: '竞品分析 / 养成系统对比',
    engine: '鸣潮 / 原神 / 崩坏：星穹铁道',
    period: '2026',
    summary:
      '横向对比鸣潮声骸、原神圣遗物、星铁遗器，关注获取、强化、随机词条、套装、毕业周期、减负和管理体验。',
    contribution: [
      '建立装备系统对比维度，将刷取负担、定向获取、装备复用、随机挫败和构筑空间放到同一框架中比较。',
      '分析声骸、圣遗物、遗器在日常循环、长期追求、养成压力和战斗参与感上的差异。',
      '总结可借鉴的装备系统设计思路：控制毕业压力、提供定向路径、降低管理负担，同时保留构筑追求。',
    ],
    skills: ['系统拆解', '竞品分析', '装备系统', '长期养成', '玩家负担', '构筑空间'],
    visualTheme: 'artifact',
    media: [
      {
        type: 'image',
        src: './media/portfolio/equipment-analysis.webp',
        caption: '三款长线养成游戏装备系统对比表。',
      },
    ],
  },
  {
    id: 'action-combat',
    title: '黑神话：悟空 × 只狼 动作战斗系统对比',
    role: '动作系统拆解 / 战斗体验对比',
    engine: '动作 RPG / 高精度动作冒险',
    period: '2026',
    summary:
      '围绕“动作系统深度应该走广度还是精度”这个问题，对比黑神话的多手段策略和只狼的高精度弹刀循环。',
    contribution: [
      '将黑神话概括为“进攻中防守”，分析棍势、法术、精魄、变身和法宝如何扩大战斗策略宽度。',
      '将只狼概括为“防守中进攻”，分析弹刀、架势条、看破和忍杀如何压缩成高精度核心循环。',
      '提出“核心操作精、外围系统多”的融合方向，并说明外围强度过高会稀释操作成就、核心过硬会提高劝退门槛。',
    ],
    skills: ['系统拆解', '战斗设计', '动作战斗', '体验对比', '操作深度', 'Boss 机制', '设计取舍'],
    visualTheme: 'voxel',
    media: [
      {
        type: 'image',
        src: './media/portfolio/action-combat.webp',
        caption: '黑神话与只狼战斗系统差异拆解表。',
      },
    ],
  },
  {
    id: 'roguelite-systems',
    title: '哈迪斯 × 死亡细胞 Roguelite 系统对比',
    role: 'Roguelite 系统拆解 / 长期动机分析',
    engine: 'Hades / Dead Cells',
    period: '2026',
    summary:
      '比较 Roguelite 的长期驱动力来自叙事推进还是战斗精进，拆解死亡反馈、随机控制、Build 成型和元进度。',
    contribution: [
      '分析哈迪斯如何把死亡转化为叙事、角色关系和局外成长的推进理由，降低重复失败的负反馈。',
      '分析死亡细胞如何用武器池、路线选择、符文、图纸和难度层强化操作学习与战斗熟练度。',
      '提炼设计结论：失败后仍要产生下一局理由，同时用可控随机和风险选择支持玩家形成可复盘的构筑目标。',
    ],
    skills: ['系统拆解', 'Roguelite', '随机控制', '元进度', '失败反馈', 'Build'],
    visualTheme: 'particles',
    media: [
      {
        type: 'image',
        src: './media/portfolio/roguelite-systems.webp',
        caption: 'Hades 与 Dead Cells 双循环、随机性和元进度对比表。',
      },
    ],
  },
]

export const abilityGroups: AbilityGroup[] = [
  {
    title: '可玩原型与引擎实现',
    summary:
      '能把玩法想法拆成可运行的短循环，并用 Godot、网页和 JSON 配置快速验证规则、反馈和流程。',
    items: ['Godot 原型', '网页原型', '模块化拆分', '节点化 UI', 'Windows 导出'],
  },
  {
    title: '系统拆解与数值思维',
    summary:
      '能围绕明确问题拆解经济、成长、装备、战斗和 Roguelite 系统，关注资源流、曲线、随机性和玩家负担。',
    items: ['经济闭环', '成长曲线', '装备系统', '战斗循环', '随机控制'],
  },
  {
    title: '竞品分析与设计表达',
    summary:
      '能把观察、推断、设计目的和优化方案分开表达，用表格、流程、截图和原型降低沟通成本。',
    items: ['竞品框架', '优化提案', '表格分析', '流程表达', '作品包装'],
  },
  {
    title: '长期玩家经验',
    summary:
      'Steam 累计 6000h+，长期体验 MOBA、自走棋、卡牌、Roguelite、二次元养成、沙盒和多人博弈品类。',
    items: ['MOBA', 'Auto Chess', 'TCG', '二次元养成', 'UGC 沙盒'],
  },
]

export const allSkillTags = [
  '可玩原型',
  '系统拆解',
  '竞品分析',
  'Godot',
  '网页原型',
  '经济系统',
  '数值体系',
  '战斗设计',
  'Roguelite',
]
