// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let player, enemies = [], projectiles = [], pickups = [], keys = {};
let lastAttackTime = 0;
let startTime = Date.now();
let xp = 0;
let gameOver = false;
let paused = false;

// HUD Elements
const healthEl = document.getElementById('health');
const shieldEl = document.getElementById('shield');
const xpEl = document.getElementById('xp');
const timerEl = document.getElementById('timer');
const statDamage = document.getElementById('stat-damage');
const statAreaRadius = document.getElementById('stat-area-radius');
const statAreaDamage = document.getElementById('stat-area-damage');
const statBurn = document.getElementById('stat-burn');
const statFreeze = document.getElementById('stat-freeze');
const statProjectiles = document.getElementById('stat-projectiles');
const statAttackSpeed = document.getElementById('stat-attack-speed');
const statRegen = document.getElementById('stat-regen');
const statKnockback = document.getElementById('stat-knockback');
const statInvincible = document.getElementById('stat-invincible');
const statProjectileSize = document.getElementById('stat-projectile-size');
const statCrit = document.getElementById('stat-crit');
const statShield = document.getElementById('stat-shield');
const statReflect = document.getElementById('stat-reflect');
const statLifesteal = document.getElementById('stat-lifesteal');
const statMoveSpeed = document.getElementById('stat-move-speed');

// Upgrade System
const upgrades = [
  { name: "Damage", effect: "increaseDamage", value: 10, desc: "+10 projectile damage", icon: "images/upg/upg1.png" },
  { name: "Move Speed", effect: "increaseSpeed", value: 0.5, desc: "+0.5 player speed", icon: "images/upg/upg2.png" },
  { name: "HP Regen", effect: "regen", value: 2, desc: "+2 HP per second", icon: "images/upg/upg3.png" },
  { name: "Max HP", effect: "maxHp", value: 30, desc: "+30 max HP", icon: "images/upg/upg4.png" },
  { name: "Attack Speed", effect: "attackSpeed", value: -150, desc: "Faster auto-attack", icon: "images/upg/upg5.png" },
  { name: "Projectile Size", effect: "projectileSize", value: 5, desc: "+5 projectile size", icon: "images/upg/upg6.png" },
  { name: "Area Damage", effect: "areaDamage", value: 15, desc: "Deal 15 damage to all enemies in radius", icon: "images/upg/upg7.png" },
  { name: "invincible", effect: "invincible", value: 2, desc: "Invincible for 2s after hit", icon: "images/upg/upg8.png" },
  { name: "Add Projectile", effect: "addProjectile", value: 1, desc: "+1 projectile per shot", icon: "images/upg/upg9.png" },
  { name: "Magnet", effect: "magnet", value: 200, desc: "Pickup range +200px", icon: "images/upg/upg10.png" },
  { name: "Freeze", effect: "freeze", value: 2, desc: "Freeze enemies for 2s", icon: "images/upg/upg11.png" },
  { name: "Lifesteal", effect: "lifesteal", value: 0.15, desc: "Heal 15% of damage dealt", icon: "images/upg/upg12.png" },
  { name: "Reflect", effect: "reflect", value: 0.15, desc: "15% chance to reflect damage", icon: "images/upg/upg13.png" },
  { name: "Burn", effect: "burn", value: 5, desc: "Burn enemies for 5/sec", icon: "images/upg/upg14.png" },
  { name: "Crit Chance", effect: "crit", value: 0.15, desc: "15% chance to crit x2 dmg", icon: "images/upg/upg15.png" },
  { name: "Knockback", effect: "knockback", value: 20, desc: "Projectiles knock enemies back", icon: "images/upg/upg16.png" },
  { name: "Armor", effect: "shield", value: 10, desc: "+10 armor (absorbs damage)", icon: "images/upg/upg17.png" }
];
let level = 1;
let totalXP = 0; // Track total XP collected
let projectileDamage = 10; //start = 10dmg
let critChance = 0;
let hpRegen = 0;
let upgradePending = false;
let maxHp = 100;
let attackInterval = 1000;
let projectileRadius = 5;
let invincibleTime = 0;
let lastHitTime = 0;
let invincibleDuration = 0;
let additionalProjectiles = 0; //start = 0
let magnetRange = 50;
let freezeDuration = 0;
let lifesteal = 0;
let reflectChance = 0;
let burnDamage = 0;
let burnDuration = 5;
let knockback = 0;
let shield = 0;
let shieldRegen = 0;
let maxShield = 0;
let areaDamageValue = 0;
let areaDamageRadius = 80;
let areaExplosions = [];
const upgradeModal = document.getElementById('upgradeModal');

// Track upgrade levels
let upgradeLevels = {};

// Add global array for floating damage numbers
let floatingDamageNumbers = [];

// Add global array for floating player damage numbers
let floatingPlayerDamageNumbers = [];

// Enemy types
const ENEMY_TYPES = [
  { name: 'Basic', color: 'red', speed: () => 1.0 + Math.random() * 0.5, radius: 15, hp: 20, xp: 10, damage: 10 },
  { name: 'Fast', color: 'yellow', speed: () => 1.8 + Math.random() * 0.5, radius: 14, hp: 10, xp: 7, damage: 7 },
  { name: 'Tank', color: 'blue', speed: () => 0.7 + Math.random() * 0.2, radius: 22, hp: 60, xp: 25, damage: 18 },
  { name: 'Burning', color: 'orange', speed: () => 1.2 + Math.random() * 0.3, radius: 14, hp: 18, xp: 12, damage: 12 },
  { name: 'Range', color: 'lime', speed: () => 1.0 + Math.random() * 0.3, radius: 13, hp: 16, xp: 14, damage: 8 },
  { name: 'Final Boss', color: 'purple', speed: () => 0.7, radius: 60, hp: 800, xp: 100, damage: 30 }
];

