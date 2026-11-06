# 长尾关键词选词 · 第一批（Batch 01）

> 流程：**先找词，再做站**。一页一词，一个页面吃掉一个搜索意图。
>
> 数据源：Bing Autocomplete（变体/真实输入）、Google SERP 前 10 构成核查（竞争度）、意图与变现定性判断。
> 日期：2026-11-06。站点：cigol.dev（英文、纯前端静态导出）。

---

## 1. 判定口径

| 项 | 口径 |
| --- | --- |
| **page-level 需求** | SERP 前 10 里排前面的页面是否「专门为这个词做的」。是 → 值得单独成页 |
| **GO** | 前 10 以中小工具站/普通内页为主，新站做专用页有机会进前 20 |
| **MAYBE** | 有窗口，但同质专页已 5+ 或有强域名专页压顶 |
| **SKIP** | 被大厂首页、词根专站或意图不匹配的 SERP 形态锁死 |
| **搜索量 / CPC** | 无 Keyword Planner 权限，为定性估计（autocomplete 出现频度 + SERP 广告主类型） |

---

## 2. 工程约束（选词硬门槛）

一个词能不能进这批，先过实施关，再看 SERP。**词再好，做不成「一页一组件的静态小工具」就出局。**

| 约束 | 基线（来自现有代码） |
| --- | --- |
| 一页 = 一个路由 = 一个工具 | `registry.ts` 加一条 + `src/tools/<slug>/index.tsx` 一个 `"use client"` 组件 + `map.tsx` 加一行 |
| 组件体量 | 单工具 **1 个组件为主，至多拆 2–3 个**（cube 现状：单文件 327 行含四元数数学类，可维护） |
| 纯静态 | `output: 'export'` —— 无 API route、无 server action、无运行时服务端数据请求 |
| 零后端、零数据库 | 结果不持久化；文件不出浏览器（`canvas` / `FileReader` / 纯计算 / 下载与剪贴板） |
| 零新增依赖 | 现有依赖仅 `react` / `react-dom` / `next`；不为一个工具引 wasm、编解码库、时区库 |
| 共享逻辑放 lib，不放组件 | 跨工具复用的纯函数放 `src/tools/_lib/*.ts`，组件只管 UI |

**由此推出的选词边界：**

- ✅ **能做**：纯计算 / 纯字符串处理 / canvas 图片处理（缩放、压缩、格式转换到浏览器原生支持的格式）/ 剪贴板与文件下载
- ❌ **出局**：需要版权色值表（Pantone）、需要时区或历法数据、需要外链图源（canvas 跨域 taint 导致无法导出）、需要引入编解码库（GIF/HEIC/WebP 有损转码超原生能力）、意图上需要登录或历史记录的词

---

## 3. 推荐落地的 5 个词

| # | 长尾词 | 竞争 | 判定 | 组件数 | 体量 | 批次 |
| --- | --- | --- | --- | --- | --- | --- |
| ① | `compress image under 100kb` | GO | ✅ | 1 + 共享 lib | ~250 行 | 第 1 批 |
| ② | `youtube thumbnail compressor` | GO | ✅ | 1 + 共享 lib | ~120 行 | 第 2 批（①的薄壳） |
| ③ | `css clamp calculator` | GO | ✅ | 1（不拆） | ~150 行 | 第 1 批 |
| ④ | `csv to markdown table generator` | GO | ✅ | 1（不拆） | ~150 行 | 第 1 批 |
| ⑤ | `etsy listing image resizer` | MAYBE | ⚠️ | 1 + 共享 lib | ~150 行 | 第 2 批（唯一 MAYBE，最后做） |

**实施顺序**：`④ → ③ → ①`（同为纯计算/单引擎，成本最低，三个 GO 词先上线拿 Search Console 展示数据）→ `② → ⑤`（复用 `①` 的引擎，边际成本极低）。任何一批都不新增依赖、不新增路由之外的运行时。

### ① compress image under 100kb — `GO`

- **Autocomplete 证据**：`compress image under 50kb / 100kb / 200kb / 10kb / 1mb / 2mb / 10mb` 整族变体真实存在，本词是这一族的入口。
- **SERP**：前 10 全是中小工具站的专用页（imagecompressortools、pixoate、11zon、Pi7、jpeg-optimizer…），无大站首页垄断，无 AI 垃圾/论坛。
- **Title**：`Compress Image Under 100KB`
- **H1**：`Compress Image Under 100KB`
- **首屏说明**：1–2 句点明「把任意 JPG/PNG 压到 100KB 以内，保留画质，浏览器本地处理、不上传」。
- **实施规格**：
  - 文件：`src/tools/image-compress-under-100kb/index.tsx`（1 个组件）+ `src/tools/_lib/image.ts`（共享纯函数：`compressToTarget(file, { maxKB, maxW, maxH })`）
  - 体量：组件 ~150 行、引擎 ~100 行（`canvas.toBlob` 对 quality 做 0.01–0.95 二分；仍超目标则按 10% 逐档降尺寸；最后一次兜底转 JPEG）
  - 依赖：0（`canvas` + `URL.createObjectURL` + `<a download>`）
  - 静态 ✅ / 数据库 ✅（不持久化）/ 上传 ❌（本地处理）
  - 风险与取舍：PNG 透明区必须提示「转 JPEG 才能压到位」；不追求逐字节精确，以「≤ 目标值」为验收口径
