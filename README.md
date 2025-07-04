# SVG Editor & Image Exporter

<div align="center">
  <img src="assets/favicon.ico" alt="logo" height="56"><br>
  <b>智能在线 SVG 编辑器 / 实时预览 / 多格式图片导出工具</b><br>
  <b>Intelligent Online SVG Editor / Real-Time Preview / Multi-Format Exporter</b>
</div>

---

## 🚀 功能亮点 Highlights

### 中文简介

- **SVG 代码编辑**：直接编辑、粘贴 SVG XML，实时反馈。
- **实时预览**：右侧预览 SVG，支持缩放/拖拽，多终端支持。
- **多格式导出**：一键导出 PNG、JPEG、WebP，也能导出原 SVG 文件。
- **分栏宽度拖拽+一键均分**：编辑和预览区宽度自定义调整，中央小按钮一键复位。
- **分辨率自定义、图片和语言菜单弱高亮、键盘导航友好**
- **支持文件拖拽/选择导入 SVG、中英文界面切换**
- **风险提示：刷新或关闭网页将丢失内容，导出前请务必保存！**
  > ⚠️ 编辑区代码未自动保存，刷新或关闭网页后将丢失，请及时导出！

### English Introduction

- **SVG code editing**: Directly edit and paste SVG XML, see immediate result.
- **Live Preview**: See your SVG instantly; support for interactive zoom and pan, mobile-friendly.
- **Multi-format Export**: Export to PNG, JPEG, WebP, and also download original SVG.
- **Resizable Panels & Central Reset**: Drag to adjust editor/preview width; one-click center split with a button.
- **Custom resolution, soft-highlighted menus, keyboard accessible**
- **File drag/drop/import, switchable English/Chinese UI**
- **Risk Tip: All code will be lost if you refresh or close the page. Please export first!**
  > ⚠️ Refresh or close the page and your code in the editor will be lost.  
  > Please export the code in time!

---

## 🌏 在线访问 / Live Demo

- [页面在线体验 Demo](https://mccoach.github.io/svg-to-png/)  
- 源码仓库：[https://github.com/mccoach/svg-to-png](https://github.com/mccoach/svg-to-png)

---

## ✨ 截图 Screenshot

| 中文版本                  |
|:-------------------------:|
| ![截图](./screenshot-zh.png)  |

| English Version           |
|:-------------------------:|
| ![screenshot](./screenshot-en.png)  |

---

## 📝 使用方法 Usage

### 在线体验 Demo  

🔗 [Try Online / 立即使用](https://mccoach.github.io/svg-to-png/)

### 本地部署 / Run Locally

    git clone https://github.com/mccoach/svg-to-png.git
    cd svg-to-png

**推荐用VSCode Live Server，或：**

    python -m http.server 8000
    
**浏览器访问 <http://localhost:8000>**

---

## 🏗️ 文件结构 / File Structure

    /
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── main.js
    │   ├── render.js
    │   ├── svgpng.js
    │   ├── lang-en.js
    │   └── lang-zh.js
    ├── assets/
    │   └── favicon.ico
    ├── screenshot-en.png
    ├── screenshot-zh.png
    └── README.md

---

## 🌐 多语言（Multi-language）

- 页面右上角下拉按钮可一键切换 “English / 中文”  
   Click the language dropdown button in the upper-right corner to switch between English and Chinese.
- 所有菜单、控件、风险提示自动中英文切换  
   All menus, controls, and risk hints will automatically switch language.
- **GitHub 的 README.md 只能双语并排，不支持点击切换语言**  
  **GitHub README.md only supports bilingual content side by side, not language switching by click.**

---

## 📦 主要特性 Features

- **拖拽/选择 SVG 文件导入，编辑区自动填充**
  Drag-and-drop or select SVG files for instant code import
- **实时渲染和缩放，支持鼠标、滚轮及触屏**
  Live rendering and zoom, supports mouse, scroll wheel, and touch gestures
- **菜单弱高亮，键盘/鼠标/无障碍兼容，移动端适用**  
  Soft-highlighted menus, keyboard/mouse/accessible, mobile-friendly
- **一键导出 PNG/JPEG/WebP，并可导出 SVG**
  Export PNG/JPEG/WebP images and SVG source with one click
- **分栏宽度/预览缩放条任意调整**
  Resize preview/editor panels and zoom bar freely
- **编辑器标题处常驻风险提示，中英文自动切换**
  Permanent risk warning in the editor title, auto switches language

---

## 🙋 FAQ

**Q: 为什么刷新后内容丢失？**  
A: 前端编辑器不会自动保存，刷新或关闭网页后编辑器内容将丢失，务必及时导出图片或SVG！  
**Q: Why is my SVG code lost after refresh?**  
A: The editor is fully client-side and doesn’t save content persistently. Refreshing or closing the page will erase your code—please export your images or SVG files before that happens!

**Q: 菜单三角形/图标不显示怎么办？**  
A: 检查HTML结构中 download-caret 相关 SVG 及CSS部分是否缺失或被 display:none 覆盖。  
**Q: Why is the arrow icon missing in the export menu?**  
A: Check if the download-caret SVG and its CSS are present and not hidden by `display: none`.

**Q: 怎么用手机/平板操作？**
A: 完全支持触控操作，分栏以及右侧缩放条均可点击滑动。  
**Q: Can I use it on mobile devices?**
A: Fully touch device friendly—both splitting and zoom bar support tap and slide.

---

<div align="center">
欢迎 Star / Fork ，热烈欢迎提出意见反馈或 PR！<br>
Welcome to Star, Fork and send PRs or issues!
</div>
