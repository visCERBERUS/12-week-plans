<template>
  <div class="card task-card" :class="{ 'task-active-timer': isActive, 'task-done': task.done }">
    <div class="task-top">
      <label class="task-check-label">
        <input type="checkbox" :checked="task.done" @change="$emit('toggle')" />
        <span :class="{ 'done-text': task.done }">{{ task.text }}</span>
      </label>
      <div class="task-actions">
        <span v-if="isCompleteByPlan" class="badge-done">✅ Выполнено по плану</span>
        <button class="btn btn-ghost btn-icon" @click="$emit('delete')" title="Удалить">🗑️</button>
      </div>
    </div>

    <!-- Pomodoro row -->
    <div class="pomodoro-row" v-if="!task.done">
      <span
        v-for="i in totalPomodoros"
        :key="i"
        class="pomodoro-cell"
        :title="i <= completedPomodoros ? 'Выполнен' : 'Запланирован'"
      >{{ i <= completedPomodoros ? '🍅' : '☐' }}</span>
      <button class="btn btn-ghost btn-icon pomodoro-adj" aria-label="Убрать помидор" @click="$emit('decrement-planned')" title="Убрать помидор">−</button>
      <button class="btn btn-ghost btn-icon pomodoro-adj" aria-label="Добавить помидор" @click="$emit('increment-planned')" title="Добавить помидор">+</button>
    </div>

    <!-- Timer or start button -->
    <div class="task-timer-row" v-if="!task.done">
      <template v-if="isActive">
        <span class="pomodoro-display">{{ pomodoroDisplay }}</span>
        <button class="btn btn-ghost btn-sm" @click="togglePause">
          {{ tasksStore.activeTimer?.isPaused ? '▶ Продолжить' : '⏸ Пауза' }}
        </button>
        <button class="btn btn-ghost btn-sm" @click="tasksStore.resetTimer()">⏹ Сброс</button>
      </template>
      <template v-else>
        <button
          class="btn btn-ghost btn-sm"
          :disabled="!!tasksStore.activeTimer"
          :title="tasksStore.activeTimer ? 'Другой таймер уже запущен' : 'Начать помидор 25 мин'"
          @click="$emit('start-pomodoro')"
        >▶ Начать помидор</button>
      </template>
    </div>

    <!-- Notes section -->
    <div class="notes-row">
      <button
        class="btn btn-ghost btn-sm notes-toggle-btn"
        :class="{ 'notes-active': task.notes }"
        @click="notesOpen = !notesOpen"
        title="Конспект"
      >📝 Конспект</button>
    </div>
    <div v-if="notesOpen" class="notes-section">
      <textarea
        class="input notes-textarea"
        :value="task.notes || ''"
        placeholder="Конспект к задаче..."
        rows="4"
        @input="$emit('update-notes', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '../stores/tasks.js'

const props = defineProps({
  task: { type: Object, required: true },
})
const emit = defineEmits(['toggle', 'delete', 'start-pomodoro', 'increment-planned', 'decrement-planned', 'record-interruption', 'update-notes'])

const tasksStore = useTasksStore()

const notesOpen = ref(false)

const isActive = computed(() =>
  tasksStore.activeTimer?.taskId === props.task.id
)

const completedPomodoros = computed(() => props.task.completedPomodoros ?? 0)
const totalPomodoros = computed(() => props.task.plannedPomodoros ?? 1)
const isCompleteByPlan = computed(() => completedPomodoros.value >= totalPomodoros.value && totalPomodoros.value > 0)

const now = ref(Date.now())
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now()
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

function togglePause() {
  if (tasksStore.activeTimer?.isPaused) {
    tasksStore.resumeTimer()
  } else {
    tasksStore.pauseTimer()
  }
}
</script>

<style scoped>
.task-card {
  transition: all 0.3s ease;
}
.task-active-timer {
  border: 2px solid var(--accent);
  background: rgba(108, 99, 255, 0.05);
}
.task-done {
  opacity: 0.7;
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
.task-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.badge-done {
  font-size: 0.78rem;
  color: #22c55e;
  white-space: nowrap;
}
.pomodoro-row {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
}
.pomodoro-cell {
  font-size: 1rem;
  cursor: default;
  user-select: none;
}
.pomodoro-adj {
  font-size: 0.85rem;
  padding: 0 0.3rem;
  line-height: 1;
  margin-left: 0.25rem;
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
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.notes-row {
  margin-top: 0.5rem;
}
.notes-toggle-btn {
  opacity: 0.5;
  font-size: 0.82rem;
}
.notes-toggle-btn.notes-active,
.notes-toggle-btn:hover {
  opacity: 1;
}
.notes-section {
  margin-top: 0.5rem;
}
.notes-textarea {
  width: 100%;
  resize: vertical;
  font-size: 0.88rem;
  padding: 0.5rem 0.75rem;
  box-sizing: border-box;
}
</style>

