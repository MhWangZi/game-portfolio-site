# INDEX-0 异常档案实施计划

对应规格：`docs/superpowers/specs/2026-07-20-index-zero-recovery-archive-design.md`

## 任务 1：建立状态层与路由边界

文件：

- 新增 `src/data/indexZeroArchive.ts`
- 新增 `src/hooks/useIndexZeroPuzzle.ts`
- 修改 `src/App.tsx`

步骤：

1. 定义五个片段、错误提示、完整口令和 CASE-00 文本数据。
2. 实现版本化 `localStorage` 读取、白名单校验、去重、内存回退、恢复与重置。
3. 将 App 路由扩展为 public、admin、recovery、case-zero 四类。
4. 保留已知项目 hash 由 `useDossierRoute` 处理。
5. 未验证时访问 `#/case-00`，替换为 `#/recovery`。
6. 正确验证完成时同时恢复五段并写入 `phraseVerified`。

验证：

- TypeScript 构建通过。
- `#/admin` 和项目 hash 仍进入原有页面。

## 任务 2：实现可访问的污染片段

文件：

- 新增 `src/components/index-zero/CorruptedFragment.tsx`
- 修改 `src/components/CurrentBuilds.tsx`
- 修改 `src/components/DesignRadar.tsx`
- 修改 `src/components/CaseFiles.tsx`
- 修改 `src/components/FieldNotes.tsx`

步骤：

1. 实现鼠标停留、点击、焦点停留、Enter/Space 与触屏恢复。
2. 使用 GSAP 运行一次字符错位与归位动画。
3. reduced-motion 下立即恢复。
4. 在五个指定模块接入对应片段。
5. 为测试和辅助技术提供稳定的 test id、aria-label 和 live 状态。

验证：

- 五个片段可独立恢复且不重复计数。
- 页面刷新后保持恢复状态。
- 键盘和移动端均可完成。

## 任务 3：实现完整度节点与主页解锁反馈

文件：

- 新增 `src/components/index-zero/ArchiveIntegrityNode.tsx`
- 修改 `src/components/ContactSection.tsx`
- 修改 `src/App.tsx`

步骤：

1. 添加右下完整度节点和恢复编号摘要。
2. 五段完成后切换为未登记入口状态。
3. Contact 页脚使用涂抹收缩露出 `OPEN RECOVERY INTERFACE`。
4. 解锁后显示本地记忆说明。
5. 让一个项目状态短暂显示 `OBSERVATION COMPLETE`，随后恢复。

验证：

- 0/5 至 5/5 状态准确。
- 移动端节点不遮挡操作。
- 返回主页后变化只触发一次，不改写项目数据。

## 任务 4：实现恢复入口与动画

文件：

- 新增 `src/components/index-zero/RecoveryInterface.tsx`
- 新增 `src/components/index-zero/RecoverySequence.tsx`
- 修改 `src/App.tsx`

步骤：

1. 实现恢复口令表单、统一随机错误与正确提示。
2. 输入仅在组件内存中存在，不写入本地存储或网络。
3. 使用单一 GSAP timeline 实现扫描、76% 停顿、错误、记忆源恢复和黑色涂抹转场。
4. reduced-motion 使用短时无位移版本。
5. 动画完成后写入完成状态并进入 `#/case-00`。

验证：

- 错误口令留在恢复页。
- 正确口令完成动画并进入剧情页。
- 重复提交被禁用。

## 任务 5：实现 CASE-00 剧情档案

文件：

- 新增 `src/components/index-zero/CaseZeroArchive.tsx`
- 新增 `src/styles/index-zero.css`
- 修改 `src/main.tsx`

步骤：

1. 实现状态栏、正文、批注、涂抹、警告印章和结尾作者字段。
2. 为文档章节加入一次性扫描与轻微重新分页。
3. 为状态变化和最终两句加入可清理的 GSAP 时间线。
4. 所有装饰重复文本对辅助技术隐藏。
5. 添加返回主页与清除本地恢复记忆操作。
6. 完成桌面双列与移动端单列样式。

验证：

- CASE-00 文本完整可读。
- 强动效只运行一次。
- reduced-motion 下无持续位移或打字等待。

## 任务 6：自动化与视觉回归

文件：

- 修改 `tests/visual.spec.ts`

步骤：

1. 添加五段恢复与持久化测试。
2. 添加错误口令与正确口令流程测试。
3. 添加未解锁 CASE-00 重定向测试。
4. 添加已解锁 CASE-00、键盘和 reduced-motion 测试。
5. 检查桌面和移动端横向溢出。
6. 复跑现有 Three.js、项目档案和伪后台测试。

命令：

```powershell
npm run build
npm run lint
npm run test:e2e
```

## 任务 7：浏览器验收、提交与部署

步骤：

1. 启动本地站点并截取桌面、移动端恢复页与 CASE-00。
2. 检查画面非空白、焦点状态、文字裁切和 Contact 解锁入口。
3. 检查生产路径下资源与 hash 路由。
4. 提交代码并推送 `main`。
5. 检查 GitHub Pages 部署完成并验证公开 URL。
