// Tetris 游戏核心逻辑

// 游戏板尺寸
export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

// 方块类型 (I, O, T, S, Z, J, L)
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

// 方块形状定义 (每个旋转状态)
export type TetrominoShapes = number[][][]

// 方块颜色
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
}

// 方块形状定义 - 每个数组代表一个旋转状态
export const TETROMINO_SHAPES: Record<TetrominoType, TetrominoShapes> = {
  I: [
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
  ],
  O: [
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]]
  ],
  T: [
    [[0,1,0], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,1], [0,1,0]],
    [[0,1,0], [1,1,0], [0,1,0]]
  ],
  S: [
    [[0,1,1], [1,1,0], [0,0,0]],
    [[0,1,0], [0,1,1], [0,0,1]],
    [[0,0,0], [0,1,1], [1,1,0]],
    [[1,0,0], [1,1,0], [0,1,0]]
  ],
  Z: [
    [[1,1,0], [0,1,1], [0,0,0]],
    [[0,0,1], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,0], [0,1,1]],
    [[0,1,0], [1,1,0], [1,0,0]]
  ],
  J: [
    [[1,0,0], [1,1,1], [0,0,0]],
    [[0,1,1], [0,1,0], [0,1,0]],
    [[0,0,0], [1,1,1], [0,0,1]],
    [[0,1,0], [0,1,0], [1,1,0]]
  ],
  L: [
    [[0,0,1], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,0], [0,1,1]],
    [[0,0,0], [1,1,1], [1,0,0]],
    [[1,1,0], [0,1,0], [0,1,0]]
  ]
}

// 游戏状态
export interface GameState {
  board: (TetrominoType | null)[][]
  currentPiece: TetrominoType | null
  currentX: number
  currentY: number
  currentRotation: number
  score: number
  level: number
  lines: number
  nextPiece: TetrominoType | null
  isGameOver: boolean
  isPaused: boolean
  justLocked: boolean  // 方块刚刚锁定
}

// 初始化空游戏板
export function createEmptyBoard(): (TetrominoType | null)[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  )
}

// 创建初始游戏状态
export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPiece: null,
    currentX: 0,
    currentY: 0,
    currentRotation: 0,
    score: 0,
    level: 1,
    lines: 0,
    nextPiece: null,
    isGameOver: false,
    isPaused: false,
    justLocked: false
  }
}

// 获取随机方块类型
export function getRandomTetromino(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
  return types[Math.floor(Math.random() * types.length)]
}

// 获取方块形状
export function getTetrominoShape(type: TetrominoType, rotation: number): number[][] {
  const shapes = TETROMINO_SHAPES[type]
  return shapes[rotation % 4]
}

// 获取方块颜色
export function getTetrominoColor(type: TetrominoType): string {
  return TETROMINO_COLORS[type]
}

// 检测碰撞
export function checkCollision(
  board: (TetrominoType | null)[][],
  pieceType: TetrominoType,
  x: number,
  y: number,
  rotation: number
): boolean {
  const shape = getTetrominoShape(pieceType, rotation)

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = x + col
        const boardY = y + row

        // 检测边界碰撞
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return true
        }

        // 检测与已放置方块的碰撞 (只检测屏幕内的)
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true
        }
      }
    }
  }

  return false
}

// 锁定方块到游戏板
export function lockPiece(
  board: (TetrominoType | null)[][],
  pieceType: TetrominoType,
  x: number,
  y: number,
  rotation: number
): (TetrominoType | null)[][] {
  const newBoard = board.map(row => [...row])
  const shape = getTetrominoShape(pieceType, rotation)

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardY = y + row
        const boardX = x + col
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = pieceType
        }
      }
    }
  }

  return newBoard
}

// 消除满行并返回新的游戏板和消除的行数
export function clearLines(board: (TetrominoType | null)[][]): {
  newBoard: (TetrominoType | null)[][]
  linesCleared: number
} {
  let linesCleared = 0
  const newBoard = board.filter(row => row.some(cell => cell === null))

  linesCleared = BOARD_HEIGHT - newBoard.length

  // 添加空行到顶部
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null))
  }

  return { newBoard, linesCleared }
}

// 计算得分
export function calculateScore(linesCleared: number, level: number): number {
  const lineScores = [0, 100, 300, 500, 800]
  return lineScores[Math.min(linesCleared, 4)] * level
}

// 计算等级 (每消除10行升一级)
export function calculateLevel(lines: number): number {
  return Math.floor(lines / 10) + 1
}

// 移动方块
export function movePiece(
  state: GameState,
  dx: number,
  dy: number
): GameState {
  if (state.isGameOver || state.isPaused || !state.currentPiece) {
    return state
  }

  const newX = state.currentX + dx
  const newY = state.currentY + dy

  if (!checkCollision(state.board, state.currentPiece, newX, newY, state.currentRotation)) {
    return {
      ...state,
      currentX: newX,
      currentY: newY
    }
  }

  return state
}

