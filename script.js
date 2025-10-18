const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let ball;
let platforms = [];
const gravity = 0.5;
const friction = 0.9;
let isJumping = false;
let gameState = 'LOADING'; // Initial state is loading the image

// --- NEW IMAGE AND BUTTON SETUP ---
let titleScreenImage = new Image();
titleScreenImage.src = 'title_screen.png'; // IMPORTANT: Replace 'your_image.png' with the actual path to your image file.
let imageLoaded = false;

titleScreenImage.onload = () => {
    imageLoaded = true;
    gameState = 'TITLE_SCREEN';
    gameLoop(); // Start the loop once the image is ready
};

// Set up the canvas dimensions to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Menu button data
const menuButtons =;

let selectedItemIndex = 0;

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
        this.vy += gravity;
        this.vx *= friction;
        this.x += this.vx;
        this.y += this.vy;
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

// --- NEW TITLE SCREEN DRAWING FUNCTION ---
function drawTitleScreen() {
    if (!imageLoaded) return; // Wait for the image to load

    // Draw the image as the background
    ctx.drawImage(titleScreenImage, 0, 0, canvas.width, canvas.height);

    // Calculate menu position based on a known point in the image
    const menuWidth = 250;
    const menuHeight = 200;
    const menuX = canvas.width - menuWidth - 50;
    const menuY = (canvas.height / 2) + 20;

    // Redraw menu buttons on top of the image
    const buttonSpacing = 10;
    let currentY = menuY + 50;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(menuX, menuY, menuWidth, menuHeight, 15); // rounded rectangle for the menu background
    ctx.fill();

    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText("Main Menu", menuX + menuWidth / 2, menuY + 40);

    menuButtons.forEach((button, index) => {
        const buttonX = menuX + 20;
        const buttonY = currentY;

        // Update button coordinates for click detection
        button.x = buttonX;
        button.y = buttonY;

        // Draw button background
        ctx.fillStyle = (index === selectedItemIndex) ? 'lightblue' : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY, button.width - 40, button.height, 10);
        ctx.fill();

        // Draw button text
        ctx.fillStyle = 'white';
        ctx.fillText(button.text, buttonX + (button.width - 40) / 2, buttonY + 30);
        currentY += button.height + buttonSpacing;
    });
}

// --- NEW CLICK AND KEYBOARD EVENT LISTENERS ---
canvas.addEventListener('click', (event) => {
    if (gameState === 'TITLE_SCREEN') {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        menuButtons.forEach(button => {
            // Check if the click is within a button's bounds
            if (mouseX >= button.x && mouseX <= button.x + button.width &&
                mouseY >= button.y && mouseY <= button.y + button.height) {
                button.action();
            }
        });
    }
});

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
        switch (e.key) {
            case 'ArrowUp':
                selectedItemIndex = (selectedItemIndex - 1 + menuButtons.length) % menuButtons.length;
                break;
            case 'ArrowDown':
                selectedItemIndex = (selectedItemIndex + 1) % menuButtons.length;
                break;
            case 'Enter':
                menuButtons[selectedItemIndex].action();
                break;
        }
    }
});

// --- GAME FUNCTIONS (same as before) ---
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

// --- UPDATED MAIN GAME LOOP ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING') {
        ball.update();
        handleCollisions();
        ball.draw();
        platforms.forEach(platform => platform.draw());
    } else if (gameState === 'TITLE_SCREEN') {
        drawTitleScreen();
    }

    requestAnimationFrame(gameLoop);
}

// Resize handler to make the game responsive
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gameState === 'PLAYING') {
        createGameObjects();
    }
});

// Initial call to start the loop
gameLoop();

