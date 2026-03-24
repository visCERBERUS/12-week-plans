<template>
  <div class="card task-card" :class="{ 'task-active-timer': isActive }">
    <div class="task-top">
      <label class="task-check-label">
        <input type="checkbox" :checked="task.done" @change="$emit('toggle')" />
        <span :class="{ 'done-text': task.done }">{{ task.text }}</span>
      </label>
      <button class="btn btn-ghost btn-icon" @click="$emit('delete')" title="Удалить">🗑️</button>
    </div>
    <div class="task-timer-row" v-if="!task.done">
      <template v-if="isActive">
        <span class="pomodoro-display">{{ pomodoroDisplay }}</span>
        <button class="btn btn-ghost btn-sm" @click="togglePause">
          {{ tasksStore.activeTimer?.isPaused ? '▶ Продолжить' : '⏸ Пауза' }}
        </button>
        <button class="btn btn-ghost btn-sm" @click="tasksStore.resetTimer()">⏹ Сброс</button>
      </template>
      <template v-else>
        <button class="btn btn-ghost btn-sm" @click="startPomodoro(25 * 60 * 1000)">▶ 25 мин</button>
        <button class="btn btn-ghost btn-sm" @click="startPomodoro(50 * 60 * 1000)">▶ 50 мин</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '../stores/tasks.js'

const props = defineProps({
  task: { type: Object, required: true },
})
const emit = defineEmits(['toggle', 'delete'])

const tasksStore = useTasksStore()

const isActive = computed(() =>
  tasksStore.activeTimer?.taskId === props.task.id
)

const now = ref(Date.now())
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now()
    if (isActive.value && tasksStore.activeTimer && !tasksStore.activeTimer.isPaused) {
      const remaining = tasksStore.activeTimer.endTime - now.value
      if (remaining <= 0) {
        playBeep()
        tasksStore.completeTimer()
      }
    }
  }, 500)
})

onUnmounted(() => {
  clearInterval(interval)
})

const pomodoroDisplay = computed(() => {
  if (!isActive.value || !tasksStore.activeTimer) return '00:00'
  let remaining
  if (tasksStore.activeTimer.isPaused) {
    remaining = tasksStore.activeTimer.remainingMs
  } else {
    remaining = tasksStore.activeTimer.endTime - now.value
  }
  if (remaining < 0) remaining = 0
  const totalSec = Math.ceil(remaining / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

function startPomodoro(durationMs) {
  tasksStore.startTimer(props.task.id, durationMs)
}

function togglePause() {
  if (tasksStore.activeTimer?.isPaused) {
    tasksStore.resumeTimer()
  } else {
    tasksStore.pauseTimer()
  }
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1)
  } catch (e) {
    console.warn('Audio not available', e)
  }
}
</script>

<style scoped>
.task-card {
  transition: all 0.3s ease;
}
.task-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.task-check-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  flex: 1;
}
.task-check-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
}
.task-timer-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}
.pomodoro-display {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent);
  min-width: 5ch;
}
.btn-icon {
  padding: 0.35rem 0.5rem;
  font-size: 1rem;
}
.btn-sm {
  padding: 0.3rem 0.65rem;
  font-size: 0.82rem;
}
</style>