// Stage logic
let stage = 0;
let finalBossActive = false;
let win = false;
let boss = null;
let bossProjectiles = [];
let bossHasSpawned = false;

// World and Camera
const worldWidth = 1440;
const worldHeight = 1440;
let camera = { x: 0, y: 0 };

// Environment Objects (emojis/images)
const environmentObjects = [
  {
    type: 'stairs',
    image: 'images/env/stairs1.png',
    x: worldWidth / 2,
    y: worldHeight / 2,
    size: 96 // px, for scaling
  }
  // Add more objects here later
];

// XP progression parameters
const baseXP = 50;
const xpGrowth = 1.2;

// Returns the cumulative XP required to reach a given level (level 1 = 0 XP)
function totalXPForLevel(level) {
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += Math.floor(baseXP * Math.pow(xpGrowth, i - 1));
  }
  return xp;
}
// Returns the XP required to go from (level-1) to level
function xpForLevel(level) {
  return Math.floor(baseXP * Math.pow(xpGrowth, level - 1));
}

// XP Orb Class
class XPOrb {
  constructor(x, y, value = 10) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.collected = false;
    // Size and color by value (brown/gold style)
    if (value <= 10) {
      this.radius = 6;
      this.color = '#cd7f32'; // bronze
    } else if (value < 20) {
      this.radius = 8;
      this.color = '#c0c0c0'; // silver
    } else {
      this.radius = 10;
      this.color = '#ffd700'; // gold
    }
    this.vx = 0;
    this.vy = 0;
  }
  update(player) {
    // Magnet effect
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    let attract = false;
    if (magnetRange > 0 && dist < magnetRange) attract = true;
    if (dist < player.radius + this.radius + 4) {
      this.collected = true;
      xp += this.value;
      totalXP += this.value;
      checkLevelUp();
    } else if (attract) {
      // Move toward player
      this.vx = (dx / dist) * 6;
      this.vy = (dy / dist) * 6;
      this.x += this.vx;
      this.y += this.vy;
    } else {
      // Slow drift (optional)
      this.vx *= 0.9;
      this.vy *= 0.9;
      this.x += this.vx;
      this.y += this.vy;
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = '#b35c1e'; // gold-brown shadow
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    // ctx.strokeStyle = '#fff';
    // ctx.lineWidth = 2;
    // ctx.stroke();
    ctx.restore();
  }
}

// Mouse movement control
let mouseTarget = null;
let mouseFollowing = false;

function updateMouseTarget(e) {
  const rect = canvas.getBoundingClientRect();
  mouseTarget = {
    x: (e.clientX - rect.left) * (canvas.width / rect.width) + camera.x,
    y: (e.clientY - rect.top) * (canvas.height / rect.height) + camera.y
  };
}

canvas.addEventListener('click', function(e) {
  if (!mouseFollowing) {
    mouseFollowing = true;
    updateMouseTarget(e);
    window.addEventListener('mousemove', updateMouseTarget);
  } else {
    mouseFollowing = false;
    window.removeEventListener('mousemove', updateMouseTarget);
    mouseTarget = null;
  }
});

// Joystick state (virtual joystick)
let joystick = {
  active: false,
  dx: 0,
  dy: 0,
  magnitude: 0
};

// Gamepad state
let gamepadState = {
  connected: false,
  dx: 0,
  dy: 0,
  magnitude: 0
};

// Joystick event handlers
const joystickContainer = document.getElementById('joystick-container');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
let joystickCenter = { x: 0, y: 0 };
let joystickRadius = 50; // px, matches #joystick-base half width

// Hide joystick if not on a touch device
function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}
if (!isTouchDevice()) {
  joystickContainer.style.display = 'none';
}

function getTouchPos(e) {
  const rect = joystickBase.getBoundingClientRect();
  let touch = e.touches ? e.touches[0] : e;
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

function startJoystick(e) {
  e.preventDefault();
  joystick.active = true;
  const rect = joystickBase.getBoundingClientRect();
  joystickCenter = { x: rect.width / 2, y: rect.height / 2 };
  moveJoystick(e);
}
function moveJoystick(e) {
  if (!joystick.active) return;
  const pos = getTouchPos(e);
  let dx = pos.x - joystickCenter.x;
  let dy = pos.y - joystickCenter.y;
  let dist = Math.hypot(dx, dy);
  let maxDist = joystickRadius;
  if (dist > maxDist) {
    dx = (dx / dist) * maxDist;
    dy = (dy / dist) * maxDist;
    dist = maxDist;
  }
  joystick.dx = dx / maxDist;
  joystick.dy = dy / maxDist;
  joystick.magnitude = dist / maxDist;
  // Move knob
  joystickKnob.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
}
function endJoystick(e) {
  joystick.active = false;
  joystick.dx = 0;
  joystick.dy = 0;
  joystick.magnitude = 0;
  joystickKnob.style.transform = 'translate(-50%, -50%)';
}
joystickBase.addEventListener('touchstart', startJoystick, { passive: false });
joystickBase.addEventListener('touchmove', moveJoystick, { passive: false });
joystickBase.addEventListener('touchend', endJoystick, { passive: false });
joystickBase.addEventListener('touchcancel', endJoystick, { passive: false });
// Optional: mouse support for joystick
joystickBase.addEventListener('mousedown', startJoystick);
window.addEventListener('mousemove', moveJoystick);
window.addEventListener('mouseup', endJoystick);

// Gamepad polling
function pollGamepad() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) { gp = gamepads[i]; break; }
  }
  if (gp) {
    gamepadState.connected = true;
    // Left stick axes (axes[0]=x, axes[1]=y)
    let dx = gp.axes[0] || 0;
    let dy = gp.axes[1] || 0;
    let mag = Math.hypot(dx, dy);
    // Deadzone
    if (mag < 0.15) { dx = 0; dy = 0; mag = 0; }
    gamepadState.dx = dx;
    gamepadState.dy = dy;
    gamepadState.magnitude = mag > 1 ? 1 : mag;
  } else {
    gamepadState.connected = false;
    gamepadState.dx = 0;
    gamepadState.dy = 0;
    gamepadState.magnitude = 0;
  }
  requestAnimationFrame(pollGamepad);
}
requestAnimationFrame(pollGamepad);

