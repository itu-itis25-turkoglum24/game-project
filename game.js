// ============================================
// KIRILGAN GEÇİT - Game Engine v4.0
// Menu System + High Score + Power-ups
// ============================================

class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Screens
        this.screens = {
            welcome: document.getElementById('welcomeScreen'),
            menu: document.getElementById('menuScreen'),
            leaderboard: document.getElementById('leaderboardScreen'),
            settings: document.getElementById('settingsScreen'),
            market: document.getElementById('marketScreen'),
            game: document.getElementById('gameScreen'),
            pause: document.getElementById('pauseScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            newHighScore: document.getElementById('newHighScoreScreen')
        };

        // UI Elements
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.scoreDisplay = document.querySelector('.score-display');
        this.powerUpDisplay = document.getElementById('powerUpDisplay');
        this.powerUpIcon = document.getElementById('powerUpIcon');
        this.powerUpProgress = document.getElementById('powerUpProgress');
        this.hsNotification = document.getElementById('hsNotification');
        this.hsNotificationText = document.getElementById('hsNotificationText');

        // Player Data (localStorage)
        this.playerName = '';
        this.highScore = 0;
        this.soundEnabled = true;
        this.leaderboard = [];
        this.supabaseReady = false; // Will be set to true if Supabase initializes successfully

        // Token System
        this.tokens = 0;
        this.continueCount = 0;

        // Owned Items
        this.ownedFrameColors = ['default'];
        this.ownedShapeColors = ['default'];
        this.ownedPatterns = ['solid'];
        this.powerUpInventory = { shield: 0, golden: 0, expand: 0, shrink: 0, slowmo: 0, frameChange: 0 };

        // Active Customizations
        this.activeFrameColor = 'default';
        this.activeShapeColor = 'default';
        this.activePattern = 'solid';

        // Market Items Configuration
        this.marketItems = {
            frameColors: [
                { id: 'default', name: 'Varsayılan', color: 'rgba(150, 200, 255, 0.25)', borderColor: 'rgba(200, 230, 255, 0.5)', price: 0 },
                { id: 'neon-cyan', name: 'Neon Mavi', color: 'rgba(0, 212, 255, 0.35)', borderColor: 'rgba(0, 212, 255, 0.7)', price: 100 },
                { id: 'neon-purple', name: 'Neon Mor', color: 'rgba(168, 85, 247, 0.35)', borderColor: 'rgba(168, 85, 247, 0.7)', price: 100 },
                { id: 'neon-pink', name: 'Neon Pembe', color: 'rgba(236, 72, 153, 0.35)', borderColor: 'rgba(236, 72, 153, 0.7)', price: 100 },
                { id: 'golden', name: 'Altın', color: 'rgba(255, 215, 0, 0.35)', borderColor: 'rgba(255, 215, 0, 0.7)', price: 200 },
                { id: 'emerald', name: 'Zümrüt', color: 'rgba(34, 197, 94, 0.35)', borderColor: 'rgba(34, 197, 94, 0.7)', price: 200 }
            ],
            shapeColors: [
                { id: 'default', name: 'Varsayılan', colors: null, price: 0 },
                { id: 'neon', name: 'Neon', colors: { circle: '#00ffff', square: '#ff00ff', star: '#ffff00' }, price: 100 },
                { id: 'pastel', name: 'Pastel', colors: { circle: '#a8e6cf', square: '#dda0dd', star: '#ffd3b6' }, price: 150 },
                { id: 'fire', name: 'Ateş', colors: { circle: '#ff4500', square: '#ff6347', star: '#ffa500' }, price: 180 },
                { id: 'ice', name: 'Buz', colors: { circle: '#87ceeb', square: '#b0e0e6', star: '#e0ffff' }, price: 180 }
            ],
            patterns: [
                { id: 'solid', name: 'Düz', price: 0 },
                { id: 'striped', name: 'Çizgili', price: 100 },
                { id: 'dotted', name: 'Noktalı', price: 80 },
                { id: 'gradient', name: 'Gradyan', price: 120 }
            ],
            powerUps: [
                { id: 'slowmo', name: 'Ağır Çekim', icon: '🐌', price: 35, key: '1' },
                { id: 'shrink', name: 'Küçült', icon: '⬇️', price: 25, key: '2' },
                { id: 'frameChange', name: 'Çerçeve Değiştir', icon: '🔄', price: 20, key: '3' },
                { id: 'shield', name: 'Kalkan', icon: '🛡️', price: 30, key: '4' },
                { id: 'golden', name: 'Altın Mod', icon: '✨', price: 40, key: '5' },
                { id: 'expand', name: 'Büyüt', icon: '⬆️', price: 25, key: '6' }
            ]
        };

        this.loadPlayerData();

        // Game State
        this.score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        this.hsNotified80 = false;
        this.hsNotifiedBeat = false;

        // Game Objects
        this.frame = null;
        this.fallingShapes = [];
        this.shapeSpawnTimer = 0;
        this.spawnInterval = 120;
        this.successEffects = [];
        this.particles = [];

        // Frame overflow and transition
        this.frameOverflow = 180;
        this.nextFrameChangeTime = 0;
        this.frameChangeMinTime = 12000;
        this.frameChangeMaxTime = 30000;
        this.frameTransitioning = false;
        this.frameInvincible = false;
        this.frameDashPhase = 0;
        this.transitionProgress = 0;
        this.pendingConfig = null;

        // Background stars
        this.stars = [];

        // Input
        this.isDragging = false;
        this.lastX = 0;

        // Shape types
        this.shapeTypes = ['circle', 'square', 'star'];
        this.shapeColors = {
            circle: { fill: '#00d4ff', stroke: '#0099cc', glow: '#00d4ff' },
            square: { fill: '#a855f7', stroke: '#7c3aed', glow: '#a855f7' },
            star: { fill: '#ec4899', stroke: '#be185d', glow: '#ec4899' }
        };
        this.goldenColor = { fill: '#ffd700', stroke: '#ffaa00', glow: '#ffd700' };

        // Power-up types (added slow-mo)
        this.powerUpTypes = [
            { type: 'shield', icon: '🛡️', duration: 5000, color: '#00ffff', name: 'Kalkan' },
            { type: 'golden', icon: '✨', duration: 5000, color: '#ffd700', name: 'Altın Mod' },
            { type: 'expand', icon: '⬆️', duration: 5000, color: '#22c55e', name: 'Büyük Çerçeve' },
            { type: 'shrink', icon: '⬇️', duration: 5000, color: '#ef4444', name: 'Küçük Çerçeve' },
            { type: 'slowmo', icon: '🐌', duration: 5000, color: '#a855f7', name: 'Ağır Çekim' },
            { type: 'triple', icon: '🎯', duration: 0, color: '#a855f7', name: 'Üçlü Şekil' }
        ];

        // Active power-up
        this.activePowerUp = null;
        this.powerUpEndTime = 0;

        // Frame configurations
        this.frameConfigs = [
            { holes: ['circle', 'square', 'star'] },
            { holes: ['circle'] },
            { holes: ['square'] },
            { holes: ['star'] },
            { holes: ['circle', 'circle'] },
            { holes: ['square', 'square'] },
            { holes: ['star', 'star'] },
            { holes: ['circle', 'star'] },
            { holes: ['square', 'circle'] },
            { holes: ['star', 'square'] },
            { holes: ['circle', 'circle', 'star'] },
            { holes: ['square', 'star', 'star'] },
        ];

        this.baseFrameWidth = 320;
        this.frameGlowIntensity = 0;

        // Audio
        this.audioContext = null;
        this.initAudio();

        this.init();
    }

    // ============================================
    // DATA PERSISTENCE - SUPABASE + LOCALSTORAGE
    // ============================================

    // Get storage key prefix for current player
    getStorageKey(key) {
        return this.playerName ? `player_${this.playerName}_${key}` : key;
    }

    // Initialize Supabase connection
    initDatabase() {
        if (window.SupabaseDB) {
            this.supabaseReady = window.SupabaseDB.init();
        } else {
            this.supabaseReady = false;
        }
        console.log('Database ready:', this.supabaseReady ? 'Supabase' : 'localStorage only');
    }

    loadPlayerData() {
        // Load local settings immediately (sync)
        this.playerName = localStorage.getItem('lastPlayerName') || '';
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.sensitivity = parseFloat(localStorage.getItem('sensitivity')) || 1.0;

        // Load local leaderboard as cache
        try {
            this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        } catch {
            this.leaderboard = [];
        }

        // If we have a player name, load their specific data from localStorage first
        if (this.playerName) {
            this.loadPlayerSpecificDataFromLocal();
        }
    }

    // Load data from localStorage (sync, used as cache)
    loadPlayerSpecificDataFromLocal() {
        this.highScore = parseInt(localStorage.getItem(this.getStorageKey('highScore'))) || 0;
        this.tokens = parseInt(localStorage.getItem(this.getStorageKey('tokens'))) || 0;

        try {
            this.ownedFrameColors = JSON.parse(localStorage.getItem(this.getStorageKey('ownedFrameColors'))) || ['default'];
            this.ownedShapeColors = JSON.parse(localStorage.getItem(this.getStorageKey('ownedShapeColors'))) || ['default'];
            this.ownedPatterns = JSON.parse(localStorage.getItem(this.getStorageKey('ownedPatterns'))) || ['solid'];
            this.powerUpInventory = JSON.parse(localStorage.getItem(this.getStorageKey('powerUpInventory'))) || { shield: 0, golden: 0, expand: 0, shrink: 0, slowmo: 0, frameChange: 0 };
        } catch {
            this.ownedFrameColors = ['default'];
            this.ownedShapeColors = ['default'];
            this.ownedPatterns = ['solid'];
            this.powerUpInventory = { shield: 0, golden: 0, expand: 0, shrink: 0, slowmo: 0, frameChange: 0 };
        }

        this.activeFrameColor = localStorage.getItem(this.getStorageKey('activeFrameColor')) || 'default';
        this.activeShapeColor = localStorage.getItem(this.getStorageKey('activeShapeColor')) || 'default';
        this.activePattern = localStorage.getItem(this.getStorageKey('activePattern')) || 'solid';
    }

    // Load player data from Supabase (async)
    async loadPlayerFromCloud(name) {
        if (!this.supabaseReady) return null;

        try {
            const cloudData = await window.SupabaseDB.fetchPlayer(name);
            if (cloudData) {
                // Update local state with cloud data
                this.highScore = cloudData.high_score || 0;
                this.tokens = cloudData.tokens || 0;
                this.ownedFrameColors = cloudData.owned_frame_colors || ['default'];
                this.ownedShapeColors = cloudData.owned_shape_colors || ['default'];
                this.ownedPatterns = cloudData.owned_patterns || ['solid'];
                this.powerUpInventory = cloudData.power_up_inventory || { shield: 0, golden: 0, expand: 0, shrink: 0, slowmo: 0, frameChange: 0 };
                this.activeFrameColor = cloudData.active_frame_color || 'default';
                this.activeShapeColor = cloudData.active_shape_color || 'default';
                this.activePattern = cloudData.active_pattern || 'solid';

                // Update localStorage cache
                this.savePlayerDataToLocal();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error loading from cloud:', err);
            return false;
        }
    }

    // Switch to a different player (async with Supabase)
    async switchPlayer(name) {
        this.playerName = name;
        localStorage.setItem('lastPlayerName', name);

        // Reset to defaults
        this.highScore = 0;
        this.tokens = 0;
        this.ownedFrameColors = ['default'];
        this.ownedShapeColors = ['default'];
        this.ownedPatterns = ['solid'];
        this.powerUpInventory = { shield: 0, golden: 0, expand: 0, shrink: 0, slowmo: 0, frameChange: 0 };
        this.activeFrameColor = 'default';
        this.activeShapeColor = 'default';
        this.activePattern = 'solid';

        // Try to load from cloud first
        const cloudLoaded = await this.loadPlayerFromCloud(name);

        if (!cloudLoaded) {
            // Fall back to localStorage
            this.loadPlayerSpecificDataFromLocal();

            // If this is a new player and Supabase is ready, create them in the cloud
            if (this.supabaseReady) {
                await this.savePlayerDataToCloud();
            }
        }
    }

    // Save to localStorage (sync, immediate)
    savePlayerDataToLocal() {
        localStorage.setItem('lastPlayerName', this.playerName);
        localStorage.setItem('soundEnabled', this.soundEnabled.toString());
        localStorage.setItem('sensitivity', this.sensitivity.toString());
        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));

        if (this.playerName) {
            localStorage.setItem(this.getStorageKey('highScore'), this.highScore.toString());
            localStorage.setItem(this.getStorageKey('tokens'), this.tokens.toString());
            localStorage.setItem(this.getStorageKey('ownedFrameColors'), JSON.stringify(this.ownedFrameColors));
            localStorage.setItem(this.getStorageKey('ownedShapeColors'), JSON.stringify(this.ownedShapeColors));
            localStorage.setItem(this.getStorageKey('ownedPatterns'), JSON.stringify(this.ownedPatterns));
            localStorage.setItem(this.getStorageKey('powerUpInventory'), JSON.stringify(this.powerUpInventory));
            localStorage.setItem(this.getStorageKey('activeFrameColor'), this.activeFrameColor);
            localStorage.setItem(this.getStorageKey('activeShapeColor'), this.activeShapeColor);
            localStorage.setItem(this.getStorageKey('activePattern'), this.activePattern);
        }
    }

    // Save to Supabase (async, background)
    async savePlayerDataToCloud() {
        if (!this.supabaseReady || !this.playerName) return;

        try {
            await window.SupabaseDB.savePlayer({
                name: this.playerName,
                highScore: this.highScore,
                tokens: this.tokens,
                ownedFrameColors: this.ownedFrameColors,
                ownedShapeColors: this.ownedShapeColors,
                ownedPatterns: this.ownedPatterns,
                powerUpInventory: this.powerUpInventory,
                activeFrameColor: this.activeFrameColor,
                activeShapeColor: this.activeShapeColor,
                activePattern: this.activePattern
            });
        } catch (err) {
            console.error('Error saving to cloud:', err);
        }
    }

    // Main save function - saves to both localStorage and cloud
    savePlayerData() {
        // Always save to localStorage immediately
        this.savePlayerDataToLocal();

        // Save to cloud in background (don't await)
        this.savePlayerDataToCloud();
    }

    // Update leaderboard (both local and cloud)
    async updateLeaderboard(name, score) {
        // Update local leaderboard
        const existingIndex = this.leaderboard.findIndex(e => e.name === name);
        if (existingIndex >= 0) {
            if (score > this.leaderboard[existingIndex].score) {
                this.leaderboard[existingIndex].score = score;
            }
        } else {
            this.leaderboard.push({ name, score });
        }

        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        this.savePlayerDataToLocal();

        // Update cloud leaderboard
        if (this.supabaseReady) {
            await window.SupabaseDB.updateLeaderboardEntry(name, score);
        }
    }

    // Fetch global leaderboard from cloud
    async fetchGlobalLeaderboard() {
        if (!this.supabaseReady) return this.leaderboard;

        try {
            const cloudLeaderboard = await window.SupabaseDB.fetchLeaderboard();
            if (cloudLeaderboard) {
                this.leaderboard = cloudLeaderboard;
                localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
                return cloudLeaderboard;
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        }
        return this.leaderboard;
    }

    resetAllData() {
        localStorage.clear();
        this.playerName = '';
        this.highScore = 0;
        this.soundEnabled = true;
        this.leaderboard = [];
        this.showScreen('welcome');
    }

    // ============================================
    // AUDIO SYSTEM
    // ============================================

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(type) {
        if (!this.audioContext || !this.soundEnabled) return;

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        switch (type) {
            case 'success':
                oscillator.frequency.setValueAtTime(880, now);
                oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            case 'bonus':
                [880, 1100, 1320].forEach((freq, i) => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);
                    gain.gain.setValueAtTime(0.15, now + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.15);
                });
                return;

            case 'powerup':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
                oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;

            case 'frameChange':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.15);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'vulnerable':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.setValueAtTime(150, now + 0.1);
                oscillator.frequency.setValueAtTime(200, now + 0.2);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'fail':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gainNode.gain.setValueAtTime(0.25, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'highscore':
                [523, 659, 784, 1047].forEach((freq, i) => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                    gain.gain.setValueAtTime(0.2, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.3);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.3);
                });
                return;
        }
    }

    // ============================================
    // BACKGROUND STARS
    // ============================================

    initStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.8 + 0.3,
                opacity: Math.random() * 0.5 + 0.2,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    updateStars() {
        for (const star of this.stars) {
            star.y += star.speed;
            star.twinkle += 0.03;

            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        }
    }

    drawStars() {
        for (const star of this.stars) {
            const twinkleOpacity = star.opacity + Math.sin(star.twinkle) * 0.2;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, twinkleOpacity)})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // ============================================
    // SCREEN NAVIGATION
    // ============================================

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));

        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
        }

        // Update UI when showing menu
        if (screenName === 'menu') {
            document.getElementById('playerNameDisplay').textContent = this.playerName;
            document.getElementById('menuHighScore').textContent = this.highScore;
            document.getElementById('menuTokens').textContent = this.tokens;
        }

        // Update settings inputs
        if (screenName === 'settings') {
            document.getElementById('soundToggle').checked = this.soundEnabled;
            document.getElementById('changeNameInput').value = this.playerName;
            document.getElementById('sensitivitySlider').value = this.sensitivity;
            document.getElementById('sensitivityValue').textContent = this.sensitivity.toFixed(1) + 'x';
        }

        // Update leaderboard (fetch from cloud if available)
        if (screenName === 'leaderboard') {
            this.renderLeaderboardWithLoading();
        }

        // Render market
        if (screenName === 'market') {
            this.renderMarket();
        }
    }

    renderLeaderboard() {
        const list = document.getElementById('leaderboardList');

        if (this.leaderboard.length === 0) {
            list.innerHTML = '<div class="empty-leaderboard">Henüz skor yok. İlk sen ol! 🎮</div>';
            return;
        }

        list.innerHTML = this.leaderboard.map((entry, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const selfClass = entry.name === this.playerName ? 'self' : '';
            return `
                <div class="leaderboard-item ${selfClass}">
                    <div class="lb-rank ${rankClass}">${index + 1}</div>
                    <div class="lb-name">${entry.name}</div>
                    <div class="lb-score">${entry.score}</div>
                </div>
            `;
        }).join('');
    }

    // Render leaderboard with cloud fetch and loading state
    async renderLeaderboardWithLoading() {
        const list = document.getElementById('leaderboardList');

        // Show loading state
        list.innerHTML = '<div class="empty-leaderboard">Yükleniyor... ⏳</div>';

        // Fetch from cloud
        await this.fetchGlobalLeaderboard();

        // Render the leaderboard
        this.renderLeaderboard();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        this.resizeCanvas();
        this.initStars();
        this.initDatabase(); // Initialize Supabase
        window.addEventListener('resize', () => this.resizeCanvas());

        // Check if first time
        if (!this.playerName) {
            this.showScreen('welcome');
        } else {
            // Try to sync with cloud on startup
            if (this.supabaseReady) {
                this.loadPlayerFromCloud(this.playerName).then(() => {
                    this.showScreen('menu');
                });
            } else {
                this.showScreen('menu');
            }
        }

        // Welcome screen
        document.getElementById('saveNameBtn').addEventListener('click', async () => {
            const name = document.getElementById('playerNameInput').value.trim();
            if (name) {
                // Show loading state
                const btn = document.getElementById('saveNameBtn');
                const originalText = btn.textContent;
                btn.textContent = 'Yükleniyor...';
                btn.disabled = true;

                try {
                    await this.switchPlayer(name);
                    this.savePlayerData();
                    this.showScreen('menu');
                } catch (err) {
                    console.error('Error switching player:', err);
                    this.showScreen('menu');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            }
        });

        document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('saveNameBtn').click();
            }
        });

        // Menu buttons
        document.getElementById('playBtn').addEventListener('click', () => this.startGame());
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showScreen('leaderboard'));
        document.getElementById('settingsBtn').addEventListener('click', () => this.showScreen('settings'));
        document.getElementById('marketBtn').addEventListener('click', () => this.showScreen('market'));

        // Switch user button
        document.getElementById('switchUserBtn').addEventListener('click', () => {
            document.getElementById('playerNameInput').value = '';
            this.showScreen('welcome');
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = btn.getAttribute('data-target');
                if (target) {
                    this.showScreen(target);
                }
            });
        });

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.soundEnabled = document.getElementById('soundToggle').checked;
            this.sensitivity = parseFloat(document.getElementById('sensitivitySlider').value);
            const newName = document.getElementById('changeNameInput').value.trim();
            if (newName) {
                this.playerName = newName;
            }
            this.savePlayerData();
            this.showScreen('menu');
        });

        // Sensitivity slider live update
        document.getElementById('sensitivitySlider').addEventListener('input', (e) => {
            document.getElementById('sensitivityValue').textContent = parseFloat(e.target.value).toFixed(1) + 'x';
        });

        document.getElementById('resetDataBtn').addEventListener('click', () => {
            if (confirm('Tüm veriler silinecek. Emin misin?')) {
                this.resetAllData();
            }
        });

        // Pause
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('quitBtn').addEventListener('click', () => {
            this.isRunning = false;
            cancelAnimationFrame(this.animationId);
            this.showScreen('menu');
        });

        // Game over
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showScreen('menu'));

        // New high score
        document.getElementById('hsPlayAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('hsMenuBtn').addEventListener('click', () => this.showScreen('menu'));

        // Continue buttons
        document.getElementById('continueBtn').addEventListener('click', () => this.continueGame());
        document.getElementById('hsContinueBtn').addEventListener('click', () => this.continueGame());

        // Market tabs
        document.querySelectorAll('.market-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.market-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const tabName = tab.dataset.tab;
                document.getElementById('customizeTab').classList.toggle('hidden', tabName !== 'customize');
                document.getElementById('powerupsTab').classList.toggle('hidden', tabName !== 'powerups');
            });
        });

        // Keyboard input for power-ups
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Game input
        this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e.clientX));
        this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX));
        this.canvas.addEventListener('mouseup', () => this.onPointerUp());
        this.canvas.addEventListener('mouseleave', () => this.onPointerUp());

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.onPointerDown(e.touches[0].clientX);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onPointerMove(e.touches[0].clientX);
        });
        this.canvas.addEventListener('touchend', () => this.onPointerUp());
    }

    // ============================================
    // KEYBOARD INPUT FOR POWER-UPS
    // ============================================

    onKeyDown(e) {
        if (!this.isRunning || this.isPaused) return;

        const keyMap = {
            '1': 'slowmo',
            '2': 'shrink',
            '3': 'frameChange',
            '4': 'shield',
            '5': 'golden',
            '6': 'expand'
        };

        const powerUpType = keyMap[e.key];
        if (powerUpType && this.powerUpInventory[powerUpType] > 0) {
            this.usePurchasedPowerUp(powerUpType);
        }
    }

    usePurchasedPowerUp(type) {
        if (this.powerUpInventory[type] <= 0) return;
        if (this.activePowerUp) return; // Already have active power-up

        this.powerUpInventory[type]--;
        this.updateInventoryDisplay();
        this.savePlayerData();

        // Find the power-up config
        const powerUpConfig = this.marketItems.powerUps.find(p => p.id === type);
        if (!powerUpConfig) return;

        if (type === 'frameChange') {
            // Special case: instant frame change
            this.changeFrame();
        } else {
            // Duration-based power-ups
            const powerUp = this.powerUpTypes.find(p => p.type === type);
            if (powerUp) {
                this.activatePowerUp(powerUp);
            }
        }
    }

    updateInventoryDisplay() {
        document.getElementById('invSlowmo').textContent = this.powerUpInventory.slowmo;
        document.getElementById('invShrink').textContent = this.powerUpInventory.shrink;
        document.getElementById('invFrameChange').textContent = this.powerUpInventory.frameChange;
        document.getElementById('invShield').textContent = this.powerUpInventory.shield;
        document.getElementById('invGolden').textContent = this.powerUpInventory.golden;
        document.getElementById('invExpand').textContent = this.powerUpInventory.expand;

        // Update visibility
        document.querySelectorAll('.inv-item').forEach(item => {
            const type = item.dataset.powerup;
            const count = this.powerUpInventory[type] || 0;
            item.classList.toggle('empty', count === 0);
        });
    }

    // ============================================
    // MARKET SYSTEM
    // ============================================

    renderMarket() {
        // Update token display
        document.getElementById('marketTokens').textContent = this.tokens;

        // Render frame colors
        this.renderMarketItems('frameColorItems', this.marketItems.frameColors, 'frameColor');

        // Render shape colors
        this.renderMarketItems('shapeColorItems', this.marketItems.shapeColors, 'shapeColor');

        // Render patterns
        this.renderMarketItems('patternItems', this.marketItems.patterns, 'pattern');

        // Render power-ups
        this.renderPowerUpItems();
    }

    renderMarketItems(containerId, items, category) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        items.forEach(item => {
            const isOwned = this.isItemOwned(category, item.id);
            const isActive = this.isItemActive(category, item.id);
            const canAfford = this.tokens >= item.price;

            const div = document.createElement('div');
            div.className = `market-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''} ${!canAfford && !isOwned ? 'locked' : ''}`;

            let preview = '';
            if (category === 'frameColor') {
                preview = `<div class="item-preview frame-preview" style="background: ${item.color}; border-color: ${item.borderColor}"></div>`;
            } else if (category === 'shapeColor') {
                if (item.colors) {
                    preview = `<div class="item-preview shape-preview">
                        <span style="color: ${item.colors.circle}">●</span>
                        <span style="color: ${item.colors.square}">■</span>
                        <span style="color: ${item.colors.star}">★</span>
                    </div>`;
                } else {
                    preview = `<div class="item-preview shape-preview">
                        <span style="color: #00d4ff">●</span>
                        <span style="color: #a855f7">■</span>
                        <span style="color: #ec4899">★</span>
                    </div>`;
                }
            } else if (category === 'pattern') {
                preview = `<div class="item-preview pattern-preview ${item.id}"></div>`;
            }

            div.innerHTML = `
                ${preview}
                <span class="item-name">${item.name}</span>
                ${isActive ? '<span class="item-status">✓ Aktif</span>' :
                    isOwned ? '<span class="item-status owned-status">Sahip</span>' :
                        `<span class="item-price">🪙 ${item.price}</span>`}
            `;

            div.addEventListener('click', () => {
                if (isActive) return;
                if (isOwned) {
                    this.setActiveItem(category, item.id);
                } else if (canAfford) {
                    this.purchaseItem(category, item);
                }
            });

            container.appendChild(div);
        });
    }

    renderPowerUpItems() {
        const container = document.getElementById('powerUpItems');
        container.innerHTML = '';

        this.marketItems.powerUps.forEach(item => {
            const count = this.powerUpInventory[item.id] || 0;
            const canAfford = this.tokens >= item.price;

            const div = document.createElement('div');
            div.className = `market-item powerup-item ${!canAfford ? 'locked' : ''}`;

            div.innerHTML = `
                <div class="powerup-header">
                    <span class="powerup-icon-large">${item.icon}</span>
                    <span class="powerup-key">[${item.key}]</span>
                </div>
                <span class="item-name">${item.name}</span>
                <span class="powerup-owned">Envanter: ${count}</span>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''}>
                    🪙 ${item.price}
                </button>
            `;

            div.querySelector('.buy-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (canAfford) {
                    this.purchasePowerUp(item);
                }
            });

            container.appendChild(div);
        });
    }

    isItemOwned(category, itemId) {
        switch (category) {
            case 'frameColor': return this.ownedFrameColors.includes(itemId);
            case 'shapeColor': return this.ownedShapeColors.includes(itemId);
            case 'pattern': return this.ownedPatterns.includes(itemId);
            default: return false;
        }
    }

    isItemActive(category, itemId) {
        switch (category) {
            case 'frameColor': return this.activeFrameColor === itemId;
            case 'shapeColor': return this.activeShapeColor === itemId;
            case 'pattern': return this.activePattern === itemId;
            default: return false;
        }
    }

    setActiveItem(category, itemId) {
        switch (category) {
            case 'frameColor': this.activeFrameColor = itemId; break;
            case 'shapeColor': this.activeShapeColor = itemId; break;
            case 'pattern': this.activePattern = itemId; break;
        }
        this.savePlayerData();
        this.renderMarket();
        this.playSound('success');
    }

    purchaseItem(category, item) {
        if (this.tokens < item.price) return;

        this.tokens -= item.price;

        switch (category) {
            case 'frameColor':
                this.ownedFrameColors.push(item.id);
                this.activeFrameColor = item.id;
                break;
            case 'shapeColor':
                this.ownedShapeColors.push(item.id);
                this.activeShapeColor = item.id;
                break;
            case 'pattern':
                this.ownedPatterns.push(item.id);
                this.activePattern = item.id;
                break;
        }

        this.savePlayerData();
        this.renderMarket();
        this.playSound('bonus');
    }

    purchasePowerUp(item) {
        if (this.tokens < item.price) return;

        this.tokens -= item.price;
        this.powerUpInventory[item.id]++;

        this.savePlayerData();
        this.renderMarket();
        this.updateInventoryDisplay();
        this.playSound('success');
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        if (this.frame) {
            this.frame.y = this.canvas.height - 180;
            this.clampFramePosition();
        }

        this.initStars();
    }

    clampFramePosition() {
        const minX = -this.frameOverflow;
        const maxX = this.canvas.width - this.frame.width + this.frameOverflow;
        this.frame.x = Math.max(minX, Math.min(maxX, this.frame.x));
    }

    // ============================================
    // INPUT HANDLING
    // ============================================

    onPointerDown(x) {
        if (!this.isRunning || this.isPaused) return;
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isDragging = true;
        this.lastX = x;
    }

    onPointerMove(x) {
        if (!this.isDragging || !this.isRunning || this.isPaused) return;

        const deltaX = (x - this.lastX) * this.sensitivity;
        this.frame.x += deltaX;
        this.clampFramePosition();
        this.lastX = x;
    }

    onPointerUp() {
        this.isDragging = false;
    }

    // ============================================
    // GAME CONTROL
    // ============================================

    startGame() {
        this.score = 0;
        this.scoreElement.textContent = '0';
        this.fallingShapes = [];
        this.successEffects = [];
        this.particles = [];
        this.shapeSpawnTimer = 0;
        this.spawnInterval = 120;
        this.activePowerUp = null;
        this.powerUpDisplay.classList.add('hidden');
        this.frameInvincible = false;
        this.frameTransitioning = false;
        this.frameGlowIntensity = 0;
        this.isPaused = false;
        this.hsNotified80 = false;
        this.hsNotifiedBeat = false;
        this.hsNotification.classList.add('hidden');
        this.continueCount = 0; // Reset continue count for new game

        this.scheduleNextFrameChange();
        this.createFrame(this.frameConfigs[0]);

        // Update inventory display
        this.updateInventoryDisplay();

        this.showScreen('game');

        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isRunning = true;
        this.gameLoop();
    }

    pauseGame() {
        if (!this.isRunning) return;
        this.isPaused = true;
        cancelAnimationFrame(this.animationId);
        this.showScreen('pause');
    }

    resumeGame() {
        if (!this.isRunning) return;
        this.isPaused = false;
        this.screens.pause.classList.add('hidden');
        this.screens.game.classList.remove('hidden');
        this.gameLoop();
    }

    createFrame(config, keepPosition = false) {
        let frameWidth = Math.min(this.baseFrameWidth, this.canvas.width * 0.85);

        if (this.activePowerUp) {
            if (this.activePowerUp.type === 'expand') {
                frameWidth *= 1.4;
            } else if (this.activePowerUp.type === 'shrink') {
                frameWidth *= 0.65;
            }
        }

        const holeSize = 50;
        const holeCount = config.holes.length;
        const spacing = (frameWidth - (holeSize * holeCount)) / (holeCount + 1);

        const holes = config.holes.map((type, index) => ({
            type: type,
            x: spacing + (spacing + holeSize) * index,
            size: holeSize
        }));

        const oldX = this.frame ? this.frame.x + (this.frame.width / 2) : this.canvas.width / 2;

        this.frame = {
            x: keepPosition ? oldX - frameWidth / 2 : (this.canvas.width - frameWidth) / 2,
            y: this.canvas.height - 180,
            width: frameWidth,
            height: 80,
            holes: holes,
            config: config
        };

        this.clampFramePosition();
    }

    scheduleNextFrameChange() {
        const delay = this.frameChangeMinTime + Math.random() * (this.frameChangeMaxTime - this.frameChangeMinTime);
        this.nextFrameChangeTime = Date.now() + delay;
    }

    changeFrame() {
        if (this.frameTransitioning) return;

        let newConfig;
        do {
            newConfig = this.frameConfigs[Math.floor(Math.random() * this.frameConfigs.length)];
        } while (newConfig.holes.length === this.frame.holes.length &&
            newConfig.holes.every((h, i) => h === this.frame.holes[i]?.type));

        this.startFrameTransition(newConfig);
    }

    startFrameTransition(newConfig) {
        this.frameTransitioning = true;
        this.frameInvincible = true;
        this.frameDashPhase = 0;
        this.transitionProgress = 0;
        this.transitionDuration = 3000;
        this.transitionStartTime = Date.now();
        this.pendingConfig = newConfig;
        this.playSound('frameChange');
    }

    updateFrameTransition() {
        if (!this.frameTransitioning) return;

        const elapsed = Date.now() - this.transitionStartTime;
        this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);
        this.frameDashPhase += 0.15;

        if (this.transitionProgress >= 0.8 && this.pendingConfig) {
            this.createFrame(this.pendingConfig, true);
            this.pendingConfig = null;
            this.frameGlowIntensity = 2;
            this.playSound('powerup');
        }

        if (this.transitionProgress >= 1) {
            this.frameTransitioning = false;
            this.frameInvincible = false;
            this.scheduleNextFrameChange();
            this.playSound('vulnerable');
            this.frameGlowIntensity = 1;
        }
    }

    addFrameParticles() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: this.frame.x + Math.random() * this.frame.width,
                y: this.frame.y + Math.random() * this.frame.height,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: '#00d4ff',
                life: 1
            });
        }
    }

    endGame() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        this.playSound('fail');
        this.showShatterEffect();

        // Calculate and award tokens (10% of score)
        const earnedTokens = Math.floor(this.score * 0.10);
        this.tokens += earnedTokens;
        this.lastEarnedTokens = earnedTokens;

        // Check for new high score
        const isNewHighScore = this.score > this.highScore;

        if (isNewHighScore) {
            this.highScore = this.score;
        }

        this.savePlayerData();

        // Update leaderboard
        if (this.score > 0) {
            this.updateLeaderboard(this.playerName, this.score);
        }

        setTimeout(() => {
            if (isNewHighScore && this.score > 0) {
                // Show new high score screen
                document.getElementById('newHighScoreValue').textContent = this.score;
                document.getElementById('hsPlayerName').textContent = this.playerName;
                document.getElementById('hsEarnedTokens').textContent = `+${earnedTokens}`;
                this.updateContinueButton('newHighScore');
                this.showScreen('newHighScore');
                this.playSound('highscore');
            } else {
                // Show regular game over
                this.finalScoreElement.textContent = this.score;
                document.getElementById('earnedTokens').textContent = `+${earnedTokens}`;
                this.updateContinueButton('gameOver');
                this.showScreen('gameOver');
            }
        }, 800);
    }

    getContinueCost() {
        return 50 + (this.continueCount * 50);
    }

    updateContinueButton(screen) {
        const cost = this.getContinueCost();
        const canAfford = this.tokens >= cost;

        let btn, costEl;
        if (screen === 'gameOver') {
            btn = document.getElementById('continueBtn');
            costEl = document.getElementById('continueCost');
        } else {
            btn = document.getElementById('hsContinueBtn');
            costEl = document.getElementById('hsContinueCost');
        }

        if (btn && costEl) {
            costEl.textContent = cost;
            btn.disabled = !canAfford;
            btn.classList.toggle('disabled', !canAfford);
        }
    }

    continueGame() {
        const cost = this.getContinueCost();
        if (this.tokens >= cost) {
            this.tokens -= cost;
            this.continueCount++;
            this.savePlayerData();

            // Reset game state but keep score
            this.fallingShapes = [];
            this.activePowerUp = null;
            this.powerUpDisplay.classList.add('hidden');
            this.frameInvincible = false;
            this.frameTransitioning = false;

            this.scheduleNextFrameChange();
            this.showScreen('game');

            this.isRunning = true;
            this.gameLoop();

            this.playSound('powerup');
        }
    }

    showShatterEffect() {
        const overlay = document.createElement('div');
        overlay.className = 'shatter-overlay';
        document.body.appendChild(overlay);

        for (let i = 0; i < 12; i++) {
            const crack = document.createElement('div');
            crack.className = 'crack-line';
            crack.style.left = `${this.frame.x + this.frame.width / 2}px`;
            crack.style.top = `${this.frame.y + this.frame.height / 2}px`;
            crack.style.width = `${80 + Math.random() * 180}px`;
            crack.style.height = '2px';
            crack.style.transform = `rotate(${i * 30 + Math.random() * 15}deg)`;
            overlay.appendChild(crack);
        }

        setTimeout(() => overlay.remove(), 800);
    }

    // ============================================
    // HIGH SCORE NOTIFICATIONS
    // ============================================

    checkHighScoreProgress() {
        if (this.highScore === 0) return;

        const threshold80 = this.highScore * 0.8;

        if (!this.hsNotified80 && this.score >= threshold80 && this.score < this.highScore) {
            this.hsNotified80 = true;
            this.showHsNotification('🔥 Rekora yaklaşıyorsun!');
        }

        if (!this.hsNotifiedBeat && this.score > this.highScore) {
            this.hsNotifiedBeat = true;
            this.showHsNotification('⭐ YENİ REKOR!');
            this.playSound('bonus');
        }
    }

    showHsNotification(text) {
        this.hsNotificationText.textContent = text;
        this.hsNotification.classList.remove('hidden');

        setTimeout(() => {
            this.hsNotification.classList.add('hidden');
        }, 3000);
    }

    // ============================================
    // POWER-UP SYSTEM
    // ============================================

    activatePowerUp(powerUp) {
        this.activePowerUp = powerUp;
        this.playSound('powerup');

        if (powerUp.duration > 0) {
            this.powerUpEndTime = Date.now() + powerUp.duration;
            this.powerUpDisplay.classList.remove('hidden');
            this.powerUpIcon.textContent = powerUp.icon;
            this.powerUpProgress.style.width = '100%';
        }

        if (powerUp.type === 'triple') {
            this.spawnTripleShapes();
            this.activePowerUp = null;
        } else if (powerUp.type === 'expand' || powerUp.type === 'shrink') {
            this.createFrame(this.frame.config, true);
        }
    }

    updatePowerUp() {
        if (!this.activePowerUp || this.activePowerUp.duration === 0) return;

        const now = Date.now();
        const remaining = this.powerUpEndTime - now;

        if (remaining <= 0) {
            const wasSize = this.activePowerUp.type === 'expand' || this.activePowerUp.type === 'shrink';

            this.activePowerUp = null;
            this.powerUpDisplay.classList.add('hidden');

            if (wasSize) {
                this.createFrame(this.frame.config, true);
            }
        } else {
            const progress = (remaining / this.activePowerUp.duration) * 100;
            this.powerUpProgress.style.width = `${progress}%`;
        }
    }

    spawnTripleShapes() {
        const holes = this.frame.holes;
        const shapeSize = 38;

        holes.forEach((hole) => {
            const x = this.frame.x + hole.x + hole.size / 2;

            this.fallingShapes.push({
                type: hole.type,
                x: x,
                y: -50,
                size: shapeSize,
                speed: 2.5,
                rotation: 0,
                rotationSpeed: 0,
                isGolden: true,
                isPowerUp: false,
                pulsePhase: Math.random() * Math.PI * 2,
                isTriple: true
            });
        });
    }

    // ============================================
    // GAME LOOP
    // ============================================

    gameLoop() {
        if (!this.isRunning || this.isPaused) return;

        this.update();
        this.render();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updateStars();
        this.updateParticles();
        this.updateSuccessEffects();
        this.updatePowerUp();
        this.updateFrameTransition();
        this.checkHighScoreProgress();

        if (this.frameGlowIntensity > 0) {
            this.frameGlowIntensity -= 0.03;
        }

        if (!this.frameTransitioning && Date.now() >= this.nextFrameChangeTime) {
            this.changeFrame();
        }

        this.shapeSpawnTimer++;
        if (this.shapeSpawnTimer >= this.spawnInterval) {
            this.spawnShape();
            this.shapeSpawnTimer = 0;
        }

        // Speed multiplier (affected by slow-mo)
        const speedMultiplier = (this.activePowerUp && this.activePowerUp.type === 'slowmo') ? 0.4 : 1;

        for (let i = this.fallingShapes.length - 1; i >= 0; i--) {
            const shape = this.fallingShapes[i];
            shape.y += shape.speed * speedMultiplier;

            if (this.checkCollision(shape)) {
                continue;
            }

            if (shape.y > this.canvas.height + 50) {
                this.fallingShapes.splice(i, 1);
            }
        }

        if (this.spawnInterval > 60) {
            this.spawnInterval -= 0.008;
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.02;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateSuccessEffects() {
        for (let i = this.successEffects.length - 1; i >= 0; i--) {
            const effect = this.successEffects[i];
            effect.life -= 0.025;
            effect.radius += 4;
            effect.y -= 2;

            if (effect.life <= 0) {
                this.successEffects.splice(i, 1);
            }
        }
    }

    spawnShape() {
        const type = this.shapeTypes[Math.floor(Math.random() * this.shapeTypes.length)];
        const size = 40;
        const x = Math.random() * (this.canvas.width - size * 2) + size;

        const baseSpeed = 1.5;
        const speedIncrease = Math.min(this.score / 50 * 0.25, 4);
        const speed = baseSpeed + speedIncrease * (0.6 + Math.random() * 0.4);

        let isGolden = false;
        let isPowerUp = false;
        let powerUpType = null;

        if (this.activePowerUp && this.activePowerUp.type === 'golden') {
            isGolden = true;
        } else if (Math.random() < 0.05) {
            isGolden = true;
        } else if (Math.random() < 0.15) {
            // 15% chance for power-up (increased from 10%)
            isPowerUp = true;
            powerUpType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        }

        this.fallingShapes.push({
            type: type,
            x: x,
            y: -size,
            size: size,
            speed: speed,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            isGolden: isGolden,
            isPowerUp: isPowerUp,
            powerUpType: powerUpType,
            pulsePhase: 0
        });
    }

    checkCollision(shape) {
        const shapeBottom = shape.y + shape.size / 2;
        const shapeTop = shape.y - shape.size / 2;
        const shapeCenterX = shape.x;

        const frameTop = this.frame.y;
        const frameBottom = this.frame.y + this.frame.height;

        if (shapeBottom >= frameTop && shapeTop <= frameBottom) {
            const frameLeft = this.frame.x;
            const frameRight = this.frame.x + this.frame.width;

            if (shapeCenterX >= frameLeft && shapeCenterX <= frameRight) {
                for (const hole of this.frame.holes) {
                    const holeLeft = this.frame.x + hole.x;
                    const holeRight = holeLeft + hole.size;

                    if (shapeCenterX >= holeLeft && shapeCenterX <= holeRight) {
                        if (shape.type === hole.type) {
                            // Correct shape - collect points (works even during frame transition)
                            if (shape.isPowerUp) {
                                this.activatePowerUp(shape.powerUpType);
                                this.addSuccessEffect(shape.x, this.frame.y, shape.type, false, true);
                            } else {
                                const points = shape.isGolden ? 30 : 10;
                                this.addScore(points);
                                this.addSuccessEffect(shape.x, this.frame.y, shape.type, shape.isGolden, false);
                                this.playSound(shape.isGolden ? 'bonus' : 'success');
                            }
                            this.removeShape(shape);
                            return true;
                        } else {
                            // Wrong shape in hole
                            if (this.frameInvincible) {
                                // During frame transition - just destroy shape, no death
                                this.addParticles(shapeCenterX, frameTop, '#ffff00');
                                this.removeShape(shape);
                                return true;
                            }
                            if (this.activePowerUp && this.activePowerUp.type === 'shield') {
                                this.addParticles(shapeCenterX, frameTop, '#00ffff');
                                this.removeShape(shape);
                                return true;
                            }
                            this.endGame();
                            return true;
                        }
                    }
                }

                if (shapeBottom >= frameTop + 10) {
                    // Shape hit the frame (not a hole)
                    if (this.frameInvincible) {
                        // During frame transition - just destroy shape, no death
                        this.addParticles(shapeCenterX, frameTop, '#ffff00');
                        this.removeShape(shape);
                        return true;
                    }
                    if (this.activePowerUp && this.activePowerUp.type === 'shield') {
                        this.addParticles(shapeCenterX, frameTop, '#00ffff');
                        this.removeShape(shape);
                        return true;
                    }
                    this.endGame();
                    return true;
                }
            }
        }

        return false;
    }

    addParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 4 - 2,
                size: Math.random() * 3 + 1,
                color: color,
                life: 1
            });
        }
    }

    removeShape(shape) {
        const index = this.fallingShapes.indexOf(shape);
        if (index > -1) {
            this.fallingShapes.splice(index, 1);
        }
    }

    addSuccessEffect(x, y, type, isGolden, isPowerUp) {
        this.successEffects.push({
            x: x,
            y: y,
            type: type,
            isGolden: isGolden,
            isPowerUp: isPowerUp,
            radius: 20,
            life: 1
        });
    }

    addScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;

        this.scoreDisplay.classList.remove('pop');
        void this.scoreDisplay.offsetWidth;
        this.scoreDisplay.classList.add('pop');
    }

    // ============================================
    // RENDERING
    // ============================================

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#12122a');
        gradient.addColorStop(1, '#1a0a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Slow-mo visual effect
        if (this.activePowerUp && this.activePowerUp.type === 'slowmo') {
            this.ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.drawStars();
        this.drawParticles();
        this.drawSuccessEffects();

        for (const shape of this.fallingShapes) {
            this.drawShape(shape);
        }

        this.drawFrame();

        if (this.frameTransitioning) {
            this.drawTransitionEffect();
        }
    }

    drawTransitionEffect() {
        const frame = this.frame;
        const progress = this.transitionProgress;

        const barWidth = frame.width * 0.8;
        const barHeight = 8;
        const barX = frame.x + (frame.width - barWidth) / 2;
        const barY = frame.y - 40;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.roundRect(barX, barY, barWidth, barHeight, 4);
        this.ctx.fill();

        const progressWidth = barWidth * (1 - progress);
        const hue = 180 - progress * 60;
        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        this.roundRect(barX, barY, progressWidth, barHeight, 4);
        this.ctx.fill();

        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px Outfit';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.shadowBlur = 15;

        const text = progress < 0.8 ? '⚡ Çerçeve Değişiyor! ⚡' : '✨ Yeni Çerçeve! ✨';
        this.ctx.fillText(text, this.canvas.width / 2, barY - 15);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.setLineDash([15, 10]);
        this.ctx.lineDashOffset = -this.frameDashPhase * 10;

        const flash = 0.5 + Math.sin(this.frameDashPhase * 3) * 0.5;
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${flash})`;
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 20;

        this.roundRect(frame.x - 5, frame.y - 5, frame.width + 10, frame.height + 10, 15);
        this.ctx.stroke();

        this.ctx.lineDashOffset = this.frameDashPhase * 10;
        this.ctx.strokeStyle = `rgba(255, 255, 0, ${1 - flash})`;
        this.ctx.lineWidth = 2;
        this.roundRect(frame.x - 2, frame.y - 2, frame.width + 4, frame.height + 4, 13);
        this.ctx.stroke();

        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    drawParticles() {
        for (const p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawSuccessEffects() {
        for (const effect of this.successEffects) {
            const colors = effect.isGolden ? this.goldenColor : this.shapeColors[effect.type];
            const effectColor = effect.isPowerUp ? '#ff00ff' : colors.fill;

            this.ctx.save();
            this.ctx.globalAlpha = effect.life * 0.7;
            this.ctx.strokeStyle = effectColor;
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = effectColor;
            this.ctx.shadowBlur = 20;

            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.fillStyle = effectColor;
            this.ctx.font = `bold ${18 + (1 - effect.life) * 8}px Outfit`;
            this.ctx.textAlign = 'center';
            const text = effect.isPowerUp ? '⚡ POWER!' : (effect.isGolden ? '★ +30' : '✓ +10');
            this.ctx.fillText(text, effect.x, effect.y - effect.radius - 10);

            this.ctx.restore();
        }
    }

    drawShape(shape) {
        // Get custom colors based on active shape color pack
        let colors;
        if (shape.isGolden) {
            colors = this.goldenColor;
        } else if (shape.isPowerUp) {
            colors = { fill: shape.powerUpType.color, stroke: '#ffffff', glow: shape.powerUpType.color };
        } else {
            colors = this.getShapeColors(shape.type);
        }

        if (shape.isGolden || shape.isPowerUp) {
            shape.pulsePhase += 0.12;
        }

        this.ctx.save();
        this.ctx.translate(shape.x, shape.y);
        shape.rotation += shape.rotationSpeed;
        this.ctx.rotate(shape.rotation);

        if (shape.isGolden || shape.isPowerUp) {
            const pulse = 1 + Math.sin(shape.pulsePhase) * 0.12;
            this.ctx.scale(pulse, pulse);
        }

        // Apply pattern
        const patternFill = this.getPatternFill(colors.fill, shape.size);
        this.ctx.fillStyle = patternFill || colors.fill;
        this.ctx.strokeStyle = colors.stroke;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = colors.glow;
        // Reduced glow for better pattern visibility
        this.ctx.shadowBlur = shape.isGolden || shape.isPowerUp ? 15 : 6;

        switch (shape.type) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;

            case 'square':
                const half = shape.size / 2;
                this.ctx.fillRect(-half, -half, shape.size, shape.size);
                this.ctx.strokeRect(-half, -half, shape.size, shape.size);
                break;

            case 'star':
                this.drawStar(0, 0, 5, shape.size / 2, shape.size / 4);
                this.ctx.fill();
                this.ctx.stroke();
                break;
        }

        if (shape.isPowerUp) {
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(shape.powerUpType.icon, 0, 0);
        }

        if (shape.isGolden && !shape.isPowerUp) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.shadowBlur = 0;
            const sparkleSize = 3 + Math.sin(shape.pulsePhase * 2) * 2;
            this.ctx.beginPath();
            this.ctx.arc(shape.size / 4, -shape.size / 4, sparkleSize, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    // Get shape colors based on active color pack
    getShapeColors(type) {
        const colorPack = this.marketItems.shapeColors.find(c => c.id === this.activeShapeColor);
        if (colorPack && colorPack.colors) {
            const baseColor = colorPack.colors[type];
            return { fill: baseColor, stroke: this.darkenColor(baseColor), glow: baseColor };
        }
        return this.shapeColors[type];
    }

    // Darken a hex color for stroke
    darkenColor(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
    }

    // Get pattern fill based on active pattern
    getPatternFill(baseColor, size) {
        if (this.activePattern === 'solid' || !this.activePattern) {
            return null; // Use base color
        }

        // Create a pattern canvas
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = 10;
        patternCanvas.height = 10;

        if (this.activePattern === 'striped') {
            patternCtx.fillStyle = baseColor;
            patternCtx.fillRect(0, 0, 10, 10);
            patternCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Increased opacity
            patternCtx.lineWidth = 3; // Thicker lines
            patternCtx.beginPath();
            patternCtx.moveTo(0, 0);
            patternCtx.lineTo(10, 10);
            patternCtx.stroke();
            patternCtx.beginPath();
            patternCtx.moveTo(-5, 5);
            patternCtx.lineTo(5, 15);
            patternCtx.stroke();
            patternCtx.beginPath();
            patternCtx.moveTo(5, -5);
            patternCtx.lineTo(15, 5);
            patternCtx.stroke();
        } else if (this.activePattern === 'dotted') {
            patternCtx.fillStyle = baseColor;
            patternCtx.fillRect(0, 0, 10, 10);
            patternCtx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Increased opacity
            patternCtx.beginPath();
            patternCtx.arc(5, 5, 2.5, 0, Math.PI * 2); // Larger dots
            patternCtx.fill();
        } else if (this.activePattern === 'gradient') {
            const grad = patternCtx.createLinearGradient(0, 0, 10, 10);
            grad.addColorStop(0, baseColor);
            grad.addColorStop(1, this.darkenColor(baseColor));
            patternCtx.fillStyle = grad;
            patternCtx.fillRect(0, 0, 10, 10);
        }

        return this.ctx.createPattern(patternCanvas, 'repeat');
    }

    // Get frame colors based on active frame color
    getFrameColors() {
        const frameColor = this.marketItems.frameColors.find(c => c.id === this.activeFrameColor);
        if (frameColor && frameColor.id !== 'default') {
            return { fill: frameColor.color, border: frameColor.borderColor };
        }
        // Default glass gradient
        return {
            fill: 'rgba(150, 200, 255, 0.25)',
            border: 'rgba(200, 230, 255, 0.5)'
        };
    }

    drawFrame() {
        const frame = this.frame;

        // Get custom frame colors
        const frameColorConfig = this.getFrameColors();

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.roundRect(frame.x + 4, frame.y + 6, frame.width, frame.height, 12);
        this.ctx.fill();
        this.ctx.restore();

        for (const hole of frame.holes) {
            const holeX = frame.x + hole.x + hole.size / 2;
            const holeY = frame.y + frame.height / 2;

            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

            switch (hole.type) {
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(holeX, holeY, hole.size / 2 + 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;

                case 'square':
                    this.ctx.fillRect(holeX - hole.size / 2 - 2, holeY - hole.size / 2 - 2, hole.size + 4, hole.size + 4);
                    break;

                case 'star':
                    this.ctx.translate(holeX, holeY);
                    this.drawStar(0, 0, 5, hole.size / 2 + 2, hole.size / 4 + 1);
                    this.ctx.fill();
                    break;
            }
            this.ctx.restore();
        }

        // Use custom frame color
        this.ctx.fillStyle = frameColorConfig.fill;
        this.ctx.strokeStyle = frameColorConfig.border;
        this.ctx.lineWidth = 2;

        this.roundRect(frame.x, frame.y, frame.width, frame.height, 12);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';

        for (const hole of frame.holes) {
            const holeX = frame.x + hole.x + hole.size / 2;
            const holeY = frame.y + frame.height / 2;

            switch (hole.type) {
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(holeX, holeY, hole.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;

                case 'square':
                    this.ctx.fillRect(holeX - hole.size / 2, holeY - hole.size / 2, hole.size, hole.size);
                    break;

                case 'star':
                    this.ctx.save();
                    this.ctx.translate(holeX, holeY);
                    this.drawStar(0, 0, 5, hole.size / 2, hole.size / 4);
                    this.ctx.fill();
                    this.ctx.restore();
                    break;
            }
        }
        this.ctx.restore();

        for (const hole of frame.holes) {
            const holeX = frame.x + hole.x + hole.size / 2;
            const holeY = frame.y + frame.height / 2;
            const colors = this.shapeColors[hole.type];

            this.ctx.save();
            this.ctx.strokeStyle = colors.fill;
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = colors.fill;
            this.ctx.shadowBlur = 15;

            switch (hole.type) {
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(holeX, holeY, hole.size / 2, 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;

                case 'square':
                    this.ctx.strokeRect(holeX - hole.size / 2, holeY - hole.size / 2, hole.size, hole.size);
                    break;

                case 'star':
                    this.ctx.translate(holeX, holeY);
                    this.drawStar(0, 0, 5, hole.size / 2, hole.size / 4);
                    this.ctx.stroke();
                    break;
            }
            this.ctx.restore();
        }

        const shineGradient = this.ctx.createLinearGradient(frame.x, frame.y, frame.x + frame.width, frame.y);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shineGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.25)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        shineGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = shineGradient;
        this.roundRect(frame.x + 10, frame.y + 3, frame.width - 20, 8, 4);
        this.ctx.fill();

        if (this.frameGlowIntensity > 0 && !this.frameTransitioning) {
            this.ctx.save();
            this.ctx.strokeStyle = `rgba(0, 255, 100, ${this.frameGlowIntensity})`;
            this.ctx.lineWidth = 4;
            this.ctx.shadowColor = '#00ff64';
            this.ctx.shadowBlur = 25;
            this.roundRect(frame.x, frame.y, frame.width, frame.height, 12);
            this.ctx.stroke();
            this.ctx.restore();
        }

        if (this.activePowerUp && this.activePowerUp.type === 'shield') {
            this.ctx.save();
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(Date.now() * 0.008) * 0.2})`;
            this.ctx.lineWidth = 6;
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 30;
            this.roundRect(frame.x - 5, frame.y - 5, frame.width + 10, frame.height + 10, 15);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
