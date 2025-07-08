// Header Globe Animation - Адаптированная версия для размещения поверх логотипа
// Оптимизированная для меньших размеров и производительности

class HeaderGlobeAnimation {
    constructor(canvasId) {
        // Получаем canvas по id
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas с id "${canvasId}" не найден.`);
            return;
        }

        // Создаем сцену Three.js
        this.scene = new THREE.Scene();

        // Камера для header глобуса (меньший угол обзора для компактности)
        // Используем фиксированное соотношение сторон, так как контейнер может быть скрыт
        this.camera = new THREE.PerspectiveCamera(
            60, // уменьшенный угол обзора для header
            1, // квадратное соотношение сторон
            0.1,
            1000
        );

        // Рендерер с альфа-каналом для прозрачности
        try {
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.canvas, 
                antialias: true, 
                alpha: true,
                preserveDrawingBuffer: false,
                premultipliedAlpha: false
            });
            // Устанавливаем начальный размер 400x400
            this.renderer.setSize(400, 400);
            this.renderer.setClearColor(0x000000, 0); // Полностью прозрачный фон
            
            console.log('✅ WebGL renderer initialized');
        } catch (error) {
            console.error('Ошибка создания WebGL контекста:', error);
            return;
        }

        this.particles = null;
        this.isRotating = true;
        this.rotationSpeed = 0.001; // Медленнее для header

        this.init();
    }

    init() {
        this.addLights();
        this.createEarthSphere();
        this.animate();

        // Обработчик изменения размера окна
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    addLights() {
        // Мягкий окружающий свет
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Направленный свет для объема
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(3, 2, 3);
        this.scene.add(directionalLight);
    }

    createEarthSphere() {
        const loader = new THREE.FileLoader();
        
        // Используем правильный путь к SVG файлу
        loader.load('assets/img/svg/World-map-SVG.svg', (data) => {
            const paths = new DOMParser().parseFromString(data, 'image/svg+xml').querySelectorAll('path');

            // === Параметры для header глобуса ===
            const radius = 3; // Меньший радиус для header
            const landParticleCount = 3000; // Меньше частиц для производительности
            const seaParticleCount = 500;   // Пропорционально меньше
            // ===================================

            const svgWidth = 1099;
            const svgHeight = 953;

            // Временный холст для получения точек из SVG
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = svgWidth;
            offscreenCanvas.height = svgHeight;
            const ctx = offscreenCanvas.getContext('2d');
            ctx.fillStyle = 'black';

            // Рисуем все пути (кроме белых)
            paths.forEach(path => {
                if (path.getAttribute('fill') === '#ffffff') return;
                const path2d = new Path2D(path.getAttribute('d'));
                ctx.fill(path2d);
            });

            const imageData = ctx.getImageData(0, 0, svgWidth, svgHeight);
            const pixelData = imageData.data;
            const landPoints = [];
            const seaPoints = [];
            const step = 3; // Больший шаг для меньшего количества точек

            // Собираем точки суши и моря
            for (let y = 0; y < svgHeight; y += step) {
                for (let x = 0; x < svgWidth; x += step) {
                    const alpha = pixelData[(y * svgWidth + x) * 4 + 3];
                    if (alpha > 0) {
                        landPoints.push({ x: x, y: y });
                    } else {
                        seaPoints.push({ x: x, y: y });
                    }
                }
            }

            const totalParticleCount = landParticleCount + seaParticleCount;
            const positions = new Float32Array(totalParticleCount * 3);
            const colors = new Float32Array(totalParticleCount * 3);

            for (let i = 0; i < totalParticleCount; i++) {
                let point;
                const color = new THREE.Color();

                if (i < landParticleCount) {
                    // Цвет точек суши - более яркий для header
                    if (landPoints.length === 0) continue;
                    point = landPoints[Math.floor(Math.random() * landPoints.length)];
                    color.set(0xffffff); // Ярче синий для лучшей видимости
                } else {
                    // Цвет точек моря - полупрозрачный
                    if (seaPoints.length === 0) continue;
                    point = seaPoints[Math.floor(Math.random() * seaPoints.length)];
                    color.set(0xe0e0e0); // Чуть темнее для контраста
                }

                if (!point) continue;

                // Преобразование координат SVG в сферические
                const u = (point.x / 1099);
                const v = (point.y / 953);

                const theta = u * 2 * Math.PI;
                const phi = v * Math.PI;

                // Размещение точек на сфере
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = -radius * Math.sin(phi) * Math.sin(theta);

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;

                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

            // Материал с повышенной прозрачностью для overlay эффекта
            const material = new THREE.PointsMaterial({
                size: 0.08, // Чуть больше размер для лучшей видимости
                vertexColors: true,
                transparent: true,
                opacity: 0.7, // Полупрозрачность для overlay эффекта
                blending: THREE.NormalBlending
            });

            this.particles = new THREE.Points(geometry, material);
            this.scene.add(this.particles);

            // Позиция камеры для header глобуса
            this.camera.position.z = 10; // Ближе для большего размера

            // Показываем контейнер глобуса после загрузки частиц с небольшой задержкой
            setTimeout(() => {
                if (this.canvas && this.particles) {
                    const container = this.canvas.closest('.tp-hero-globe-container');
                    if (container) {
                        // Сначала показываем canvas
                        this.canvas.classList.add('canvas-ready');
                        
                        // Затем показываем контейнер и логотип
                        setTimeout(() => {
                            container.classList.add('loaded');
                            container.classList.add('ready');
                            console.log('✅ Globe container and canvas shown after particles loaded');
                        }, 50);
                    }
                }
            }, 100);
        }, 
        // Обработчик прогресса загрузки
        undefined,
        // Обработчик ошибки
        (error) => {
            console.error('Ошибка загрузки SVG файла:', error);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Медленное вращение глобуса
        if (this.particles && this.isRotating) {
            this.particles.rotation.y += this.rotationSpeed;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.canvas) return;
        
        const container = this.canvas.closest('.tp-hero-globe-container');
        if (container && container.classList.contains('loaded')) {
            const width = this.canvas.clientWidth || 400;
            const height = this.canvas.clientHeight || 400;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    // Методы управления анимацией
    pause() {
        this.isRotating = false;
    }

    resume() {
        this.isRotating = true;
    }

    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }

    // Метод для очистки ресурсов
    dispose() {
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.scene.remove(this.particles);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
}

// Экспорт для использования в других модулях
window.HeaderGlobeAnimation = HeaderGlobeAnimation;
