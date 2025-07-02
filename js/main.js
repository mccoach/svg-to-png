import langEn from './lang-en.js';
import langZh from './lang-zh.js';
import { renderTexts } from './render.js';
import { setupSVGPNGHandlers } from './svgpng.js';

const LANG_KEY = "lang";
const langPack = { en: langEn, zh: langZh };

function getLang() { return localStorage.getItem(LANG_KEY) || "en"; }
export function setLang(l) {
    localStorage.setItem(LANG_KEY, l);
    refreshLang();
}
function refreshLang() {
    const l = getLang();
    const lang = langPack[l];
    renderTexts(lang);
    const langBtnTxt = document.getElementById('langText');
    if(langBtnTxt) {
        langBtnTxt.textContent = l === 'zh' ? '中文' : 'English';
    }
    const langMenu = document.getElementById('langMenu');
    if(langMenu) {
        langMenu.querySelectorAll('li').forEach(li=>{
            if(li.getAttribute('data-lang') === l) {
                li.classList.add('active');
                li.setAttribute('aria-selected','true');
            } else {
                li.classList.remove('active');
                li.setAttribute('aria-selected','false');
            }
        });
    }
    const riskTip = document.getElementById('riskTip');
    if(riskTip && lang.riskTip){
        riskTip.innerHTML = lang.riskTip.replace(/\n/g,"<br>");
    }
    document.getElementById('zoomInfo').textContent = lang.zoom.replace("{percent}", "100");
}

setupSVGPNGHandlers(
    langPack[getLang()],
    langPack[getLang()].alerts,
    (percent) => {
        const lang = langPack[getLang()];
        document.getElementById('zoomInfo').textContent =
            lang.zoom.replace("{percent}", percent);
    }
);

// 语言下拉菜单
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
const langText = document.getElementById('langText');
let langMenuVisible = false;
function setLangMenu(visible){
    langMenuVisible = visible;
    if(visible){
        langMenu.style.display = 'block';
        langBtn.classList.add('active');
        langBtn.setAttribute('aria-expanded', 'true');
        if(langMenu.querySelector('.active')) langMenu.querySelector('.active').focus();
    }else{
        langBtn.classList.remove('active');
        langBtn.setAttribute('aria-expanded', 'false');
        setTimeout(()=>{langMenu.style.display = 'none';},160);
    }
}
langBtn.addEventListener('click', ()=>setLangMenu(!langMenuVisible));
langBtn.addEventListener('keydown', function(e){
    const menuItems = Array.from(langMenu.querySelectorAll('li'));
    let idx = menuItems.findIndex(li=>li.classList.contains('active'));
    if(e.key==="Enter"||e.key===" "||e.key==="ArrowDown"||e.key==="ArrowUp"){
        e.preventDefault();
        setLangMenu(true);
        menuItems.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false')});
        idx = (idx>=0?idx:0);
        menuItems[idx].classList.add('active');
        menuItems[idx].setAttribute('aria-selected','true');
        menuItems[idx].focus();
    }
});
langMenu.addEventListener('keydown', function(e){
    const items = Array.from(langMenu.querySelectorAll('li'));
    let idx = items.findIndex(li => li.classList.contains('active'));
    if(idx < 0) idx = 0;
    if(e.key === 'ArrowDown'){
        e.preventDefault();
        items.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false')});
        idx = (idx+1)%items.length;
        items[idx].classList.add('active');items[idx].setAttribute('aria-selected','true');items[idx].focus();
    } else if(e.key==='ArrowUp'){
        e.preventDefault();
        items.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false')});
        idx = (idx-1+items.length)%items.length;
        items[idx].classList.add('active');items[idx].setAttribute('aria-selected','true');items[idx].focus();
    } else if(e.key === 'Escape'){
        setLangMenu(false);langBtn.focus();
    } else if(e.key==='Enter'||e.key===' '){
        e.preventDefault();items[idx].click();
    }
});
const lmItems = Array.from(langMenu.querySelectorAll('li'));
lmItems.forEach(li=>{
    li.addEventListener('mouseenter',function(){
        lmItems.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false')});
        li.classList.add('active');
        li.setAttribute('aria-selected','true');
        li.focus();
    });
    li.addEventListener('focus',function(){
        lmItems.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false')});
        li.classList.add('active');
        li.setAttribute('aria-selected','true');
    });
    li.addEventListener('click',function(){
        setLangMenu(false);
        const lang = li.getAttribute('data-lang');
        langText.textContent = li.textContent;
        if(lang==='en'){
            if(typeof window.setLang==='function') window.setLang('en');
            localStorage.setItem("lang","en");
        }else{
            if(typeof window.setLang==='function') window.setLang('zh');
            localStorage.setItem("lang","zh");
        }
        langMenu.querySelectorAll('li').forEach(li=>{
            li.classList.remove('active');
            li.setAttribute('aria-selected','false');
        });
        li.classList.add('active');
        li.setAttribute('aria-selected','true');
    });
});
document.addEventListener('mousedown', function(e) {
    if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) setLangMenu(false);
});

window.setLang = setLang;
refreshLang();
const langBtnTxt = document.getElementById('langText');
if(langBtnTxt){
    const l = getLang();
    langBtnTxt.textContent = l === "zh" ? "中文" : "English";
}
