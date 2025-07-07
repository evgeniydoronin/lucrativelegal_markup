// GSAP DrawSVG анимация космонавта

function initializeAstronautDrawing() {
    console.log('🚀 Инициализация DrawSVG анимации космонавта...');
    
    // Проверяем GSAP
    if (typeof gsap === 'undefined') {
        console.error('❌ GSAP не загружен!');
        return;
    }

    // Проверяем DrawSVGPlugin
    if (typeof DrawSVGPlugin === 'undefined') {
        console.error('❌ DrawSVGPlugin не загружен!');
        return;
    }

    console.log('✅ GSAP загружен');
    console.log('✅ DrawSVGPlugin загружен');

    // Регистрируем плагины
    gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);
    console.log('✅ DrawSVGPlugin зарегистрирован');

    // Проверяем наличие контейнера
    const astronautContainer = document.querySelector('#astronaut-container');
    
    if (!astronautContainer) {
        console.error('❌ Контейнер #astronaut-container не найден!');
        return;
    }

    // Ищем только элементы анимированного SVG (не статичного)
    let drawElements = document.querySelectorAll('#astronaut-container .astronaut-svg .draw-me');
    
    if (drawElements.length === 0) {
        console.error('❌ Анимированный SVG не найден! Элементы .astronaut-svg .draw-me отсутствуют');
        return;
    }

    console.log(`✅ Найдено ${drawElements.length} элементов .draw-me для анимации`);

    // SCROLL-СИНХРОНИЗИРОВАННАЯ АНИМАЦИЯ космонавта
    console.log('🚀 Запускаем scroll-синхронизированную DrawSVG анимацию космонавта...');
    
    // Сначала устанавливаем начальное состояние - все пути скрыты
    gsap.set(drawElements, { drawSVG: "0%" });
    
    // СЕГМЕНТИРОВАННОЕ РИСОВАНИЕ (по документации GSAP)
    console.log('🎯 Применяем сегментированное рисование космонавта...');
    
    // Анализируем пути и группируем их логически
    const allPaths = Array.from(drawElements);
    const segments = categorizeAstronautPaths(allPaths);
    
    console.log('📊 Сегменты космонавта:');
    console.log(`   • Контур головы: ${segments.headContour.length} путей`);
    console.log(`   • Детали лица: ${segments.faceDetails.length} путей`);
    console.log(`   • Тело: ${segments.body.length} путей`);
    console.log(`   • Руки: ${segments.arms.length} путей`);
    console.log(`   • Ноги: ${segments.legs.length} путей`);
    console.log(`   • Мелкие детали: ${segments.details.length} путей`);

    // Создаем поэтапную анимацию (как в документации GSAP)
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.tp-about-area', // Адаптируем триггер для новой версии
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: 0.7,
            toggleActions: 'play reverse play reverse',
            markers: false,
            id: 'astronaut-segmented-drawSVG',
            onUpdate: (self) => {
                // Прогресс анимации: ${Math.round(self.progress * 100)}%
            }
        },
        onStart: () => console.log('▶️ Сегментированная анимация космонавта началась!'),
        onComplete: () => console.log('✅ Сегментированная анимация космонавта завершена!'),
        onReverseComplete: () => console.log('🔄 Обратная сегментированная анимация завершена!')
    });

    // Поэтапное рисование (точно по документации GSAP)
    // 1. Контур головы (основа) - 25% времени
    tl.to(segments.headContour, {
        drawSVG: "100%",
        duration: 0.25,
        ease: "none",
        stagger: 0.05
    })
    // 2. Детали лица - 15% времени, начинаем чуть раньше окончания контура
    .to(segments.faceDetails, {
        drawSVG: "100%", 
        duration: 0.15,
        ease: "none",
        stagger: 0.08
    }, "-=0.05")
    // 3. Тело - 25% времени
    .to(segments.body, {
        drawSVG: "100%",
        duration: 0.25,
        ease: "none",
        stagger: 0.04
    }, "-=0.03")
    // 4. Руки (параллельно с телом) - 20% времени
    .to(segments.arms, {
        drawSVG: "100%",
        duration: 0.20,
        ease: "none",
        stagger: 0.1
    }, "-=0.15")
    // 5. Ноги (параллельно с руками) - 20% времени
    .to(segments.legs, {
        drawSVG: "100%",
        duration: 0.20,
        ease: "none",
        stagger: 0.12
    }, "-=0.18")
    // 6. Мелкие детали (финальная полировка) - 35% времени
    .to(segments.details, {
        drawSVG: "100%",
        duration: 0.35,
        ease: "none",
        stagger: 0.02 // Быстрый stagger для множества мелких деталей
    }, "-=0.1");

    // Дополнительная анимация появления контейнера
    gsap.from("#astronaut-container", {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: '.tp-about-area',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        }
    });

    console.log('✅ DrawSVG анимация космонавта инициализирована');
}

