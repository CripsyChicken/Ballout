const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let ball;
let platforms = [];
const gravity = 0.5;
const friction = 0.9;
let isJumping = false;

// Set up the canvas dimensions to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Ball object
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

// Platform object
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

// Create game objects
function createGameObjects() {
    ball = new Ball(canvas.width / 2, 50, 20, 'blue');
    platforms = [
        new Platform(0, canvas.height - 20, canvas.width, 20, 'green'), // Ground platform
        new Platform(100, canvas.height - 150, 200, 20, 'gray'),
        new Platform(400, canvas.height - 250, 200, 20, 'gray'),
        new Platform(700, canvas.height - 350, 200, 20, 'gray'),
        new Platform(1000, canvas.height - 450, 200, 20, 'gray')
    ];
}

// Handle collision detection between the ball and platforms
function handleCollisions() {
    platforms.forEach(platform => {
        // Check for collision
        if (
            ball.x + ball.radius > platform.x &&
            ball.x - ball.radius < platform.x + platform.width &&
            ball.y + ball.radius > platform.y &&
            ball.y - ball.radius < platform.y + platform.height
        ) {
            // Collision from above
            if (ball.vy > 0 && ball.y - ball.radius < platform.y) {
                ball.vy = 0;
                ball.y = platform.y - ball.radius;
                isJumping = false; // Reset jump ability
            }
        }
    });
}

// Handle keyboard input for player movement
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            ball.vx = -5;
            break;
        case 'ArrowRight':
            ball.vx = 5;
            break;
        case 'ArrowUp':
            if (!isJumping) {
                ball.vy = -12; // Jump force
                isJumping = true;
            }
            break;
    }
});

// Main game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw game objects
    ball.update();
    handleCollisions();
    ball.draw();
    platforms.forEach(platform => platform.draw());

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game
createGameObjects();
gameLoop();

// Resize handler to make the game responsive
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createGameObjects(); // Recreate objects to fit new dimensions
});
