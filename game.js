// ====== 1. DOM 元素获取 ======
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // 获取Canvas 2D绘图上下文
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('finalScore');

// ====== 2. 游戏配置 (逻辑尺寸和物理参数) ======
const GAME_WIDTH = 288; // 游戏逻辑宽度 (基于原版游戏尺寸)
const GAME_HEIGHT = 512; // 游戏逻辑高度 (基于原版游戏尺寸)

const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const PIPE_WIDTH = 52;
const GROUND_HEIGHT = 112;

// 游戏物理参数 (根据最新反馈再次优化)
// --- 关键调整 ---
const PIPE_GAP = 140; // 管道上下开口的距离，从 120 增大到 140，提供更多通过空间

const GRAVITY = 0.4; // 重力加速度，保持 0.4，与 MAX_FALL_SPEED 配合良好
const JUMP_STRENGTH = -8.5; // 跳跃初速度，从 -9.5 减小到 -8.5，回弹高度降低

const MAX_FALL_SPEED = 6; // 最大下落速度，保持 6，确保下落线性可控

const PIPE_SPEED = 1.8; // 管道移动速度，保持 1.8
const PIPE_SPAWN_INTERVAL = 1500; // 管道生成间隔（毫秒），保持 1500ms
// --- 关键调整结束 ---

// ====== 3. 游戏颜色定义 (用于Canvas绘制) ======
const COLORS = {
    SKY_BLUE: '#70c5ce',        // 天空蓝色
    CLOUD_WHITE: '#fff',        // 云朵白色
    GROUND_BROWN: '#ded895',    // 地面泥土色
    GROUND_GREEN: '#7d6f51',    // 地面草地色
    PIPE_GREEN: '#7ac711',      // 管道绿色
    PIPE_DARK_GREEN: '#5a9b0c', // 管道深绿色 (边缘)
    BIRD_YELLOW: '#ffd700',     // 小鸟身体黄色
    BIRD_ORANGE: '#ff8c00',     // 小鸟喙橙色
    BIRD_EYE: '#000000'         // 小鸟眼睛黑色
};

// ====== 4. 游戏状态变量 ======
let gameStarted = false;
let gameOver = false;
let score = 0;
let bird = {}; // 小鸟对象
let pipes = []; // 管道数组
let lastPipeSpawnTime = 0; // 上次生成管道的时间戳
let animationFrameId; // requestAnimationFrame 的 ID，用于取消动画

// ====== 5. 资源加载 (仅音效) ======
// 确保 'assets/sounds/' 目录下有对应的音效文件
const sounds = {
    flap: new Audio('assets/sounds/flap.wav'),
    score: new Audio('assets/sounds/score.wav'),
    hit: new Audio('assets/sounds/hit.wav'),
    die: new Audio('assets/sounds/die.wav')
};

// 确保音效可以预加载和播放 (可根据需要添加 error handling)
Object.values(sounds).forEach(sound => {
    sound.load(); // 预加载音效
    sound.volume = 0.5; // 设置音量
});

// ====== 6. 游戏尺寸调整函数 (响应式核心) ======
function resizeGame() {
    // 获取当前窗口的宽高
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 计算基于游戏逻辑尺寸的缩放比例
    const scaleX = windowWidth / GAME_WIDTH;
    const scaleY = windowHeight / GAME_HEIGHT;

    // 选择较小的缩放比例，以确保游戏内容在屏幕上完全可见且保持宽高比
    const scale = Math.min(scaleX, scaleY);

    // 设置canvas的实际渲染尺寸 (物理像素)
    canvas.width = GAME_WIDTH * scale;
    canvas.height = GAME_HEIGHT * scale;

    // 重新获取2D上下文并应用缩放，
    // 这样在 draw 函数中，我们仍然可以使用 GAME_WIDTH/GAME_HEIGHT 的逻辑坐标进行绘制
    // 而 Canvas 会自动将其渲染到正确的物理像素尺寸上
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 先重置transform，清除之前的缩放
    ctx.scale(scale, scale); // 再应用新的缩放
}


// ====== 7. 游戏对象定义 (小鸟、管道) ======

