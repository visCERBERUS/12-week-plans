<template>
  <div
    class="task-card card"
    :class="{
      'task-active-timer': isActive,
      'task-done': task.done,
    }"
  >
    <div class="task-main">
      <!-- Left: custom checkbox -->
      <button
        class="task-checkbox"
        :class="{ checked: task.done }"
        :aria-label="task.done ? 'Отметить невыполненной' : 'Отметить выполненной'"
        @click="$emit('toggle')"
      >
        <svg v-if="task.done" class="check-icon" viewBox="0 0 16 16" fill="none">
          <polyline points="3,8 6.5,11.5 13,4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Center: task name + pomodoro row -->
      <div class="task-body">
        <span class="task-text" :class="{ 'done-text': task.done }">{{ task.text }}</span>

        <!-- Pomodoro dots row -->
        <div v-if="!task.done" class="pomodoro-row">
          <div class="pomodoro-dots">
            <span
              v-for="i in totalPomodoros"
              :key="i"
              class="pomodoro-dot"
              :class="i <= completedPomodoros ? 'dot-filled' : 'dot-empty'"
              :title="i <= completedPomodoros ? 'Выполнен' : 'Запланирован'"
            ></span>
          </div>
          <span class="pomodoro-count">{{ completedPomodoros }}/{{ totalPomodoros }} 🍅</span>
          <button class="adj-btn" aria-label="Убрать помидор" @click="$emit('decrement-planned')">−</button>
          <button class="adj-btn" aria-label="Добавить помидор" @click="$emit('increment-planned')">+</button>
        </div>

        <!-- Badge: completed by plan -->
        <div v-if="isCompleteByPlan && !task.done" class="badge-done">
          <span>✅ Выполнено по плану</span>
        </div>
      </div>

      <!-- Right: timer zone + delete -->
      <div class="task-right">
        <template v-if="!task.done">
          <!-- Active timer on THIS task -->
          <div v-if="isActive" class="timer-active">
            <span class="timer-countdown">{{ pomodoroDisplay }}</span>
            <div class="timer-btns">
              <button class="btn btn-ghost btn-xs" @click="togglePause">
                {{ tasksStore.activeTimer?.isPaused ? '▶' : '⏸' }}
              </button>
              <button class="btn btn-ghost btn-xs" @click="tasksStore.resetTimer()">⏹</button>
            </div>
          </div>
          <!-- No timer running on this task -->
          <button
            v-else
            class="btn-start"
            :disabled="!!tasksStore.activeTimer"
            :title="tasksStore.activeTimer ? 'Другой таймер уже запущен' : 'Начать помидор 25 мин'"
            @click="$emit('start-pomodoro')"
          >
            <span class="btn-start-icon">▶</span>
            <span class="btn-start-time">25:00</span>
          </button>
        </template>

        <!-- Delete button (visible on hover via CSS) -->
        <button
          class="delete-btn"
          aria-label="Удалить задачу"
          @click="$emit('delete')"
          title="Удалить"
        >
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M6 4V3h4v1M5.5 4l.5 8M10.5 4l-.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Notes section -->
    <div class="notes-row">
      <button
        class="notes-toggle"
        :class="{ 'has-notes': !!task.notes }"
        @click="notesOpen = !notesOpen"
      >
        <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Конспект</span>
        <span v-if="notesOpen" class="notes-chevron">▲</span>
        <span v-else class="notes-chevron">▼</span>
      </button>
    </div>

    <Transition name="notes-slide">
      <div v-if="notesOpen" class="notes-section">
        <textarea
          class="input notes-textarea"
          :value="task.notes || ''"
          placeholder="Конспект к задаче..."
          rows="4"
          @input="$emit('update-notes', $event.target.value)"
        />
      </div>
    </Transition>
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
const isCompleteByPlan = computed(() =>
  completedPomodoros.value >= totalPomodoros.value && totalPomodoros.value > 0
)

const now = ref(Date.now())
let interval = null

