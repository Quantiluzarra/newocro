const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const betForm = document.getElementById('betForm');
const balanceElement = document.getElementById('balance');
const ai1HealthElement = document.getElementById('ai1Health');
const ai1StrengthElement = document.getElementById('ai1Strength');
const ai1BehaviorElement = document.getElementById('ai1Behavior');
const ai2HealthElement = document.getElementById('ai2Health');
const ai2StrengthElement = document.getElementById('ai2Strength');
const ai2BehaviorElement = document.getElementById('ai2Behavior');
const ai1OddsElement = document.getElementById('ai1Odds');
const ai2OddsElement = document.getElementById('ai2Odds');

// Инициализация ИИ
let ai1 = { x: 100, y: 250, vx: 0, vy: 0, health: 100, maxHealth: 100, strength: 5, behavior: 'агрессивное' };
let ai2 = { x: 400, y: 250, vx: 0, vy: 0, health: 100, maxHealth: 100, strength: 5, behavior: 'оборонительное' };

let balance = 1000;
const houseEdge = 0.1;

function calculateOdds() {
    const p1 = ai1.strength / (ai1.strength + ai2.strength);
    const p2 = 1 - p1;
    ai1OddsElement.textContent = ((1 - houseEdge) / p1).toFixed(2);
    ai2OddsElement.textContent = ((1 - houseEdge) / p2).toFixed(2);
}

calculateOdds();

function updateStats() {
    ai1HealthElement.textContent = ai1.health;
    ai1StrengthElement.textContent = ai1.strength;
    ai1BehaviorElement.textContent = ai1.behavior;
    ai2HealthElement.textContent = ai2.health;
    ai2StrengthElement.textContent = ai2.strength;
    ai2BehaviorElement.textContent = ai2.behavior;
}

function drawAI(ai, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ai.x, ai.y, 10, 0, Math.PI * 2);
    ctx.fill();
    const healthWidth = (ai.health / ai.maxHealth) * 20;
    ctx.fillStyle = 'green';
    ctx.fillRect(ai.x - 10, ai.y - 20, healthWidth, 5);
}

function moveAI(ai, target) {
    if (ai.behavior === 'агрессивное') {
        const dx = target.x - ai.x;
        const dy = target.y - ai.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            ai.vx = (dx / distance) * 2;
            ai.vy = (dy / distance) * 2;
        }
    } else if (ai.behavior === 'оборонительное') {
        const dx = target.x - ai.x;
        const dy = target.y - ai.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
            ai.vx = -(dx / distance) * 2;
            ai.vy = -(dy / distance) * 2;
        } else {
            ai.vx = (Math.random() - 0.5) * 2;
            ai.vy = (Math.random() - 0.5) * 2;
        }
    }
    ai.x += ai.vx;
    ai.y += ai.vy;
    if (ai.x < 10) ai.x = 10;
    if (ai.x > 490) ai.x = 490;
    if (ai.y < 10) ai.y = 10;
    if (ai.y > 490) ai.y = 490;
}

function fight() {
    const dx = ai1.x - ai2.x;
    const dy = ai1.y - ai2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 20) {
        ai1.health -= ai2.strength;
        ai2.health -= ai1.strength;
        if (ai1.health <= 0) return 'ai2';
        if (ai2.health <= 0) return 'ai1';
    }
    return null;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveAI(ai1, ai2);
    moveAI(ai2, ai1);
    drawAI(ai1, 'red');
    drawAI(ai2, 'blue');
    const winner = fight();
    if (winner) {
        if (winner === 'ai1') ai2.strength += 1;
        else ai1.strength += 1;
        ai1.health = ai1.maxHealth;
        ai2.health = ai2.maxHealth;
        calculateOdds();
        updateStats();
        ai1.x = 100; ai1.y = 250;
        ai2.x = 400; ai2.y = 250;
    } else {
        requestAnimationFrame(animate);
    }
}

betForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedAI = document.querySelector('input[name="ai"]:checked').value;
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (betAmount > balance) {
        alert('Недостаточно средств');
        return;
    }
    balance -= betAmount;
    balanceElement.textContent = balance;
    animate();
    setTimeout(() => {
        const winner = ai1.health <= 0 ? 'ai2' : 'ai2.health <= 0' ? 'ai1' : null;
        if (winner === selectedAI) {
            const odds = selectedAI === 'ai1' ? parseFloat(ai1OddsElement.textContent) : parseFloat(ai2OddsElement.textContent);
            balance += betAmount * odds;
        }
        balanceElement.textContent = Math.round(balance);
    }, 100); // Задержка для завершения анимации
});
