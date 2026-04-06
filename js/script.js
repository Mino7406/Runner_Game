// 플레이어는 dino로 정의의

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 300;

// 변수 설정
let score = 0;
let highScore = 0;

try {
    highScore = localStorage.getItem('dinoHighScore') || 0;
} catch (e) {
    highScore = 0;
}

let animationId;
let isGameOver = false;
let isGameStarted = false;
let gameSpeed = 3; 
let spawnTimer = 0; 
let spawnInterval = 0; 

// 플레이어 설정
const dino = {
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    color: '#00FF00', 
    vy: 0,
    gravity: 0.3,    
    jumpPower: -10,  
    isJumping: false,
    groundY: 200
};

let cactusArray = [];

// 클래스 정의

class Cactus {
    constructor() {
        this.width = 30;
        this.x = canvas.width;
        
        // 속도 4.0 이상일 때 30% 확률으로 큰 장애물
        if (gameSpeed >= 4.0 && Math.random() < 0.3) {
            this.height = 60; 
            this.y = 170;     
            this.color = '#FF0055'; 
        } else {
            this.height = 30; 
            this.y = 200;     
            this.color = '#FF3333'; 
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (this.height === 60) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 0; 
            ctx.fillRect(this.x, this.y + 29, this.width, 2);
        }
        
        ctx.shadowBlur = 0;
    }
}

// 텍스트 함수 
function drawText(text, x, y, size, color, align = 'center') {
    ctx.fillStyle = color;
    ctx.font = `${size}px "Press Start 2P", sans-serif`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

// UI
function drawScore() {
    drawText(`SCORE: ${score}`, 20, 40, 16, '#fff', 'left');
    drawText(`BEST: ${highScore}`, 20, 70, 12, '#aaa', 'left');

    // 2칸 장애물 경고 문구 
    if(gameSpeed >= 4.0 && gameSpeed < 4.5) {
        drawText("WARNING!", canvas.width / 2, 100, 40, '#FF3333', 'center');
    }
}

// 시작 화면
function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawText("READY?", canvas.width / 2, canvas.height / 2 - 20, 30, '#fff');
    drawText("PRESS SPACE TO START", canvas.width / 2, canvas.height / 2 + 30, 14, '#00FF00');
    drawText(`BEST: ${highScore}`, canvas.width / 2, canvas.height / 2 + 70, 12, '#888');
    
    ctx.fillStyle = dino.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = dino.color;
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    ctx.shadowBlur = 0;
}

// 게임 오버 화면
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20, 40, '#FF3333');
    drawText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2 + 30, 16, '#fff');

    if (score > highScore) { 
        drawText("NEW RECORD!", canvas.width / 2, canvas.height / 2 + 60, 16, '#FFFF00');
    } else {
        drawText(`HIGH SCORE: ${highScore}`, canvas.width / 2, canvas.height / 2 + 60, 14, '#aaa');
    }

    drawText("PRESS SPACE", canvas.width / 2, canvas.height / 2 + 100, 14, '#00FF00');
}

// 충돌 감지
function checkCollision(dino, cactus) {
    return (
        cactus.x < dino.x + dino.width &&
        cactus.x + cactus.width > dino.x &&
        cactus.y < dino.y + dino.height &&
        cactus.y + cactus.height > dino.y
    );
}

// 장애물 간격 설정
function setNextSpawnInterval() {
    const minGap = 100;
    const maxGap = 250;
    const randomGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    spawnInterval = Math.max(60, randomGap - (gameSpeed * 5));
}

// 게임 루프
function frame() {
    animationId = requestAnimationFrame(frame);
    spawnTimer++; 

    if (spawnTimer % 10 === 0) {
        score++;
        if (score % 100 === 0) {
            gameSpeed += 0.5; 
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, 230);
    ctx.lineTo(canvas.width, 230);
    ctx.stroke();

    drawScore();

    if (spawnTimer >= spawnInterval) { 
        const cactus = new Cactus();
        cactusArray.push(cactus);
        spawnTimer = 0; 
        setNextSpawnInterval();
    }

    cactusArray.forEach((cactus, index) => {
        cactus.x -= gameSpeed;
        cactus.draw();

        if (cactus.x < -cactus.width) {
            cactusArray.splice(index, 1);
        }

        if (checkCollision(dino, cactus)) {
            isGameOver = true;
            cancelAnimationFrame(animationId);
            
            if (score > highScore) {
                highScore = score;
                try {
                    localStorage.setItem('dinoHighScore', highScore);
                } catch (e) {}
            }
            drawGameOver();
        }
    });

    if (dino.isJumping) {
        dino.y += dino.vy;
        dino.vy += dino.gravity;

        if (dino.y >= dino.groundY) {
            dino.y = dino.groundY;
            dino.isJumping = false;
            dino.vy = 0;
        }
    }

    ctx.fillStyle = dino.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = dino.color;
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    ctx.shadowBlur = 0;
}

// 게임 리셋
function resetGame() {
    isGameOver = false;
    isGameStarted = true; 
    score = 0;
    spawnTimer = 0;
    cactusArray = [];
    dino.isJumping = false;
    dino.y = 200;
    gameSpeed = 3;
    
    try {
        highScore = localStorage.getItem('dinoHighScore') || 0;
    } catch(e) { highScore = 0; }
    
    setNextSpawnInterval(); 
    frame();
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        if (isGameOver) {
            resetGame();
        } 
        else if (!isGameStarted) {
            resetGame(); 
        }
        else if (!dino.isJumping) {
            dino.isJumping = true;
            dino.vy = dino.jumpPower;
        }
    }
});

// 폰트 로딩 대기 후 실행
document.fonts.ready.then(function() {
    drawStartScreen();
});