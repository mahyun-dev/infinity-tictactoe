// ============================================
// Game State Management
// ============================================
class InfinityTicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 1; // 1 for Player 1 (Blue), 2 for Player 2/AI (Pink)
        this.player1Queue = []; // FIFO queue for Player 1's stone positions
        this.player2Queue = []; // FIFO queue for Player 2's stone positions
        this.gameMode = null; // 'pvp', 'pve-easy', 'pve-hard'
        this.gameOver = false;
        this.isAIThinking = false; // Prevent multiple AI moves
        this.maxStones = 3;
        
        this.initializeEventListeners();
    }

    // ============================================
    // Initialization
    // ============================================
    initializeEventListeners() {
        // Mode selection
        document.getElementById('pvpBtn').addEventListener('click', () => this.startGame('pvp'));
        document.getElementById('pveEasyBtn').addEventListener('click', () => this.startGame('pve-easy'));
        document.getElementById('pveHardBtn').addEventListener('click', () => this.startGame('pve-hard'));
        
        // Control buttons
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('changeModeBtn').addEventListener('click', () => this.showModeSelection());
        
        // Modal buttons
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideModal();
            this.restartGame();
        });
        document.getElementById('changeModeBtnModal').addEventListener('click', () => {
            this.hideModal();
            this.showModeSelection();
        });
        
        // Board cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
    }

    // ============================================
    // Game Flow
    // ============================================
    startGame(mode) {
        this.gameMode = mode;
        this.resetGameState();
        
        // Update UI
        document.getElementById('modeSelection').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        
        // Update mode badge
        const modeBadge = document.getElementById('modeBadge');
        switch(mode) {
            case 'pvp':
                modeBadge.textContent = 'PvP Mode';
                break;
            case 'pve-easy':
                modeBadge.textContent = 'PvE (Easy)';
                break;
            case 'pve-hard':
                modeBadge.textContent = 'PvE (Hard)';
                break;
        }
        
        // Update player 2 label for AI
        const player2Label = document.querySelector('.player2-info .player-label');
        if (mode.startsWith('pve')) {
            player2Label.textContent = 'AI';
        } else {
            player2Label.textContent = 'Player 2';
        }
        
        this.updateUI();
    }

    resetGameState() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 1;
        this.player1Queue = [];
        this.player2Queue = [];
        this.gameOver = false;
        this.isAIThinking = false;
        
        // Clear board visually
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateUI();
    }

    restartGame() {
        this.resetGameState();
    }

    showModeSelection() {
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('modeSelection').style.display = 'block';
        this.resetGameState();
    }

    // ============================================
    // Game Logic
    // ============================================
    handleCellClick(index) {
        // Validate move
        if (this.gameOver || this.board[index] !== null || this.isAIThinking) {
            return;
        }
        
        // Check if game mode is selected
        if (!this.gameMode) {
            return;
        }
        
        // Check if it's AI's turn (prevent manual click during AI turn)
        if (this.gameMode.startsWith('pve') && this.currentPlayer === 2) {
            return;
        }
        
        this.makeMove(index);
    }

    makeMove(index) {
        const queue = this.currentPlayer === 1 ? this.player1Queue : this.player2Queue;
        
        // Handle FIFO: Remove oldest stone if player has 3 stones
        if (queue.length >= this.maxStones) {
            const oldestPosition = queue.shift();
            this.removeStone(oldestPosition);
        }
        
        // Place new stone
        this.board[index] = this.currentPlayer;
        queue.push(index);
        this.placeStone(index);
        
        // Update oldest stone indicator
        this.updateOldestStoneIndicator();
        
        // Check for winner
        if (this.checkWinner()) {
            this.handleWin();
            return;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateUI();
        
        // AI turn
        if (this.gameMode.startsWith('pve') && this.currentPlayer === 2) {
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
    }

    makeAIMove() {
        if (this.gameOver || this.isAIThinking) return;
        
        this.isAIThinking = true;
        
        let move;
        if (this.gameMode === 'pve-easy') {
            move = AI.getEasyMove(this.board);
        } else {
            move = AI.getHardMove(this.board, this.player1Queue, this.player2Queue);
        }
        
        if (move !== -1) {
            this.makeMove(move);
        }
        
        this.isAIThinking = false;
    }

    placeStone(index) {
        const cell = document.querySelectorAll('.cell')[index];
        cell.classList.add('filled');
        cell.classList.add(`player${this.currentPlayer}`);
        cell.textContent = this.currentPlayer === 1 ? '●' : '▲';
    }

    removeStone(index) {
        const cell = document.querySelectorAll('.cell')[index];
        
        // Immediately update board state
        this.board[index] = null;
        
        // Add removing animation
        cell.classList.add('removing');
        
        // Clean up after animation
        setTimeout(() => {
            cell.textContent = '';
            cell.className = 'cell';
        }, 500);
    }

    updateOldestStoneIndicator() {
        // Remove all oldest indicators
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('oldest');
        });
        
        // Show oldest stone for both players if they have 3 stones
        // This helps players see which stones will disappear next
        if (this.player1Queue.length >= this.maxStones) {
            const oldestIndex = this.player1Queue[0];
            const cell = document.querySelectorAll('.cell')[oldestIndex];
            cell.classList.add('oldest');
        }
        
        if (this.player2Queue.length >= this.maxStones) {
            const oldestIndex = this.player2Queue[0];
            const cell = document.querySelectorAll('.cell')[oldestIndex];
            cell.classList.add('oldest');
        }
    }

    // ============================================
    // Win Detection
    // ============================================
    checkWinner() {
        const winPatterns = [
            [0, 1, 2], // Top row
            [3, 4, 5], // Middle row
            [6, 7, 8], // Bottom row
            [0, 3, 6], // Left column
            [1, 4, 7], // Middle column
            [2, 5, 8], // Right column
            [0, 4, 8], // Diagonal \
            [2, 4, 6]  // Diagonal /
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                this.winningPattern = pattern;
                return true;
            }
        }
        
        return false;
    }

    handleWin() {
        this.gameOver = true;
        
        // Highlight winning cells
        this.winningPattern.forEach(index => {
            const cell = document.querySelectorAll('.cell')[index];
            cell.classList.add('winning');
        });
        
        // Show modal after animation
        setTimeout(() => {
            this.showWinModal();
        }, 600);
    }

    showWinModal() {
        const modal = document.getElementById('winModal');
        const winTitle = document.getElementById('winTitle');
        const winIcon = document.getElementById('winIcon');
        
        if (this.currentPlayer === 1) {
            winTitle.textContent = 'Player 1 Wins! 🎉';
            winTitle.style.color = 'var(--player1-color)';
        } else {
            if (this.gameMode.startsWith('pve')) {
                winTitle.textContent = 'AI Wins! 🤖';
            } else {
                winTitle.textContent = 'Player 2 Wins! 🎉';
            }
            winTitle.style.color = 'var(--player2-color)';
        }
        
        modal.classList.add('show');
    }

    hideModal() {
        const modal = document.getElementById('winModal');
        modal.classList.remove('show');
    }

    // ============================================
    // UI Updates
    // ============================================
    updateUI() {
        this.updateTurnIndicator();
        this.updateStoneCounter();
    }

    updateTurnIndicator() {
        const turnIndicator = document.getElementById('turnIndicator').querySelector('.current-turn');
        
        if (this.gameOver) {
            turnIndicator.textContent = 'Game Over';
            return;
        }
        
        if (this.currentPlayer === 1) {
            turnIndicator.textContent = "Player 1's Turn";
            turnIndicator.style.color = 'var(--player1-color)';
        } else {
            if (this.gameMode.startsWith('pve')) {
                turnIndicator.textContent = "AI's Turn";
            } else {
                turnIndicator.textContent = "Player 2's Turn";
            }
            turnIndicator.style.color = 'var(--player2-color)';
        }
    }

    updateStoneCounter() {
        // Update Player 1 stones
        const player1Dots = document.getElementById('player1Stones').querySelectorAll('.stone-dot');
        player1Dots.forEach((dot, index) => {
            if (index < this.player1Queue.length) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update Player 2 stones
        const player2Dots = document.getElementById('player2Stones').querySelectorAll('.stone-dot');
        player2Dots.forEach((dot, index) => {
            if (index < this.player2Queue.length) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// ============================================
// Initialize Game
// ============================================
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new InfinityTicTacToe();
});
