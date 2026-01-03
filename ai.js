// ============================================
// AI Logic for Infinity Tic-Tac-Toe
// ============================================
const AI = {
    // ============================================
    // Easy Mode: Random Move
    // ============================================
    getEasyMove(board) {
        const emptyCells = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                emptyCells.push(i);
            }
        }
        
        if (emptyCells.length === 0) return -1;
        
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    },

    // ============================================
    // Hard Mode: Strategic AI
    // ============================================
    getHardMove(board, player1Queue, player2Queue) {
        // Strategy priority:
        // 1. Win if possible
        // 2. Block opponent's winning move
        // 3. Take center if available
        // 4. Take corner
        // 5. Strategic move based on opponent's stones
        
        // Check if there are any empty cells
        const hasEmptyCells = board.some(cell => cell === null);
        if (!hasEmptyCells) {
            return -1;
        }
        
        // 1. Check if AI can win
        const winMove = this.findWinningMove(board, 2);
        if (winMove !== -1) return winMove;
        
        // 2. Block opponent's winning move
        const blockMove = this.findWinningMove(board, 1);
        if (blockMove !== -1) return blockMove;
        
        // 3. Take center if available
        if (board[4] === null) return 4;
        
        // 4. Strategic positioning considering the infinity rule
        const strategicMove = this.findStrategicMove(board, player1Queue, player2Queue);
        if (strategicMove !== -1) return strategicMove;
        
        // 5. Take any corner
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (board[corner] === null) return corner;
        }
        
        // 6. Take any edge
        const edges = [1, 3, 5, 7];
        for (let edge of edges) {
            if (board[edge] === null) return edge;
        }
        
        // Fallback to random
        return this.getEasyMove(board);
    },

    // ============================================
    // Find Winning Move
    // ============================================
    findWinningMove(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const values = [board[a], board[b], board[c]];
            
            // Check if this pattern has 2 of player's stones and 1 empty
            const playerCount = values.filter(v => v === player).length;
            const emptyCount = values.filter(v => v === null).length;
            
            if (playerCount === 2 && emptyCount === 1) {
                // Find the empty position
                if (board[a] === null) return a;
                if (board[b] === null) return b;
                if (board[c] === null) return c;
            }
        }
        
        return -1;
    },

    // ============================================
    // Find Strategic Move
    // ============================================
    findStrategicMove(board, player1Queue, player2Queue) {
        // Consider opponent's oldest stone (which will disappear next)
        if (player1Queue.length >= 3) {
            const opponentOldestPos = player1Queue[0];
            
            // If opponent's oldest stone is part of a potential winning line,
            // we might want to wait or position strategically
            const strategicPositions = this.getStrategicPositionsNearCell(opponentOldestPos, board);
            for (let pos of strategicPositions) {
                if (board[pos] === null) return pos;
            }
        }
        
        // Look for positions that create multiple threats
        const forkMove = this.findForkMove(board, 2);
        if (forkMove !== -1) return forkMove;
        
        // Block opponent's fork
        const blockForkMove = this.findForkMove(board, 1);
        if (blockForkMove !== -1) return blockForkMove;
        
        return -1;
    },

    // ============================================
    // Get Strategic Positions Near a Cell
    // ============================================
    getStrategicPositionsNearCell(cellIndex, board) {
        // Get positions that form lines with the given cell
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];
        
        const strategicPositions = [];
        
        for (let pattern of winPatterns) {
            if (pattern.includes(cellIndex)) {
                pattern.forEach(pos => {
                    if (pos !== cellIndex && board[pos] === null) {
                        strategicPositions.push(pos);
                    }
                });
            }
        }
        
        return strategicPositions;
    },

    // ============================================
    // Find Fork Move (Create Multiple Winning Threats)
    // ============================================
    findForkMove(board, player) {
        // A fork is a move that creates two winning opportunities
        for (let i = 0; i < board.length; i++) {
            if (board[i] !== null) continue;
            
            // Simulate placing stone at position i
            const testBoard = [...board];
            testBoard[i] = player;
            
            // Count how many winning moves this creates
            let winningMoves = 0;
            for (let j = 0; j < testBoard.length; j++) {
                if (testBoard[j] === null) {
                    const testBoard2 = [...testBoard];
                    testBoard2[j] = player;
                    if (this.checkWin(testBoard2, player)) {
                        winningMoves++;
                    }
                }
            }
            
            // If this creates 2 or more winning opportunities, it's a fork
            if (winningMoves >= 2) {
                return i;
            }
        }
        
        return -1;
    },

    // ============================================
    // Check Win Helper
    // ============================================
    checkWin(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === player && 
                board[b] === player && 
                board[c] === player) {
                return true;
            }
        }
        
        return false;
    },

    // ============================================
    // Advanced: Minimax with Infinity Rule
    // ============================================
    minimax(board, player1Queue, player2Queue, depth, isMaximizing, alpha, beta) {
        // This is a simplified minimax - full implementation would need
        // to consider the FIFO queue mechanics, which adds significant complexity
        
        const maxDepth = 4; // Limit depth for performance
        
        if (depth >= maxDepth) {
            return this.evaluateBoard(board, player1Queue, player2Queue);
        }
        
        // Check terminal states
        if (this.checkWin(board, 2)) return 10 - depth;
        if (this.checkWin(board, 1)) return depth - 10;
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    const newBoard = [...board];
                    newBoard[i] = 2;
                    
                    const evaluation = this.minimax(newBoard, player1Queue, player2Queue, 
                                             depth + 1, false, alpha, beta);
                    maxEval = Math.max(maxEval, evaluation);
                    alpha = Math.max(alpha, evaluation);
                    
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    const newBoard = [...board];
                    newBoard[i] = 1;
                    
                    const evaluation = this.minimax(newBoard, player1Queue, player2Queue, 
                                             depth + 1, true, alpha, beta);
                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }
            return minEval;
        }
    },

    // ============================================
    // Evaluate Board State
    // ============================================
    evaluateBoard(board, player1Queue, player2Queue) {
        let score = 0;
        
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const values = [board[a], board[b], board[c]];
            
            const ai2Count = values.filter(v => v === 2).length;
            const player1Count = values.filter(v => v === 1).length;
            const emptyCount = values.filter(v => v === null).length;
            
            // Score for AI (player 2)
            if (ai2Count === 3) score += 100;
            else if (ai2Count === 2 && emptyCount === 1) score += 10;
            else if (ai2Count === 1 && emptyCount === 2) score += 1;
            
            // Score against player 1
            if (player1Count === 3) score -= 100;
            else if (player1Count === 2 && emptyCount === 1) score -= 10;
            else if (player1Count === 1 && emptyCount === 2) score -= 1;
        }
        
        // Bonus for center control
        if (board[4] === 2) score += 3;
        if (board[4] === 1) score -= 3;
        
        // Bonus for corners
        const corners = [0, 2, 6, 8];
        corners.forEach(corner => {
            if (board[corner] === 2) score += 2;
            if (board[corner] === 1) score -= 2;
        });
        
        return score;
    }
};
