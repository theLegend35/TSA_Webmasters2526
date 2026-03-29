import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './GamePage.css';

// ── Constants ────────────────────────────────────────────────────────────────
const TILE = 40;
const COLS = 19;
const ROWS = 14;
const WIDTH = TILE * COLS;
const HEIGHT = TILE * ROWS;
const PLAYER_SPEED = 3;
const ENEMY_SPEED = 1.4;
const ENEMY_CHANGE_INTERVAL = 90; // frames
const INVINCIBLE_FRAMES = 90;
const TOTAL_GEMS = 8;

// ── Map: 0=floor, 1=wall, 2=gem ─────────────────────────────────────────────
const MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,2,1],
  [1,0,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,1,0,1,0,0,2,2,0,0,1,0,1,0,0,1],
  [1,1,0,0,1,0,1,0,0,0,0,0,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
  [1,1,0,0,1,0,1,0,0,2,2,0,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1],
  [1,2,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface Vec2 { x: number; y: number }
interface Enemy { pos: Vec2; dir: Vec2; timer: number; id: number }

function isWall(mapData: number[][], px: number, py: number): boolean {
  const col = Math.floor(px / TILE);
  const row = Math.floor(py / TILE);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
  return mapData[row][col] === 1;
}

function rectBlocked(mapData: number[][], x: number, y: number, size: number): boolean {
  const half = size / 2;
  return (
    isWall(mapData, x - half + 1, y - half + 1) ||
    isWall(mapData, x + half - 1, y - half + 1) ||
    isWall(mapData, x - half + 1, y + half - 1) ||
    isWall(mapData, x + half - 1, y + half - 1)
  );
}

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomFloorTile(mapData: number[][]): Vec2 {
  let col: number, row: number;
  do {
    col = Math.floor(Math.random() * (COLS - 2)) + 1;
    row = Math.floor(Math.random() * (ROWS - 2)) + 1;
  } while (mapData[row][col] !== 0);
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

function cloneMap(src: number[][]): number[][] {
  return src.map(row => [...row]);
}

const GamePage: React.FC = () => {
  const { theme } = useAuth();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    map: number[][];
    player: Vec2;
    playerDir: Vec2;
    health: number;
    score: number;
    gemsLeft: number;
    enemies: Enemy[];
    keys: Record<string, boolean>;
    frame: number;
    invincible: number;
    animFrame: number;
    phase: 'playing' | 'won' | 'lost';
  } | null>(null);

  const [uiHealth, setUiHealth] = useState(3);
  const [uiScore, setUiScore] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost'>('playing');

  const initGame = useCallback(() => {
    const mapData = cloneMap(MAP);
    const playerStart: Vec2 = { x: TILE * 9 + TILE / 2, y: TILE * 6 + TILE / 2 };
    const enemies: Enemy[] = [
      { pos: randomFloorTile(mapData), dir: { x: 1, y: 0 }, timer: 0, id: 1 },
      { pos: randomFloorTile(mapData), dir: { x: 0, y: 1 }, timer: 0, id: 2 },
      { pos: randomFloorTile(mapData), dir: { x: -1, y: 0 }, timer: 0, id: 3 },
    ];
    // make sure enemies don't start on top of player
    enemies.forEach(e => {
      while (dist(e.pos, playerStart) < TILE * 4) {
        e.pos = randomFloorTile(mapData);
      }
    });
    gameRef.current = {
      map: mapData,
      player: { ...playerStart },
      playerDir: { x: 0, y: 1 },
      health: 3,
      score: 0,
      gemsLeft: TOTAL_GEMS,
      enemies,
      keys: {},
      frame: 0,
      invincible: 0,
      animFrame: 0,
      phase: 'playing',
    };
    setUiHealth(3);
    setUiScore(0);
    setPhase('playing');
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    const onKey = (e: KeyboardEvent, down: boolean) => {
      gameRef.current && (gameRef.current.keys[e.key] = down);
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => onKey(e, true);
    const onKeyUp   = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ── Palette ──────────────────────────────────────────────────────────────
    const PALETTE = {
      floor: isDark ? '#1a2e0f' : '#2d4a1e',
      floorAlt: isDark ? '#162809' : '#274318',
      wall: isDark ? '#0d1a08' : '#14280a',
      wallTop: isDark ? '#1e3611' : '#2a4a15',
      player: '#5eead4',
      playerDark: '#0f766e',
      sword: '#fbbf24',
      gem: '#60a5fa',
      gemGlow: '#93c5fd',
      enemy: '#f87171',
      enemyDark: '#b91c1c',
      bg: isDark ? '#0a1507' : '#1a2e0f',
    };

    // ── Draw helpers ─────────────────────────────────────────────────────────
    function drawTile(c: number, r: number, color: string) {
      ctx.fillStyle = color;
      ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
    }

    function drawMap(mapData: number[][], frame: number) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = mapData[r][c];
          if (cell === 1) {
            // Wall with 3D top illusion
            ctx.fillStyle = PALETTE.wall;
            ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
            ctx.fillStyle = PALETTE.wallTop;
            ctx.fillRect(c * TILE, r * TILE, TILE, 6);
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            ctx.fillRect(c * TILE, r * TILE, 3, TILE);
          } else {
            // Checkerboard floor pattern
            const alt = (c + r) % 2 === 0;
            drawTile(c, r, alt ? PALETTE.floor : PALETTE.floorAlt);

            if (cell === 2) {
              // Animated gem
              const pulse = Math.sin(frame * 0.08 + c + r) * 3;
              const gx = c * TILE + TILE / 2;
              const gy = r * TILE + TILE / 2;
              const gSize = 10 + pulse;

              // Glow
              const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, gSize + 8);
              grd.addColorStop(0, 'rgba(147,197,253,0.6)');
              grd.addColorStop(1, 'rgba(147,197,253,0)');
              ctx.fillStyle = grd;
              ctx.beginPath();
              ctx.arc(gx, gy, gSize + 8, 0, Math.PI * 2);
              ctx.fill();

              // Gem body (diamond shape)
              ctx.save();
              ctx.translate(gx, gy);
              ctx.rotate(Math.PI / 4 + frame * 0.02);
              ctx.fillStyle = PALETTE.gem;
              ctx.fillRect(-gSize / 2, -gSize / 2, gSize, gSize);
              ctx.strokeStyle = PALETTE.gemGlow;
              ctx.lineWidth = 2;
              ctx.strokeRect(-gSize / 2, -gSize / 2, gSize, gSize);
              ctx.restore();
            }
          }
        }
      }
    }

    function drawPlayer(pos: Vec2, dir: Vec2, frame: number, invincible: number) {
      const { x, y } = pos;
      const flicker = invincible > 0 && Math.floor(invincible / 6) % 2 === 0;
      if (flicker) return;

      const bob = Math.sin(frame * 0.2) * 1.5;
      ctx.save();
      ctx.translate(x, y + bob);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = PALETTE.player;
      ctx.beginPath();
      ctx.roundRect(-9, -12, 18, 20, 4);
      ctx.fill();

      // Tunic shading
      ctx.fillStyle = PALETTE.playerDark;
      ctx.beginPath();
      ctx.roundRect(-9, 2, 18, 6, [0, 0, 4, 4]);
      ctx.fill();

      // Head
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(0, -16, 9, 0, Math.PI * 2);
      ctx.fill();

      // Hat (triangle)
      ctx.fillStyle = PALETTE.player;
      ctx.beginPath();
      ctx.moveTo(-10, -16);
      ctx.lineTo(10, -16);
      ctx.lineTo(0, -30);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1e293b';
      const eyeOffsetX = dir.x !== 0 ? dir.x * 3 : 0;
      ctx.beginPath();
      ctx.arc(-3 + eyeOffsetX, -16, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3 + eyeOffsetX, -16, 2, 0, Math.PI * 2);
      ctx.fill();

      // Sword (small line in movement direction)
      const sAngle = Math.atan2(dir.y, dir.x);
      ctx.save();
      ctx.rotate(sAngle);
      ctx.strokeStyle = PALETTE.sword;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();
      // crossguard
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, -4);
      ctx.lineTo(10, 4);
      ctx.stroke();
      ctx.restore();
    }

    function drawEnemy(e: Enemy, frame: number) {
      const { x, y } = e.pos;
      ctx.save();
      ctx.translate(x, y);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (slime/skeleton shape)
      const bob = Math.sin(frame * 0.12 + e.id) * 2;
      ctx.translate(0, bob);
      ctx.fillStyle = PALETTE.enemy;
      ctx.beginPath();
      ctx.arc(0, -8, 12, 0, Math.PI * 2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(-4, -10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, -10, 3, 0, Math.PI * 2);
      ctx.fill();

      // Angry brows
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, -15);
      ctx.lineTo(-2, -13);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, -15);
      ctx.lineTo(2, -13);
      ctx.stroke();

      // Mouth
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(4, -4);
      ctx.stroke();

      ctx.restore();
    }

    // ── Game loop ─────────────────────────────────────────────────────────────
    let rafId: number;
    const ENEMY_DIRS: Vec2[] = [{ x:1,y:0},{ x:-1,y:0},{ x:0,y:1},{ x:0,y:-1}];

    function tick() {
      const g = gameRef.current;
      if (!g) { rafId = requestAnimationFrame(tick); return; }

      if (g.phase !== 'playing') {
        drawGameOver(g.phase, g.score);
        rafId = requestAnimationFrame(tick);
        return;
      }

      g.frame++;

      // ── Input ──────────────────────────────────────────────────────────────
      const { keys } = g;
      let dx = 0, dy = 0;
      if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx = -1;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) dx =  1;
      if (keys['ArrowUp']    || keys['w'] || keys['W']) dy = -1;
      if (keys['ArrowDown']  || keys['s'] || keys['S']) dy =  1;

      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

      if (dx !== 0 || dy !== 0) {
        g.playerDir = { x: dx, y: dy };
        const nx = g.player.x + dx * PLAYER_SPEED;
        const ny = g.player.y + dy * PLAYER_SPEED;
        if (!rectBlocked(g.map, nx, g.player.y, 24)) g.player.x = nx;
        if (!rectBlocked(g.map, g.player.x, ny, 24)) g.player.y = ny;
      }

      // ── Gem collection ─────────────────────────────────────────────────────
      const pc = Math.floor(g.player.x / TILE);
      const pr = Math.floor(g.player.y / TILE);
      if (
        pr >= 0 && pr < ROWS && pc >= 0 && pc < COLS &&
        g.map[pr][pc] === 2
      ) {
        g.map[pr][pc] = 0;
        g.score += 100;
        g.gemsLeft--;
        setUiScore(g.score);
        if (g.gemsLeft <= 0) {
          g.phase = 'won';
          setPhase('won');
        }
      }

      // ── Enemy AI ───────────────────────────────────────────────────────────
      for (const e of g.enemies) {
        e.timer++;
        if (e.timer >= ENEMY_CHANGE_INTERVAL) {
          e.timer = 0;
          // Randomly choose new direction; bias towards player
          const toPlayer = {
            x: g.player.x - e.pos.x,
            y: g.player.y - e.pos.y,
          };
          const d = Math.hypot(toPlayer.x, toPlayer.y) || 1;
          if (Math.random() < 0.6) {
            // Chase player
            e.dir = {
              x: Math.abs(toPlayer.x / d) > 0.5 ? Math.sign(toPlayer.x) : 0,
              y: Math.abs(toPlayer.y / d) > 0.5 ? Math.sign(toPlayer.y) : 0,
            };
            if (e.dir.x === 0 && e.dir.y === 0) e.dir = { x: 1, y: 0 };
          } else {
            e.dir = ENEMY_DIRS[Math.floor(Math.random() * ENEMY_DIRS.length)];
          }
        }

        const ex = e.pos.x + e.dir.x * ENEMY_SPEED;
        const ey = e.pos.y + e.dir.y * ENEMY_SPEED;
        if (!rectBlocked(g.map, ex, e.pos.y, 20)) e.pos.x = ex;
        else e.dir.x *= -1;
        if (!rectBlocked(g.map, e.pos.x, ey, 20)) e.pos.y = ey;
        else e.dir.y *= -1;

        // ── Collision with player ─────────────────────────────────────────
        if (g.invincible === 0 && dist(e.pos, g.player) < 28) {
          g.health--;
          g.invincible = INVINCIBLE_FRAMES;
          setUiHealth(g.health);
          if (g.health <= 0) {
            g.phase = 'lost';
            setPhase('lost');
          }
        }
      }

      if (g.invincible > 0) g.invincible--;

      // ── Render ─────────────────────────────────────────────────────────────
      ctx.fillStyle = PALETTE.bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawMap(g.map, g.frame);
      g.enemies.forEach(e => drawEnemy(e, g.frame));
      drawPlayer(g.player, g.playerDir, g.frame, g.invincible);

      rafId = requestAnimationFrame(tick);
    }

    function drawGameOver(result: 'won' | 'lost', score: number) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.textAlign = 'center';
      if (result === 'won') {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 48px "Sora", sans-serif';
        ctx.fillText('⭐ Quest Complete!', WIDTH / 2, HEIGHT / 2 - 40);
        ctx.fillStyle = '#a3e635';
        ctx.font = '24px "Sora", sans-serif';
        ctx.fillText(`All gems collected! Score: ${score}`, WIDTH / 2, HEIGHT / 2 + 10);
      } else {
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 48px "Sora", sans-serif';
        ctx.fillText('💀 Game Over', WIDTH / 2, HEIGHT / 2 - 40);
        ctx.fillStyle = '#d1d5db';
        ctx.font = '24px "Sora", sans-serif';
        ctx.fillText(`Score: ${score}`, WIDTH / 2, HEIGHT / 2 + 10);
      }

      ctx.fillStyle = '#60a5fa';
      ctx.font = '18px "Sora", sans-serif';
      ctx.fillText('Press R to restart', WIDTH / 2, HEIGHT / 2 + 56);
    }

    const handleRestart = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        initGame();
      }
    };
    window.addEventListener('keydown', handleRestart);

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', handleRestart);
    };
  }, [isDark, initGame]);

  return (
    <div className={`game-page${isDark ? ' game-page--dark' : ''}`}>
      <div className="game-page__header">
        <span className="game-page__badge">Mini-Game</span>
        <h1 className="game-page__title">Adventure Quest</h1>
        <p className="game-page__sub">
          Collect all 8 gems while avoiding the slimes. Use arrow keys or WASD to move.
        </p>
      </div>

      <div className="game-page__arena">
        {/* HUD */}
        <div className="game-hud">
          <div className="game-hud__hearts">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`game-hud__heart${i < uiHealth ? ' game-hud__heart--full' : ' game-hud__heart--empty'}`}>
                {i < uiHealth ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <div className="game-hud__score">
            <span className="game-hud__score-label">SCORE</span>
            <span className="game-hud__score-value">{uiScore}</span>
          </div>
          <div className="game-hud__gems">
            <span className="game-hud__gems-label">GEMS</span>
            <span className="game-hud__gems-value">
              {TOTAL_GEMS - (gameRef.current?.gemsLeft ?? TOTAL_GEMS)}/{TOTAL_GEMS}
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="game-page__canvas"
          aria-label="Adventure Quest game canvas"
        />

        {/* Overlay for won/lost */}
        {phase !== 'playing' && (
          <div className="game-page__overlay">
            {phase === 'won' ? (
              <>
                <div className="game-page__overlay-icon">⭐</div>
                <h2 className="game-page__overlay-title">Quest Complete!</h2>
                <p className="game-page__overlay-sub">All gems collected!</p>
              </>
            ) : (
              <>
                <div className="game-page__overlay-icon">💀</div>
                <h2 className="game-page__overlay-title">Game Over</h2>
                <p className="game-page__overlay-sub">The slimes got you!</p>
              </>
            )}
            <p className="game-page__overlay-score">Score: {uiScore}</p>
            <button
              className="game-page__restart-btn"
              onClick={initGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="game-page__controls">
        <div className="game-page__key-group">
          <div className="game-page__key-row">
            <kbd className="game-page__key">W</kbd>
          </div>
          <div className="game-page__key-row">
            <kbd className="game-page__key">A</kbd>
            <kbd className="game-page__key">S</kbd>
            <kbd className="game-page__key">D</kbd>
          </div>
        </div>
        <span className="game-page__or">or</span>
        <div className="game-page__key-group">
          <div className="game-page__key-row">
            <kbd className="game-page__key">↑</kbd>
          </div>
          <div className="game-page__key-row">
            <kbd className="game-page__key">←</kbd>
            <kbd className="game-page__key">↓</kbd>
            <kbd className="game-page__key">→</kbd>
          </div>
        </div>
        <span className="game-page__ctrl-hint">Move &amp; collect gems · Avoid slimes · Press <kbd className="game-page__key game-page__key--sm">R</kbd> to restart</span>
      </div>
    </div>
  );
};

export default GamePage;
