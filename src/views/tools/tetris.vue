<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Grid } from '@element-plus/icons-vue'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TetrominoType,
  getTetrominoColor,
  getTetrominoShape,
  gameTick,
  movePiece,
  rotatePiece,
  hardDrop,
  startNewGame,
  togglePause,
  getGhostY,
  GameState
} from '@/utils/tetris'
import { useTetrisStore } from '@/stores/tetris'
import PageTitle from '../../components/PageTitle.vue'

const { t } = useI18n()
const tetrisStore = useTetrisStore()

// 游戏状态
const gameState = ref<GameState>(startNewGame())
const gameInterval = ref<number | null>(null)
const isStarted = ref(false)

// 特效状态
const scorePopups = ref<{ id: number; score: number; x: number; y: number }[]>([])
const isLanding = ref(false)  // 落地特效
const isLevelUp = ref(false)
const popupId = ref(0)

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (!isStarted.value || gameState.value.isGameOver) return

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      gameState.value = movePiece(gameState.value, -1, 0)
      break
    case 'ArrowRight':
      e.preventDefault()
      gameState.value = movePiece(gameState.value, 1, 0)
      break
    case 'ArrowDown':
      e.preventDefault()
      gameState.value = movePiece(gameState.value, 0, 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      gameState.value = rotatePiece(gameState.value)
      break
    case ' ':
      e.preventDefault()
      gameState.value = hardDrop(gameState.value)
      gameState.value = gameTick(gameState.value)
      break
    case 'p':
    case 'P':
      e.preventDefault()
      gameState.value = togglePause(gameState.value)
      break
  }
}

// 根据等级计算下落速度 (毫秒)
const getSpeed = computed(() => {
  const level = gameState.value.level
  return Math.max(100, 1000 - (level - 1) * 100)
})

// 游戏循环
const tick = () => {
  if (!gameState.value.isPaused && !gameState.value.isGameOver) {
    const oldScore = gameState.value.score
    const oldLevel = gameState.value.level

    gameState.value = gameTick(gameState.value)

    // 检测分数变化
    if (gameState.value.score > oldScore) {
      const scoreGain = gameState.value.score - oldScore
      triggerScorePopup(scoreGain)
    }

    // 检测升级
    if (gameState.value.level > oldLevel) {
      triggerLevelUpEffect()
    }
  }
}

// 监听 justLocked 变化来触发落地特效
watch(() => gameState.value.justLocked, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    triggerLandingEffect()
  }
})

// 监听游戏结束，更新最高分
watch(() => gameState.value.isGameOver, (isGameOver, wasGameOver) => {
  if (isGameOver && !wasGameOver) {
    tetrisStore.updateHighScore(gameState.value.score)
  }
})

// 触发落地特效
const triggerLandingEffect = () => {
  isLanding.value = false
  isLanding.value = true
  setTimeout(() => {
    isLanding.value = false
  }, 400)
}

// 触发得分弹出
const triggerScorePopup = (score: number) => {
  const id = popupId.value++
  // 分数弹出显示在游戏板中央偏上
  scorePopups.value.push({
    id,
    score,
    x: 50,
    y: 30
  })
  setTimeout(() => {
    scorePopups.value = scorePopups.value.filter(p => p.id !== id)
  }, 800)
}

// 触发升级特效
const triggerLevelUpEffect = () => {
  isLevelUp.value = true
  setTimeout(() => {
    isLevelUp.value = false
  }, 500)
}

// 开始游戏
const startGame = () => {
  scorePopups.value = []
  gameState.value = startNewGame()
  isStarted.value = true

  if (gameInterval.value) {
    clearInterval(gameInterval.value)
  }
  gameInterval.value = window.setInterval(tick, getSpeed.value)
}

// 重新开始
const restartGame = () => {
  startGame()
}

// 监听等级变化,更新速度（仅在游戏进行中）
watch(() => gameState.value.level, () => {
  if (gameInterval.value && !gameState.value.isPaused && !gameState.value.isGameOver) {
    clearInterval(gameInterval.value)
    gameInterval.value = window.setInterval(tick, getSpeed.value)
  }
})

// 获取显示的方块
const getDisplayBoard = computed(() => {
  const display: (TetrominoType | null)[][] = gameState.value.board.map(row => [...row])

  // 如果有当前方块,绘制它
  if (gameState.value.currentPiece && !gameState.value.isGameOver) {
    const shape = getTetrominoShape(
      gameState.value.currentPiece,
      gameState.value.currentRotation
    )

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardY = gameState.value.currentY + row
          const boardX = gameState.value.currentX + col
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            display[boardY][boardX] = gameState.value.currentPiece
          }
        }
      }
    }
  }

  return display
})

// 获取幽灵方块位置
const ghostCells = computed(() => {
  if (!gameState.value.currentPiece || gameState.value.isGameOver) return []

  const ghostY = getGhostY(gameState.value)
  if (ghostY === gameState.value.currentY) return [] // 已经在最底部

  const shape = getTetrominoShape(
    gameState.value.currentPiece,
    gameState.value.currentRotation
  )
  const cells: { x: number; y: number }[] = []

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardY = ghostY + row
        const boardX = gameState.value.currentX + col
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          cells.push({ x: boardX, y: boardY })
        }
      }
    }
  }

  return cells
})