// Функция категоризации путей космонавта (на основе анализа SVG)
function categorizeAstronautPaths(allPaths) {
    console.log('🔍 Анализируем пути космонавта для сегментации...');
    
    const segments = {
        headContour: [],
        faceDetails: [],
        body: [],
        arms: [],
        legs: [],
        details: []
    };

    allPaths.forEach((path, index) => {
        const d = path.getAttribute('d');
        if (!d) return;

        // Анализируем координаты для определения области
        const coords = extractCoordinates(d);
        const avgY = coords.reduce((sum, coord) => sum + coord.y, 0) / coords.length;
        const avgX = coords.reduce((sum, coord) => sum + coord.x, 0) / coords.length;

        // Категоризация на основе позиции и размера пути
        if (avgY < 80) {
            // Верхняя часть - голова и шлем
            if (isLargeContourPath(d)) {
                segments.headContour.push(path);
                console.log(`📍 Путь ${index + 1}: Контур головы (Y: ${avgY.toFixed(1)})`);
            } else {
                segments.faceDetails.push(path);
                console.log(`👁️ Путь ${index + 1}: Детали лица (Y: ${avgY.toFixed(1)})`);
            }
        } else if (avgY >= 80 && avgY < 150) {
            // Средняя часть - тело и руки
            if (avgX < 180 || avgX > 280) {
                segments.arms.push(path);
                console.log(`🤲 Путь ${index + 1}: Руки (X: ${avgX.toFixed(1)}, Y: ${avgY.toFixed(1)})`);
            } else {
                segments.body.push(path);
                console.log(`🫁 Путь ${index + 1}: Тело (Y: ${avgY.toFixed(1)})`);
            }
        } else if (avgY >= 150) {
            // Нижняя часть - ноги
            segments.legs.push(path);
            console.log(`🦵 Путь ${index + 1}: Ноги (Y: ${avgY.toFixed(1)})`);
        } else {
            // Остальные мелкие детали
            segments.details.push(path);
            console.log(`⚙️ Путь ${index + 1}: Детали (Y: ${avgY.toFixed(1)})`);
        }
    });

    // Если какие-то категории пустые, перераспределяем
    if (segments.headContour.length === 0) {
        // Берем первые 5 путей как контур головы
        segments.headContour = allPaths.slice(0, 5);
        console.log('🔄 Автоматически назначили первые 5 путей как контур головы');
    }

    if (segments.body.length === 0) {
        // Берем средние пути как тело
        const start = Math.floor(allPaths.length * 0.3);
        const end = Math.floor(allPaths.length * 0.6);
        segments.body = allPaths.slice(start, end);
        console.log(`🔄 Автоматически назначили пути ${start}-${end} как тело`);
    }

    // Все оставшиеся пути идут в детали
    const usedPaths = new Set([
        ...segments.headContour,
        ...segments.faceDetails,
        ...segments.body,
        ...segments.arms,
        ...segments.legs
    ]);

    allPaths.forEach(path => {
        if (!usedPaths.has(path)) {
            segments.details.push(path);
        }
    });

    return segments;
}

// Вспомогательная функция для извлечения координат из SVG пути
function extractCoordinates(pathData) {
    const coords = [];
    const matches = pathData.match(/[ML]\s*([0-9.]+)[,\s]+([0-9.]+)/g);
    
    if (matches) {
        matches.forEach(match => {
            const numbers = match.match(/([0-9.]+)/g);
            if (numbers && numbers.length >= 2) {
                coords.push({
                    x: parseFloat(numbers[0]),
                    y: parseFloat(numbers[1])
                });
            }
        });
    }
    
    return coords.length > 0 ? coords : [{ x: 0, y: 0 }];
}

// Определяет, является ли путь большим контурным путем
function isLargeContourPath(pathData) {
    // Большие контурные пути обычно длиннее и содержат больше команд
    const commands = pathData.match(/[MLHVCSQTAZ]/gi);
    const length = pathData.length;
    
    return commands && commands.length > 10 && length > 200;
}

// Экспорт для использования в других модулях
if (typeof window !== 'undefined') {
    window.initializeAstronautDrawing = initializeAstronautDrawing;
    window.categorizeAstronautPaths = categorizeAstronautPaths;
}

// Инициализация только через main.js (убираем автоматическую инициализацию)
