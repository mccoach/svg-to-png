export function setupSVGPNGHandlers(langObj, alertObj, setZoomInfo) {
    // ===== DOM元素 =====
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const svgEditor = document.getElementById('svgEditor');
    const svgPreview = document.getElementById('svgPreview');
    const previewArea = document.getElementById('previewArea');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectRatioCheckbox = document.getElementById('aspectRatio');
    const keepSizeCheckbox = document.getElementById('keepSize');
    const stretchToFitCheckbox = document.getElementById('stretchToFit');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const fitBtn = document.getElementById('fitBtn');
    const zoomInfo = document.getElementById('zoomInfo');

    // ===== 状态变量 =====
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

    /**
     * 语言切换后同步多语言界面 & placeholder
     */
    function rerenderLangStatic() {
        svgEditor.placeholder = langObj.editorPlaceholder;
        zoomInfo.textContent = langObj.zoom.replace('{percent}', Math.round(currentScale * 100));
    }

    /**
     * 更新SVG预览
     */
    function updatePreview() {
        // 获取并清理SVG代码
        const svgCode = svgEditor.value.trim();

        // 如果没有SVG代码，显示提示信息
        if (!svgCode) {
            svgPreview.innerHTML = `<p style="color: #999;">SVG preview will show here</p>`;
            return;
        }

        // 内容变化判定
        const contentDiff = getContentDifference(lastSvgContent, svgCode);
        isNewContent = contentDiff > 0.5 || lastSvgContent === '';
        lastSvgContent = svgCode;

        try {
            // 清理SVG代码
            const cleanSvgCode = svgCode
                .replace(/<\?xml[^?]*\?>/g, '')
                .replace(/<!DOCTYPE[^>]*>/g, '')
                .trim();

            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(cleanSvgCode, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');

            if (!svgElement) throw new Error(alertObj.svgError);

            // 获取SVG的原始尺寸
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

            // 如果是新内容，更新
            if (isNewContent) {
                originalWidth = svgWidth;
                originalHeight = svgHeight;
                originalAspectRatio = svgWidth / svgHeight;
                if (!keepSizeCheckbox.checked) {
                    widthInput.value = Math.round(svgWidth);
                    heightInput.value = Math.round(svgHeight);
                }
            }

            // 目标尺寸
            const targetWidth = parseInt(widthInput.value) || originalWidth;
            const targetHeight = parseInt(heightInput.value) || originalHeight;
            const shouldStretch = stretchToFitCheckbox.checked;

            svgPreview.innerHTML = `
                <div class="preview-wrapper" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                ">
                    <div class="preview-transformer" style="position: relative; transform-origin: center center;">
                        <div class="preview-canvas" style="
                            width: ${targetWidth}px;
                            height: ${targetHeight}px;
                            background: white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                            overflow: hidden;
                        "></div>
                    </div>
                </div>
            `;

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

            // 计算基准缩放适应
            const previewRect = previewArea.getBoundingClientRect();
            const scaleX = previewRect.width / targetWidth;
            const scaleY = previewRect.height / targetHeight;
            baseScale = Math.min(scaleX, scaleY);

            if (isNewContent) {
                currentScale = 1;
                currentTranslateX = 0;
                currentTranslateY = 0;
            }
            updateTransform();

        } catch (error) {
            svgPreview.innerHTML = `<p style="color: #f44336;">${alertObj.svgError}</p>`;
        }
    }

    function getContentDifference(str1, str2) {
        if (!str1 || !str2) return 1;
        const len1 = str1.length;
        const len2 = str2.length;
        const maxLen = Math.max(len1, len2);
        if (maxLen === 0) return 0;
        let diff = Math.abs(len1 - len2);
        const minLen = Math.min(len1, len2);
        for (let i = 0; i < minLen; i++) {
            if (str1[i] !== str2[i]) diff++;
        }
        return diff / maxLen;
    }

    function updateTransform() {
        const transformer = svgPreview.querySelector('.preview-transformer');
        if (transformer) {
            const actualScale = currentScale * baseScale;
            transformer.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${actualScale})`;
        }
        setZoomInfo(Math.round(currentScale * 100));
    }

    function fitToView() {
        currentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        updateTransform();
    }

    // ===== 预览区域缩放 =====
    previewArea.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = currentScale * delta;
        if (newScale >= 0.1 && newScale <= 100) {
            const rect = previewArea.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            currentTranslateX = x + (currentTranslateX - x) * delta;
            currentTranslateY = y + (currentTranslateY - y) * delta;
            currentScale = newScale;
            updateTransform();
        }
    });

    // 拖拽预览
    previewArea.addEventListener('mousedown', function(e) {
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
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    // 还原尺寸按钮
    resetBtn.addEventListener('click', function() {
        widthInput.value = Math.round(originalWidth);
        heightInput.value = Math.round(originalHeight);
        updatePreview();
    });

    // 编辑器延迟预览
    let updateTimer;
    svgEditor.addEventListener('input', function() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(updatePreview, 300);
    });

    // 宽高输入联动
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

    stretchToFitCheckbox.addEventListener('change', updatePreview);
    fitBtn.addEventListener('click', fitToView);

    // 文件选择
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

    // 拖放
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

    // ====== 下载PNG功能 ======
    downloadBtn.addEventListener('click', async function() {
        const svgCode = svgEditor.value.trim();
        if (!svgCode) {
            alert(alertObj.inputSVG);
            return;
        }
        const width = parseInt(widthInput.value) || originalWidth || 800;
        const height = parseInt(heightInput.value) || originalHeight || 600;

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
            const svgBlob = new Blob([processedSvgString], {
                type: 'image/svg+xml;charset=utf-8'
            });
            const url = URL.createObjectURL(svgBlob);

            img.onload = function() {
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
                    canvas.toBlob(function(blob) {
                        if (!blob) throw new Error('Failed to generate image');
                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = 'svg-to-png-' + Date.now() + '.png';
                        link.href = downloadUrl;
                        link.click();
                        setTimeout(() => {
                            URL.revokeObjectURL(url);
                            URL.revokeObjectURL(downloadUrl);
                        }, 100);
                    }, 'image/png');
                } catch (e) {
                    fallbackDownload(processedSvgString, width, height, svgOriginalWidth, svgOriginalHeight);
                }
                URL.revokeObjectURL(url);
            };
            img.onerror = function() {
                fallbackDownload(processedSvgString, width, height, svgOriginalWidth, svgOriginalHeight);
                URL.revokeObjectURL(url);
            };
            img.src = url;

        } catch (error) {
            alert(alertObj.convertFail.replace('{msg}', error.message));
        }
    });

    function fallbackDownload(svgString, width, height, svgOriginalWidth, svgOriginalHeight) {
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

            img.onload = function() {
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
                    canvas.toBlob(function(blob) {
                        if (blob) {
                            const link = document.createElement('a');
                            link.download = 'svg-to-png-' + Date.now() + '.png';
                            link.href = URL.createObjectURL(blob);
                            link.click();
                        } else {
                            const link = document.createElement('a');
                            link.download = 'svg-to-png-' + Date.now() + '.png';
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                        }
                    }, 'image/png');
                } catch (e) {
                    const link = document.createElement('a');
                    link.download = 'svg-to-png-' + Date.now() + '.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            };
            img.onerror = function() {
                alert(alertObj.totallyFail);
            };
            img.src = dataUrl;

        } catch (e) {
            alert(alertObj.totallyFail);
        }
    }

    // 多语言重绘
    rerenderLangStatic();

    // ===== 启动时自动填充默认SVG 示例代码（如编辑区为空） =====
    if (!svgEditor.value.trim()) {
        svgEditor.value =
`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="95" fill="#4CAF50"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-size="30" font-weight="bold">SVG to PNG</text>
</svg>`;
    }

    // ===== 初始化预览 =====
    updatePreview();

    // ===== 语言切换适配 =====
    // 提供给多语言切换时手动重新渲染（main.js 可直接暴露出去）
    setupSVGPNGHandlers.refreshLangElements = rerenderLangStatic;
}