// 预览下一个方块
const getNextPieceShape = computed(() => {
  if (!gameState.value.nextPiece) return null
  return getTetrominoShape(gameState.value.nextPiece, 0)
})

// 获取方块颜色
const getCellColor = (type: TetrominoType | null) => {
  if (!type) return 'transparent'
  return getTetrominoColor(type)
}

// 判断是否是幽灵方块格子
const isGhostCell = (x: number, y: number): boolean => {
  return ghostCells.value.some(g => g.x === x && g.y === y)
}

// 获取格子样式
const getCellStyle = (cell: TetrominoType | null, x: number, y: number) => {
  const isGhost = isGhostCell(x, y)
  const color = cell ? getCellColor(cell) : (isGhost ? getCellColor(gameState.value.currentPiece!) : 'transparent')
  const borderColor = isGhost && !cell ? 'var(--el-border-color)' : color

  const style: Record<string, string> = {
    backgroundColor: color,
    borderColor: borderColor
  }

  if (isGhost && !cell) {
    style.backgroundColor = 'transparent'
  }

  return style
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (gameInterval.value) {
    clearInterval(gameInterval.value)
    gameInterval.value = null
  }
})
</script>

<template>
  <div class="tool-container">
    <PageTitle
      :icon="Grid"
      :title="t('tools.tetris')"
      description="tetris"
      color="#ffc107"
    />

    <div class="game-wrapper">
      <!-- 第一列：游戏区域 -->
      <div class="game-area">
        <div
          class="game-board"
          :class="{
            'game-over': gameState.isGameOver,
            'landing': isLanding,
            'level-up': isLevelUp
          }"
        >
          <div
            v-for="(row, rowIndex) in getDisplayBoard"
            :key="rowIndex"
            class="board-row"
          >
            <div
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              class="board-cell"
              :class="{
                'filled': cell !== null,
                'ghost': isGhostCell(colIndex, rowIndex)
              }"
              :style="getCellStyle(cell, colIndex, rowIndex)"
            />
          </div>

          <!-- 分数弹出特效 -->
          <transition-group name="score-popup" tag="div" class="score-popup-container">
            <div
              v-for="popup in scorePopups"
              :key="popup.id"
              class="score-popup"
              :style="{ left: popup.x + '%', top: popup.y + '%' }"
            >
              +{{ popup.score }}
            </div>
          </transition-group>
        </div>

        <!-- 开始提示 -->
        <div v-if="!isStarted" class="start-overlay">
          <div class="start-content">
            <div class="start-icon">🎮</div>
            <div class="start-text">{{ t('tetris.pressStart') }}</div>
            <el-button type="primary" size="large" @click="startGame">
              {{ t('tetris.start') }}
            </el-button>
          </div>
        </div>

        <!-- 游戏结束 -->
        <div v-else-if="gameState.isGameOver" class="gameover-overlay">
          <div class="gameover-content">
            <div class="gameover-icon">💔</div>
            <div class="gameover-text">{{ t('tetris.gameOver') }}</div>
            <div class="final-score">{{ t('tetris.score') }}: {{ gameState.score }}</div>
            <el-button type="primary" size="large" @click="restartGame">
              {{ t('tetris.restart') }}
            </el-button>
          </div>
        </div>

        <!-- 暂停提示 -->
        <div v-else-if="gameState.isPaused" class="pause-overlay">
          <div class="pause-content">
            <div class="pause-icon">⏸️</div>
            <div class="pause-text">{{ t('tetris.paused') }}</div>
            <div class="hint-text">{{ t('tetris.pressP') }}</div>
          </div>
        </div>
      </div>

      <!-- 第二列：下一个方块 + 操作说明 -->
      <div class="side-panel column-2">
        <!-- 下一个方块 -->
        <div class="info-card next-piece">
          <div class="card-title">{{ t('tetris.next') }}</div>
          <div v-if="getNextPieceShape" class="next-preview">
            <div
              v-for="(row, rowIndex) in getNextPieceShape"
              :key="rowIndex"
              class="preview-row"
            >
              <div
                v-for="(cell, colIndex) in row"
                :key="colIndex"
                class="preview-cell"
                :style="{
                  backgroundColor: cell ? getTetrominoColor(gameState.nextPiece!) : 'transparent'
                }"
              />
            </div>
          </div>
        </div>

        <!-- 操作说明 -->
        <div class="info-card controls">
          <div class="card-title">{{ t('tetris.controls') }}</div>
          <div class="control-list">
            <div class="control-item">
              <span class="key">←→</span>
              <span class="desc">{{ t('tetris.move') }}</span>
            </div>
            <div class="control-item">
              <span class="key">↑</span>
              <span class="desc">{{ t('tetris.rotate') }}</span>
            </div>
            <div class="control-item">
              <span class="key">↓</span>
              <span class="desc">{{ t('tetris.softDrop') }}</span>
            </div>
            <div class="control-item">
              <span class="key">Space</span>
              <span class="desc">{{ t('tetris.hardDrop') }}</span>
            </div>
            <div class="control-item">
              <span class="key">P</span>
              <span class="desc">{{ t('tetris.pause') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三列：分数信息 -->
      <div class="side-panel column-3">
        <!-- 分数 -->
        <div class="info-card">
          <div class="card-title">{{ t('tetris.score') }}</div>
          <div class="stat-value">{{ gameState.score }}</div>
        </div>

        <!-- 最高分 -->
        <div class="info-card high-score">
          <div class="card-title">{{ t('tetris.highScore') }}</div>
          <div class="stat-value high-score-value">{{ tetrisStore.highScore }}</div>
        </div>

        <!-- 等级 -->
        <div class="info-card">
          <div class="card-title">{{ t('tetris.level') }}</div>
          <div class="stat-value">{{ gameState.level }}</div>
        </div>

        <!-- 消除行数 -->
        <div class="info-card">
          <div class="card-title">{{ t('tetris.lines') }}</div>
          <div class="stat-value">{{ gameState.lines }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 1000px;
}

.game-wrapper {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: flex-start;
}

.game-area {
  position: relative;
  flex-shrink: 0;
}

.side-panel.column-2,
.side-panel.column-3 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 160px;
}

.game-board {
  display: flex;
  flex-direction: column;
  border: 3px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color);
  overflow: hidden;
  position: relative;
}

