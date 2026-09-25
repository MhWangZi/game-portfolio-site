# 小助手装配稿逐项对位审计

来源：小助手全量台词情感动效样式装配版_2026-09-24.md。此表按当前可游玩的场景与节点核对，稿件只作为文本来源。

稿件实际有25个CHOICE条目、26个EVENT条目、4个场景操作和12段特殊台词；标题中的27与逐项内容不一致。
其中58项接入了可触发路径，9项因现有场景没有对应的独立物件或操作，仅保存在事件数据中。

|稿件条目|状态|当前接入点或说明|
|---|---|---|
|CHOICE.visitor-register.visitor.continue|已接入|visitor-register.visitor|
|CHOICE.visitor-register.blank.continue|已接入|visitor-register.blank|
|CHOICE.coat-owner.owner.continue|已接入|coat-owner.owner|
|CHOICE.coat-owner.keep.continue|已接入|coat-owner.keep|
|CHOICE.missing-room.gap.continue|已接入|missing-room.gap|
|CHOICE.missing-room.map.continue|已接入|missing-room.map|
|CHOICE.tool-care.fix.continue|已接入|tool-care.fix|
|CHOICE.tool-care.dust.continue|已接入|tool-care.dust|
|CHOICE.door-name.back.continue|已接入|door-name.back|
|CHOICE.door-name.stay.continue|已接入|door-name.stay|
|CHOICE.no-reflection.turn.continue|已接入|no-reflection.turn|
|CHOICE.no-reflection.touch.continue|已接入|no-reflection.touch|
|CHOICE.borrowed-light.stay.continue|已接入|borrowed-light.stay|
|CHOICE.borrowed-light.touch.continue|已接入|borrowed-light.touch|
|CHOICE.sparse-signal.record.continue|已接入|sparse-signal.record|
|CHOICE.sparse-signal.listen.continue|已接入|sparse-signal.listen|
|CHOICE.sparse-signal.release.continue|已接入|sparse-signal.release|
|CHOICE.rain-cup.light.continue|已接入|rain-cup.light|
|CHOICE.rain-cup.rain.continue|已接入|rain-cup.rain|
|CHOICE.signal-reports.economy.continue|已接入|signal-reports.economy|
|CHOICE.signal-reports.numeric.continue|已接入|signal-reports.numeric|
|CHOICE.loose-contact.tool.continue|已接入|loose-contact.tool|
|CHOICE.loose-contact.retract.continue|已接入|loose-contact.retract|
|CHOICE.unnamed-box.away.continue|已接入|unnamed-box.away|
|CHOICE.unnamed-box.privacy.continue|已接入|unnamed-box.privacy|
|SCENE.duty.bulletin|已接入|场景回应配置|
|SCENE.corridor.phone-hang|已接入|场景回应配置|
|CONTROL.archive-exit|已接入|场景回应配置|
|CONTROL.music-open|已接入|场景回应配置|
|EVENT.visitor-register|已接入|场景热点可触发|
|EVENT.stopped-clock|已接入|场景热点可触发|
|EVENT.coat-owner|已接入|场景热点可触发|
|EVENT.missing-room|已接入|场景热点可触发|
|EVENT.wet-step|已接入|场景热点可触发|
|EVENT.cat-seat|已接入|场景热点可触发|
|EVENT.disc-margin|已接入|场景热点可触发|
|EVENT.box-outline|仅预留|包装盒事件与现有拿取八音盒状态冲突，保留场景内拿取与差分。|
|EVENT.sofa-place|仅预留|沙发使用可游玩的坐下与游戏入口，事件弹窗会打断操作。|
|EVENT.tool-care|已接入|场景热点可触发|
|EVENT.prototype-mistake|仅预留|原型通过可阅读作品入口呈现，不以便签事件替代。|
|EVENT.unrecorded-answer|已接入|场景热点可触发|
|EVENT.empty-file|仅预留|档案柜有独立抽屉和归还流程，第四抽屉空文件未作为可点物件。|
|EVENT.far-away|已接入|场景热点可触发|
|EVENT.pencil-note|仅预留|曲序卡由三层小柜的档案交互呈现，避免重复事件弹窗。|
|EVENT.room-index|仅预留|建筑图由档案柜页面呈现，避免与现有房间拓扑矛盾。|
|EVENT.fifth-seat|仅预留|现有放映间是三把椅子，不存在稿中第四把椅子。|
|EVENT.spliced-label|已接入|场景热点可触发|
|EVENT.empty-audience|仅预留|空座位沿用场景观察，不叠加第二个选择窗口。|
|EVENT.chair-distance|已接入|场景热点可触发|
|EVENT.door-name|已接入|场景热点可触发|
|EVENT.no-reflection|已接入|场景热点可触发|
|EVENT.forgotten-line|仅预留|规程原件由档案页承载，不添加重复的纸页弹窗。|
|EVENT.borrowed-light|已接入|场景热点可触发|
|EVENT.sparse-signal|已接入|场景热点可触发|
|EVENT.loose-contact|已接入|场景热点可触发|
|1. 首次盖章授权时（Clearance Elevation）|已接入|运行时情境|
|2. 再次打开调阅台（系统恢复上次阅读页码）|已接入|运行时情境|
|3. 关闭调阅台返回房间漫游|已接入|运行时情境|
|1. 切走标签页 15 分钟切回（被抓包的心虚慌乱）|已接入|运行时情境|
|2. 切走标签页 45 分钟切回（以为玩家断电离开）|已接入|运行时情境|
|3. 游戏房猫咪熟睡（微缩气泡与噤声）|已接入|运行时情境|
|4. 天台收音机调出 98.6MHz（暴雨中的萨克斯）|已接入|运行时情境|
|5. 鼠标光标高频晃动逗弄（Cursor Jiggling）|已接入|运行时情境|
|6. 选项悬停徘徊犹豫（Choice Hesitation）|已接入|运行时情境|
|7. 二周目初见裂痕（Déjà vu 初体验）|已接入|运行时情境|
|8. 二周目未看曲序卡直接听三首歌（未卜先知惊恐）|已接入|运行时情境|
|9. 档案室读完清空规程（戏剧性留白）|已接入|运行时情境|

仅预留表示台词已经写入事件数据，但该事件在当前场景设计中未启用；它不应被宣称为玩家可见。
