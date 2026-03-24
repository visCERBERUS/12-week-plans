<template>
  <div class="tracker">
    <h1 class="page-title">📓 Ежедневный трекер</h1>

    <!-- Date navigation -->
    <div class="date-nav">
      <button class="btn btn-ghost" @click="prevDay">← Предыдущий</button>
      <span class="date-label">{{ formattedDate }}</span>
      <button class="btn btn-ghost" @click="nextDay">Следующий →</button>
    </div>

    <!-- Sleep schedule -->
    <div class="card section-card">
      <h2 class="section-title">🌅 Режим дня</h2>
      <div class="time-row">
        <label class="time-field">
          <span class="field-label">Время подъёма</span>
          <input
            type="time"
            class="input time-input"
            :value="entry.wakeUpTime"
            @change="save('wakeUpTime', $event.target.value)"
          />
        </label>
        <label class="time-field">
          <span class="field-label">Время сна</span>
          <input
            type="time"
            class="input time-input"
            :value="entry.sleepTime"
            @change="save('sleepTime', $event.target.value)"
          />
        </label>
      </div>
    </div>

    <!-- Mood -->
    <div class="card section-card">
      <h2 class="section-title">😊 Настроение</h2>
      <div class="emoji-row">
        <button
          v-for="(emoji, i) in moodEmojis"
          :key="i"
          class="emoji-btn"
          :class="{ active: entry.mood === i + 1 }"
          @click="save('mood', i + 1)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- Anxiety -->
    <div class="card section-card">
      <h2 class="section-title">💭 Уровень тревоги / переживаний</h2>
      <div class="emoji-row">
        <button
          v-for="(item, i) in anxietyLevels"
          :key="i"
          class="emoji-btn emoji-btn--labeled"
          :class="{ active: entry.anxiety === i + 1 }"
          @click="save('anxiety', i + 1)"
        >
          <span class="emoji-icon">{{ item.emoji }}</span>
          <span class="emoji-label">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- Thoughts -->
    <div class="card section-card">
      <h2 class="section-title">📝 Мысли и переживания</h2>
      <textarea
        class="input thoughts-area"
        placeholder="Запишите свои мысли, переживания, идеи…"
        :value="entry.thoughts"
        @input="save('thoughts', $event.target.value)"
      />
    </div>

    <!-- Habits -->
    <div class="card section-card">
      <div class="habits-header">
        <h2 class="section-title">✅ Привычки</h2>
        <span class="habit-count">{{ doneCount }} / {{ entry.habits.length }} выполнено</span>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }" />
      </div>

      <ul class="habit-list">
        <li v-for="habit in entry.habits" :key="habit.id" class="habit-item">
          <label class="habit-label">
            <input
              type="checkbox"
              class="habit-checkbox"
              :checked="habit.done"
              @change="tracker.toggleHabit(selectedDate, habit.id)"
            />
            <span :class="{ 'done-text': habit.done }">{{ habit.name }}</span>
          </label>
          <button class="btn-remove" title="Удалить привычку" @click="confirmRemoveHabit(habit.id)">✕</button>
        </li>
      </ul>

      <div v-if="!showAddHabit" class="add-habit-trigger">
        <button class="btn btn-ghost" @click="showAddHabit = true">+ Добавить привычку</button>
      </div>
      <div v-else class="add-habit-row">
        <input
          ref="newHabitInput"
          v-model="newHabitName"
          class="input"
          placeholder="Название привычки…"
          @keydown.enter="addHabit"
          @keydown.esc="cancelAddHabit"
        />
        <button class="btn btn-primary" @click="addHabit">Добавить</button>
        <button class="btn btn-ghost" @click="cancelAddHabit">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useDailyTrackerStore } from '../stores/dailyTracker.js'

const tracker = useDailyTrackerStore()

// --- Date navigation ---
function todayKey() {
  return new Date().toISOString().split('T')[0]
}

const selectedDate = ref(todayKey())

const formattedDate = computed(() => {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
})

function shiftDay(delta) {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  selectedDate.value = date.toISOString().split('T')[0]
}
function prevDay() { shiftDay(-1) }
function nextDay() { shiftDay(1) }

// --- Entry reactive proxy ---
const entry = computed(() => tracker.getOrCreateEntry(selectedDate.value))

function save(field, value) {
  tracker.updateEntry(selectedDate.value, { [field]: value })
}

// --- Mood & Anxiety ---
const moodEmojis = ['😞', '😕', '😐', '🙂', '😄']
const anxietyLevels = [
  { emoji: '😌', label: 'Спокойно' },
  { emoji: '🤔', label: 'Немного' },
  { emoji: '😟', label: 'Заметно' },
  { emoji: '😰', label: 'Сильно' },
  { emoji: '😱', label: 'Очень сильно' },
]

// --- Habits ---
const doneCount = computed(() => entry.value.habits.filter(h => h.done).length)
const progressPercent = computed(() =>
  entry.value.habits.length ? Math.round(doneCount.value / entry.value.habits.length * 100) : 0
)

const showAddHabit = ref(false)
const newHabitName = ref('')
const newHabitInput = ref(null)

watch(showAddHabit, async (val) => {
  if (val) {
    await nextTick()
    newHabitInput.value?.focus()
  }
})

function confirmRemoveHabit(habitId) {
  if (confirm('Удалить привычку из всех записей?')) {
    tracker.removeHabit(habitId)
  }
}

function addHabit() {
  if (newHabitName.value.trim()) {
    tracker.addHabit(newHabitName.value.trim())
  }
  cancelAddHabit()
}

function cancelAddHabit() {
  newHabitName.value = ''
  showAddHabit.value = false
}
</script>

<style scoped>
.tracker {
  max-width: 700px;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.date-label {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
  text-transform: capitalize;
}

.section-card {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

/* Sleep schedule */
.time-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.time-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 140px;
}

.field-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.time-input {
  color-scheme: dark;
  width: 100%;
}

/* Emoji buttons */
.emoji-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.emoji-btn {
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.8rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
  line-height: 1;
}

.emoji-btn:hover {
  border-color: var(--accent);
  transform: scale(1.1);
}

.emoji-btn.active {
  border-color: var(--accent);
  background: rgba(108, 99, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.2);
}

.emoji-btn--labeled {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  font-size: unset;
  flex: 1;
  min-width: 80px;
}

.emoji-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.emoji-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
}

/* Thoughts */
.thoughts-area {
  width: 100%;
  min-height: 120px;
  resize: vertical;
}

/* Habits */
.habits-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.habits-header .section-title {
  margin-bottom: 0;
}

.habit-count {
  font-size: 0.9rem;
  color: var(--accent);
  font-weight: 600;
}

.progress-bar-wrap {
  margin-bottom: 1rem;
}

.habit-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.habit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.habit-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  flex: 1;
}

.habit-checkbox {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--accent);
  cursor: pointer;
}

.btn-remove {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: color 0.2s ease;
  line-height: 1;
}

.btn-remove:hover {
  color: var(--danger);
}

.add-habit-trigger {
  margin-top: 0.25rem;
}

.add-habit-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.add-habit-row .input {
  flex: 1;
  min-width: 160px;
}

@media (max-width: 600px) {
  .emoji-btn--labeled {
    min-width: 56px;
    padding: 0.4rem;
  }
  .emoji-label {
    font-size: 0.6rem;
  }
}
</style>
