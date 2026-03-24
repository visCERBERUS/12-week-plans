import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function weekStartKey(date) {
  const d = date ? new Date(date) : new Date()
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export const usePomodoroStore = defineStore('pomodoro', () => {
  const stored = JSON.parse(localStorage.getItem('vis-pomodoro') || '{}')

  const settings = ref(
    stored.settings || {
      workMin: 25,
      shortBreakMin: 5,
      longBreakMin: 15,
      longBreakAfter: 4,
      dailyGoal: 8,
    }
  )

  const sessions = ref(stored.sessions || [])

  const currentSession = ref(stored.currentSession || null)

  watch([settings, sessions, currentSession], () => {
    localStorage.setItem(
      'vis-pomodoro',
      JSON.stringify({
        settings: settings.value,
        sessions: sessions.value,
        currentSession: currentSession.value,
      })
    )
  }, { deep: true })

  // --- Getters ---
  const todaySessions = computed(() =>
    sessions.value.filter(s => s.date === todayKey())
  )

  const todayCompletedPomodoros = computed(() =>
    todaySessions.value.reduce((sum, s) => sum + (s.completedPomodoros || 0), 0)
  )

  function weekSessions(startDate) {
    const start = startDate || weekStartKey()
    const startTs = new Date(start).getTime()
    const endTs = startTs + 7 * 24 * 60 * 60 * 1000
    return sessions.value.filter(s => {
      const ts = new Date(s.date).getTime()
      return ts >= startTs && ts < endTs
    })
  }

  // --- Actions ---
  function startSession(taskName, plannedPomodoros) {
    currentSession.value = {
      id: crypto.randomUUID(),
      taskName,
      plannedPomodoros,
      completedPomodoros: 0,
      interruptionsCount: 0,
      phase: 'work',
      phaseNumber: 1,
      timerActive: false,
      startedAt: new Date().toISOString(),
      concentrationRating: null,
    }
  }

  function tickComplete() {
    if (!currentSession.value) return
    const s = currentSession.value
    if (s.phase === 'work') {
      s.completedPomodoros++
      if (s.completedPomodoros >= s.plannedPomodoros) {
        s.phase = 'rating'
        s.timerActive = false
        return
      }
      if (s.completedPomodoros % settings.value.longBreakAfter === 0) {
        s.phase = 'longBreak'
      } else {
        s.phase = 'shortBreak'
      }
    } else {
      s.phase = 'work'
      s.phaseNumber++
    }
    s.timerActive = false
  }

  function recordInterruption() {
    if (!currentSession.value) return
    currentSession.value.interruptionsCount++
  }

  function abandonSession() {
    if (!currentSession.value) return
    const s = { ...currentSession.value }
    sessions.value.push({
      id: s.id,
      date: todayKey(),
      taskName: s.taskName,
      plannedPomodoros: s.plannedPomodoros,
      completedPomodoros: s.completedPomodoros,
      interruptionsCount: s.interruptionsCount,
      concentrationRating: null,
      completedAt: new Date().toISOString(),
      abandoned: true,
    })
    currentSession.value = null
  }

  function completeSession(concentrationRating) {
    if (!currentSession.value) return
    const s = currentSession.value
    sessions.value.push({
      id: s.id,
      date: todayKey(),
      taskName: s.taskName,
      plannedPomodoros: s.plannedPomodoros,
      completedPomodoros: s.completedPomodoros,
      interruptionsCount: s.interruptionsCount,
      concentrationRating,
      completedAt: new Date().toISOString(),
      abandoned: false,
    })
    currentSession.value = null
  }

  function updateSettings(newSettings) {
    Object.assign(settings.value, newSettings)
  }

  return {
    settings,
    sessions,
    currentSession,
    todaySessions,
    todayCompletedPomodoros,
    weekSessions,
    startSession,
    tickComplete,
    recordInterruption,
    abandonSession,
    completeSession,
    updateSettings,
  }
})
