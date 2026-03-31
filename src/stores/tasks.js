import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
  const stored = JSON.parse(localStorage.getItem('vis-tasks') || '{}')
  const tasksByDate = ref(stored)

  const activeTimer = ref(null) // { taskId, date, endTime, isPaused, remainingMs }

  watch(tasksByDate, () => {
    localStorage.setItem('vis-tasks', JSON.stringify(tasksByDate.value))
  }, { deep: true })

  function getTodayKey() {
    return new Date().toISOString().split('T')[0]
  }

  function getTodayTasks() {
    const key = getTodayKey()
    if (!tasksByDate.value[key]) tasksByDate.value[key] = []
    return tasksByDate.value[key]
  }

  function addTask(text, options = {}) {
    const key = getTodayKey()
    if (!tasksByDate.value[key]) tasksByDate.value[key] = []
    tasksByDate.value[key].push({
      id: crypto.randomUUID(),
      text,
      done: false,
      plannedPomodoros: options.plannedPomodoros ?? 1,
      completedPomodoros: 0,
      isUnplanned: options.isUnplanned ?? false,
      pomodoroLog: [],
      interruptionsCount: 0,
      notes: '',
    })
  }

  function addUnplannedTask(text) {
    addTask(text, { isUnplanned: true })
  }

  function incrementPlanned(id) {
    const tasks = getTodayTasks()
    const task = tasks.find(t => t.id === id)
    if (task) task.plannedPomodoros = (task.plannedPomodoros ?? 1) + 1
  }

  function decrementPlanned(id) {
    const tasks = getTodayTasks()
    const task = tasks.find(t => t.id === id)
    if (task && (task.plannedPomodoros ?? 1) > 1) task.plannedPomodoros -= 1
  }

  function recordCompletedPomodoro(id) {
    const tasks = getTodayTasks()
    const task = tasks.find(t => t.id === id)
    if (task) {
      task.completedPomodoros = (task.completedPomodoros ?? 0) + 1
      if (!task.pomodoroLog) task.pomodoroLog = []
      task.pomodoroLog.push({ completedAt: new Date().toISOString() })
    }
  }

  function recordInterruption(id) {
    const tasks = getTodayTasks()
    const task = tasks.find(t => t.id === id)
    if (task) task.interruptionsCount = (task.interruptionsCount || 0) + 1
  }

  function toggleTask(id) {
    const tasks = getTodayTasks()
    const task = tasks.find(t => t.id === id)
    if (task) task.done = !task.done
  }

  function updateTaskNotes(id, notes) {
    const tasks = getTodayTasks()
    const task = tasks.find(t => t.id === id)
    if (task) task.notes = notes
  }

  function deleteTask(id) {
    const key = getTodayKey()
    if (tasksByDate.value[key]) {
      tasksByDate.value[key] = tasksByDate.value[key].filter(t => t.id !== id)
    }
    if (activeTimer.value && activeTimer.value.taskId === id) {
      activeTimer.value = null
    }
  }

  function startTimer(taskId, durationMs) {
    activeTimer.value = {
      taskId,
      date: getTodayKey(),
      endTime: Date.now() + durationMs,
      isPaused: false,
      remainingMs: durationMs,
    }
  }

  function pauseTimer() {
    if (activeTimer.value && !activeTimer.value.isPaused) {
      activeTimer.value.remainingMs = activeTimer.value.endTime - Date.now()
      activeTimer.value.isPaused = true
    }
  }

  function resumeTimer() {
    if (activeTimer.value && activeTimer.value.isPaused) {
      activeTimer.value.endTime = Date.now() + activeTimer.value.remainingMs
      activeTimer.value.isPaused = false
    }
  }

  function resetTimer() {
    activeTimer.value = null
  }

  function completeTimer() {
    if (activeTimer.value) {
      recordCompletedPomodoro(activeTimer.value.taskId)
    }
    activeTimer.value = null
  }

  return {
    tasksByDate,
    activeTimer,
    getTodayKey,
    getTodayTasks,
    addTask,
    addUnplannedTask,
    incrementPlanned,
    decrementPlanned,
    recordCompletedPomodoro,
    recordInterruption,
    toggleTask,
    deleteTask,
    updateTaskNotes,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completeTimer,
  }
})
