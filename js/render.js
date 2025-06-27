export function renderTexts(lang) {
    document.title = lang.title;
    document.getElementById('authorInfo').innerHTML = lang.author;
    document.getElementById('dropZoneText').textContent = lang.dropZoneText;
    document.getElementById('chooseFileBtn').textContent = lang.chooseFile;
    document.getElementById('editorHeader').textContent = lang.editorHeader;
    document.getElementById('svgEditor').placeholder = lang.editorPlaceholder;
    document.getElementById('previewHeader').textContent = lang.previewHeader;
    document.getElementById('widthLabel').textContent = lang.widthLabel;
    document.getElementById('heightLabel').textContent = lang.heightLabel;
    document.getElementById('keepSizeLabel').textContent = lang.keepSizeLabel;
    document.getElementById('aspectRatioLabel').textContent = lang.aspectRatioLabel;
    document.getElementById('resetBtn').textContent = lang.resetBtn;
    document.getElementById('fitBtn').textContent = lang.fitBtn;
    const downloadImageText = document.getElementById('downloadImageText');
    if (downloadImageText) {
        downloadImageText.textContent = lang.downloadBtn;
    }
    const downloadSVGBtn = document.getElementById('downloadSVGBtn');
    if (downloadSVGBtn) {
        downloadSVGBtn.textContent = lang.downloadSVGBtn;
    }
}
