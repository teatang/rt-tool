import { describe, it, expect, beforeEach } from 'vitest'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  createEmptyBoard,
  createInitialState,
  getRandomTetromino,
  getTetrominoShape,
  getTetrominoColor,
  checkCollision,
  lockPiece,
  clearLines,
  calculateScore,
  calculateLevel,
  movePiece,
  rotatePiece,
  hardDrop,
  softDrop,
  spawnPiece,
  lockAndClearLines,
  getGhostY,
  gameTick,
  startNewGame,
  togglePause,
  TETROMINO_SHAPES
} from './tetris'

describe('tetris utils', () => {
  describe('createEmptyBoard', () => {
    it('should create empty board with correct dimensions', () => {
      const board = createEmptyBoard()
      expect(board.length).toBe(BOARD_HEIGHT)
      expect(board[0].length).toBe(BOARD_WIDTH)
    })

    it('should create board filled with null', () => {
      const board = createEmptyBoard()
      board.forEach(row => {
        row.forEach(cell => {
          expect(cell).toBeNull()
        })
      })
    })
  })

  describe('createInitialState', () => {
    it('should create initial state with empty board', () => {
      const state = createInitialState()
      expect(state.board.length).toBe(BOARD_HEIGHT)
      expect(state.currentPiece).toBeNull()
    })

    it('should have zero score and level 1', () => {
      const state = createInitialState()
      expect(state.score).toBe(0)
      expect(state.level).toBe(1)
      expect(state.lines).toBe(0)
    })

    it('should not be game over or paused initially', () => {
      const state = createInitialState()
      expect(state.isGameOver).toBe(false)
      expect(state.isPaused).toBe(false)
    })
  })

  describe('getRandomTetromino', () => {
    it('should return a valid tetromino type', () => {
      const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
      for (let i = 0; i < 100; i++) {
        const piece = getRandomTetromino()
        expect(types).toContain(piece)
      }
    })
  })

  describe('getTetrominoShape', () => {
    it('should return correct shape for I piece rotation 0', () => {
      const shape = getTetrominoShape('I', 0)
      expect(shape).toEqual([
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ])
    })

    it('should return correct shape for T piece rotation 1', () => {
      const shape = getTetrominoShape('T', 1)
      expect(shape).toEqual([
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
      ])
    })

    it('should handle rotation wrapping', () => {
      const shape0 = getTetrominoShape('T', 0)
      const shape4 = getTetrominoShape('T', 4)
      expect(shape0).toEqual(shape4)
    })
  })

  describe('getTetrominoColor', () => {
    it('should return correct colors', () => {
      expect(getTetrominoColor('I')).toBe('#00d4ff')
      expect(getTetrominoColor('O')).toBe('#ffd700')
      expect(getTetrominoColor('T')).toBe('#da70d6')
    })
  })

  describe('checkCollision', () => {
    let board: ReturnType<typeof createEmptyBoard>

    beforeEach(() => {
      board = createEmptyBoard()
    })

    it('should return false when no collision', () => {
      const collision = checkCollision(board, 'T', 3, 0, 0)
      expect(collision).toBe(false)
    })

    it('should detect wall collision on left', () => {
      const collision = checkCollision(board, 'T', -1, 0, 0)
      expect(collision).toBe(true)
    })

    it('should detect wall collision on right', () => {
      const collision = checkCollision(board, 'T', BOARD_WIDTH - 2, 0, 0)
      expect(collision).toBe(true)
    })

    it('should detect floor collision', () => {
      const collision = checkCollision(board, 'T', 3, BOARD_HEIGHT, 0)
      expect(collision).toBe(true)
    })

    it('should detect collision with locked piece', () => {
      board[19][5] = 'I'
      const collision = checkCollision(board, 'T', 4, 18, 0)
      expect(collision).toBe(true)
    })

    it('should not detect collision when piece is above locked piece', () => {
      board[19][5] = 'I'
      const collision = checkCollision(board, 'T', 4, 17, 0)
      expect(collision).toBe(false)
    })
  })

  describe('lockPiece', () => {
    let board: ReturnType<typeof createEmptyBoard>

    beforeEach(() => {
      board = createEmptyBoard()
    })

    it('should lock piece onto board', () => {
      const newBoard = lockPiece(board, 'O', 0, 0, 0)
      expect(newBoard[0][0]).toBe('O')
      expect(newBoard[0][1]).toBe('O')
      expect(newBoard[1][0]).toBe('O')
      expect(newBoard[1][1]).toBe('O')
    })

    it('should not modify original board', () => {
      lockPiece(board, 'O', 0, 0, 0)
      expect(board[0][0]).toBeNull()
    })

    it('should handle piece partially above board', () => {
      const newBoard = lockPiece(board, 'I', 3, -1, 0)
      expect(newBoard[0][3]).toBe('I')
      expect(newBoard[0][4]).toBe('I')
      expect(newBoard[0][5]).toBe('I')
      expect(newBoard[0][6]).toBe('I')
    })
  })

  describe('clearLines', () => {
    it('should return empty board when no lines to clear', () => {
      const board = createEmptyBoard()
      const { newBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(0)
      expect(newBoard.length).toBe(BOARD_HEIGHT)
    })

    it('should clear a full line', () => {
      const board = createEmptyBoard()
      // Fill bottom row with pieces
      for (let i = 0; i < BOARD_WIDTH; i++) {
        board[BOARD_HEIGHT - 1][i] = 'I'
      }
      const { newBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(1)
      expect(newBoard[BOARD_HEIGHT - 1].every(c => c === null)).toBe(true)
    })

    it('should clear multiple lines', () => {
      const board = createEmptyBoard()
      // Fill bottom two rows
      for (let row = BOARD_HEIGHT - 2; row <= BOARD_HEIGHT - 1; row++) {
        for (let i = 0; i < BOARD_WIDTH; i++) {
          board[row][i] = 'I'
        }
      }
      const { linesCleared } = clearLines(board)
      expect(linesCleared).toBe(2)
    })
  })

  describe('calculateScore', () => {
    it('should return 0 for 0 lines', () => {
      expect(calculateScore(0, 1)).toBe(0)
    })

    it('should return 100 for 1 line at level 1', () => {
      expect(calculateScore(1, 1)).toBe(100)
    })

    it('should return 300 for 2 lines at level 1', () => {
      expect(calculateScore(2, 1)).toBe(300)
    })

    it('should return 500 for 3 lines at level 1', () => {
      expect(calculateScore(3, 1)).toBe(500)
    })

    it('should return 800 for 4 lines at level 1', () => {
      expect(calculateScore(4, 1)).toBe(800)
    })

    it('should multiply score by level', () => {
      expect(calculateScore(1, 2)).toBe(200)
      expect(calculateScore(2, 3)).toBe(900)
    })
  })

  describe('calculateLevel', () => {
    it('should return 1 for 0 lines', () => {
      expect(calculateLevel(0)).toBe(1)
    })

    it('should return 1 for 9 lines', () => {
      expect(calculateLevel(9)).toBe(1)
    })

    it('should return 2 for 10 lines', () => {
      expect(calculateLevel(10)).toBe(2)
    })

    it('should return 3 for 20 lines', () => {
      expect(calculateLevel(20)).toBe(3)
    })
  })

  describe('movePiece', () => {
    let state: ReturnType<typeof createInitialState>

    beforeEach(() => {
      state = {
        ...createInitialState(),
        currentPiece: 'T',
        currentX: 3,
        currentY: 5,
        currentRotation: 0
      }
    })

    it('should move piece right', () => {
      const newState = movePiece(state, 1, 0)
      expect(newState.currentX).toBe(4)
    })

    it('should move piece left', () => {
      const newState = movePiece(state, -1, 0)
      expect(newState.currentX).toBe(2)
    })

    it('should move piece down', () => {
      const newState = movePiece(state, 0, 1)
      expect(newState.currentY).toBe(6)
    })

    it('should not move when paused', () => {
      const pausedState = { ...state, isPaused: true }
      const newState = movePiece(pausedState, 1, 0)
      expect(newState.currentX).toBe(3)
    })

    it('should not move when game over', () => {
      const gameOverState = { ...state, isGameOver: true }
      const newState = movePiece(gameOverState, 1, 0)
      expect(newState.currentX).toBe(3)
    })

    it('should not move into collision', () => {
      // T piece at x=3, y=5, rotation 0 occupies:
      // (4,5), (3,6), (4,6), (5,6)
      // Put a blocker at (5, 6) - bottom row center
      state.board[6][5] = 'I'
      const newState = movePiece(state, 1, 0)
      expect(newState.currentX).toBe(3)
    })
  })

  describe('rotatePiece', () => {
    let state: ReturnType<typeof createInitialState>

    beforeEach(() => {
      state = {
        ...createInitialState(),
        currentPiece: 'T',
        currentX: 3,
        currentY: 5,
        currentRotation: 0
      }
    })

    it('should rotate piece', () => {
      const newState = rotatePiece(state)
      expect(newState.currentRotation).toBe(1)
    })

    it('should not rotate when paused', () => {
      const pausedState = { ...state, isPaused: true }
      const newState = rotatePiece(pausedState)
      expect(newState.currentRotation).toBe(0)
    })

    it('should wrap rotation from 3 to 0', () => {
      state.currentRotation = 3
      const newState = rotatePiece(state)
      expect(newState.currentRotation).toBe(0)
    })
  })

  describe('hardDrop', () => {
    it('should move piece to bottom', () => {
      const state: ReturnType<typeof createInitialState> = {
        ...createInitialState(),
        currentPiece: 'I',
        currentX: 3,
        currentY: 0,
        currentRotation: 0
      }
      // I piece has blocks at y+1, so it drops until y+1 = 19 (bottom)
      // meaning y = 18
      const newState = hardDrop(state)
      expect(newState.currentY).toBe(BOARD_HEIGHT - 2)
    })
  })

  describe('softDrop', () => {
    it('should move piece down by one', () => {
      const state: ReturnType<typeof createInitialState> = {
        ...createInitialState(),
        currentPiece: 'T',
        currentX: 3,
        currentY: 5,
        currentRotation: 0
      }
      const newState = softDrop(state)
      expect(newState.currentY).toBe(6)
    })
  })

  describe('spawnPiece', () => {
    it('should spawn piece in center', () => {
      const state = createInitialState()
      const newState = spawnPiece(state)
      expect(newState.currentPiece).not.toBeNull()
      expect(newState.nextPiece).not.toBeNull()
    })
  })

  describe('lockAndClearLines', () => {
    it('should lock current piece', () => {
      const state: ReturnType<typeof createInitialState> = {
        ...createInitialState(),
        currentPiece: 'O',
        currentX: 0,
        currentY: BOARD_HEIGHT - 2,
        currentRotation: 0
      }
      const newState = lockAndClearLines(state)
      expect(newState.board[BOARD_HEIGHT - 2][0]).toBe('O')
      expect(newState.currentPiece).toBeNull()
    })
  })

  describe('togglePause', () => {
    it('should toggle pause state', () => {
      const state = createInitialState()
      expect(state.isPaused).toBe(false)
      const pausedState = togglePause(state)
      expect(pausedState.isPaused).toBe(true)
      const unpausedState = togglePause(pausedState)
      expect(unpausedState.isPaused).toBe(false)
    })
  })

  describe('startNewGame', () => {
    it('should return state with current piece', () => {
      const state = startNewGame()
      expect(state.currentPiece).not.toBeNull()
      expect(state.isGameOver).toBe(false)
      expect(state.isPaused).toBe(false)
      expect(state.score).toBe(0)
    })
  })

  describe('gameTick', () => {
    it('should spawn piece on first tick', () => {
      const state = createInitialState()
      const newState = gameTick(state)
      expect(newState.currentPiece).not.toBeNull()
    })

    it('should not progress when paused', () => {
      const state: ReturnType<typeof createInitialState> = {
        ...createInitialState(),
        currentPiece: 'T',
        currentX: 3,
        currentY: 5,
        isPaused: true
      }
      const newState = gameTick(state)
      expect(newState.currentY).toBe(5)
    })

    it('should not progress when game over', () => {
      const state: ReturnType<typeof createInitialState> = {
        ...createInitialState(),
        currentPiece: 'T',
        currentX: 3,
        currentY: 5,
        isGameOver: true
      }
      const newState = gameTick(state)
      expect(newState.isGameOver).toBe(true)
    })
  })

  describe('TETROMINO_SHAPES', () => {
    it('should have all rotation states for each piece', () => {
      const types: Array<keyof typeof TETROMINO_SHAPES> = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
      types.forEach(type => {
        expect(TETROMINO_SHAPES[type].length).toBe(4)
      })
    })

    it('should have correct shape dimensions for O piece', () => {
      const shape = TETROMINO_SHAPES.O[0]
      expect(shape.length).toBe(2)
      expect(shape[0].length).toBe(2)
    })
  })

  describe('getGhostY', () => {
    it('should return 0 when no piece is active', () => {
      const state = createInitialState()
      expect(getGhostY(state)).toBe(0)
    })

    it('should return current Y when piece is at bottom', () => {
      const state: ReturnType<typeof createInitialState> = {
        ...createInitialState(),
        currentPiece: 'O',
        currentX: 0,
        currentY: BOARD_HEIGHT - 2,
        currentRotation: 0
      }
      expect(getGhostY(state)).toBe(BOARD_HEIGHT - 2)
    })

    it('should calculate correct ghost position with empty board', () => {
      const state: ReturnType<typeof createInitialState> = {
        ...createInitialState(),
        currentPiece: 'I',
        currentX: 3,
        currentY: 0,
        currentRotation: 0
      }
      // I piece at rotation 0 has blocks at y+1, so ghost should be at BOARD_HEIGHT - 2
      expect(getGhostY(state)).toBe(BOARD_HEIGHT - 2)
    })

    it('should stop at locked pieces', () => {
      const board = createEmptyBoard()
      // Place a blocker at position (5, 17)
      board[BOARD_HEIGHT - 2][5] = 'I'

      const state = {
        board,
        currentPiece: 'T' as const,
        currentX: 4,
        currentY: 10,
        currentRotation: 0
      }

      const ghostY = getGhostY(state)
      // T rotation 0 has blocks at y+1 (bottom row), so ghost stops at y=16 (one above blocker at 17)
      expect(ghostY).toBe(16)
    })
  })
})