- **变体预留（后续辐条）**：`under 50kb` / `under 200kb` / `under 2mb`，**只换 registry 条目里的规格预设，组件复用**
- **FAQ 方向**：压到 100KB 会明显糊吗 / 支持哪些格式 / 图片会上传吗 / 100KB 够用在什么场景（简历、报名表、工单系统）。

### ② youtube thumbnail compressor — `GO`

- **Autocomplete 证据**：`youtube thumbnail compressor free / 2mb / size compressor`、`compress thumbnail for youtube`。
- **SERP**：ImgTweak 精确同词专页、ThumbnailDock、ImgToolkit、ThumbFuel，全是小站，无大站。
- **Title**：`YouTube Thumbnail Compressor Under 2MB`
- **H1**：`YouTube Thumbnail Compressor Under 2MB`
- **首屏说明**：YouTube 封面上传上限 2MB，本工具把图压到 2MB 以内并保持 1280×720 比例。
- **实施规格**：
  - 文件：`src/tools/youtube-thumbnail-compressor/index.tsx`（1 个组件，**复用** `src/tools/_lib/image.ts`）
  - 体量：组件 ~120 行 —— 与①的差别只有规格预设（1280×720 等比适配 + 目标 2MB 上限）+ 一段针对 YouTube 上传规则的说明文案
  - 依赖：0；静态 ✅
  - 风险与取舍：**这是①的薄壳，边际成本极低**，但 Title/H1/首屏/FAQ 是完全独立的另一套长尾词，属于「一引擎吃两词」的标准打法
- **FAQ 方向**：YouTube 封面最大多少 MB / 1280×720 还是 1920×1080 / 会被 YouTube 二次压缩吗。

### ③ css clamp calculator — `GO`

- **Autocomplete 证据**：`css clamp calculator`、`css font size clamp`、`css clamp generator`。
- **SERP**：前 10 全是独立专页（fluid-type-scale.com、utopia.fyi、clampgenerator.com、fluidtypography.com），全是中小站，无大站、无 AI 垃圾。
- **Title**：`CSS Clamp Calculator — Fluid Type Scale Generator`
- **H1**：`CSS Clamp Calculator`
- **首屏说明**：输入最小/最大字号与视口宽度，生成 `clamp()` 值与完整流体字号阶梯。
- **实施规格**：
  - 文件：`src/tools/css-clamp-calculator/index.tsx`（**单组件，不拆**）
  - 体量：~150 行，纯数学（`preferred = (max-min)/(maxVW-minVW)`，输出 `clamp()` 一行 + 最小/最大字号、上下断点、rem 版本的阶梯表）
  - 依赖：0；无 canvas、无文件 IO —— **本批实现成本最低的词之一**
  - 静态 ✅ / 数据库 ✅ / 风险：无
- **FAQ 方向**：clamp 三个参数分别是什么 / clamp 和 media query 怎么选 / 老浏览器支持吗（IE/旧 Safari 回退）。

### ④ csv to markdown table generator — `GO`

- **Autocomplete 证据**：`csv to markdown table generator / converter / online`。
- **SERP**：前 10 为中小工具专页（tableconvert、convertcsv、tablesgenerator、devtool.tech）+ Reddit + 一篇博客内页，无大站首页锁定。
- **Title**：`CSV to Markdown Table Generator`
- **H1**：`CSV to Markdown Table Generator`
- **首屏说明**：粘贴 CSV（或直接粘 Excel 表格），即时输出 GitHub/Reddit 可用的 Markdown 表格。
- **实施规格**：
  - 文件：`src/tools/csv-to-markdown/index.tsx`（**单组件，不拆**）
  - 体量：~150 行，其中 CSV 解析约 30 行（状态机处理引号、字段内逗号与换行，**不引 papaparse**），渲染部分是拼字符串
  - 依赖：0；输入输出都在 textarea，剪贴板一键复制
  - 静态 ✅ / 数据库 ✅ / 风险与取舍：不做大文件流式解析（超过 ~1MB 给提示即可，长尾用户粘的都是小表格）；**本批实现成本最低的词之一**
- **FAQ 方向**：Excel 直接粘贴行不行 / 含逗号的字段怎么办 / 表格太大有上限吗。

### ⑤ etsy listing image resizer — `MAYBE`（CPC 高，卖家意图）

