import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useWeeklyPlanStore = defineStore('weeklyPlan', () => {
  const stored = JSON.parse(localStorage.getItem('vis-weekly') || '{}')
  const tasksByWeek = ref(stored)

  watch(tasksByWeek, () => {
    localStorage.setItem('vis-weekly', JSON.stringify(tasksByWeek.value))
  }, { deep: true })

  function getWeekTasks(weekNum) {
    const key = `week-${weekNum}`
    if (!tasksByWeek.value[key]) tasksByWeek.value[key] = []
    return tasksByWeek.value[key]
  }

  function addTask(weekNum, text) {
    const key = `week-${weekNum}`
    if (!tasksByWeek.value[key]) tasksByWeek.value[key] = []
    tasksByWeek.value[key].push({ id: crypto.randomUUID(), text, done: false })
  }

  function toggleTask(weekNum, id) {
    const tasks = getWeekTasks(weekNum)
    const task = tasks.find(t => t.id === id)
    if (task) task.done = !task.done
  }

  function deleteTask(weekNum, id) {
    const key = `week-${weekNum}`
    if (tasksByWeek.value[key]) {
      tasksByWeek.value[key] = tasksByWeek.value[key].filter(t => t.id !== id)
    }
  }

  return { tasksByWeek, getWeekTasks, addTask, toggleTask, deleteTask }
})
