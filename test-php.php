<?php
echo "<h2>Проверка PHP</h2>";
echo "PHP работает! Версия: " . phpversion();
echo "<br>Время сервера: " . date('Y-m-d H:i:s');
echo "<br>Текущая директория: " . __DIR__;

// Проверка include
echo "<h3>Проверка Include:</h3>";
if (file_exists('components/test-include.html')) {
    echo "✅ Include файл найден!<br>";
    include 'components/test-include.html';
} else {
    echo "❌ Include файл не найден. Создайте components/test-include.html";
}
?>

<style>
body { font-family: Arial, sans-serif; padding: 20px; }
h2, h3 { color: #333; }
</style>