// 小鸟对象构造函数
function createBird() {
    return {
        x: GAME_WIDTH / 4, // 小鸟的X坐标，固定在屏幕左侧一定位置
        y: GAME_HEIGHT / 2 - BIRD_HEIGHT / 2, // 小鸟的Y坐标，初始在屏幕中央
        velocity: 0, // 垂直速度
        
        // 绘制小鸟 (使用Canvas API)
        draw: function() {
            // 身体 (简单圆形)
            ctx.fillStyle = COLORS.BIRD_YELLOW;
            ctx.beginPath();
            ctx.arc(this.x + BIRD_WIDTH / 2, this.y + BIRD_HEIGHT / 2, BIRD_HEIGHT / 2, 0, Math.PI * 2);
            ctx.fill();
            // 身体的橙色部分 (模拟腹部或阴影)
            ctx.fillStyle = COLORS.BIRD_ORANGE;
            ctx.beginPath();
            ctx.arc(this.x + BIRD_WIDTH / 2, this.y + BIRD_HEIGHT / 2, BIRD_HEIGHT / 2 - 2, 0, Math.PI, true);
            ctx.fill();


            // 喙 (三角形)
            ctx.fillStyle = COLORS.BIRD_ORANGE;
            ctx.beginPath();
            ctx.moveTo(this.x + BIRD_WIDTH * 0.9, this.y + BIRD_HEIGHT / 2);
            ctx.lineTo(this.x + BIRD_WIDTH + 8, this.y + BIRD_HEIGHT / 2 - 4);
            ctx.lineTo(this.x + BIRD_WIDTH + 8, this.y + BIRD_HEIGHT / 2 + 4);
            ctx.closePath();
            ctx.fill();

            // 眼睛 (小黑点)
            ctx.fillStyle = COLORS.BIRD_EYE;
            ctx.beginPath();
            ctx.arc(this.x + BIRD_WIDTH * 0.7, this.y + BIRD_HEIGHT * 0.35, 2, 0, Math.PI * 2);
            ctx.fill();

            // 翅膀 (简单的矩形，根据速度模拟倾斜)
            ctx.fillStyle = COLORS.BIRD_YELLOW;
            ctx.save(); // 保存当前Canvas状态
            // 将原点移动到翅膀的旋转中心
            ctx.translate(this.x + BIRD_WIDTH * 0.3, this.y + BIRD_HEIGHT * 0.5);
            // 根据垂直速度旋转翅膀，模拟拍打效果
            ctx.rotate(this.velocity * 0.04); // 乘以一个小数来控制旋转幅度
            ctx.fillRect(-10, -5, 20, 10); // 从新原点绘制翅膀
            ctx.restore(); // 恢复Canvas状态，避免影响其他绘制
        },
        
        // 更新小鸟状态
        update: function() {
            this.velocity += GRAVITY; // 施加重力
            this.y += this.velocity; // 更新Y坐标

            // 限制小鸟不能飞出顶部
            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
            }

            // 限制最大下落速度，解决“砸下去”问题
            if (this.velocity > MAX_FALL_SPEED) {
                this.velocity = MAX_FALL_SPEED;
            }
        },
        
        // 小鸟跳跃
        flap: function() {
            this.velocity = JUMP_STRENGTH; // 给予向上速度
            sounds.flap.play(); // 播放拍打音效
        }
    };
}

// 管道对象构造函数
function createPipe(x) {
    const minPipeHeight = 50; // 管道最小高度
    // 管道最大高度 = 游戏高度 - 地面高度 - 管道开口 - 最小管道高度
    const maxPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - minPipeHeight;
    // 随机生成顶部管道的高度
    const pipeTopHeight = Math.random() * maxPipeHeight + minPipeHeight;

    return {
        x: x, // 管道的X坐标，初始在屏幕右侧
        y: 0, // 顶部管道的Y坐标
        width: PIPE_WIDTH,
        height: pipeTopHeight, // 顶部管道的高度
        gapY: pipeTopHeight, // 管道开口的顶部Y坐标 (即顶部管道底部Y坐标)
        passed: false, // 标记是否已经通过，用于得分
        
        // 绘制管道 (使用Canvas API)
        draw: function() {
            ctx.fillStyle = COLORS.PIPE_GREEN;
            // 绘制顶部管道主体
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // 绘制顶部管道的“盖子” (边缘)
            ctx.fillRect(this.x - 3, this.height - 20, this.width + 6, 20);

            // 绘制底部管道主体
            const bottomPipeY = this.gapY + PIPE_GAP; // 底部管道的Y坐标
            const bottomPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomPipeY; // 底部管道的高度
            ctx.fillRect(this.x, bottomPipeY, this.width, bottomPipeHeight);
            // 绘制底部管道的“盖子” (边缘)
            ctx.fillRect(this.x - 3, bottomPipeY, this.width + 6, 20);

            // 绘制深色边缘，增加立体感 (可选)
            ctx.fillStyle = COLORS.PIPE_DARK_GREEN;
            ctx.fillRect(this.x, this.height - 20, this.width, 5); // 顶部管道盖的顶部边缘
            ctx.fillRect(this.x, bottomPipeY, this.width, 5); // 底部管道盖的顶部边缘
        },
        
        // 更新管道状态
        update: function() {
            this.x -= PIPE_SPEED; // 管道向左移动
        }
    };
}

