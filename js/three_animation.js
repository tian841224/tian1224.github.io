// 駭客矩陣風格 (Matrix Rain) 背景特效 - 高效 Canvas 2D 實作
(function () {
    const canvas = document.querySelector('#three-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 矩陣字元設定
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]";
    const fontSize = 16;
    let columns = 0;
    let drops = [];

    // 初始化與縮放處理
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.ceil(canvas.width / fontSize);

        // 重新初始化 drops
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }
    }

    window.addEventListener('resize', resize);
    resize(); // 執行初始縮放

    function draw() {
        // 半透明黑色背景，產生殘影效果
        // 注意：這裡使用非常淡的黑色，讓背景保持透亮
        ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00FF41'; // 經典駭客綠
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            // 隨機取出字元
            const text = characters.charAt(Math.floor(Math.random() * characters.length));

            // 繪製字元
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // 如果字元移出畫面，或隨機機率回到頂端
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // 垂直移動
            drops[i]++;
        }
    }

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 固定速度

    function animate(time) {
        requestAnimationFrame(animate);

        const elapsed = time - lastTime;
        if (elapsed > fpsInterval) {
            lastTime = time - (elapsed % fpsInterval);
            draw();
        }
    }

    animate(0);
})();
