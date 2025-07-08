<?php
// Подключаем данные услуг
include 'hugeinc-services-data.php';
?>

<!-- HugeInc Services Cards Effect area start -->
<section data-component-name="section-our-work" class="hugeinc-services-section relative overflow-hidden">
    <!-- Контейнер для прокрутки -->
    <div class="pin-spacer">
        <div class="js-cards-viewer">
            <ul class="js-cards-list">
                <?php foreach ($servicesData as $index => $service): ?>
                <!-- Карточка <?php echo $index + 1; ?>: <?php echo $service['title']; ?> -->
                <li class="js-card" data-theme="<?php echo $service['theme']; ?>">
                    <div class="card-content">
                        <!-- Картинка по центру экрана -->
                        <img src="<?php echo $service['icon']; ?>" 
                             alt="<?php echo $service['title']; ?>" 
                             class="js-card-image">
                        
                        <!-- Скроллящийся заголовок -->
                        <h2 class="js-scroll-title"><?php echo $service['title']; ?></h2>
                        
                        <!-- Описание в правом нижнем углу -->
                        <p class="js-card-description">
                            <?php echo $service['description']; ?>
                        </p>
                    </div>
                </li>
                <?php endforeach; ?>
            </ul>

            <!-- Счетчик карточек -->
            <div class="card-counter">
                <span class="js-client-number"><span class="js-client-number-units">01</span>/12</span>
            </div>
        </div>
    </div>
</section>
<!-- HugeInc Services Cards Effect area end -->
