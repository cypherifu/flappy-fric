const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const aspectRatio = 2 / 3;
    if (window.innerWidth < 600) {
        canvas.width = window.innerWidth * 0.9;
        canvas.height = canvas.width / aspectRatio;
    } else {
        canvas.width = 800;
        canvas.height = 600;
    }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const fricImg = new Image();
fricImg.src = "./images/fric.png";

const coinImg = new Image();
coinImg.src = "./images/coin.png";

// Settings
let fricSize = 40;
let pipeSpeed = 1.5;
let pipeGap = 200;

const fric = {
    x: 50,
    y: canvas.height / 2,
    width: fricSize,
    height: fricSize,
    gravity: 0.4,
    lift: -8,
    velocity: 0
};

const pipes = [];
const coins = [];
const pipeWidth = 50;
let score = 0;
let coinCount = 0;
let gameOver = false;
let lastTime = 0;

// Game loop (now with deltaTime)
function update(deltaTime) {
    if (gameOver) return;

    // Normalize movement with deltaTime
    fric.velocity += fric.gravity * deltaTime;
    fric.y += fric.velocity * deltaTime;

    // Prevent fric from going off screen
    if (fric.y + fric.height > canvas.height) {
        fric.y = canvas.height - fric.height;
        fric.velocity = 0;
        endGame();
    }
    if (fric.y < 0) {
        fric.y = 0;
        fric.velocity = 0;
        endGame();
    }

    // Update pipes
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed * deltaTime;

        // Collision detection
        if (
            fric.x < pipes[i].x + pipeWidth &&
            fric.x + fric.width > pipes[i].x &&
            (fric.y < pipes[i].top || fric.y + fric.height > pipes[i].bottom)
        ) {
            endGame();
        }
    }

    // Update coins
    for (let i = 0; i < coins.length; i++) {
        coins[i].x -= pipeSpeed * deltaTime;

        // Collision with fric
        if (
            fric.x < coins[i].x + 20 &&
            fric.x + fric.width > coins[i].x &&
            fric.y < coins[i].y + 20 &&
            fric.y + fric.height > coins[i].y
        ) {
            coins.splice(i, 1);
            coinCount++;
        }
    }

    // Remove off-screen pipes
    if (pipes.length > 0 && pipes[0].x < -pipeWidth) {
        pipes.shift();
        score++;
    }

    // Add new pipes and coins
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        let topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        let bottomHeight = topHeight + pipeGap;
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: bottomHeight
        });

        // Add coin at a more reachable position
        if (Math.random() < 0.5) {
            coins.push({
                x: canvas.width + 50,
                y: topHeight + pipeGap / 2 - 10
            });
        }
    }
}

function draw() {
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fric image
    ctx.drawImage(fricImg, fric.x, fric.y, fric.width, fric.height);

    // Draw pipes
    ctx.fillStyle = "green";
    for (let i = 0; i < pipes.length; i++) {
        ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].top);
        ctx.fillStyle = "red";
        ctx.fillRect(pipes[i].x, pipes[i].bottom, pipeWidth, canvas.height - pipes[i].bottom);
        ctx.fillStyle = "red";
    }

    // Draw coins
    for (let i = 0; i < coins.length; i++) {
        ctx.drawImage(coinImg, coins[i].x, coins[i].y, 20, 20);
    }

    // Update Score and Coins in UI
    document.getElementById("score").textContent = score;
    document.getElementById("coins").textContent = coinCount;
}

function endGame() {
    gameOver = true;
    document.getElementById("gameOverScreen").style.display = "block";
}

function restartGame() {
    fric.y = canvas.height / 2;
    fric.velocity = 0;
    pipes.length = 0;
    coins.length = 0;
    score = 0;
    coinCount = 0;
    gameOver = false;
    document.getElementById("gameOverScreen").style.display = "none";
}

// Game loop with deltaTime to fix high refresh rate issues
function gameLoop(timestamp) {
    let deltaTime = (timestamp - lastTime) / 16.67; // 60fps
    lastTime = timestamp;

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// Controls
let lastJumpTime = 0;

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        if (gameOver) {
            restartGame();
        } else {
            fric.velocity = fric.lift;
        }
    }
});

document.addEventListener("touchstart", function(event) {
    event.preventDefault();

    const now = Date.now();
    if (now - lastJumpTime > 100) { // 100ms delay
        lastJumpTime = now;
        if (gameOver) {
            restartGame();
        } else {
            fric.velocity = fric.lift;
        }
    }
}, { passive: false });

