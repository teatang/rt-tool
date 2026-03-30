import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'tetris-high-score'

// 从 localStorage 读取最高分
const getStoredHighScore = (): number => {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const parsed = parseInt(stored, 10)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// 俄罗斯方块状态管理
export const useTetrisStore = defineStore('tetris', () => {
  // 最高分
  const highScore = ref(getStoredHighScore())

  // 更新最高分
  const updateHighScore = (score: number) => {
    if (score > highScore.value) {
      highScore.value = score
      localStorage.setItem(STORAGE_KEY, score.toString())
    }
  }

  // 重置最高分
  const resetHighScore = () => {
    highScore.value = 0
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    highScore,
    updateHighScore,
    resetHighScore
  }
})
