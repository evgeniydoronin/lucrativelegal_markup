// HugeInc Effect - Эффект прокрутки карточек услуг
// Инициализация только после полной загрузки DOM и библиотек

/*
=== НАСТРАИВАЕМЫЕ ПАРАМЕТРЫ ===

1. ВЫСОТА ПРОКРУТКИ (строка 67):
   - spacerHeight = cards.length * 150
   - 150vh = высота на каждую карточку
   - Увеличьте для более медленной прокрутки (например, 200vh)
   - Уменьшите для более быстрой прокрутки (например, 120vh)

2. ОТЗЫВЧИВОСТЬ ПРОКРУТКИ (строка 77):
   - scrub: 2
   - Меньше значение = более отзывчивая прокрутка (1-3)
   - Больше значение = более плавная прокрутка (4-10)

3. ТАЙМИНГ АНИМАЦИИ КАРТОЧКИ (строки 105-107):
   - appearanceDuration = duration * 0.35 (35% времени на появление)
   - readingTime = duration * 0.4 (40% времени на чтение)
   - disappearanceDuration = duration * 0.25 (25% времени на исчезновение)
   
   Сумма должна быть ≤ 1.0 (100%)

4. СКОРОСТЬ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ (строки 115-140):
   - Интервалы между появлением элементов:
     * image: appearanceDuration * 0.1
     * title: appearanceDuration * 0.2
     * description: appearanceDuration * 0.4
     * button: appearanceDuration * 0.7

5. ПЛАВНОСТЬ ИСЧЕЗНОВЕНИЯ (строки 145-185):
   - Смещение элементов при исчезновении: y: -20, -25, -30, -35
   - Длительность исчезновения каждого элемента: 0.3, 0.4, 0.5, 0.6
   - ease: 'power1.out' - тип плавности (можно менять на power2.out, back.out и т.д.)

6. ПЕРЕКРЫТИЕ КАРТОЧЕК (строка 147):
   - overlapTime = disappearanceDuration * 0.1 (10% перекрытие)
   - Увеличьте для более плавного перехода

7. СКРОЛЛЯЩИЙСЯ ЗАГОЛОВОК (строки 175-190):
   - Новый эффект как на HugeInc.com
   - ИСПРАВЛЕНО: Полное движение от низа до верха (y: '75vh' → y: '-75vh')
   - ИСПРАВЛЕНО: Работает в обе стороны при скролле (fromTo анимация)
   - duration - полная длительность карточки для непрерывного движения
   - ease: 'none' - линейное движение для эффекта скролла
   - mix-blend-mode: difference - эффект смешивания в CSS
   - Видимость управляется через opacity в начале и конце

=== ТИПЫ EASING (плавности) ===
- power1.out - мягкое замедление
- power2.out - среднее замедление  
- power3.out - сильное замедление
- back.out - эффект отскока
- elastic.out - эластичный эффект
*/

