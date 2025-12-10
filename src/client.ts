document.addEventListener('DOMContentLoaded', () => {
    /* ==================================================
       1. ライトボックス & ギャラリー処理
    ================================================== */
    const lightboxOverlay = document.getElementById('lightbox-overlay') as HTMLDivElement;
    const lightboxImage = document.getElementById('lightbox-image') as HTMLImageElement;
    const lightboxCaption = document.getElementById('lightbox-caption') as HTMLElement;
    const lightboxClose = document.getElementById('lightbox-close') as HTMLElement;
    const btnPrev = document.getElementById('lightbox-prev') as HTMLElement;
    const btnNext = document.getElementById('lightbox-next') as HTMLElement;
    const scrollingTrack = document.querySelector('.scrolling-track') as HTMLElement;

    // ギャラリー画像生成
    const galleryImages: { src: string; title: string }[] = [];
    for (let i = 1; i <= 10; i++) {
        galleryImages.push({ src: `images/gallery${i}.jpg`, title: '' });
    }

    let currentGalleryIndex = -1;

    function openLightbox(index: number) {
        if (index < 0 || index >= galleryImages.length) return;
        if (scrollingTrack) scrollingTrack.style.animationPlayState = 'paused';

        currentGalleryIndex = index;
        const imageInfo = galleryImages[currentGalleryIndex];

        lightboxImage.src = imageInfo.src;
        if (lightboxCaption) lightboxCaption.textContent = '';

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

        if (scrollingTrack) scrollingTrack.style.animationPlayState = 'running';
    }

    function showGalleryImage(index: number) {
        if (index < 0) index = galleryImages.length - 1;
        if (index >= galleryImages.length) index = 0;

        currentGalleryIndex = index;
        lightboxImage.src = galleryImages[currentGalleryIndex].src;
    }

    // イベントリスナー
    const mapTriggers = document.querySelectorAll('.lightbox-trigger');
    mapTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget as HTMLAnchorElement;
            lightboxImage.src = target.getAttribute('href') || '';
            lightboxOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
        });
    });

    if (scrollingTrack) {
        scrollingTrack.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const indexStr = target.getAttribute('data-index');
                if (indexStr !== null) {
                    openLightbox(parseInt(indexStr, 10));
                }
            }
        });
    }

    btnPrev?.addEventListener('click', (e) => { e.stopPropagation(); showGalleryImage(currentGalleryIndex - 1); });
    btnNext?.addEventListener('click', (e) => { e.stopPropagation(); showGalleryImage(currentGalleryIndex + 1); });
    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxOverlay?.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay || (e.target as HTMLElement).id === 'lightbox-modal') {
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
    function setupDateWeekDisplay(inputId: string, spanId: string) {
        const input = document.getElementById(inputId) as HTMLInputElement;
        // spanを作成して挿入（HTML側になければ）
        let span = document.getElementById(spanId);
        if (!span && input) {
            span = document.createElement('span');
            span.id = spanId;
            span.classList.add('week-text');
            input.parentNode?.insertBefore(span, input.nextSibling);
        }

        if (!input || !span) return;

        const updateWeek = () => {
            const val = input.value;
            if (!val) {
                span!.textContent = '';
                return;
            }
            const dateObj = new Date(val);
            if (isNaN(dateObj.getDate())) {
                span!.textContent = '';
            } else {
                const dayOfWeek = weekChars[dateObj.getDay()];
                span!.textContent = `（${dayOfWeek}）`;
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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formEl = e.target as HTMLFormElement;
            const formData = new FormData(formEl);
            const data = Object.fromEntries(formData.entries());

            // エラー表示のリセット
            formEl.querySelectorAll('.error-text').forEach(el => el.remove());
            const submitBtn = formEl.querySelector('button[type="submit"]') as HTMLButtonElement;
            const originalBtnText = submitBtn.textContent;
            
            // ローディング状態
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            try {
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    formEl.reset();
                    // 完了メッセージエリアがあれば表示
                    const msgArea = document.getElementById('global-message');
                    if(msgArea) {
                        msgArea.textContent = result.message;
                        msgArea.style.display = 'block';
                    }
                } else {
                    // バリデーションエラーの表示
                    if (result.errors) {
                        Object.keys(result.errors).forEach(key => {
                            const input = formEl.querySelector(`[name="${key}"]`);
                            if (input) {
                                const errorSpan = document.createElement('span');
                                errorSpan.className = 'error-text';
                                errorSpan.textContent = result.errors[key];
                                input.parentNode?.appendChild(errorSpan);
                            }
                        });
                    } else {
                        alert(result.message || 'エラーが発生しました。');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('送信中に通信エラーが発生しました。');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    });
});