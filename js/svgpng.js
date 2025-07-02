export function setupSVGPNGHandlers(langObj, alertObj, setZoomInfo) {
    const dropZone           = document.getElementById('dropZone');
    const fileInput          = document.getElementById('fileInput');
    const chooseFileBtn      = document.getElementById('chooseFileBtn');
    const svgEditor          = document.getElementById('svgEditor');
    const svgPreview         = document.getElementById('svgPreview');
    const previewArea        = document.getElementById('previewArea');
    const widthInput         = document.getElementById('widthInput');
    const heightInput        = document.getElementById('heightInput');
    const aspectRatioCheckbox= document.getElementById('aspectRatio');
    const keepSizeCheckbox   = document.getElementById('keepSize');
    const stretchToFitCheckbox = document.getElementById('stretchToFit');
    const downloadBtn        = document.getElementById('downloadBtn');
    const downloadImageGroup = document.getElementById('downloadImageGroup');
    const downloadFormatMenu = document.getElementById('downloadFormatMenu');
    const resetBtn           = document.getElementById('resetBtn');
    const fitBtn             = document.getElementById('fitBtn');
    const zoomInfo           = document.getElementById('zoomInfo');
    const downloadSVGBtn     = document.getElementById('downloadSVGBtn');
    const mainContent        = document.getElementById('mainContentResizable');
    const editorContainer    = document.getElementById('editorContainer');
    const previewContainer   = document.getElementById('previewContainer');
    const mainResizer        = document.getElementById('mainResizer');
    const verticalZoomBar    = document.getElementById('verticalZoomBar');
    const verticalZoomThumb  = document.getElementById('verticalZoomThumb');
    const restoreSplitBtn    = document.getElementById('restoreSplitBtn');

    let originalAspectRatio = 1;
    let originalWidth = 200;
    let originalHeight = 200;
    let currentScale = 1;
    let baseScale = 1;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastSvgContent = '';
    let isNewContent = true;
    let currentImageFormat = 'png';
    let menuTimeout = null;

    // ========== 分栏宽度拖拽 & 恢复 ==========
    function setDefaultSplit() {
        editorContainer.style.flexBasis = "50%";
        previewContainer.style.flexBasis = "50%";
    }
    setDefaultSplit();
    let isDraggingResizer = false;
    mainResizer.addEventListener('mousedown', e => {
        isDraggingResizer = true;
        document.body.style.cursor = 'col-resize';
        mainResizer.classList.add('active');
    });
    document.addEventListener('mousemove', e => {
        if (!isDraggingResizer) return;
        const mainRect = mainContent.getBoundingClientRect();
        let px = e.clientX - mainRect.left;
        let minW = 120, maxW = mainRect.width - 120;
        if (px < minW) px = minW;
        if (px > maxW) px = maxW;
        const percent = px / mainRect.width;
        editorContainer.style.flexBasis = (percent * 100) + "%";
        previewContainer.style.flexBasis = ((1 - percent) * 100) + "%";
    });
    document.addEventListener('mouseup', () => {
        if (isDraggingResizer) {
            isDraggingResizer = false;
            mainResizer.classList.remove('active');
            document.body.style.cursor = '';
        }
    });
    mainResizer.addEventListener('keydown', function(e) {
        let percent = parseFloat(editorContainer.style.flexBasis) / 100 || 0.5;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') percent -= 0.03;
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') percent += 0.03;
        else return;
        percent = Math.max(0.12, Math.min(0.88, percent));
        editorContainer.style.flexBasis = (percent * 100) + "%";
        previewContainer.style.flexBasis = ((1 - percent) * 100) + "%";
        e.preventDefault();
    });
    if (restoreSplitBtn) restoreSplitBtn.addEventListener('click', setDefaultSplit);
    window.addEventListener('resize', function() {
        if (parseFloat(editorContainer.style.flexBasis) < 10 || parseFloat(previewContainer.style.flexBasis) < 10) {
            setDefaultSplit();
        }
    });

    // ========== 图片格式菜单及弱高亮 ==========
    let menuVisible = false;
    function setMenu(visible) {
        menuVisible = visible;
        if (menuTimeout) clearTimeout(menuTimeout);
        if (visible) {
            downloadFormatMenu.style.display = 'block';
            downloadBtn.classList.add('active');
            downloadBtn.setAttribute('aria-expanded', 'true');
            if (downloadFormatMenu.querySelector('.active')) downloadFormatMenu.querySelector('.active').focus();
        } else {
            downloadBtn.classList.remove('active');
            downloadBtn.setAttribute('aria-expanded', 'false');
            menuTimeout = setTimeout(() => {
                downloadFormatMenu.style.display = 'none';
            }, 180);
        }
    }
    downloadBtn.addEventListener('click', function(e) {
        setMenu(!menuVisible);
        if (menuVisible && downloadFormatMenu.querySelector('.active')) {
            downloadFormatMenu.querySelector('.active').focus();
        }
    });
    downloadFormatMenu.addEventListener('click', function(e) {
        const li = e.target.closest('li[data-format]');
        if (!li) return;
        currentImageFormat = li.dataset.format;
        Array.from(downloadFormatMenu.children).forEach(child => {
            child.classList.remove('active');
            child.setAttribute('aria-selected', 'false');
        });
        li.classList.add('active');
        li.setAttribute('aria-selected', 'true');
        setMenu(false);
        downloadCurrentImage();
    });
    document.addEventListener('mousedown', function(e) {
        if (!downloadImageGroup.contains(e.target)) setMenu(false);
    });
    downloadBtn.addEventListener('keydown', function(e) {
        const menuItems = Array.from(downloadFormatMenu.querySelectorAll('li'));
        let idx = menuItems.findIndex(li => li.classList.contains('active'));
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            setMenu(true);
            menuItems.forEach(item => {item.classList.remove('active'); item.setAttribute('aria-selected','false');});
            idx = idx >= 0 ? idx : 0;
            menuItems[idx].classList.add('active');
            menuItems[idx].setAttribute('aria-selected', 'true');
            menuItems[idx].focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setMenu(true);
            menuItems.forEach(item => {item.classList.remove('active'); item.setAttribute('aria-selected','false');});
            idx = idx > 0 ? idx-1 : 0;
            menuItems[idx].classList.add('active');
            menuItems[idx].setAttribute('aria-selected', 'true');
            menuItems[idx].focus();
        }
    });
    downloadFormatMenu.addEventListener('keydown', function(e) {
        const items = Array.from(downloadFormatMenu.querySelectorAll('li'));
        let idx = items.findIndex(li => li.classList.contains('active'));
        if (idx < 0) idx = 0;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            items.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-selected','false');});
            idx = (idx + 1) % items.length;
            items[idx].classList.add('active');
            items[idx].setAttribute('aria-selected', 'true');
            items[idx].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            items.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-selected','false');});
            idx = (idx - 1 + items.length) % items.length;
            items[idx].classList.add('active');
            items[idx].setAttribute('aria-selected', 'true');
            items[idx].focus();
        } else if (e.key === 'Escape') {
            setMenu(false);
            downloadBtn.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            items[idx].click();
        }
    });
    const menuItems = Array.from(downloadFormatMenu.querySelectorAll('li'));
    menuItems.forEach(li => {
        li.addEventListener('mouseenter', function() {
            menuItems.forEach(item => {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            });
            li.classList.add('active');
            li.setAttribute('aria-selected', 'true');
            li.focus();
        });
        li.addEventListener('focus', function() {
            menuItems.forEach(item => {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            });
            li.classList.add('active');
            li.setAttribute('aria-selected', 'true');
        });
    });

    // ===== 竖向缩放条/滑块缩放 =====
    const ZOOM_MIN = 0.1, ZOOM_MAX = 100;
    function scaleToPercent(scale) {
        return (Math.log(scale / ZOOM_MIN) / Math.log(ZOOM_MAX / ZOOM_MIN));
    }
    function percentToScale(percent) {
        return ZOOM_MIN * Math.pow((ZOOM_MAX / ZOOM_MIN), percent);
    }
    function setVerticalThumbPos(val) {
        if (!verticalZoomBar || !verticalZoomThumb) return;
        const barRect = verticalZoomBar.getBoundingClientRect();
        const thumbRect = verticalZoomThumb.getBoundingClientRect();
        const used = barRect.height - thumbRect.height;
        const percent = scaleToPercent(val);
        const pos = used * percent;
        verticalZoomThumb.style.bottom = `${pos}px`;
    }
    function getThumbValByEvent(e) {
        if (!verticalZoomBar || !verticalZoomThumb) return currentScale;
        const barRect = verticalZoomBar.getBoundingClientRect();
        const thumbRect = verticalZoomThumb.getBoundingClientRect();
        let y = 0;
        if (e.touches && e.touches.length) y = e.touches[0].clientY;
        else y = e.clientY;
        let rel = y - barRect.top;
        const used = barRect.height - thumbRect.height;
        let pos = rel - thumbRect.height / 2;
        pos = Math.max(0, Math.min(pos, used));
        const percent = 1 - (pos / used);
        return percentToScale(percent);
    }
    function setZoomLevel(scale) {
        currentScale = Math.max(ZOOM_MIN, Math.min(scale, ZOOM_MAX));
        updateTransform();
        setVerticalThumbPos(currentScale);
        setZoomInfo(Math.round(currentScale * 100));
    }
    function updateTransform() {
        const transformer = svgPreview.querySelector('.preview-transformer');
        if (transformer) {
            const actualScale = currentScale * baseScale;
            transformer.style.transform = `translate(${currentTranslateX}px,${currentTranslateY}px) scale(${actualScale})`;
        }
    }
    // 缩放条拖动
    let draggingThumb = false;
    verticalZoomThumb.addEventListener('mousedown', (e) => {
        draggingThumb = true;
        document.body.style.cursor = 'ns-resize';
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (!draggingThumb) return;
        setZoomLevel(getThumbValByEvent(e));
        e.preventDefault();
    });
    document.addEventListener('mouseup', () => {
        if (draggingThumb) {
            draggingThumb = false;
            document.body.style.cursor = '';
        }
    });
    verticalZoomThumb.addEventListener('touchstart', (e) => {
        draggingThumb = true;
        document.body.style.cursor = 'ns-resize';
        e.preventDefault();
    });
    document.addEventListener('touchmove', (e) => {
        if (!draggingThumb) return;
        setZoomLevel(getThumbValByEvent(e));
        e.preventDefault();
    });
    document.addEventListener('touchend', () => {
        if (draggingThumb) {
            draggingThumb = false;
            document.body.style.cursor = '';
        }
    });
    verticalZoomBar.addEventListener('mousedown', function(e) {
        if (e.target === verticalZoomThumb) return;
        setZoomLevel(getThumbValByEvent(e));
        e.preventDefault();
    });
    verticalZoomBar.addEventListener('touchstart', function(e) {
        if (e.target === verticalZoomThumb) return;
        setZoomLevel(getThumbValByEvent(e));
        e.preventDefault();
    });
    verticalZoomBar.addEventListener('wheel', (e) => {
        e.preventDefault();
        let delta = e.deltaY > 0 ? 0.9 : 1.11;
        setZoomLevel(currentScale * delta);
    });
    previewArea.addEventListener('wheel', function(e) {
        if (e.target === verticalZoomBar || verticalZoomBar.contains(e.target)) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.11;
        setZoomLevel(currentScale * delta);
    });
    previewArea.addEventListener('mousedown', function(e) {
        if (verticalZoomBar.contains(e.target)) return;
        isDragging = true;
        dragStartX = e.clientX - currentTranslateX;
        dragStartY = e.clientY - currentTranslateY;
        e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            currentTranslateX = e.clientX - dragStartX;
            currentTranslateY = e.clientY - dragStartY;
            updateTransform();
        }
    });
    document.addEventListener('mouseup', function() { isDragging = false; });

    // SVG上传/拖拽/文件选择逻辑
    chooseFileBtn.onclick = () => fileInput.click();
    function handleFile(file) {
        if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                lastSvgContent = '';
                svgEditor.value = e.target.result;
                updatePreview();
            };
            reader.readAsText(file);
        } else {
            alert(alertObj.chooseSVG);
        }
    }
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // SVG编辑器/尺寸输入变化实时预览
    let updateTimer;
    svgEditor.addEventListener('input', function() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(updatePreview, 300);
    });
    widthInput.addEventListener('input', function() {
        if (aspectRatioCheckbox.checked && this.value) {
            heightInput.value = Math.round(this.value / originalAspectRatio);
        }
        clearTimeout(updateTimer);
        updateTimer = setTimeout(updatePreview, 300);
    });
    heightInput.addEventListener('input', function() {
        if (aspectRatioCheckbox.checked && this.value) {
            widthInput.value = Math.round(this.value * originalAspectRatio);
        }
        clearTimeout(updateTimer);
        updateTimer = setTimeout(updatePreview, 300);
    });
    resetBtn.addEventListener('click', function() {
        widthInput.value = Math.round(originalWidth);
        heightInput.value = Math.round(originalHeight);
        updatePreview();
    });
    fitBtn.addEventListener('click', function() {
        currentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        setZoomLevel(currentScale);
    });
    stretchToFitCheckbox.addEventListener('change', updatePreview);
    // ========== 实时SVG预览 ==========
    function updatePreview() {
        const svgCode = svgEditor.value.trim();
        if (!svgCode) {
            svgPreview.innerHTML = `<p style="color: #999;">SVG preview will show here</p>`;
            return;
        }
        const contentDiff = getContentDifference(lastSvgContent, svgCode);
        isNewContent = contentDiff > 0.5 || lastSvgContent === '';
        lastSvgContent = svgCode;

        try {
            const cleanSvgCode = svgCode
                .replace(/<\?xml[^?]*\?>/g, '')
                .replace(/<!DOCTYPE[^>]*>/g, '')
                .trim();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(cleanSvgCode, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');
            if (!svgElement) throw new Error(alertObj.svgError);

            const viewBox = svgElement.getAttribute('viewBox');
            let svgWidth, svgHeight;
            if (viewBox) {
                const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(Number);
                svgWidth = vbWidth;
                svgHeight = vbHeight;
            } else {
                svgWidth = parseFloat(svgElement.getAttribute('width')) || 100;
                svgHeight = parseFloat(svgElement.getAttribute('height')) || 100;
            }
            if (isNewContent) {
                originalWidth     = svgWidth;
                originalHeight    = svgHeight;
                originalAspectRatio = svgWidth / svgHeight;
                if (!keepSizeCheckbox.checked) {
                    widthInput.value = Math.round(svgWidth);
                    heightInput.value = Math.round(svgHeight);
                }
            }
            const targetWidth  = parseInt(widthInput.value) || originalWidth;
            const targetHeight = parseInt(heightInput.value) || originalHeight;
            const shouldStretch= stretchToFitCheckbox.checked;

            svgPreview.innerHTML =
                `<div class="preview-wrapper" style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    <div class="preview-transformer" style="position:relative;transform-origin:center center;">
                        <div class="preview-canvas" style="width:${targetWidth}px;height:${targetHeight}px;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.15);overflow:hidden;"></div>
                    </div>
                </div>`;
            const canvas = svgPreview.querySelector('.preview-canvas');
            const processedSvg = svgElement.cloneNode(true);
            if (!processedSvg.getAttribute('viewBox')) {
                processedSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
            }
            if (shouldStretch) {
                processedSvg.setAttribute('width', '100%');
                processedSvg.setAttribute('height', '100%');
                processedSvg.setAttribute('preserveAspectRatio', 'none');
            } else {
                processedSvg.setAttribute('width', '100%');
                processedSvg.setAttribute('height', '100%');
                processedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }
            canvas.innerHTML = new XMLSerializer().serializeToString(processedSvg);

            const previewRect = previewArea.getBoundingClientRect();
            const scaleX = previewRect.width / targetWidth;
            const scaleY = previewRect.height / targetHeight;
            baseScale = Math.min(scaleX, scaleY);

            if (isNewContent) {
                currentScale = 1;
                currentTranslateX = 0;
                currentTranslateY = 0;
                setVerticalThumbPos(currentScale);
            }
            updateTransform();
        } catch (error) {
            svgPreview.innerHTML = `<p style="color: #f44336;">${alertObj.svgError}</p>`;
        }
    }
    function getContentDifference(str1, str2) {
        if (!str1 || !str2) return 1;
        const len1 = str1.length, len2 = str2.length;
        const maxLen = Math.max(len1, len2);
        if (maxLen === 0) return 0;
        let diff = Math.abs(len1 - len2);
        const minLen = Math.min(len1, len2);
        for (let i = 0; i < minLen; i++) {
            if (str1[i] !== str2[i]) diff++;
        }
        return diff / maxLen;
    }

    // ========== 多格式导出函数 ==========
    function downloadCurrentImage() {
        const svgCode = svgEditor.value.trim();
        if (!svgCode) {
            alert(alertObj.inputSVG);
            return;
        }
        const width = parseInt(widthInput.value) || originalWidth;
        const height = parseInt(heightInput.value) || originalHeight;
        let format = currentImageFormat || 'png';

        try {
            let cleanSvgCode = svgCode
                .replace(/<\?xml[^?]*\?>/g, '')
                .replace(/<!DOCTYPE[^>]*>/g, '')
                .trim();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(cleanSvgCode, 'image/svg+xml');
            const parseError = svgDoc.querySelector('parsererror');
            if (parseError) throw new Error(alertObj.svgError + ': ' + parseError.textContent);
            const parsedSvg = svgDoc.querySelector('svg');
            if (!parsedSvg) throw new Error(alertObj.svgError);

            let svgOriginalWidth = originalWidth;
            let svgOriginalHeight = originalHeight;
            const viewBox = parsedSvg.getAttribute('viewBox');
            if (viewBox) {
                const vbParts = viewBox.split(/\s+/).map(Number);
                if (vbParts.length >= 4) {
                    svgOriginalWidth = vbParts[2];
                    svgOriginalHeight = vbParts[3];
                }
            } else {
                const svgWidth = parsedSvg.getAttribute('width');
                const svgHeight = parsedSvg.getAttribute('height');
                if (svgWidth && svgHeight) {
                    svgOriginalWidth = parseFloat(svgWidth) || svgOriginalWidth;
                    svgOriginalHeight = parseFloat(svgHeight) || svgOriginalHeight;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);

            if (stretchToFitCheckbox.checked) {
                parsedSvg.setAttribute('width', width);
                parsedSvg.setAttribute('height', height);
                parsedSvg.setAttribute('preserveAspectRatio', 'none');
            } else {
                parsedSvg.setAttribute('width', svgOriginalWidth);
                parsedSvg.setAttribute('height', svgOriginalHeight);
                parsedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }
            if (!parsedSvg.getAttribute('viewBox')) {
                parsedSvg.setAttribute('viewBox', `0 0 ${svgOriginalWidth} ${svgOriginalHeight}`);
            }
            if (!parsedSvg.getAttribute('xmlns')) {
                parsedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
            const serializer = new XMLSerializer();
            const processedSvgString = serializer.serializeToString(parsedSvg);

            const img = new Image();
            const svgBlob = new Blob([processedSvgString], {type:'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);

            img.onload = function () {
                try {
                    if (!stretchToFitCheckbox.checked) {
                        const imgAspectRatio = svgOriginalWidth / svgOriginalHeight;
                        const canvasAspectRatio = width / height;
                        let drawWidth, drawHeight, drawX, drawY;
                        if (imgAspectRatio > canvasAspectRatio) {
                            drawWidth = width;
                            drawHeight = width / imgAspectRatio;
                            drawX = 0;
                            drawY = (height - drawHeight) / 2;
                        } else {
                            drawHeight = height;
                            drawWidth = height * imgAspectRatio;
                            drawX = (width - drawWidth) / 2;
                            drawY = 0;
                        }
                        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                    } else {
                        ctx.drawImage(img, 0, 0, width, height);
                    }
                    let mimeType = 'image/png', ext = 'png';
                    if (format === 'jpeg') { mimeType = 'image/jpeg'; ext = 'jpeg'; }
                    else if (format === 'webp') { mimeType = 'image/webp'; ext = 'webp'; }
                    canvas.toBlob(function(blob) {
                        if (!blob) throw new Error('Failed to generate image');
                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = `svg-to-${ext}-` + Date.now() + '.' + ext;
                        link.href = downloadUrl;
                        link.click();
                        setTimeout(() => {
                            URL.revokeObjectURL(url);
                            URL.revokeObjectURL(downloadUrl);
                        },100);
                    }, mimeType);
                } catch (e) {
                    fallbackDownload(processedSvgString, width, height, svgOriginalWidth, svgOriginalHeight, format);
                }
                URL.revokeObjectURL(url);
            };
            img.onerror = function() {
                fallbackDownload(processedSvgString, width, height, svgOriginalWidth, svgOriginalHeight, format);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (error) {
            alert(alertObj.convertFail.replace('{msg}', error.message));
        }
    }
    function fallbackDownload(svgString, width, height, svgOriginalWidth, svgOriginalHeight, format = 'png') {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            const img = new Image();
            let validSvgString = svgString;
            if (!svgString.includes('xmlns')) {
                validSvgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            const base64 = btoa(unescape(encodeURIComponent(validSvgString)));
            const dataUrl = 'data:image/svg+xml;base64,' + base64;
            img.onload = function () {
                if (!stretchToFitCheckbox.checked && svgOriginalWidth && svgOriginalHeight) {
                    const imgAspectRatio = svgOriginalWidth / svgOriginalHeight;
                    const canvasAspectRatio = width / height;
                    let drawWidth, drawHeight, drawX, drawY;
                    if (imgAspectRatio > canvasAspectRatio) {
                        drawWidth = width;
                        drawHeight = width / imgAspectRatio;
                        drawX = 0;
                        drawY = (height - drawHeight) / 2;
                    } else {
                        drawHeight = height;
                        drawWidth = height * imgAspectRatio;
                        drawX = (width - drawWidth) / 2;
                        drawY = 0;
                    }
                    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                } else {
                    ctx.drawImage(img, 0, 0, width, height);
                }
                try {
                    let mimeType = 'image/png';
                    let ext = 'png';
                    if (format === 'jpeg') {
                        mimeType = 'image/jpeg';
                        ext = 'jpeg';
                    } else if (format === 'webp') {
                        mimeType = 'image/webp';
                        ext = 'webp';
                    }
                    canvas.toBlob(function(blob) {
                        if (blob) {
                            const link = document.createElement('a');
                            link.download = `svg-to-${ext}-` + Date.now() + '.' + ext;
                            link.href = URL.createObjectURL(blob);
                            link.click();
                        } else {
                            const link = document.createElement('a');
                            link.download = `svg-to-${ext}-` + Date.now() + '.' + ext;
                            link.href = canvas.toDataURL(mimeType);
                            link.click();
                        }
                    }, mimeType);
                } catch (e) {
                    const link = document.createElement('a');
                    link.download = `svg-to-png-` + Date.now() + `.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            };
            img.onerror = function () {
                alert(alertObj.totallyFail);
            };
            img.src = dataUrl;
        } catch (e) {
            alert(alertObj.totallyFail);
        }
    }
    if (downloadSVGBtn) {
        downloadSVGBtn.addEventListener('click', function () {
            const svgCode = svgEditor.value.trim();
            if (!svgCode) {
                alert(alertObj.inputSVG);
                return;
            }
            let cleanSvgCode = svgCode
                .replace(/<\?xml[^?]*\?>/g, '')
                .replace(/<!DOCTYPE[^>]*>/g, '')
                .trim();
            if (!/^<svg[\s>]/i.test(cleanSvgCode)) {
                alert(alertObj.svgError);
                return;
            }
            if (!cleanSvgCode.includes('xmlns')) {
                cleanSvgCode = cleanSvgCode.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            const blob = new Blob([cleanSvgCode], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `svg-export-${Date.now()}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 200);
        });
    }

    if (!svgEditor.value.trim()) {
        svgEditor.value =
`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="95" fill="#4CAF50"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-size="30" font-weight="bold">SVG Export</text>
</svg>`;
    }

    // 刷新/关闭页面弹窗确认
    window.onbeforeunload = function (e) {
        if (svgEditor && svgEditor.value && svgEditor.value.trim() !== '') {
            e = e || window.event; e.returnValue = true; return true;
        }
    };

    updatePreview();
    setZoomLevel(currentScale || 1);
}
