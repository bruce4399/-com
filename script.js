// 倒计时功能
function updateCountdown() {
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);
    const diff = nextYear - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// 烟花效果
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 添加音频元素引用
const firecrackerSound = document.getElementById('firecracker');
const launchSound = document.getElementById('firework-launch');
const explosionSound = document.getElementById('firework-explosion');

class Firework {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * (canvas.height * 0.5);
        this.speed = 2 + Math.random() * 4;
        this.particles = [];
        this.exploded = false;
        if (Math.random() < 0.3) { // 30%的概率播放发射声音
            this.playLaunchSound();
        }
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            this.particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1;
                particle.alpha -= 0.01;

                if (particle.alpha <= 0) {
                    this.particles.splice(index, 1);
                }
            });

            if (this.particles.length === 0) {
                this.reset();
            }
        }
    }

    playLaunchSound() {
        const launch = launchSound.cloneNode();
        launch.volume = 0.3;
        launch.play();
    }

    playExplosionSound() {
        const explosion = explosionSound.cloneNode();
        explosion.volume = 0.4;
        explosion.play();
    }

    explode() {
        this.exploded = true;
        // 播放爆炸声音
        this.playExplosionSound();
        
        // 定义一些喜庆的颜色
        const colors = [
            'rgb(255, 0, 0)',    // 红色
            'rgb(255, 215, 0)',  // 金色
            'rgb(255, 140, 0)',  // 橙色
            'rgb(255, 192, 203)', // 粉色
            'rgb(255, 255, 0)'   // 黄色
        ];
        // 随机选择一个颜色作为这朵烟花的主色
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: mainColor
            });
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD700'; // 上升过程中显示金色
            ctx.fill();
        }

        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.alpha})`);
            ctx.fill();
        });
    }
}

const fireworks = Array(5).fill().map(() => new Firework());

// 随机播放鞭炮声
function playRandomFirecracker() {
    if (Math.random() < 0.1) { // 10%的概率播放鞭炮声
        const firecracker = firecrackerSound.cloneNode();
        firecracker.volume = 0.2;
        firecracker.play();
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach(firework => {
        firework.update();
        firework.draw();
    });

    playRandomFirecracker();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 添加用户交互控制声音
let soundEnabled = true;
document.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    [firecrackerSound, launchSound, explosionSound].forEach(sound => {
        sound.muted = !soundEnabled;
    });
});

// 添加音频加载检查
function loadSound(audioElement) {
    return new Promise((resolve, reject) => {
        audioElement.addEventListener('canplaythrough', () => resolve(true), { once: true });
        audioElement.addEventListener('error', () => {
            console.error('Error loading sound:', audioElement.src);
            resolve(false);
        });
    });
}

// 初始化声音
async function initSounds() {
    const sounds = [firecrackerSound, launchSound, explosionSound];
    const results = await Promise.all(sounds.map(loadSound));
    
    if (results.some(result => !result)) {
        console.warn('Some sounds failed to load');
    }
    
    // 设置初始音量
    sounds.forEach(sound => {
        sound.volume = 0.3;
    });
    
    // 添加音量控制UI
    const volumeControl = document.createElement('div');
    volumeControl.className = 'volume-control';
    volumeControl.innerHTML = `
        <button id="toggleSound">🔊</button>
        <div class="volume-slider">
            <input type="range" min="0" max="100" value="30" id="volumeSlider">
        </div>
    `;
    document.body.appendChild(volumeControl);
    
    // 音量控制事件
    const toggleBtn = document.getElementById('toggleSound');
    const slider = document.getElementById('volumeSlider');
    
    toggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        toggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
        sounds.forEach(sound => {
            sound.muted = !soundEnabled;
        });
    });
    
    slider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        sounds.forEach(sound => {
            sound.volume = volume;
        });
    });
}

// 在页面加载完成后初始化声音
window.addEventListener('load', initSounds);

// 修改雪花效果函数
function createSnowflakes() {
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow-container';
    document.body.appendChild(snowContainer);

    // 增加雪花数量
    const numberOfSnowflakes = 100;
    const snowflakes = ['❅', '❆', '❄'];
    const snowTypes = ['snow-type-1', 'snow-type-2', 'snow-type-3'];

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // 随机选择雪花样式和动画类型
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.classList.add(snowTypes[Math.floor(Math.random() * snowTypes.length)]);
        
        // 随机起始位置
        const startPositionLeft = Math.random() * 120 - 10; // -10 到 110
        snowflake.style.left = startPositionLeft + 'vw';
        
        // 随机大小
        const size = Math.random() * 0.8 + 0.5; // 0.5 - 1.3em
        snowflake.style.fontSize = size + 'em';
        
        // 随机动画持续时间
        const duration = Math.random() * 4 + 8; // 8-12秒
        snowflake.style.animationDuration = duration + 's';
        
        // 随机透明度
        snowflake.style.opacity = Math.random() * 0.4 + 0.2;
        
        snowContainer.appendChild(snowflake);

        // 动画结束后重新创建雪花
        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
            createSnowflake();
        });
    }

    // 初始化雪花
    for (let i = 0; i < numberOfSnowflakes; i++) {
        setTimeout(() => {
            createSnowflake();
        }, Math.random() * 5000); // 在前5秒内随机时间创建雪花
    }
}

// 修改星星创建函数
function createStarryBackground() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    document.body.appendChild(starsContainer);

    // 增加星星数量
    const numberOfStars = 300;
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 随机位置
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // 随机大小，更多小星星
        const size = Math.random() < 0.9 ? 
            0.3 + Math.random() * 1 : // 90%的星星更小
            1 + Math.random() * 1.5;  // 10%的星星较大
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 50%的星星常亮，50%的星星闪烁
        if (Math.random() < 0.5) {
            star.classList.add('star-steady');
            star.style.opacity = 0.6 + Math.random() * 0.4;
        } else {
            const type = Math.floor(Math.random() * 3) + 1;
            star.classList.add(`star-twinkle-${type}`);
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.opacity = 0.3 + Math.random() * 0.4;
        }
        
        starsContainer.appendChild(star);
    }
}

// 初始化效果
createStarryBackground();
createSnowflakes();

// 窗口大小改变时重新创建效果
window.addEventListener('resize', () => {
    const stars = document.querySelector('.stars');
    const snow = document.querySelector('.snow-container');
    if (stars) stars.remove();
    if (snow) snow.remove();
    createStarryBackground();
    createSnowflakes();
}); 