const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let ball;
let platforms = [];
const gravity = 0.5;
const friction = 0.9;
let isJumping = false;
let gameState = 'TITLE_SCREEN'; // New variable to track game state

// Set up the canvas dimensions to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- GAME OBJECTS (same as before) ---
class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        // Apply gravity
        this.vy += gravity;

        // Apply friction
        this.vx *= friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Keep ball within horizontal bounds
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.vx *= -1;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
        }
        if (this.x - this.radius < 0) {
            this.x = this.radius;
        }
    }
}

class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// --- NEW TITLE SCREEN CLASS ---
class TitleScreen {
    constructor() {
        this.titleText = "ON THIN ICE";
        this.menuItems = ["Play", "Skins", "Settings", "Shop"];
        this.selectedItem = 0;
    }

    draw() {
        // Clear canvas and draw background
        ctx.fillStyle = '#b3e0ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw mountains (simplified)
        ctx.fillStyle = '#66b0d8';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width * 0.25, canvas.height * 0.5);
        ctx.lineTo(canvas.width * 0.5, canvas.height * 0.8);
        ctx.lineTo(canvas.width * 0.75, canvas.height * 0.4);
        ctx.lineTo(canvas.width, canvas.height * 0.7);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
        ctx.closePath();

        // Draw title text
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(this.titleText, canvas.width / 2, canvas.height / 4);

        // Draw menu
        const menuWidth = 250;
        const menuHeight = 200;
        const menuX = canvas.width - menuWidth - 50;
        const menuY = canvas.height / 2 - menuHeight / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText("Main Menu", menuX + menuWidth / 2, menuY + 40);

        this.menuItems.forEach((item, index) => {
            const itemY = menuY + 80 + index * 30;
            if (index === this.selectedItem) {
                ctx.fillStyle = 'lightblue'; // Highlight selected item
            } else {
                ctx.fillStyle = 'white';
            }
            ctx.fillText(item, menuX + menuWidth / 2, itemY);
        });
    }

    handleInput(key) {
        if (key === 'ArrowUp') {
            this.selectedItem = (this.selectedItem - 1 + this.menuItems.length) % this.menuItems.length;
        } else if (key === 'ArrowDown') {
            this.selectedItem = (this.selectedItem + 1) % this.menuItems.length;
        } else if (key === 'Enter') {
            if (this.menuItems[this.selectedItem] === "Play") {
                // Change to PLAYING state and start the game
                gameState = 'PLAYING';
                createGameObjects();
            }
            // Add more logic for other menu items here
        }
    }
}

let titleScreen = new TitleScreen();

// --- GAME FUNCTIONS ---
function createGameObjects() {
    ball = new Ball(canvas.width / 2, 50, 20, 'blue');
    platforms = [
        new Platform(0, canvas.height - 20, canvas.width, 20, 'green'),
        new Platform(100, canvas.height - 150, 200, 20, 'gray'),
        new Platform(400, canvas.height - 250, 200, 20, 'gray'),
        new Platform(700, canvas.height - 350, 200, 20, 'gray'),
        new Platform(1000, canvas.height - 450, 200, 20, 'gray')
    ];
}

function handleCollisions() {
    platforms.forEach(platform => {
        if (
            ball.x + ball.radius > platform.x &&
            ball.x - ball.radius < platform.x + platform.width &&
            ball.y + ball.radius > platform.y &&
            ball.y - ball.radius < platform.y + platform.height
        ) {
            if (ball.vy > 0 && ball.y - ball.radius < platform.y) {
                ball.vy = 0;
                ball.y = platform.y - ball.radius;
                isJumping = false;
            }
        }
    });
}

// --- UPDATED INPUT HANDLING ---
document.addEventListener('keydown', (e) => {
    if (gameState === 'PLAYING') {
        switch (e.key) {
            case 'ArrowLeft':
                ball.vx = -5;
                break;
            case 'ArrowRight':
                ball.vx = 5;
                break;
            case 'ArrowUp':
                if (!isJumping) {
                    ball.vy = -12;
                    isJumping = true;
                }
                break;
        }
    } else if (gameState === 'TITLE_SCREEN') {
        titleScreen.handleInput(e.key);
    }
});

// --- UPDATED MAIN GAME LOOP ---
function gameLoop() {
    if (gameState === 'PLAYING') {
        // Game play logic
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ball.update();
        handleCollisions();
        ball.draw();
        platforms.forEach(platform => platform.draw());
    } else if (gameState === 'TITLE_SCREEN') {
        // Title screen logic
        titleScreen.draw();
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop, which will initially draw the title screen
gameLoop();

// Resize handler to make the game responsive
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gameState === 'PLAYING') {
        createGameObjects();
    }
});
