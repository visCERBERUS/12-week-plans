import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const DEFAULT_CATEGORIES = ['Еда', 'Транспорт', 'Здоровье', 'Развлечения', 'Одежда', 'Связь', 'Образование', 'Прочее']

export const useFinanceStore = defineStore('finance', () => {
  const stored = JSON.parse(localStorage.getItem('vis-finance') || '{}')

  const expenses = ref(stored.expenses || [])
  const incomes = ref(stored.incomes || [])
  const categories = ref(stored.categories || [...DEFAULT_CATEGORIES])

  watch([expenses, incomes, categories], () => {
    localStorage.setItem('vis-finance', JSON.stringify({
      expenses: expenses.value,
      incomes: incomes.value,
      categories: categories.value,
    }))
  }, { deep: true })

  // --- Getters ---
  function expensesByDay(date) {
    return expenses.value.filter(e => e.date === date)
  }

  function totalByDay(date) {
    return expensesByDay(date).reduce((s, e) => s + e.amount, 0)
  }

  function totalByWeek(startDate) {
    const start = new Date(startDate).getTime()
    const end = start + 7 * 24 * 60 * 60 * 1000
    return expenses.value
      .filter(e => { const t = new Date(e.date).getTime(); return t >= start && t < end })
      .reduce((s, e) => s + e.amount, 0)
  }

  function totalByMonth(year, month) {
    return expenses.value
      .filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
      .reduce((s, e) => s + e.amount, 0)
  }

  function incomeByMonth(year, month) {
    return incomes.value
      .filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
      .reduce((s, e) => s + e.amount, 0)
  }

  function balance(year, month) {
    return incomeByMonth(year, month) - totalByMonth(year, month)
  }

  function expensesByCategory(year, month) {
    const result = {}
    expenses.value
      .filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
      .forEach(e => {
        result[e.category] = (result[e.category] || 0) + e.amount
      })
    return result
  }

  // --- Actions ---
  function addExpense(name, amount, category, date) {
    expenses.value.push({
      id: crypto.randomUUID(),
      date: date || new Date().toISOString().split('T')[0],
      name,
      amount: Number(amount),
      category,
    })
  }

  function deleteExpense(id) {
    expenses.value = expenses.value.filter(e => e.id !== id)
  }

  function addIncome(source, amount, note, date) {
    incomes.value.push({
      id: crypto.randomUUID(),
      date: date || new Date().toISOString().split('T')[0],
      source,
      amount: Number(amount),
      note: note || '',
    })
  }

  function deleteIncome(id) {
    incomes.value = incomes.value.filter(e => e.id !== id)
  }

  function addCategory(name) {
    if (!categories.value.includes(name)) {
      categories.value.push(name)
    }
  }

  return {
    expenses,
    incomes,
    categories,
    expensesByDay,
    totalByDay,
    totalByWeek,
    totalByMonth,
    incomeByMonth,
    balance,
    expensesByCategory,
    addExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    addCategory,
  }
})
