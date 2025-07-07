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
                        <img src="<?php echo $service['icon']; ?>" 
                             alt="<?php echo $service['title']; ?>" 
                             class="js-card-image">
                        <div class="card-description-wrapper">
                            <h3 class="js-client-name"><?php echo $service['title']; ?></h3>
                            <!-- Новый скроллящийся заголовок как на HugeInc -->
                            <h2 class="js-scroll-title"><?php echo $service['title']; ?></h2>
                            <p class="js-card-description">
                                <?php echo $service['description']; ?>
                            </p>
                            <button class="js-card-cta" data-link="<?php echo $service['link']; ?>">
                                Get Started
                            </button>
                        </div>
                    </div>
                </li>
                <?php endforeach; ?>
            </ul>

            <!-- Счетчик карточек -->
            <div class="card-counter">
                <span class="js-client-number">S — 00<span class="js-client-number-units">1</span></span>
            </div>
        </div>
    </div>
</section>
<!-- HugeInc Services Cards Effect area end -->