- **Autocomplete 证据**：`etsy listing image size / dimensions / ratio / file size / template`（需求强，其中工具意图部分由 resizer 页承接）。
- **SERP**：resizebox、imageconver、instasize、img101、scaylr 等几乎全是为该词做的专页，无大厂，但同质专页已 6+ → 需靠「尺寸准确性 + 实际可下载」压过弱站。
- **Title**：`Etsy Listing Image Resizer — 2000×2000`
- **H1**：`Etsy Listing Image Resizer`
- **首屏说明**：Etsy 主图推荐 2000×2000（最短边 ≥1000px），一键缩放到合规尺寸并导出。
- **实施规格**：
  - 文件：`src/tools/etsy-listing-image-resizer/index.tsx`（1 个组件，**复用** `src/tools/_lib/image.ts` 的 canvas 尺寸函数）
  - 体量：组件 ~150 行；两种模式用一个 radio 切换：`居中留白`（导出 2000×2000 白底）/ `裁切填满`（cover 裁切）
  - 依赖：0；静态 ✅
  - 风险与取舍：比①②多一个「留白/裁切」交互，但共用同一 canvas 底座；这是本批唯一的 `MAYBE`，**排在最后做**——先让三个 GO 词进 Search Console
- **变现**：卖家词，CPC 显著高于消费级词，是这批里变现最好的。
- **备选**：若想先要 `GO`，可换成 `whatsapp dp size converter`（GO、autocomplete 强、但 CPC 低、消费级流量）。

---

## 4. 被淘汰的词（记录原因，避免重复挖）

| 词 | 判定 | 原因 |
| --- | --- | --- |
| shopify product image compressor | SKIP | SERP 是 App Store 应用页 + Cloudinary 官方页，意图是「装 App」 |
| pinterest pin size compressor | SKIP | 前 10 全是尺寸指南内容页，Google 判定为信息型意图，工具页不对口 |
| instagram story size resizer | MAYBE 偏 SKIP | 同质专页 6+ 且 Hootsuite/Pallyy 大博客压顶 |
| amazon product image compressor | MAYBE | 卖家词变现好、Seller Central 官方页占位，但已有 5+ 同质专页；autocomplete 未确认该精确短语 |
| title case converter ap style | SKIP | titlecase.com 等词根专站已吃满各变体 |
| best time to meet across time zones | SKIP | timeanddate、worldtimebuddy 长期权威锁死 |
| json to typescript interface converter | SKIP | quicktype、transform.tools 等成熟专页权重碾压 |
| lorem ipsum image generator | SKIP | picsum/loremflickr 等图源直接满足需求，无独立生态位 |
| word frequency counter | SKIP | autocomplete 主变体是 `python / java / c++ / leetcode`，用户要的是代码不是工具，意图不匹配 |
| reading time calculator | MAYBE | Omni、Elementor 进前 10，小站仍有位置，留作第二批 |
| aspect ratio calculator pixels | MAYBE | 有大站但中小专页仍在前 10，留作第二批 |

### 4.1 被工程约束先刷掉的词（还没走到 SERP 就出局）

| 词/方向 | 出局原因（对照第 2 节） |
| --- | --- |
| hex to pantone color picker | 需要 Pantone 色值表，版权与数据体量都超出「零依赖、一页一组件」 |
| lorem ipsum image generator | 外链图源导致 canvas 跨域 taint，浏览器里根本导不出图（SERP 层面也已判 SKIP） |
| time zone meeting planner | 需要 IANA 时区/夏令时数据，超出纯计算边界（竞争上也已被锁死） |
| GIF 转 WebP / HEIC 转 JPG | 需要引入 wasm 或编解码库，违反零新增依赖 |
| 需要「历史记录 / 账号 / 收藏」的词 | 结果不持久化是硬约束，这类意图无法满足 |

> 教训：这五个方向的词可能搜索数据都不差，但**工程约束要写在选词标准里**，否则挖完才发现做不出来，白白浪费一批词。


---

## 5. 内链结构（Hub & Spoke）

```
/  (首页)
└── /tools                          枢纽：全站工具索页
    ├── /tools/image-compress-under-100kb   ┐
    ├── /tools/youtube-thumbnail-compressor ├─ 辐条：共用同一压缩引擎，互相 related 互链
    ├── /tools/etsy-listing-image-resizer   ┘
    ├── /tools/css-clamp-calculator         ┐
    └── /tools/csv-to-markdown              ┘— dev 组，互相 related
```

- 三张图片工具共享 `src/tools/_lib/image.ts` 这一份压缩/缩放核心（组件只写 UI），`related` 交叉指向。
- 第二步可加分类枢纽页 `/tools/image`、`/tools/dev`，把品类词和长尾词分层承接。
- 每个词上线后单独建一行，盯 Search Console 的 impressions；2–4 周内**开始被展示**的词再补 FAQ、内链、相关推荐。

## 6. On-Page 检查清单（每页发布前过一遍）

- [ ] Title / H1 含**完整长尾词**（`registry.ts` 的 `title` 即 H1，`generateMetadata` 拼接在 tagline 前）
- [ ] 首屏 1–2 句说明：做什么、为谁做，自然含核心变体
- [ ] 至少一个 H2 含工具全名，不要全是 "How it works" / "Features"
- [ ] 正文命中长尾词若干次（以竞品实测区间为靶，不机械追 2%）
- [ ] 可见 FAQ 覆盖真实问句（FAQ Schema 不再出富摘要，内容本身仍有价值）
- [ ] `keywords` 字段覆盖该词的 autocomplete 变体
- [ ] `related` 已填，形成互链
- [ ] URL 简洁：`/tools/<核心词>`
