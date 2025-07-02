export function renderTexts(lang) {
    // 标题
    document.title = lang.title;
    document.getElementById('authorInfo').innerHTML = lang.author;
    // 拖放区域
    document.getElementById('dropZoneText').textContent = lang.dropZoneText;
    document.getElementById('chooseFileBtn').textContent = lang.chooseFile;
    // 编辑器
    document.getElementById('editorHeader').childNodes[0].nodeValue = lang.editorHeader;
    // 风险提示（国际化，允许多行）
    const riskTip = document.getElementById('riskTip');
    if(riskTip && lang.riskTip){
        riskTip.innerHTML = lang.riskTip.replace(/\n/g, "<br>");
    }
    document.getElementById('svgEditor').placeholder = lang.editorPlaceholder;
    // 预览
    document.getElementById('previewHeader').textContent = lang.previewHeader;
    // 控件标签
    document.getElementById('widthLabel').textContent = lang.widthLabel;
    document.getElementById('heightLabel').textContent = lang.heightLabel;
    document.getElementById('keepSizeLabel').textContent = lang.keepSizeLabel;
    document.getElementById('aspectRatioLabel').textContent = lang.aspectRatioLabel;
    document.getElementById('resetBtn').textContent = lang.resetBtn;
    document.getElementById('fitBtn').textContent = lang.fitBtn;

    // 下载图片按钮文本（避免破坏三角ICON结构）
    const downloadImageText = document.getElementById('downloadImageText');
    if (downloadImageText) downloadImageText.textContent = lang.downloadBtn;

    // SVG按钮文本/菜单(如果需要)
    const downloadSVGBtn = document.getElementById('downloadSVGBtn');
    if (downloadSVGBtn) {
        downloadSVGBtn.textContent = lang.downloadSVGBtn;
    }
}