// 旋转方块
export function rotatePiece(state: GameState): GameState {
  if (state.isGameOver || state.isPaused || !state.currentPiece) {
    return state
  }

  const newRotation = (state.currentRotation + 1) % 4

  // 尝试直接旋转
  if (!checkCollision(state.board, state.currentPiece, state.currentX, state.currentY, newRotation)) {
    return {
      ...state,
      currentRotation: newRotation
    }
  }

  // 尝试左右偏移来适应墙壁
  const kicks = [-1, 1, -2, 2]
  for (const kick of kicks) {
    if (!checkCollision(state.board, state.currentPiece, state.currentX + kick, state.currentY, newRotation)) {
      return {
        ...state,
        currentX: state.currentX + kick,
        currentRotation: newRotation
      }
    }
  }

  return state
}

// 硬降 (直接落到底部)
export function hardDrop(state: GameState): GameState {
  if (state.isGameOver || state.isPaused || !state.currentPiece) {
    return state
  }

  let newY = state.currentY
  while (!checkCollision(state.board, state.currentPiece, state.currentX, newY + 1, state.currentRotation)) {
    newY++
  }

  return {
    ...state,
    currentY: newY
  }
}

// 软降 (下落一格)
export function softDrop(state: GameState): GameState {
  return movePiece(state, 0, 1)
}

// 放置新方块
export function spawnPiece(state: GameState): GameState {
  const pieceType = state.nextPiece || getRandomTetromino()
  const nextPiece = getRandomTetromino()

  // 计算初始位置 (居中)
  const shape = getTetrominoShape(pieceType, 0)
  const startX = Math.floor((BOARD_WIDTH - shape[0].length) / 2)
  const startY = pieceType === 'I' ? -1 : 0

  // 检查游戏结束
  if (checkCollision(state.board, pieceType, startX, startY, 0)) {
    return {
      ...state,
      currentPiece: pieceType,
      currentX: startX,
      currentY: startY,
      currentRotation: 0,
      nextPiece,
      isGameOver: true,
      justLocked: false
    }
  }

  return {
    ...state,
    currentPiece: pieceType,
    currentX: startX,
    currentY: startY,
    currentRotation: 0,
    nextPiece,
    justLocked: false
  }
}

// 处理方块落到底部后的逻辑
export function lockAndClearLines(state: GameState): GameState {
  if (!state.currentPiece) return state

  // 锁定方块
  let newBoard = lockPiece(
    state.board,
    state.currentPiece,
    state.currentX,
    state.currentY,
    state.currentRotation
  )

  // 消除满行
  const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
  newBoard = clearedBoard

  // 计算新得分和等级
  const newLines = state.lines + linesCleared
  const newLevel = calculateLevel(newLines)
  const scoreGain = calculateScore(linesCleared, state.level)

  return {
    ...state,
    board: newBoard,
    score: state.score + scoreGain,
    lines: newLines,
    level: newLevel,
    currentPiece: null,
    justLocked: true
  }
}

// 游戏主循环一步
export function gameTick(state: GameState): GameState {
  if (state.isGameOver || state.isPaused) {
    return state
  }

  // 如果没有当前方块,生成新方块
  if (!state.currentPiece) {
    const newState = spawnPiece(state)
    if (newState.isGameOver) {
      return newState
    }
    // 检查新生成的方块是否立即碰撞
    if (checkCollision(newState.board, newState.currentPiece!, newState.currentX, newState.currentY + 1, newState.currentRotation)) {
      return lockAndClearLines(newState)
    }
    return newState
  }

  // 尝试下落
  const movedState = movePiece(state, 0, 1)

  if (movedState.currentY === state.currentY) {
    // 方块无法下落,锁定方块
    const lockedState = lockAndClearLines(movedState)
    // 生成新方块
    return spawnPiece(lockedState)
  }

  return movedState
}

// 开始新游戏
export function startNewGame(): GameState {
  return spawnPiece(createInitialState())
}

// 暂停/继续游戏
export function togglePause(state: GameState): GameState {
  return {
    ...state,
    isPaused: !state.isPaused
  }
}

// 计算幽灵方块的 Y 位置 (方块落到底部的位置)
export function getGhostY(
  state: Pick<GameState, 'board' | 'currentPiece' | 'currentX' | 'currentY' | 'currentRotation'>
): number {
  if (!state.currentPiece) return 0

  let ghostY = state.currentY
  while (!checkCollision(state.board, state.currentPiece, state.currentX, ghostY + 1, state.currentRotation)) {
    ghostY++
  }
  return ghostY
}
