# 游戏声音素材来源与实现记录

本次只替换AVG探索层的环境声、物件声、收音机声及游戏外框的奖杯反馈。CLICKDOWN与万众瞩目两个嵌入游戏本身的音频不在本次修改范围内。

| 用途 | 项目文件 | 原素材及作者 | 授权 | 处理 |
| --- | --- | --- | --- | --- |
| 雨声白噪音质感 | `rain-white.ogg` | [Rain (loopable)](https://opengameart.org/content/rain-loopable)的`1.ogg`，Ylmir | CC0 | 保留原录音，连续循环；室内按房间低通，走廊与天台保留更多高频 |
| 纸张、抽屉、门、拿取、插入、开关、滚筒 | `paper_01.ogg`等13个文件 | [100 CC0 SFX](https://opengameart.org/content/100-cc0-sfx)，rubberduck | CC0 | 按交互映射播放，运行时调整音量与房间混响 |
| 奖杯获得 | `achievement.ogg` | [Interface Sounds](https://kenney.nl/assets/interface-sounds)的`confirmation_001.ogg`，Kenney | CC0 | 原文件 |
| 八音盒发条 | `musicbox-wind.ogg` | [Clock Wind Sounds](https://opengameart.org/content/clock-wind-sounds)的`multiwind1.wav`，BMacZero | CC0 | 转码为Ogg Vorbis |
| 猫呼噜 | `cat-purr.ogg` | [Cat Purr & Meow](https://opengameart.org/content/cat-purr-meow)的`cat_purrsleepy_loop.wav`，Kerzoven | CC0 | 转码为Ogg Vorbis |
| 收音机爵士旋律 | `radio-jazz.ogg` | [jazz improvisation looped](https://opengameart.org/content/jazz-improvisation-looped)的`jazz_improv_looped.mp3`，Alex McCulloch | CC0 | 单声道22.05kHz Ogg转码，运行时低通模拟旧收音机 |
| 收音机空频噪声 | `radio-static.ogg` | [Static](https://opengameart.org/content/static)的`ScatterNoise1.mp3`，xhunterko | CC0 | 单声道22.05kHz Ogg转码，按频率渐弱 |
| 收音机旧呼叫 | `radio-call.ogg` | [Mysterious Radio Signal](https://opengameart.org/content/mysterious-radio-signal)的`static-radio.ogg`，原录制nicStage，改编Sam Uncle | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) | 保留原文件，运行时调整混音音量；此行及游戏设置中的来源信息为署名 |

所有新音频位于`public/media/game-sfx/`。`src/avg/exploration/audio-samples.json`集中配置交互映射；室内的滤波与音量仍由现有房间配置控制。取消了AVG环境层的自动生成音符，收音机也不再用振荡器现场生成旋律和噪声。雨声是实录雨音，听感接近连续白噪音，但不是数学意义上的等功率谱白噪音。

音量开关仍统一控制这些声音。浏览器首次用户交互后才会解锁音频；若素材加载失败，视觉交互继续，控制台会报告缺失文件。