.game-board.game-over {
  opacity: 0.6;
}

/* 落地特效 - 优雅光晕 */
.game-board.landing {
  animation: land-glow 0.4s ease-out forwards !important;
}

@keyframes land-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0);
    filter: brightness(1);
  }
  20% {
    box-shadow: 0 0 30px 10px rgba(230, 162, 60, 0.7);
    filter: brightness(1.15);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0);
    filter: brightness(1);
  }
}

/* 升级特效 - 发光脉冲 */
.game-board.level-up {
  animation: level-pulse 0.5s ease-out;
  box-shadow: 0 0 20px rgba(230, 162, 60, 0.8), 0 0 40px rgba(230, 162, 60, 0.4);
}

@keyframes level-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* 分数弹出 */
.score-popup-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.score-popup {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
  color: #e6a23c;
  text-shadow: 0 0 10px rgba(230, 162, 60, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.score-popup-enter-active {
  animation: score-rise 0.8s ease-out forwards;
}

.score-popup-leave-active {
  animation: score-fade 0.3s ease-out forwards;
}

@keyframes score-rise {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  40% {
    transform: translate(-50%, -70%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -120%) scale(0.8);
  }
}

@keyframes score-fade {
  to {
    opacity: 0;
  }
}

/* 深色模式分数颜色 */
.dark .score-popup {
  color: #f0a000;
  text-shadow: 0 0 10px rgba(240, 160, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.board-row {
  display: flex;
}

.board-cell {
  width: 28px;
  height: 28px;
  border: 1px solid var(--el-border-color);
  box-sizing: border-box;
  transition: background-color 0.05s;
}

.board-cell.filled {
  border-width: 2px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.board-cell.ghost {
  border: 2px dashed rgba(180, 180, 180, 0.6);
  border-radius: 3px;
  background: rgba(180, 180, 180, 0.15) !important;
}

/* 深色模式下幽灵方块样式 */
.dark .board-cell.ghost {
  border-color: rgba(220, 220, 220, 0.5);
  background: rgba(220, 220, 220, 0.1) !important;
}

/* 遮罩层 */
.start-overlay,
.gameover-overlay,
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--el-bg-color), 0.9);
  backdrop-filter: blur(2px);
  border-radius: 4px;
}

.start-content,
.gameover-content,
.pause-content {
  text-align: center;
  padding: 20px;
}

.start-icon,
.gameover-icon,
.pause-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.start-text,
.gameover-text,
.pause-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 20px;
}

.final-score {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}

.hint-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 侧边信息栏 */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 160px;
}

.info-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  text-align: center;
}

/* 最高分样式 */
.high-score {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(255, 215, 0, 0.1)) !important;
  border-color: rgba(230, 162, 60, 0.3) !important;
}

.high-score-value {
  color: #e6a23c;
  background: linear-gradient(90deg, #e6a23c, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .high-score {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(230, 162, 60, 0.1)) !important;
}

.dark .high-score-value {
  background: linear-gradient(90deg, #ffd700, #ff9f43);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 下一个方块预览 */
.next-piece {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.next-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
}

.preview-row {
  display: flex;
  gap: 2px;
}

.preview-cell {
  width: 20px;
  height: 20px;
  border-radius: 2px;
}

.preview-cell[style*="transparent"] {
  background: transparent !important;
}

/* 操作说明 */
.controls .card-title {
  margin-bottom: 12px;
}

.control-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 6px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 深色模式适配 */
.dark .board-cell.filled {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}
</style>
