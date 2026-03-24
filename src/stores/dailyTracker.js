import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Спорт' },
  { id: 'h2', name: 'Чтение' },
  { id: 'h3', name: 'Медитация' },
  { id: 'h4', name: 'Вода 2л' },
  { id: 'h5', name: 'Без телефона до 10:00' },
]

function createEntry(defaultHabits) {
  return {
    wakeUpTime: '',
    sleepTime: '',
    mood: 0,
    anxiety: 0,
    thoughts: '',
    habits: defaultHabits.map(h => ({ ...h, done: false })),
  }
}

export const useDailyTrackerStore = defineStore('dailyTracker', () => {
  const stored = JSON.parse(localStorage.getItem('vis-daily-tracker') || '{}')

  const entries = ref(stored.entries || {})
  const defaultHabits = ref(stored.defaultHabits || DEFAULT_HABITS.map(h => ({ ...h })))

  watch([entries, defaultHabits], () => {
    localStorage.setItem('vis-daily-tracker', JSON.stringify({
      entries: entries.value,
      defaultHabits: defaultHabits.value,
    }))
  }, { deep: true })

  function getOrCreateEntry(date) {
    if (!entries.value[date]) {
      entries.value[date] = createEntry(defaultHabits.value)
    }
    return entries.value[date]
  }

  function updateEntry(date, fields) {
    const entry = getOrCreateEntry(date)
    Object.assign(entry, fields)
  }

  function toggleHabit(date, habitId) {
    const entry = getOrCreateEntry(date)
    const habit = entry.habits.find(h => h.id === habitId)
    if (habit) habit.done = !habit.done
  }

  function addHabit(name) {
    const id = crypto.randomUUID()
    defaultHabits.value.push({ id, name })
    for (const date in entries.value) {
      entries.value[date].habits.push({ id, name, done: false })
    }
  }

  function removeHabit(habitId) {
    defaultHabits.value = defaultHabits.value.filter(h => h.id !== habitId)
    for (const date in entries.value) {
      entries.value[date].habits = entries.value[date].habits.filter(h => h.id !== habitId)
    }
  }

  return {
    entries,
    defaultHabits,
    getOrCreateEntry,
    updateEntry,
    toggleHabit,
    addHabit,
    removeHabit,
  }
})
