
---

# 🚀 Flappy Bird H5 - 纯 Canvas 绘制版

一个经典的 Flappy Bird 游戏的 H5 实现，支持手机触控和电脑鼠标点击，具备响应式布局，所有游戏元素（小鸟、管道、背景等）均通过 HTML5 Canvas API 动态绘制，不依赖任何图片资源。

## ✨ 主要特性

*   **经典玩法**：忠实还原 Flappy Bird 的核心玩法，包括重力、跳跃、管道障碍和得分机制。
*   **响应式设计**：游戏画布和UI元素会根据浏览器/设备屏幕尺寸自动调整，适配手机和电脑。
*   **多平台输入**：
    *   **手机端**：支持屏幕触控操作，即点即跳。
    *   **电脑端**：支持鼠标点击操作，点击鼠标左键即可跳跃。
*   **纯 Canvas 绘制**：所有游戏图形（小鸟、管道、天空、云朵、地面）都通过 JavaScript 和 Canvas 绘图API动态生成，无外部图片资源加载，使得项目轻量高效。
*   **流畅物理效果**：
    *   优化的重力感应和跳跃力度，提供更线性和可控的下落体验（限制最大下落速度），避免突然“砸地”的感受。
    *   调整了管道的间距和鸟的回弹高度，使得游戏难度适中，更具可玩性。
*   **游戏状态管理**：包含开始界面、游戏进行中和游戏结束界面，清晰的得分显示。
*   **音效支持**：提供拍打翅膀、得分、撞击和死亡音效，增强游戏沉浸感。

## 🕹️ 如何游玩

1.  点击页面上的 **"开始游戏"** 按钮。
2.  **桌面端**：点击鼠标左键，小鸟会向上跳跃。
3.  **手机端**：触摸屏幕任意位置，小鸟会向上跳跃。
4.  控制小鸟穿过绿色管道的缝隙，每成功穿过一个管道，得分加1。
5.  避免撞到管道或地面，否则游戏结束。
6.  游戏结束后，点击 **"重新开始"** 按钮可再次挑战。

## 🛠️ 技术栈

*   **HTML5**：构建页面结构，使用 `<canvas>` 元素承载游戏。
*   **CSS3**：负责页面的整体布局、UI元素的样式以及响应式布局。
*   **JavaScript (ES6+)**：实现完整的游戏逻辑、物理引擎、碰撞检测、Canvas 绘图、动画循环和事件处理。

## 📂 项目结构

```
flappy-bird-h5/
├── index.html            # 游戏主页面
├── style.css         # 页面和游戏UI的样式文件
├── game.js         # 核心游戏逻辑，包括 Canvas 绘制、物理计算、状态管理和事件处理
└── assets/
    └── sounds/           # 存放游戏音效文件（例如：flap.wav, score.wav, hit.wav, die.wav）
```

## 🚀 部署与运行

要本地运行此游戏，您需要一个简单的 HTTP 服务器，因为浏览器安全策略会阻止直接通过 `file://` 协议加载某些资源（如音效）或 Canvas 操作。

### 先决条件

*   一个现代的Web浏览器（Chrome, Firefox, Safari, Edge等）。
*   (可选) Node.js 或 Python，用于快速启动本地服务器。

### 步骤

1.  **下载或克隆项目：**
    将本项目的代码下载到您的本地计算机。
    ```bash
    git clone <repository_url>
    cd flappy-bird-h5
    ```
    (如果您是从提供的代码片段手动创建，请确保文件结构与 `📂 项目结构` 部分所示一致)。

2.  **准备音效文件：**
    在 `assets/sounds/` 目录下放置以下 `.wav` 格式的音效文件：
    *   `flap.wav` (小鸟拍打翅膀)
    *   `score.wav` (得分)
    *   `hit.wav` (撞击管道)
    *   `die.wav` (小鸟落地或死亡)
    如果您暂时没有这些文件，游戏也能运行，只是没有音效。

3.  **启动本地服务器：**

    *   **使用 `http-server` (推荐，需要 Node.js):**
        在项目根目录打开命令行工具，运行：
        ```bash
        npx http-server
        ```
        如果未安装，它会提示您安装。

    *   **使用 Python 的内置服务器：**
        在项目根目录打开命令行工具，运行：
        ```bash
        # Python 3
        python3 -m http.server

        # Python 2 (如果还在用)
        python -m SimpleHTTPServer
        ```

    *   **使用 VS Code Live Server 插件：**
        如果您使用 Visual Studio Code，可以安装 "Live Server" 插件。在 `index.html` 文件上右键，选择 "Open with Live Server"。

4.  **在浏览器中打开：**
    服务器启动后，通常会在命令行中显示一个本地地址（例如 `http://localhost:8080` 或 `http://127.0.0.1:8000`）。在您的电脑或手机浏览器中访问此地址即可开始游戏。

## ⚙️ 游戏参数配置

您可以在 `game.js` 文件中找到并调整以下常量，以自定义游戏体验和难度：

```javascript
// ====== 2. 游戏配置 (逻辑尺寸和物理参数) ======
const GAME_WIDTH = 288;          // 游戏逻辑宽度
const GAME_HEIGHT = 512;         // 游戏逻辑高度

const BIRD_WIDTH = 34;           // 小鸟宽度
const BIRD_HEIGHT = 24;          // 小鸟高度
const PIPE_WIDTH = 52;           // 管道宽度
const GROUND_HEIGHT = 112;       // 地面高度

const PIPE_GAP = 140;            // 管道上下开口的距离 (增大此值增加难度，减小降低难度)

const GRAVITY = 0.4;             // 重力加速度 (值越小下落越慢，但会与MAX_FALL_SPEED配合)
const JUMP_STRENGTH = -8.5;      // 跳跃初速度 (绝对值越大跳得越高)
const MAX_FALL_SPEED = 6;        // 最大下落速度 (限制小鸟下落速度，避免“砸地”感)

const PIPE_SPEED = 1.8;          // 管道移动速度 (影响游戏节奏)
const PIPE_SPAWN_INTERVAL = 1500; // 管道生成间隔（毫秒）(影响管道密度)

// ====== 3. 游戏颜色定义 (用于Canvas绘制) ======
const COLORS = {
    SKY_BLUE: '#70c5ce',
    CLOUD_WHITE: '#fff',
    GROUND_BROWN: '#ded895',
    GROUND_GREEN: '#7d6f51',
    PIPE_GREEN: '#7ac711',
    PIPE_DARK_GREEN: '#5a9b0c',
    BIRD_YELLOW: '#ffd700',
    BIRD_ORANGE: '#ff8c00',
    BIRD_EYE: '#000000'
};
```
您可以根据自己的偏好调整这些数值，以达到最佳的游戏手感和挑战性。

## 📜 许可证

本项目基于 MIT 许可证开源。详情请查阅项目根目录下的 `LICENSE` 文件（如果存在的话，或者您可以自行添加）。

---

希望这个 README 文件能帮助您和项目的用户更好地理解和使用这个 Flappy Bird H5 游戏！
