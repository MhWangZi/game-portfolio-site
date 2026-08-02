# CLICK\\DOWN 网站接入设计

日期：2026-08-02
状态：已确认，等待实现

## 目标

将新完成的 `CLICK\\DOWN` 接入现有游戏设计站点，作为首页轮播第一项和设计档案 `CASE 01`。接入继续使用现有数据驱动结构、GSAP 切换动画、Three.js 场景层和项目档案弹窗，不增加割裂站点结构的独立专题页。

网站必须使用真实实机素材和可核验项目数据。飞书文档截图仅作为信息取证来源，不作为站点媒体素材。

## 名称与转义

- 页面可见名称固定为 `CLICK\\DOWN`，包含两个反斜杠。
- TypeScript 字符串写作 `CLICK\\\\DOWN`，确保浏览器最终渲染两个反斜杠。
- 标题、短标题、图片替代文本、媒体说明、下载卡片和外链文案统一检查，不允许退化成单个反斜杠。

## 信息来源

- 项目设计文档：用户提供的公开飞书页面。
- 游戏发布页：`https://ro-kiro.itch.io/click-down`。
- 比赛页面：`https://itch.io/jam/gmtk-jam-2026/rate/4819745`。
- Windows 构建：`S:\work\GMTK 2026\2026gmtk\build\CLICKDOWN_Windows.zip`。
- 实机媒体：itch.io 发布页中的五张原创 GIF。

比赛数据采用以下口径：42 份评分；官方分类排名为美术第 123、创意第 229、音频第 347、趣味性第 1182、叙事第 1370；约前 2.6% 和第 274 名只标注为第三方综合统计，不写成 GMTK 官方综合排名。

## 项目数据

在 `src/data/works.ts` 首部增加 `click-down` 条目：

- `kind`: `Playable Prototype`
- `shortTitle`: `CLICK\\DOWN`
- `heroOrder`: `1`
- `caseOrder`: `1`
- `scenePreset`: `countdown-grid`
- `role`: 核心玩法与 13 组交互段落设计、Godot 原型和系统实现、节奏判定、节点配置、Shader 整合、UI 与音频反馈、测试及导出
- `engine`: Godot 4.6.3 / Windows
- `period`: 2026-07-22 至 2026-07-26 / GMTK Game Jam 2026
- `designQuestion`: 固定的四拍倒数，如何持续产生新的观察与操作规则？
- `oneLine`: 以 4、3、2、1 为稳定语法，持续改变目标的外观、位置、可见性和输入方式。
- `flow`: 观察线索、预测下一拍、鼠标输入、节奏与视觉反馈、更新规则认知

项目详情突出四组设计信息：

1. 稳定语法：所有关卡共享四拍倒数，降低理解新规则时的基础负担。
2. 规则递进：点击、禁拍、记忆、长按、拖拽、轨迹模仿和路径重构逐层改变信息与操作方式。
3. 系统实现：音乐时间、拍点数据、输入判定、状态反馈、图像变化和关卡结算通过统一接口协作。
4. 验证结果：公开反馈认可 CRT 画面、拼贴素材和规则变化；主要问题集中在后段教学速度、操作容差、音乐衔接和注意力竞争。

证明字段使用简短结构化信息：

- 项目类型：2D 鼠标节奏 / 12 个正式微型关卡
- 开发环境：4 人团队 / 4 天 Game Jam
- 公开反馈：42 份评分 / 美术 #123 / 创意 #229

## 排序

首页当前项目轮播：

1. `CLICK\\DOWN`
2. HD2DKit
3. Parry Arena
4. Anchored Gaze

设计档案轮播：

1. `CLICK\\DOWN`
2. Parry Arena
3. Anchored Gaze
4. HD2DKit
5. STATIC SIGNAL

其余项目继续保留在完整项目索引中。原有条目的 `heroOrder` 和 `caseOrder` 顺延，不改变项目 ID 和现有链接。

## 媒体方案

五张 itch.io 实机 GIF 保存到 `public/media/portfolio/`，使用稳定的本地路径：

- `click-down-network.gif`：复杂节点网络，作为首页和项目索引主视觉。
- `click-down-basic.gif`：基础四拍点击。
- `click-down-drift.gif`：移动目标与追踪。
- `click-down-light.gif`：暗场局部照明。
- `click-down-collage.gif`：超现实拼贴与拖拽关系。

媒体说明只描述可见玩法，不把生成图或文档截图伪装成实机。项目档案沿用现有媒体切换、键盘左右键和缩略图导航。

为减少动态偏好提供静态首帧 PNG。`prefers-reduced-motion` 开启时，首页、项目索引和缩略图优先显示静态首帧；媒体档案中保留用户主动查看实机 GIF 的能力。

## 下载与外链

- 将 `CLICKDOWN_Windows.zip` 上传到现有 GitHub Release `portfolio-game-builds-v1`。
- 下载字段指向 Release 直链，标注 `Windows Build / GMTK 2026`、约 `84.7 MiB` 和 SHA-256。
- 外链包含 itch.io 游戏页、GMTK 比赛页和公开飞书设计记录。
- itch.io 用于项目介绍和备用下载；GitHub Release 用于站内明确的 Windows 构建按钮。

## Three.js 与动效

新增 `countdown-grid` 场景预设：

- 四个线框节点对应 4、3、2、1，围绕中心依次收缩。
- 当前项目切换到 `CLICK\\DOWN` 时，节点轻微错位并重组为路径网络。
- 鼠标仅产生低幅视差，不遮挡文字或承担核心内容。
- 移动端降低粒子数量和几何更新频率。
- `prefers-reduced-motion` 下停止节拍循环，只保留静态四节点构图。

现有 GSAP 首页、CASE 和档案切换动画继续复用；不增加持续闪烁、强烈抖动或影响阅读的 CRT 故障。

## 实现范围

预计修改：

- `src/types.ts`
- `src/data/works.ts`
- `src/components/PortfolioScene.tsx`
- `src/components/SafeImage.tsx` 或媒体呈现工具（仅在静态首帧降级需要时）
- `src/utils/workPresentation.ts`
- 必要的局部 CSS
- `public/media/portfolio/click-down-*`
- GitHub Release 资产

不改动 INDEX-0 谜题、伪后台、访问统计和现有项目内容。

## 验收标准

1. 首页加载后，`CLICK\\DOWN` 是轮播第一项；设计档案中是 `CASE 01`。
2. 浏览器可见名称始终包含两个反斜杠。
3. 五张媒体均为真实实机画面，没有飞书或 Word 文档截图。
4. 项目档案可切换全部媒体，键盘和移动端操作正常。
5. Windows 下载链接可访问，文件大小和 SHA-256 与本地构建一致。
6. itch.io、GMTK 和飞书链接均可访问。
7. Three.js 场景非空白，桌面端响应鼠标，移动端和 reduced-motion 正确降级。
8. `npm run build`、`npm run lint` 和 `npm run test:e2e` 通过。
9. Playwright 桌面与移动端截图无标题裁切、内容重叠或横向溢出。
10. GitHub Pages 部署完成后，公网首页和项目档案均显示新项目。