// ====== 8. 游戏逻辑函数 ======

// 初始化游戏状态 (回到开始界面或重新开始)
function initGame() {
    gameStarted = false;
    gameOver = false;
    score = 0;
    scoreDisplay.textContent = score; // 重置得分显示
    bird = createBird(); // 重新创建小鸟对象
    pipes = []; // 清空管道数组
    lastPipeSpawnTime = 0; // 重置管道生成时间

    startScreen.classList.remove('hidden'); // 显示开始界面
    gameOverScreen.classList.add('hidden'); // 隐藏结束界面

    draw(); // 初始绘制，确保开始界面有游戏背景
}

// 开始游戏
function startGame() {
    gameStarted = true;
    startScreen.classList.add('hidden'); // 隐藏开始界面
    gameOverScreen.classList.add('hidden'); // 确保隐藏结束界面
    gameLoop(0); // 启动游戏主循环 (传入0作为初始时间戳)
}

// 游戏结束
function endGame() {
    gameOver = true;
    cancelAnimationFrame(animationFrameId); // 停止游戏循环
    finalScoreDisplay.textContent = score; // 显示最终得分
    gameOverScreen.classList.remove('hidden'); // 显示游戏结束界面
    sounds.hit.play(); // 播放撞击音效
    sounds.die.play(); // 播放死亡音效
}

// 碰撞检测
function checkCollision() {
    // 1. 撞地碰撞检测
    if (bird.y + BIRD_HEIGHT >= GAME_HEIGHT - GROUND_HEIGHT) {
        return true;
    }

    // 2. 撞管道碰撞检测 (AABB 轴对齐边界框检测)
    for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];

        // 检查小鸟是否与管道水平重叠
        // bird.x 的右边缘在 p.x 的左边缘之外 且 bird.x 的左边缘在 p.x 的右边缘之内
        if (bird.x < p.x + p.width &&
            bird.x + BIRD_WIDTH > p.x) {

            // 检查小鸟是否与顶部管道或底部管道垂直重叠
            if (bird.y < p.height || // 撞击顶部管道 (小鸟顶部 Y < 顶部管道底部 Y)
                bird.y + BIRD_HEIGHT > p.gapY + PIPE_GAP) { // 撞击底部管道 (小鸟底部 Y > 底部管道顶部 Y)
                return true;
            }
        }
    }
    return false;
}

// 更新分数
function updateScore() {
    for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        // 当小鸟完全通过管道的右侧边缘，且该管道未被标记为已通过时
        if (!p.passed && bird.x > p.x + p.width) {
            score++;
            scoreDisplay.textContent = score; // 更新得分显示
            p.passed = true; // 标记为已通过，防止重复计分
            sounds.score.play(); // 播放得分音效
        }
    }
}

// ====== 9. 游戏渲染函数 ======
let backgroundX = 0; // 背景滚动X坐标
let groundX = 0;     // 地面滚动X坐标

// 随机云朵位置 (为了简单，固定几朵云并让它们循环滚动)
const clouds = [
    { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.1, radius: 25 },
    { x: GAME_WIDTH * 0.6, y: GAME_HEIGHT * 0.05, radius: 30 },
    { x: GAME_WIDTH * 0.9, y: GAME_HEIGHT * 0.15, radius: 20 }
];

