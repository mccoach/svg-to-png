export function renderTexts(lang) {
    // 标题
    document.title = lang.title;
    // 作者信息
    document.getElementById('authorInfo').innerHTML = lang.author;
    // 拖放区域
    document.getElementById('dropZoneText').textContent = lang.dropZoneText;
    document.getElementById('chooseFileBtn').textContent = lang.chooseFile;
    // 编辑器
    document.getElementById('editorHeader').textContent = lang.editorHeader;
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
    document.getElementById('downloadBtn').textContent = lang.downloadBtn;
}