// Player Class
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.radius = 20;
    this.hp = 100;
  }

  update() {
    // Mouse movement (toggle follow mode)
    if (mouseFollowing && mouseTarget) {
      const dx = mouseTarget.x - this.x;
      const dy = mouseTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 2) {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      }
    }
    // Gamepad movement (priority)
    if (gamepadState.connected && (gamepadState.dx !== 0 || gamepadState.dy !== 0)) {
      this.x += gamepadState.dx * this.speed;
      this.y += gamepadState.dy * this.speed;
    } else if (joystick.active && (joystick.dx !== 0 || joystick.dy !== 0)) {
      // Virtual joystick movement
      this.x += joystick.dx * this.speed * joystick.magnitude;
      this.y += joystick.dy * this.speed * joystick.magnitude;
    } else {
      // Keyboard movement
      if (keys['KeyW'] || keys['ArrowUp']) this.y -= this.speed;
      if (keys['KeyS'] || keys['ArrowDown']) this.y += this.speed;
      if (keys['KeyA'] || keys['ArrowLeft']) this.x -= this.speed;
      if (keys['KeyD'] || keys['ArrowRight']) this.x += this.speed;
    }
    // Clamp to world
    this.x = Math.max(this.radius, Math.min(worldWidth - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(worldHeight - this.radius, this.y));
  }

  draw(ctx) {
    ctx.save();
    const img = new window.Image();
    img.src = 'images/player1.png';
    const size = this.radius * 2;
    ctx.shadowColor = '#ffe066'; // yellowish glow
    ctx.shadowBlur = 32;
    ctx.drawImage(img, this.x - camera.x - this.radius, this.y - camera.y - this.radius, size, size);
    ctx.restore();
  }
}

// Enemy Class
class Enemy {
  constructor(x, y, type = null) {
    if (!type) type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    this.type = type;
    this.x = x;
    this.y = y;
    this.speed = type.speed();
    this.radius = type.radius;
    this.hp = type.hp;
    this.maxHp = type.hp;
    this.color = type.color;
    this.burns = [];
    this.frozen = false;
    this.damageNumbers = [];
    this.shootCooldown = 0;
    this.lastBurnNumberTime = 0; // Throttle burn damage numbers
    // Assign image based on type
    const imageMap = {
      'Basic': 'images/enemies/basic.png',
      'Fast': 'images/enemies/fast.png',
      'Tank': 'images/enemies/tank.png',
      'Burning': 'images/enemies/burning.png',
      'Range': 'images/enemies/range.png',
      'Final Boss': 'images/enemies/boss.png'
    };
    this.image = imageMap[this.type.name] || 'images/enemies/basic.png';
  }

  update(player) {
    if (typeof this.frozen === 'number' && this.frozen > Date.now()) return;
    if (this.type.name === 'Range' && !finalBossActive) {
      // Shoot at player every 1.5s
      this.shootCooldown--;
      if (this.shootCooldown <= 0) {
        bossProjectiles.push({
          x: this.x, y: this.y,
          vx: (player.x - this.x) / Math.hypot(player.x - this.x, player.y - this.y) * 4,
          vy: (player.y - this.y) / Math.hypot(player.x - this.x, player.y - this.y) * 4,
          radius: 6, color: 'lime', fromBoss: false
        });
        this.shootCooldown = 200;
      }
    }
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
  }