function draw() {
    // 清空画布 (注意：这里清空的是逻辑尺寸，因为ctx已经应用了缩放)
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 绘制背景 (天空)
    ctx.fillStyle = COLORS.SKY_BLUE;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 绘制云朵 (模拟滚动)
    ctx.fillStyle = COLORS.CLOUD_WHITE;
    for (let i = 0; i < clouds.length; i++) {
        let cloud = clouds[i];
        // 缓慢滚动云朵，模拟视差效果
        cloud.x = (cloud.x - PIPE_SPEED * 0.05); // 云朵滚动速度比管道慢
        if (cloud.x + cloud.radius * 2 < 0) { // 如果云朵完全移出左侧，将其重新放置到右侧
            cloud.x = GAME_WIDTH + Math.random() * GAME_WIDTH * 0.5; // 随机一个右侧起始点
            cloud.y = Math.random() * GAME_HEIGHT * 0.2; // 随机Y位置
            cloud.radius = 20 + Math.random() * 15; // 随机大小
        }

        ctx.beginPath();
        // 绘制多个重叠的圆形来模拟云朵形状
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.radius * 0.8, cloud.y - cloud.radius * 0.3, cloud.radius * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloud.radius * 0.8, cloud.y - cloud.radius * 0.3, cloud.radius * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.radius * 0.5, cloud.y + cloud.radius * 0.5, cloud.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制管道
    pipes.forEach(p => p.draw());

    // 绘制小鸟
    bird.draw();

    // 绘制地面 (模拟滚动)
    groundX -= PIPE_SPEED; // 地面和管道以相同速度滚动
    // 如果地面完全移出左侧，将其重置，形成无缝循环
    if (groundX <= -GAME_WIDTH) {
        groundX = 0;
    }
    // 地面底色 (泥土)
    ctx.fillStyle = COLORS.GROUND_BROWN;
    ctx.fillRect(groundX, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);
    ctx.fillRect(groundX + GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT); // 绘制第二段，实现循环

    // 地面顶部草地效果
    ctx.fillStyle = COLORS.GROUND_GREEN;
    ctx.fillRect(groundX, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, 20); // 20像素高的草地
    ctx.fillRect(groundX + GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, 20); // 绘制第二段草地
}

// ====== 10. 游戏主循环 ======
function gameLoop(currentTime) {
    if (gameOver) return; // 如果游戏结束，则停止循环

    if (!gameStarted) {
        // 如果游戏还没开始，只绘制界面，不更新游戏状态
        // 这样可以确保在开始界面时，背景是动态的
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }

    // 更新游戏状态
    bird.update();
    pipes.forEach(p => p.update());

    // 移除离开屏幕的管道 (优化性能，防止数组过大)
    pipes = pipes.filter(p => p.x + p.width > 0);

    // 生成新管道
    if (currentTime - lastPipeSpawnTime > PIPE_SPAWN_INTERVAL) {
        pipes.push(createPipe(GAME_WIDTH)); // 在屏幕右侧生成新管道
        lastPipeSpawnTime = currentTime;
    }

    // 碰撞检测
    if (checkCollision()) {
        endGame(); // 如果发生碰撞，结束游戏
        return;
    }

    // 更新分数
    updateScore();

    // 绘制所有元素
    draw();

    // 循环调用：请求浏览器在下一次重绘时调用 gameLoop
    animationFrameId = requestAnimationFrame(gameLoop);
}

// ====== 11. 事件监听 ======

// 窗口尺寸变化时调整游戏尺寸，实现响应式
window.addEventListener('resize', resizeGame);

// DOM 内容加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始设置游戏尺寸
    resizeGame();
    // 初始化游戏状态，显示开始界面
    initGame();

    // 为开始和重新开始按钮添加点击事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', initGame); // 重新开始时调用 initGame
});

// 统一处理游戏输入 (鼠标点击和触摸)
function handleGameInput() {
    if (!gameStarted && !gameOver) {
        // 如果在开始界面点击/触摸，则开始游戏
        startGame();
    } else if (gameStarted && !gameOver) {
        // 游戏进行中，小鸟拍打翅膀
        bird.flap();
    }
}

// 鼠标点击事件 (PC端)
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // 检查是否是鼠标左键
        handleGameInput();
    }
});

// 触摸事件 (移动端)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 阻止默认的触摸行为，如滚动、缩放，非常重要
    handleGameInput();
}, { passive: false }); // passive: false 确保 preventDefault 有效
