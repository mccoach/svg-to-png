import langEn from './lang-en.js';
import langZh from './lang-zh.js';
import { renderTexts } from './render.js';
import { setupSVGPNGHandlers } from './svgpng.js';

const LANG_KEY = "lang";
const langPack = { en: langEn, zh: langZh };

// 获取/保存当前语言
function getLang() {
    return localStorage.getItem(LANG_KEY) || "en";
}
function setLang(l) {
    localStorage.setItem(LANG_KEY, l);
    refreshLang();
}

// 语言切换按钮高亮
function highlightLangBtn(lang) {
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
}

// 渲染（及功能初始化）
function refreshLang() {
    const l = getLang();
    const lang = langPack[l];
    renderTexts(lang);

    // zoomInfo 切换案例
    document.getElementById('zoomInfo').textContent = lang.zoom.replace("{percent}", "100");
    // ...如有其他首次需要重置的内容填充
}

// 绑定语言按钮
document.getElementById('lang-en').onclick = () => setLang('en');
document.getElementById('lang-zh').onclick = () => setLang('zh');

// 初始化功能
setupSVGPNGHandlers(
    langPack[getLang()],
    langPack[getLang()].alerts,
    (percent) => {
        // 更新缩放信息
        document.getElementById('zoomInfo').textContent =
            langPack[getLang()].zoom.replace("{percent}", percent);
    }
);

// 初始化语言
refreshLang();
highlightLangBtn(getLang());
