var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    /* ==================================================
       1. ライトボックス & ギャラリー処理
    ================================================== */
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    const scrollingTrack = document.querySelector('.scrolling-track');
    // ギャラリー画像生成
    const galleryImages = [];
    for (let i = 1; i <= 10; i++) {
        galleryImages.push({ src: `images/gallery${i}.jpg`, title: '' });
    }
    let currentGalleryIndex = -1;
    function openLightbox(index) {
        if (index < 0 || index >= galleryImages.length)
            return;
        if (scrollingTrack)
            scrollingTrack.style.animationPlayState = 'paused';
        currentGalleryIndex = index;
        const imageInfo = galleryImages[currentGalleryIndex];
        lightboxImage.src = imageInfo.src;
        if (lightboxCaption)
            lightboxCaption.textContent = '';
        lightboxOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        btnPrev.style.display = 'block';
        btnNext.style.display = 'block';
    }
    function closeLightbox() {
        lightboxOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        currentGalleryIndex = -1;
        setTimeout(() => {
            if (lightboxOverlay.classList.contains('hidden')) {
                lightboxImage.src = "";
            }
        }, 300);
        if (scrollingTrack)
            scrollingTrack.style.animationPlayState = 'running';
    }
    function showGalleryImage(index) {
        if (index < 0)
            index = galleryImages.length - 1;
        if (index >= galleryImages.length)
            index = 0;
        currentGalleryIndex = index;
        lightboxImage.src = galleryImages[currentGalleryIndex].src;
    }
    // イベントリスナー
    const mapTriggers = document.querySelectorAll('.lightbox-trigger');
    mapTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget;
            lightboxImage.src = target.getAttribute('href') || '';
            lightboxOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
        });
    });
    if (scrollingTrack) {
        scrollingTrack.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'IMG') {
                const indexStr = target.getAttribute('data-index');
                if (indexStr !== null) {
                    openLightbox(parseInt(indexStr, 10));
                }
            }
        });
    }
    btnPrev === null || btnPrev === void 0 ? void 0 : btnPrev.addEventListener('click', (e) => { e.stopPropagation(); showGalleryImage(currentGalleryIndex - 1); });
    btnNext === null || btnNext === void 0 ? void 0 : btnNext.addEventListener('click', (e) => { e.stopPropagation(); showGalleryImage(currentGalleryIndex + 1); });
    lightboxClose === null || lightboxClose === void 0 ? void 0 : lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay === null || lightboxOverlay === void 0 ? void 0 : lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay || e.target.id === 'lightbox-modal') {
            closeLightbox();
        }
    });
    /* ==================================================
       2. スライドショー
    ================================================== */
    const slides = document.querySelectorAll('.slide-image');
    let currentSlide = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }
    /* ==================================================
       3. 曜日表示ロジック
    ================================================== */
    const weekChars = ['日', '月', '火', '水', '木', '金', '土'];
    function setupDateWeekDisplay(inputId, spanId) {
        var _a;
        const input = document.getElementById(inputId);
        // spanを作成して挿入（HTML側になければ）
        let span = document.getElementById(spanId);
        if (!span && input) {
            span = document.createElement('span');
            span.id = spanId;
            span.classList.add('week-text');
            (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(span, input.nextSibling);
        }
        if (!input || !span)
            return;
        const updateWeek = () => {
            const val = input.value;
            if (!val) {
                span.textContent = '';
                return;
            }
            const dateObj = new Date(val);
            if (isNaN(dateObj.getDate())) {
                span.textContent = '';
            }
            else {
                const dayOfWeek = weekChars[dateObj.getDay()];
                span.textContent = `（${dayOfWeek}）`;
            }
        };
        input.addEventListener('input', updateWeek);
        input.addEventListener('change', updateWeek);
        updateWeek();
    }
    setupDateWeekDisplay('res_in', 'res_in_week');
    setupDateWeekDisplay('res_out', 'res_out_week');
    /* ==================================================
       4. フォーム送信処理 (Fetch API)
    ================================================== */
    const forms = document.querySelectorAll('.php-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const formEl = e.target;
            const formData = new FormData(formEl);
            const data = Object.fromEntries(formData.entries());
            // エラー表示のリセット
            formEl.querySelectorAll('.error-text').forEach(el => el.remove());
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            // ローディング状態
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';
            try {
                const response = yield fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = yield response.json();
                if (result.success) {
                    alert(result.message);
                    formEl.reset();
                    // 完了メッセージエリアがあれば表示
                    const msgArea = document.getElementById('global-message');
                    if (msgArea) {
                        msgArea.textContent = result.message;
                        msgArea.style.display = 'block';
                    }
                }
                else {
                    // バリデーションエラーの表示
                    if (result.errors) {
                        Object.keys(result.errors).forEach(key => {
                            var _a;
                            const input = formEl.querySelector(`[name="${key}"]`);
                            if (input) {
                                const errorSpan = document.createElement('span');
                                errorSpan.className = 'error-text';
                                errorSpan.textContent = result.errors[key];
                                (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.appendChild(errorSpan);
                            }
                        });
                    }
                    else {
                        alert(result.message || 'エラーが発生しました。');
                    }
                }
            }
            catch (error) {
                console.error('Error:', error);
                alert('送信中に通信エラーが発生しました。');
            }
            finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }));
    });
});