(function() {
    'use strict';

    // Проверяем доступность необходимых библиотек
    function checkDependencies() {
        if (typeof gsap === 'undefined') {
            console.error('HugeInc Effect: GSAP не найден');
            return false;
        }
        if (typeof ScrollTrigger === 'undefined') {
            console.error('HugeInc Effect: ScrollTrigger не найден');
            return false;
        }
        if (typeof Lenis === 'undefined') {
            console.error('HugeInc Effect: Lenis не найден');
            return false;
        }
        return true;
    }

    // Инициализация Lenis для плавной прокрутки
    function initLenis() {
        const lenis = new Lenis({
            duration: 5.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Интеграция Lenis с GSAP
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return lenis;
    }

    // Основная функция инициализации эффекта карточек
    function initCardsEffect() {
        // Получение элементов
        const section = document.querySelector('.hugeinc-services-section');
        if (!section) {
            console.log('HugeInc Effect: Секция не найдена');
            return;
        }

        const pinSpacer = section.querySelector('.pin-spacer');
        const cardsViewer = section.querySelector('.js-cards-viewer');
        const cardsList = section.querySelector('.js-cards-list');
        const cards = section.querySelectorAll('.js-card');
        const clientNumber = section.querySelector('.js-client-number');
        
        if (!pinSpacer || !cardsViewer || !cardsList || cards.length === 0) {
            console.error('HugeInc Effect: Не найдены необходимые элементы для эффекта карточек');
            return;
        }

        // Установка высоты pin-spacer на основе количества карточек
        const spacerHeight = cards.length * 150; // 150vh на каждую карточку для более медленной прокрутки
        pinSpacer.style.height = `${spacerHeight}vh`;
        
        console.log(`HugeInc Effect: Найдено ${cards.length} карточек, высота spacer: ${spacerHeight}vh`);

        // Создание главной временной шкалы
        const mainTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: pinSpacer,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 2, // Уменьшили scrub для более отзывчивого управления
                pin: cardsViewer,
                anticipatePin: 1,
                onUpdate: (self) => {
                    updateCardCounter(self.progress, cards.length);
                }
            }
        });

        // Инициализация карточек
        cards.forEach((card, index) => {
            // Установка начального состояния
            gsap.set(card, {
                opacity: 0,
                visibility: 'hidden'
            });

            // Установка начального состояния для элементов внутри карточки
            const image = card.querySelector('.js-card-image');
            const description = card.querySelector('.js-card-description');
            const scrollTitle = card.querySelector('.js-scroll-title'); // Новый скроллящийся заголовок

            gsap.set([image], {
                opacity: 0,
                y: 50
            });

            // Отдельная настройка для описания (анимация справа налево)
            gsap.set(description, {
                opacity: 0,
                x: 50
            });

            // Установка начального состояния для скроллящегося заголовка
            if (scrollTitle) {
                gsap.set(scrollTitle, {
                    opacity: 0,
                    y: '75vh' // Начальная позиция снизу экрана
                });
            }

            // Расчет времени появления и исчезновения карточки
            const startTime = index / cards.length;
            const endTime = (index + 1) / cards.length;
            const duration = 1 / cards.length;

            // Настройка тайминга анимации карточки (можно изменять эти значения)
            const appearanceDuration = duration * 0.35; // 35% времени на появление элементов
            const readingTime = duration * 0.4; // 40% времени на чтение (пауза после появления описания)
            const disappearanceDuration = duration * 0.25; // 25% времени на плавное исчезновение (увеличено для плавности)

            // Анимация появления карточки
            mainTimeline.to(card, {
                opacity: 1,
                visibility: 'visible',
                duration: appearanceDuration * 0.3,
                ease: 'power2.out'
            }, startTime);

            // Анимация элементов внутри карточки с увеличенными интервалами
            mainTimeline.to(image, {
                opacity: 1,
                y: 0,
                duration: appearanceDuration * 0.4,
                ease: 'power2.out'
            }, startTime + appearanceDuration * 0.1);


            // Описание появляется сразу после карточки (справа налево)
            mainTimeline.to(description, {
                opacity: 1,
                x: 0,
                duration: appearanceDuration * 0.5,
                ease: 'power2.out'
            }, startTime + appearanceDuration * 0.1);


            // АНИМАЦИЯ СКРОЛЛЯЩЕГОСЯ ЗАГОЛОВКА (как на HugeInc)
            if (scrollTitle) {
                // Полная анимация движения заголовка от низа до верха
                mainTimeline.fromTo(scrollTitle, {
                    opacity: 1,
                    y: '75vh' // Начальная позиция снизу
                }, {
                    y: '-75vh', // Конечная позиция вверху
                    duration: duration, // Полная длительность карточки
                    ease: 'none' // Линейное движение для эффекта скролла
                }, startTime);

                // Управление видимостью заголовка
                mainTimeline.set(scrollTitle, {
                    opacity: 1
                }, startTime);

                // Скрытие заголовка в конце (если не последняя карточка)
                if (index < cards.length - 1) {
                    mainTimeline.set(scrollTitle, {
                        opacity: 0
                    }, endTime);
                }
            }

            // Пауза для чтения (readingTime) - элементы остаются видимыми
            // Анимация исчезновения карточки (если это не последняя карточка)
            if (index < cards.length - 1) {
                // Начинаем исчезновение с небольшим перекрытием для плавности
                const disappearanceStart = endTime - disappearanceDuration;
                const overlapTime = disappearanceDuration * 0.1; // 10% перекрытие с следующей карточкой
                
                // Симметричное исчезновение элементов (обратный порядок появления)
                mainTimeline.to([description], {
                    opacity: 0,
                    x: -50, // Исчезает влево (симметрично появлению справа)
                    duration: disappearanceDuration * 0.5,
                    ease: 'power2.out'
                }, disappearanceStart);

                mainTimeline.to([image], {
                    opacity: 0,
                    y: 50, // Исчезает вниз (симметрично появлению снизу)
                    duration: disappearanceDuration * 0.4,
                    ease: 'power2.out'
                }, disappearanceStart + disappearanceDuration * 0.2);

                // Финальное исчезновение карточки БЕЗ scale-анимации
                mainTimeline.to(card, {
                    opacity: 0,
                    visibility: 'hidden',
                    duration: disappearanceDuration * 0.3,
                    ease: 'power2.out'
                }, disappearanceStart + disappearanceDuration * 0.7);
            }
        });

        // Функция обновления счетчика карточек
        function updateCardCounter(progress, totalCards) {
            const currentCard = Math.floor(progress * totalCards) + 1;
            const clampedCard = Math.min(currentCard, totalCards);
            
            if (clientNumber) {
                clientNumber.textContent = clampedCard.toString().padStart(2, '0') + '/' + totalCards.toString().padStart(2, '0');
            }
        }


        // Обработчик клика по карточке
        function handleCardClick(index, card) {
            const theme = card.getAttribute('data-theme');
            const title = card.querySelector('.js-scroll-title').textContent;
            
            // Простая демонстрация - можно заменить на реальную логику
            console.log(`Клик по карточке ${index + 1}: ${title} (${theme})`);
            
            // Здесь можно добавить логику перехода на другую страницу,
            // открытия модального окна и т.д.
        }

        console.log('HugeInc Effect: Эффект карточек инициализирован');
    }

    // Функция для обработки изменения размера окна
    function handleResize() {
        // Обновление ScrollTrigger при изменении размера окна
        ScrollTrigger.refresh();
    }

    // Основная функция инициализации
    function init() {
        // Проверяем зависимости
        if (!checkDependencies()) {
            return;
        }

        // Регистрируем плагин ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Инициализируем Lenis
        const lenis = initLenis();

        // Инициализируем эффект карточек
        initCardsEffect();

        // Обработчик изменения размера окна
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });

        // Экспорт для возможного использования в других скриптах
        window.HugeIncEffect = {
            init: initCardsEffect,
            lenis: lenis,
            refresh: () => ScrollTrigger.refresh()
        };

        console.log('HugeInc Effect: Полная инициализация завершена');
    }

    // Запуск инициализации после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Небольшая задержка для гарантии загрузки всех библиотек
        setTimeout(init, 100);
    }

})();