onMounted(() => {
  interval = setInterval(() => { now.value = Date.now() }, 500)
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
/* ── Card ──────────────────────────────────────────────────────────────── */
.task-card {
  padding: 1rem 1.125rem;
  transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  transform: translateY(-2px);
}

.task-done {
  opacity: 0.55;
}

.task-done:hover {
  transform: none;
  opacity: 0.65;
}

/* ── Main row ──────────────────────────────────────────────────────────── */
.task-main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

/* ── Custom checkbox ───────────────────────────────────────────────────── */
.task-checkbox {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-strong, rgba(0, 0, 0, 0.2));
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1px;
  color: #fff;
}

.task-checkbox:hover {
  border-color: var(--accent);
  background: var(--accent-subtle, rgba(124, 111, 255, 0.1));
}

.task-checkbox.checked {
  background: var(--success);
  border-color: var(--success);
}

.check-icon {
  width: 11px;
  height: 11px;
  stroke: #fff;
}

/* ── Body ──────────────────────────────────────────────────────────────── */
.task-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.task-text {
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  line-height: 1.4;
  transition: opacity 0.2s;
}

.done-text {
  text-decoration: line-through;
  opacity: 0.5;
}

/* ── Pomodoro row ──────────────────────────────────────────────────────── */
.pomodoro-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pomodoro-dots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pomodoro-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  transition: background 0.15s;
}

.dot-filled {
  background: var(--danger);
}

.dot-empty {
  background: transparent;
  border: 1.5px solid var(--text-secondary);
  opacity: 0.5;
}

.pomodoro-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.adj-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.adj-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-subtle, rgba(124,111,255,0.08));
}

.adj-btn:active {
  transform: scale(0.9);
}

/* ── Badge ─────────────────────────────────────────────────────────────── */
.badge-done {
  font-size: 0.72rem;
  color: var(--success);
  font-weight: 500;
}

/* ── Right zone ────────────────────────────────────────────────────────── */
.task-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

/* Active timer display */
.timer-active {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.timer-countdown {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--accent);
  line-height: 1;
}

.timer-btns {
  display: flex;
  gap: 0.3rem;
}

.btn-xs {
  padding: 0.2rem 0.55rem;
  font-size: 0.8rem;
}

/* Start button */
.btn-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--accent-subtle, rgba(124,111,255,0.08));
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--accent);
}

.btn-start:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 4px 12px var(--accent-glow, rgba(124,111,255,0.25));
}

.btn-start:active {
  transform: scale(0.96);
}

.btn-start:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-start-icon {
  font-size: 0.9rem;
  line-height: 1;
}

.btn-start-time {
  font-size: 0.65rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* Delete button — subtle, revealed on hover */
.delete-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.delete-btn svg {
  width: 13px;
  height: 13px;
}

.task-card:hover .delete-btn {
  opacity: 0.45;
}

.delete-btn:hover {
  opacity: 1 !important;
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--danger);
}

.delete-btn:active {
  transform: scale(0.9);
}

/* ── Notes ─────────────────────────────────────────────────────────────── */
.notes-row {
  margin-top: 0.625rem;
}

.notes-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-family: inherit;
  font-weight: 450;
  padding: 0.2rem 0;
  opacity: 0.55;
  transition: opacity 0.15s;
}

.notes-toggle:hover,
.notes-toggle.has-notes {
  opacity: 1;
  color: var(--accent);
}

.notes-chevron {
  font-size: 0.6rem;
}

.notes-slide-enter-active,
.notes-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.notes-slide-enter-from,
.notes-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.notes-slide-enter-to,
.notes-slide-leave-from {
  max-height: 200px;
  opacity: 1;
}

.notes-section {
  margin-top: 0.5rem;
}

.notes-textarea {
  width: 100%;
  resize: vertical;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.625rem 0.875rem;
  box-sizing: border-box;
  border-radius: 10px;
  min-height: 80px;
}
</style>