  draw(ctx) {
    // Burn effect (outer, orange-red, pulsing)
    if (this.burns && this.burns.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      // Pulse the radius with a sine wave for a fire effect
      const pulse = Math.sin(Date.now() / 350 + this.x + this.y) * 3 + 10;
      const grad = ctx.createRadialGradient(
        this.x - camera.x, this.y - camera.y, this.radius + 2,
        this.x - camera.x, this.y - camera.y, this.radius + pulse + 6
      );
      grad.addColorStop(0, 'orange');
      grad.addColorStop(0.7, 'orangered');
      grad.addColorStop(1, 'red');
      ctx.strokeStyle = grad;
      ctx.shadowColor = 'orangered';
      ctx.shadowBlur = 36;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(this.x - camera.x, this.y - camera.y, this.radius + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // Enemy image
    ctx.save();
    const img = new window.Image();
    img.src = this.image;
    const size = this.radius * 2;
    ctx.shadowColor = '#ffe066'; // small yellowish glow
    ctx.shadowBlur = 12;
    ctx.drawImage(img, this.x - camera.x - this.radius, this.y - camera.y - this.radius, size, size);
    ctx.restore();
    // If frozen, overlay blue tint
    const isFrozen = typeof this.frozen === 'number' && this.frozen > Date.now();
    if (isFrozen) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#1e90ff';
      ctx.beginPath();
      ctx.arc(this.x - camera.x, this.y - camera.y, this.radius * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Inner blue circle
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#1e90ff';
      ctx.beginPath();
      ctx.arc(this.x - camera.x, this.y - camera.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    // Healthbar
    const barWidth = this.radius * 2;
    const barHeight = 6;
    const barX = this.x - this.radius - camera.x;
    const barY = this.y - this.radius - 16 - camera.y;
    ctx.save();
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    const hpPercent = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = hpPercent > 0.5 ? '#4caf50' : (hpPercent > 0.2 ? '#ffc107' : '#f44336');
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    ctx.strokeStyle = 'rgba(78,46,14,0.0)'; // dark brown, semi-transparent
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    ctx.restore();
    if (this.type.name === 'Boss') {
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x - camera.x, this.y - camera.y, this.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    this.damageNumbers = this.damageNumbers.filter(d => Date.now() - d.time < 700);
    this.damageNumbers.forEach(d => {
      ctx.save();
      ctx.globalAlpha = 1 - (Date.now() - d.time) / 700;
      ctx.fillStyle = d.crit ? '#ffd700' : (d.burn ? 'orange' : 'white');
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(d.value), this.x - camera.x, this.y - this.radius - 10 - (Date.now() - d.time) / 20 - camera.y);
      ctx.restore();
    });
  }
}

// Projectile Class
class Projectile {
  constructor(x, y, target, dmg = projectileDamage, burn = 0, knock = 0) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.hypot(dx, dy);
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
    this.radius = projectileRadius;
    this.dmg = dmg;
    this.burn = burn;
    this.knock = knock;
    this.target = target;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.save();
    ctx.font = `${this.radius * 2.2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1;
    ctx.fillText('🔥', this.x - camera.x, this.y - camera.y);
    ctx.restore();
  }
}

// Utility: Find nearest enemy
function findNearestEnemy(player, enemies) {
  let minDist = Infinity;
  let nearest = null;
  for (const e of enemies) {
    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = e;
    }
  }
  return nearest;
}

// Spawn Enemies
function spawnEnemies() {
  const pool = getStageEnemyTypes();
  let burst = Math.random() < 0.1;
  let num = burst ? (8 + Math.floor(Math.random() * 5)) : (2 + Math.floor(Math.random() * 6));
  for (let i = 0; i < num; i++) {
    let edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = 0; y = Math.random() * worldHeight; }
    else if (edge === 1) { x = worldWidth; y = Math.random() * worldHeight; }
    else if (edge === 2) { x = Math.random() * worldWidth; y = 0; }
    else { x = Math.random() * worldWidth; y = worldHeight; }
    let type = (Math.random() < 0.1) ? ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)] : pool[Math.floor(Math.random() * pool.length)];
    enemies.push(new Enemy(x, y, type));
  }
}

// Handle Collisions
function handleCollisions() {
  // Projectiles hit enemies
  for (let i = projectiles.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      const p = projectiles[i];
      const e = enemies[j];
      const dist = Math.hypot(p.x - e.x, p.y - e.y);
      if (dist < p.radius + e.radius) {
        e.hp -= p.dmg;
        // Always push damage number BEFORE death check
        e.damageNumbers.push({ value: p.dmg, time: Date.now(), crit: p.dmg > projectileDamage, burn: false });
        if (p.burn) {
          e.burns = [{ dmg: p.burn, until: Date.now() + 2000 }];
        }
        if (freezeDuration > 0) e.frozen = Date.now() + freezeDuration * 1000;
        if (p.knock) {
          const dx = e.x - player.x;
          const dy = e.y - player.y;
          const dist = Math.hypot(dx, dy);
          e.x += (dx / dist) * p.knock;
          e.y += (dy / dist) * p.knock;
        }
        if (lifesteal) player.hp = Math.min(maxHp, player.hp + p.dmg * lifesteal);
        if (reflectChance && Math.random() < reflectChance) player.hp = Math.min(maxHp, player.hp + 10);
        let killed = false;
        if (e.hp <= 0) {
          // Transfer remaining damage numbers to global array
          e.damageNumbers.forEach(d => {
            floatingDamageNumbers.push({ ...d, x: e.x, y: e.y, created: d.time });
          });
          // Area Damage on death
          if (areaDamageValue > 0) {
            areaExplosions.push({
              x: e.x,
              y: e.y,
              radius: 0,
              maxRadius: areaDamageRadius,
              alpha: 0.7,
              growing: true,
              start: Date.now(),
              damage: areaDamageValue
            });
            // Damage nearby enemies
            for (let k = enemies.length - 1; k >= 0; k--) {
              if (k === j) continue;
              const other = enemies[k];
              const d2 = Math.hypot(other.x - e.x, other.y - e.y);
              if (d2 < areaDamageRadius) {
                other.hp -= areaDamageValue;
                if (other.hp <= 0) {
                  // Transfer remaining damage numbers to global array
                  other.damageNumbers.forEach(d => {
                    floatingDamageNumbers.push({ ...d, x: other.x, y: other.y, created: Date.now() });
                  });
                  // Drop XP orb
                  let xpValue = other.type && other.type.xp ? other.type.xp : 10;
                  pickups.push(new XPOrb(other.x, other.y, xpValue));
                  // Remove enemy
                  enemies.splice(k, 1);
                }
              }
            }
          }
          // Drop XP orb
          let xpValue = e.type && e.type.xp ? e.type.xp : 10;
          pickups.push(new XPOrb(e.x, e.y, xpValue));
          if (e === boss) {
            console.log('Boss defeated and XP orb dropped at', e.x, e.y);
            finalBossActive = false;
            boss = null;
            bossProjectiles.length = 0;
            win = true;
          }
          enemies.splice(j, 1);
          killed = true;
        }
        projectiles.splice(i, 1);
        if (killed) break;
        break;
      }
    }
  }
  // Burn effect
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.burns && e.burns.length > 0) {
      let totalBurn = 0;
      e.burns = e.burns.filter(stack => stack.until > Date.now());
      // Calculate total burn per second from all active stacks
      let currentBurnPerSecond = 0;
      e.burns.forEach(stack => {
        const burnPerFrame = stack.dmg / 60;
        e.hp -= burnPerFrame;
        totalBurn += stack.dmg;
        currentBurnPerSecond += stack.dmg;
      });
      // Show burn damage number once per second (every ~1000ms)
      if (!e.lastBurnNumberTime || Date.now() - e.lastBurnNumberTime > 1000) {
        if (currentBurnPerSecond > 0) {
          e.damageNumbers.push({ value: currentBurnPerSecond, time: Date.now(), crit: false, burn: true });
        }
        e.lastBurnNumberTime = Date.now();
      }
      if (e.hp <= 0) {
        // Transfer remaining damage numbers to global array
        e.damageNumbers.forEach(d => {
          floatingDamageNumbers.push({ ...d, x: e.x, y: e.y, created: Date.now() });
        });
        let xpValue = e.type && e.type.xp ? e.type.xp : 10;
        pickups.push(new XPOrb(e.x, e.y, xpValue));
        if (e === boss) {
          console.log('Boss defeated by burn and XP orb dropped at', e.x, e.y);
          finalBossActive = false;
          boss = null;
          bossProjectiles.length = 0;
          win = true;
        }
        enemies.splice(i, 1);
        continue;
      }
    }
  }
  // Unfreeze enemies after duration
  enemies.forEach(e => {
    if (typeof e.frozen === 'number' && e.frozen > 0) {
      if (Date.now() > e.frozen) e.frozen = false;
    }
  });
  // Enemies hit player
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    if (dist < player.radius + e.radius) {
      if (invincibleTime > Date.now()) continue;
      let dmg = e.type.damage || 10;
      if (shield > 0) {
        let absorb = Math.min(shield, dmg);
        shield -= absorb;
        dmg -= absorb;
      }
      player.hp -= dmg;
      // Show floating damage above player
      floatingPlayerDamageNumbers.push({ value: dmg, time: Date.now() });
      lastHitTime = Date.now();
      if (invincibleDuration > 0) {
        invincibleTime = Date.now() + invincibleDuration * 1000;
      }
      if (e !== boss) {
        // Transfer remaining damage numbers to global array
        e.damageNumbers.forEach(d => {
          floatingDamageNumbers.push({ ...d, x: e.x, y: e.y, created: Date.now() });
        });
        // Bounce enemy away from player
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const bounceDist = player.radius + e.radius - dist + 20; // 8px extra bounce
        const norm = Math.hypot(dx, dy) || 1;
        e.x += (dx / norm) * bounceDist;
        e.y += (dy / norm) * bounceDist;
        // Optionally, slow enemy for a moment (stagger effect)
        e.staggered = Date.now() + 200; // 200ms stagger
      }
      if (player.hp <= 0) {
        gameOver = true;
      }
    }
  }
}

// Game Loop
function update() {
  if (gameOver || upgradePending || win) return;
  // Stage logic
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  // Double the time for each stage: 0, 2, 4, 6, 8, 10 minutes
  let newStage = Math.min(Math.floor(elapsed / 120), 5);
  if (newStage !== stage) stage = newStage;
  // At 10 min (stage 5), clear all enemies and spawn Final Boss
  if (stage === 5 && !finalBossActive && !bossHasSpawned) {
    enemies.length = 0;
    bossProjectiles.length = 0;
    finalBossActive = true;
    boss = new Enemy(worldWidth / 2, worldHeight / 2, ENEMY_TYPES[5]);
    boss.shootCooldown = 60;
    enemies.push(boss);
    bossHasSpawned = true;
  }
  // Win condition: kill Final Boss
  if (finalBossActive && enemies.length === 1 && enemies[0] === boss && boss.hp <= 0) {
    win = true;
    finalBossActive = false;
    enemies.length = 0;
    bossProjectiles.length = 0;
    return;
  }
  player.update();
  enemies.forEach(e => e.update(player));
  // Update camera to follow player, clamp to world (account for scale)
  let scale = 1;
  if (window.innerWidth <= 1600) {
    scale = 0.7;
  }
  camera.x = Math.max(0, Math.min(worldWidth - canvas.width / scale, player.x - (canvas.width / scale) / 2));
  camera.y = Math.max(0, Math.min(worldHeight - canvas.height / scale, player.y - (canvas.height / scale) / 2));
  // Update boss/range projectiles
  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
    const p = bossProjectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    // Collide with player
    if (Math.hypot(player.x - p.x, player.y - p.y) < player.radius + p.radius) {
      let dmg = p.fromBoss ? 30 : 10;
      if (shield > 0) {
        let absorb = Math.min(shield, dmg);
        shield -= absorb;
        dmg -= absorb;
      }
      player.hp -= dmg;
      // Show floating damage above player for projectiles
      floatingPlayerDamageNumbers.push({ value: dmg, time: Date.now() });
      if (invincibleDuration > 0) {
        invincibleTime = Date.now() + invincibleDuration * 1000;
      }
      bossProjectiles.splice(i, 1);
      if (player.hp <= 0) gameOver = true;
      continue;
    }
    // Remove offscreen
    if (p.x < -50 || p.x > worldWidth + 50 || p.y < -50 || p.y > worldHeight + 50) {
      bossProjectiles.splice(i, 1);
    }
  }
  projectiles.forEach(p => p.update());
  handleCollisions();
  // HP Regen
  if (hpRegen > 0 && player.hp > 0 && player.hp < 100) {
    player.hp = Math.min(100, player.hp + hpRegen / 60); // per second
  }
  // Shield Regen
  if (shieldRegen > 0 && shield < maxShield) {
    shield += shieldRegen / 60;
    shield = Math.min(shield, maxShield);
  }
  // Remove offscreen projectiles
  projectiles = projectiles.filter(p => p.x > 0 && p.x < worldWidth && p.y > 0 && p.y < worldHeight);
  // Spawn more enemies over time
  if (!finalBossActive && enemies.length < 5 + Math.floor(elapsed / 30)) {
    spawnEnemies();
  }
  // Level up check
  checkLevelUp();
  // Update XP orbs
  pickups.forEach(orb => orb.update(player));
  pickups = pickups.filter(orb => !orb.collected);
  // Now update boss only if still active
  if (finalBossActive) updateBoss(player);
}

// Load background tile image
const bgTile = new Image();
bgTile.src = 'images/back/tile1.jpg';

function render() {
  // Mobile scaling
  let scale = 1;
  if (window.innerWidth <= 1600) {
    scale = 0.7;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any previous transforms
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  // Draw dark overlay everywhere
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = '#18120a';
  ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
  ctx.restore();

  // Mask for playable area
  ctx.save();
  ctx.beginPath();
  ctx.rect(-camera.x, -camera.y, worldWidth, worldHeight);
  ctx.clip();

  // Draw tiled background, offset by camera
  if (bgTile.complete) {
    const pattern = ctx.createPattern(bgTile, 'repeat');
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalAlpha = 1;
    ctx.translate(-camera.x % bgTile.width, -camera.y % bgTile.height);
    ctx.fillStyle = pattern;
    // Draw tiles at half size for more frequency
    ctx.scale(0.5, 0.5);
    ctx.fillRect((camera.x % bgTile.width) * 2, (camera.y % bgTile.height) * 2, (canvas.width / scale + bgTile.width) * 2, (canvas.height / scale + bgTile.height) * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
  }

  // Draw world border
  ctx.save();
  ctx.strokeStyle = '#070401';
  ctx.lineWidth = 10;
  ctx.strokeRect(-camera.x, -camera.y, worldWidth, worldHeight);
  ctx.restore();

  // Draw environment objects (emojis/images) - as background
  environmentObjects.forEach(obj => {
    if (obj.image) {
      const img = new window.Image();
      img.src = obj.image;
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(
        img,
        obj.x - obj.size / 2 - camera.x,
        obj.y - obj.size / 2 - camera.y,
        obj.size,
        obj.size
      );
      ctx.restore();
    } else if (obj.emoji) {
      ctx.save();
      ctx.font = `${obj.size || 48}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.95;
      ctx.fillText(obj.emoji, obj.x - camera.x, obj.y - camera.y);
      ctx.restore();
    }
    // If image-based, add here later
  });

  // Draw all area explosions
  for (let i = areaExplosions.length - 1; i >= 0; i--) {
    const eff = areaExplosions[i];
    ctx.save();
    ctx.globalAlpha = eff.alpha;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(eff.x - camera.x, eff.y - camera.y, eff.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // Animate
    if (eff.growing) {
      eff.radius += 30;
      eff.alpha *= 0.92;
      if (eff.radius > eff.maxRadius) areaExplosions.splice(i, 1);
    }
  }
  // Draw boss/range projectiles
  bossProjectiles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.font = `${p.radius * 2.2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☄️', p.x - camera.x, p.y - camera.y);
    ctx.restore();
  });
  player.draw(ctx);
  enemies.forEach(e => e.draw(ctx));
  projectiles.forEach(p => p.draw(ctx));
  // Draw XP orbs
  pickups.forEach(orb => orb.draw(ctx));
  if (gameOver) {
    // Game Over overlay styled like pause, but bigger
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#4a0707'; // bloody dark red
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffb347'; // Match #stage color
    ctx.font = "64px 'Cinzel', 'UnifrakturCook', 'Luckiest Guy', 'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
    ctx.textAlign = 'center';
    ctx.textShadow = '2px 2px 0 #000, 0 0 8px #b35c1e';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
  if (win) {
    // Show win image instead of text
    const winImg = new window.Image();
    winImg.src = 'images/win.png';
    // If image is loaded, draw it centered
    if (winImg.complete) {
      const imgWidth = 500;
      const imgHeight = 500;
      ctx.drawImage(winImg, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);
    } else {
      winImg.onload = function() {
        const imgWidth = 500;
        const imgHeight = 500;
        ctx.drawImage(winImg, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);
      };
    }
  }
  // Draw boss debug info
  if (finalBossActive && boss) {
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(boss.x - camera.x, boss.y - camera.y, boss.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', boss.x - camera.x, boss.y - boss.radius - 20 - camera.y);
    ctx.fillText(`HP: ${Math.max(0, Math.round(boss.hp))}`, boss.x - camera.x, boss.y - boss.radius - 2 - camera.y);
    ctx.restore();
  }
  // Draw floating damage numbers for dead enemies
  floatingDamageNumbers = floatingDamageNumbers.filter(d => Date.now() - d.created < 700);
  floatingDamageNumbers.forEach(d => {
    ctx.save();
    ctx.globalAlpha = 1 - (Date.now() - d.created) / 700;
    ctx.fillStyle = d.crit ? '#ffd700' : (d.burn ? 'orange' : 'white');
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(d.value), d.x - camera.x, d.y - 30 - (Date.now() - d.created) / 20 - camera.y);
    ctx.restore();
  });
  // Draw floating damage numbers above player
  floatingPlayerDamageNumbers = floatingPlayerDamageNumbers.filter(d => Date.now() - d.time < 700);
  floatingPlayerDamageNumbers.forEach(d => {
    ctx.save();
    ctx.globalAlpha = 1 - (Date.now() - d.time) / 700;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(d.value), player.x - camera.x, player.y - player.radius - 20 - (Date.now() - d.time) / 20 - camera.y);
    ctx.restore();
  });
  ctx.restore();
}

function gameLoop() {
  if (!paused && !upgradePending) {
    update();
    render();
    updateHUD();
  } else {
    render();
    // Draw paused overlay
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffb347'; // Match #stage color
    ctx.font = "32px 'Cinzel', 'UnifrakturCook', 'Luckiest Guy', 'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(paused ? 'Paused' : 'Level Up!', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
  if (!gameOver) requestAnimationFrame(gameLoop);
}

function updateHUD() {
  // Ensure level matches totalXP
  while (level > 1 && totalXP < totalXPForLevel(level)) {
    level--;
  }
  while (totalXP >= totalXPForLevel(level + 1)) {
    level++;
  }
  healthEl.textContent = `HP: ${Math.floor(player.hp)}`;
  shieldEl.textContent = `Shield: ${Math.floor(shield)}/${maxShield} (+${shieldRegen}/sec)`;
  xpEl.textContent = `XP: ${totalXP}`;
  // XP Bar update
  const xpBar = document.getElementById('xpBar');
  const xpBarToNext = document.getElementById('xpBarToNext');
  const xpBarCurrent = document.getElementById('xpBarCurrent');
  const xpBarLevel = document.getElementById('xpBarLevel');
  let xpCurrentLevel = totalXPForLevel(level);
  let xpNextLevel = totalXPForLevel(level + 1);
  let xpThisLevel = totalXP - xpCurrentLevel;
  let xpNeeded = xpNextLevel - xpCurrentLevel;
  let fill = Math.max(0, Math.min(1, xpThisLevel / xpNeeded));
  xpBar.style.setProperty('--xp-bar-fill', (fill * 100) + '%');
  xpBarToNext.textContent = `${xpNeeded} XP`;
  xpBarCurrent.textContent = `${xpThisLevel} XP`;
  xpBarLevel.textContent = `Lv ${level}`;
  let elapsed, min, sec;
  if (win) {
    // Freeze timer at win time
    if (typeof window.winTime === 'undefined') {
      window.winTime = Math.floor((Date.now() - startTime) / 1000);
    }
    elapsed = window.winTime;
  } else {
    elapsed = Math.floor((Date.now() - startTime) / 1000);
    window.winTime = undefined;
  }
  min = Math.floor(elapsed / 60);
  sec = elapsed % 60;
  timerEl.textContent = `Time: ${min}:${sec.toString().padStart(2, '0')}`;
  const stageEl = document.getElementById('stage');
  stageEl.textContent = `Stage: ${stage + 1}`;
  // Upgrade stats
  statDamage.textContent = `Projectile Damage: ${projectileDamage}`;
  statAreaRadius.textContent = `Area Radius: ${areaDamageRadius}`;
  statAreaDamage.textContent = `Area Damage: ${areaDamageValue}`;
  // Burn effect from upgrades (always 5/sec for 5s)
  statBurn.textContent = `Burn: ${burnDamage}/sec for ${burnDuration}s`;
  statFreeze.textContent = `Freeze Duration: ${freezeDuration}s`;
  statProjectiles.textContent = `Projectiles: ${1 + additionalProjectiles}`;
  statAttackSpeed.textContent = `Attack Speed: ${(1000/attackInterval).toFixed(2)} shots/sec`;
  statRegen.textContent = `HP Regen: ${hpRegen.toFixed(2)}/sec`;
  statKnockback.textContent = `Knockback: ${knockback}`;
  statInvincible.textContent = `Invincible: ${invincibleTime > Date.now() ? ((invincibleTime-Date.now())/1000).toFixed(1) : 0}s (${invincibleDuration}s/hit)`;
  statProjectileSize.textContent = `Projectile Size: ${projectileRadius}`;
  statMoveSpeed.textContent = `Move Speed: ${player.speed.toFixed(2)}`;
  statCrit.textContent = `Crit Chance: ${(critChance*100).toFixed(1)}%`;
  statReflect.textContent = `Reflect: ${(reflectChance*100).toFixed(1)}%`;
  statLifesteal.textContent = `Lifesteal: ${(lifesteal*100).toFixed(1)}%`;
  // Update right HUD with chosen upgrades and levels
  const upgradeList = document.getElementById('upgradeList');
  if (Object.keys(upgradeLevels).length === 0) {
    upgradeList.style.display = 'none';
  } else {
    let html = '<h3>Upgrades</h3><ul>';
    Object.entries(upgradeLevels).forEach(([name, level]) => {
      const upg = upgrades.find(u => u.name === name);
      if (upg) {
        html += `<li class='upgrade-li'>
          <span class='icon'>
            <img src='${upg.icon}' alt='' width='28' height='28' style='vertical-align:middle;' />
            <span class='upgrade-tooltip'>
              <strong>${upg.name}</strong><br />
              <span>${upg.desc}</span>
            </span>
          </span>
          <span class='level'>x${level}</span>
        </li>`;
      }
    });
    html += '</ul>';
    upgradeList.innerHTML = html;
    upgradeList.style.display = '';
  }
}

// Auto-attack Mechanic
let autoAttackTimer = setInterval(autoAttack, attackInterval);
function autoAttack() {
  if (gameOver || upgradePending) return;
  let targets = [...enemies];
  let fired = 0;
  let maxShots = 1 + additionalProjectiles;
  let used = new Set();
  while (fired < maxShots && targets.length > 0) {
    let nearest = findNearestEnemy(player, targets);
    if (!nearest) break;
    used.add(nearest);
    let crit = Math.random() < critChance;
    let dmg = projectileDamage * (crit ? 2 : 1);
    let burn = burnDamage;
    let knock = knockback;
    projectiles.push(new Projectile(player.x, player.y, nearest, dmg, burn, knock));
    targets = targets.filter(e => !used.has(e));
    fired++;
  }
}
function updateAutoAttackInterval() {
  clearInterval(autoAttackTimer);
  autoAttackTimer = setInterval(autoAttack, attackInterval);
}

// Setup
function init() {
  resizeCanvas();
  player = new Player(worldWidth / 2, worldHeight / 2);
  spawnEnemies();
}

function showUpgradeModal() {
  upgradePending = true;
  // Pick 3 random upgrades
  const choices = [];
  while (choices.length < 3) {
    const pick = upgrades[Math.floor(Math.random() * upgrades.length)];
    if (!choices.includes(pick)) choices.push(pick);
  }
  let html = `<div class="upgrade-box">
    <h2>Level Up! (Level ${level + 1})</h2>
    <p>Choose an Upgrade:</p>
    <div class="upgrade-options">`;
  choices.forEach((upg, i) => {
    html += `<button class="upgrade-btn" onmouseover="this.classList.add('hover')" onmouseout="this.classList.remove('hover')" onclick="window.selectUpgrade(${upgrades.indexOf(upg)})">
      <span class="upgrade-icon"><img src='${upg.icon}' alt='' width='48' height='48' style='display:block;margin:0 auto;'/></span><br><strong>${upg.name}</strong><br><span>${upg.desc}</span>
    </button>`;
  });
  html += '</div></div>';
  upgradeModal.innerHTML = html;
  upgradeModal.style.display = 'flex';
}

window.selectUpgrade = function(idx) {
  const upg = upgrades[idx];
  // Track upgrade level
  upgradeLevels[upg.name] = (upgradeLevels[upg.name] || 0) + 1;
  if (upg.effect === 'increaseDamage') projectileDamage += upg.value;
  if (upg.effect === 'increaseSpeed') player.speed += upg.value;
  if (upg.effect === 'regen') hpRegen += upg.value;
  if (upg.effect === 'maxHp') { maxHp += upg.value; player.hp += upg.value; }
  if (upg.effect === 'attackSpeed') attackInterval = Math.max(300, attackInterval + upg.value);
  if (upg.effect === 'projectileSize') projectileRadius += upg.value;
  if (upg.effect === 'areaDamage') { areaDamageValue += upg.value; areaDamageRadius += 30; }
  if (upg.effect === 'invincible') invincibleDuration += upg.value;
  if (upg.effect === 'addProjectile') additionalProjectiles += upg.value;
  if (upg.effect === 'magnet') magnetRange += upg.value;
  if (upg.effect === 'freeze') freezeDuration += upg.value;
  if (upg.effect === 'lifesteal') lifesteal += upg.value;
  if (upg.effect === 'reflect') reflectChance += upg.value;
  if (upg.effect === 'burn') {
    if (upg.value) burnDamage += upg.value;
    if (upg.duration) burnDuration += upg.duration;
  }
  if (upg.effect === 'crit') critChance += upg.value;
  if (upg.effect === 'knockback') knockback += upg.value;
  if (upg.effect === 'shield') {
    maxShield += 10;
    shieldRegen += 1;
    shield = Math.min(shield + 10, maxShield);
  }
  level++;
  upgradeModal.style.display = 'none';
  upgradePending = false;
  updateAutoAttackInterval();
};

// Responsive canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    paused = !paused;
    // Show or hide stats HUD when paused
    const hud = document.getElementById('hud');
    if (paused) {
      hud.style.display = '';
    } else {
      hud.style.display = 'none';
    }
  }
});
window.addEventListener("keyup", e => keys[e.code] = false);

// On load, hide HUD by default
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('hud').style.display = 'none';
});

function getStageEnemyTypes() {
  if (finalBossActive) return [ENEMY_TYPES[5]]; // Only Final Boss
  if (stage === 0) return [ENEMY_TYPES[0], ENEMY_TYPES[1]]; // Basic, Fast
  if (stage === 1) return [ENEMY_TYPES[0], ENEMY_TYPES[1], ENEMY_TYPES[2]]; // Basic, Fast, Tank
  if (stage === 2) return [ENEMY_TYPES[0], ENEMY_TYPES[2], ENEMY_TYPES[3]]; // Basic, Tank, Burning
  if (stage === 3) return [ENEMY_TYPES[0], ENEMY_TYPES[2], ENEMY_TYPES[4]]; // Basic, Tank, Range
  if (stage === 4) return [ENEMY_TYPES[1], ENEMY_TYPES[2], ENEMY_TYPES[3], ENEMY_TYPES[4]]; // Fast, Tank, Burning, Range
  return [ENEMY_TYPES[0], ENEMY_TYPES[1]];
}

function updateBoss(player) {
  if (!boss) return;
  boss.shootCooldown--;
  if (boss.shootCooldown <= 0) {
    // Shoot big projectile at player
    bossProjectiles.push({
      x: boss.x, y: boss.y,
      vx: (player.x - boss.x) / Math.hypot(player.x - boss.x, player.y - boss.y) * 6,
      vy: (player.y - boss.y) / Math.hypot(player.x - boss.x, player.y - boss.y) * 6,
      radius: 16, color: 'purple', fromBoss: true
    });
    boss.shootCooldown = 60;
  }
  // Summon minions every 3s
  if (!boss.minionTimer) boss.minionTimer = 180;
  boss.minionTimer--;
  if (boss.minionTimer <= 0) {
    for (let i = 0; i < 3; i++) {
      let angle = Math.random() * Math.PI * 2;
      let dist = boss.radius + 40 + Math.random() * 40;
      let x = boss.x + Math.cos(angle) * dist;
      let y = boss.y + Math.sin(angle) * dist;
      enemies.push(new Enemy(x, y, ENEMY_TYPES[0]));
    }
    boss.minionTimer = 180;
  }
}

// Start menu logic
const startMenu = document.getElementById('startMenu');
const startGameBtn = document.getElementById('startGameBtn');
let gameStarted = false;

function showStartMenu() {
  startMenu.style.display = 'flex';
  gameStarted = false;
}
function hideStartMenu() {
  startMenu.style.display = 'none';
  gameStarted = true;
  gameLoop(); // Start the game loop only once
}
startGameBtn.addEventListener('click', () => {
  hideStartMenu();
});

showStartMenu();

init();

// Level up logic: check in update() or wherever XP is gained
function checkLevelUp() {
  while (totalXP >= totalXPForLevel(level + 1)) {
    level++;
    // Optionally: trigger level up effects, show upgrade modal, etc.
    showUpgradeModal();
    updateHUD();
  }
}