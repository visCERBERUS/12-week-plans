<template>
  <div class="finance-page">
    <h1 class="page-title">💰 Финансовый отдел</h1>

    <!-- Month switcher -->
    <div class="month-nav">
      <button class="btn btn-ghost" @click="shiftMonth(-1)">← Предыдущий</button>
      <span class="month-label">{{ monthLabel }}</span>
      <button class="btn btn-ghost" @click="shiftMonth(1)">Следующий →</button>
    </div>

    <!-- Summary panel -->
    <div class="summary-grid">
      <div class="summary-card card">
        <span class="sum-icon">💸</span>
        <span class="sum-num">{{ fmt(financeStore.totalByDay(todayKey)) }}</span>
        <span class="sum-label">Расходы сегодня</span>
      </div>
      <div class="summary-card card">
        <span class="sum-icon">📅</span>
        <span class="sum-num">{{ fmt(financeStore.totalByWeek(weekStart)) }}</span>
        <span class="sum-label">Расходы за неделю</span>
      </div>
      <div class="summary-card card">
        <span class="sum-icon">📆</span>
        <span class="sum-num">{{ fmt(financeStore.totalByMonth(selectedYear, selectedMonth)) }}</span>
        <span class="sum-label">Расходы за месяц</span>
      </div>
      <div class="summary-card card">
        <span class="sum-icon">💰</span>
        <span class="sum-num">{{ fmt(financeStore.incomeByMonth(selectedYear, selectedMonth)) }}</span>
        <span class="sum-label">Доходы за месяц</span>
      </div>
      <div class="summary-card card summary-balance" :class="balanceClass">
        <span class="sum-icon">⚖️</span>
        <span class="sum-num">{{ fmt(financeStore.balance(selectedYear, selectedMonth)) }}</span>
        <span class="sum-label">Баланс месяца</span>
      </div>
    </div>

    <!-- Add forms -->
    <div class="forms-row">
      <!-- Add expense -->
      <div class="card form-card">
        <h2 class="section-title">➕ Добавить расход</h2>
        <div class="form-grid">
          <input v-model="expForm.name" class="input" placeholder="Название товара/услуги" />
          <input v-model.number="expForm.amount" type="number" min="0" class="input" placeholder="Сумма" />
          <select v-model="expForm.category" class="input">
            <option value="">Категория</option>
            <option v-for="cat in financeStore.categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <input v-model="expForm.date" type="date" class="input" />
        </div>
        <button class="btn btn-primary form-btn" @click="addExpense">Добавить расход</button>
      </div>

      <!-- Add income -->
      <div class="card form-card">
        <h2 class="section-title">➕ Добавить доход</h2>
        <div class="form-grid">
          <input v-model="incForm.source" class="input" placeholder="Источник дохода" />
          <input v-model.number="incForm.amount" type="number" min="0" class="input" placeholder="Сумма" />
          <input v-model="incForm.note" class="input" placeholder="Заметка (необязательно)" />
          <input v-model="incForm.date" type="date" class="input" />
        </div>
        <button class="btn btn-primary form-btn" @click="addIncome">Добавить доход</button>
      </div>
    </div>

    <!-- Expenses table -->
    <div class="card table-card">
      <h2 class="section-title">📋 Расходы — {{ monthLabel }}</h2>
      <div class="table-filters">
        <input v-model="expSearch" class="input filter-input" placeholder="🔍 Поиск по названию" />
        <select v-model="expCatFilter" class="input filter-select">
          <option value="">Все категории</option>
          <option v-for="cat in financeStore.categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Сумма</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exp in filteredExpenses" :key="exp.id">
              <td class="td-date">{{ fmtDate(exp.date) }}</td>
              <td>{{ exp.name }}</td>
              <td><span class="cat-badge" :data-cat="catIndex(exp.category)">{{ exp.category }}</span></td>
              <td class="td-amount">{{ fmt(exp.amount) }}</td>
              <td><button class="btn-del" @click="financeStore.deleteExpense(exp.id)">✕</button></td>
            </tr>
            <tr v-if="!filteredExpenses.length">
              <td colspan="5" class="empty-row">Нет расходов</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="tfoot-label">Итого</td>
              <td class="td-amount tfoot-total">{{ fmt(filteredExpensesTotal) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Incomes table -->
    <div class="card table-card">
      <h2 class="section-title">📋 Доходы — {{ monthLabel }}</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Источник</th>
              <th>Заметка</th>
              <th>Сумма</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in monthIncomes" :key="inc.id">
              <td class="td-date">{{ fmtDate(inc.date) }}</td>
              <td>{{ inc.source }}</td>
              <td class="td-note">{{ inc.note }}</td>
              <td class="td-amount income-amount">{{ fmt(inc.amount) }}</td>
              <td><button class="btn-del" @click="financeStore.deleteIncome(inc.id)">✕</button></td>
            </tr>
            <tr v-if="!monthIncomes.length">
              <td colspan="5" class="empty-row">Нет доходов</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Category breakdown -->
    <div class="card cat-card">
      <h2 class="section-title">🗂️ Разбивка по категориям — {{ monthLabel }}</h2>
      <div v-if="Object.keys(catBreakdown).length" class="cat-list">
        <div
          v-for="(sum, cat, idx) in catBreakdown"
          :key="cat"
          class="cat-row"
        >
          <span class="cat-name" :data-cat="String(idx % 8)">{{ cat }}</span>
          <div class="cat-bar-track">
            <div
              class="cat-bar-fill"
              :data-cat="String(idx % 8)"
              :style="{ width: (sum / catTotal * 100).toFixed(1) + '%' }"
            />
          </div>
          <span class="cat-pct">{{ (sum / catTotal * 100).toFixed(0) }}%</span>
          <span class="cat-sum">{{ fmt(sum) }}</span>
        </div>
      </div>
      <p v-else class="empty-hint">Нет расходов за месяц</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance.js'

const financeStore = useFinanceStore()

// --- Today & week ---
function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function getMondayISO() {
  const d = new Date()
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

const todayKey = todayISO()
const weekStart = getMondayISO()

// --- Month navigation ---
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)

const monthLabel = computed(() => {
  const d = new Date(selectedYear.value, selectedMonth.value - 1, 1)
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
})

function shiftMonth(delta) {
  let m = selectedMonth.value + delta
  let y = selectedYear.value
  if (m > 12) { m = 1; y++ }
  if (m < 1) { m = 12; y-- }
  selectedMonth.value = m
  selectedYear.value = y
}

// --- Balance class ---
const balanceClass = computed(() =>
  financeStore.balance(selectedYear.value, selectedMonth.value) >= 0 ? 'balance-pos' : 'balance-neg'
)

// --- Add expense form ---
const expForm = ref({
  name: '',
  amount: '',
  category: '',
  date: todayISO(),
})

function addExpense() {
  if (!expForm.value.name.trim() || !expForm.value.amount || !expForm.value.category) return
  financeStore.addExpense(expForm.value.name.trim(), expForm.value.amount, expForm.value.category, expForm.value.date)
  expForm.value.name = ''
  expForm.value.amount = ''
  expForm.value.category = ''
  expForm.value.date = todayISO()
}

// --- Add income form ---
const incForm = ref({
  source: '',
  amount: '',
  note: '',
  date: todayISO(),
})

function addIncome() {
  if (!incForm.value.source.trim() || !incForm.value.amount) return
  financeStore.addIncome(incForm.value.source.trim(), incForm.value.amount, incForm.value.note, incForm.value.date)
  incForm.value.source = ''
  incForm.value.amount = ''
  incForm.value.note = ''
  incForm.value.date = todayISO()
}

// --- Expense filters ---
const expSearch = ref('')
const expCatFilter = ref('')

const monthExpenses = computed(() =>
  financeStore.expenses
    .filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === selectedYear.value && d.getMonth() + 1 === selectedMonth.value
    })
    .sort((a, b) => b.date.localeCompare(a.date))
)

const filteredExpenses = computed(() =>
  monthExpenses.value.filter(e => {
    const matchSearch = !expSearch.value || e.name.toLowerCase().includes(expSearch.value.toLowerCase())
    const matchCat = !expCatFilter.value || e.category === expCatFilter.value
    return matchSearch && matchCat
  })
)

const filteredExpensesTotal = computed(() =>
  filteredExpenses.value.reduce((s, e) => s + e.amount, 0)
)

// --- Incomes for month ---
const monthIncomes = computed(() =>
  financeStore.incomes
    .filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === selectedYear.value && d.getMonth() + 1 === selectedMonth.value
    })
    .sort((a, b) => b.date.localeCompare(a.date))
)

// --- Category breakdown ---
const catBreakdown = computed(() =>
  financeStore.expensesByCategory(selectedYear.value, selectedMonth.value)
)

const catTotal = computed(() =>
  Object.values(catBreakdown.value).reduce((s, v) => s + v, 0)
)

function catIndex(cat) {
  const idx = financeStore.categories.indexOf(cat)
  return String(idx >= 0 ? idx % 8 : 0)
}

// --- Formatters ---
function fmt(num) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num || 0)
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.finance-page {
  max-width: 900px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.month-label {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
  text-transform: capitalize;
}

/* Summary */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 0.5rem;
  text-align: center;
}

.sum-icon {
  font-size: 1.4rem;
}

.sum-num {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  word-break: break-all;
}

.sum-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.summary-balance.balance-pos .sum-num { color: var(--success); }
.summary-balance.balance-neg .sum-num { color: var(--danger); }

/* Forms */
.forms-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.form-btn {
  width: 100%;
  justify-content: center;
}

/* Tables */
.table-card {
  margin-bottom: 1.25rem;
}

.table-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.filter-input {
  flex: 1;
  min-width: 140px;
}

.filter-select {
  min-width: 140px;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.data-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}

.data-table tbody tr:hover {
  background: var(--bg-secondary);
}

.td-date {
  color: var(--text-secondary);
  font-size: 0.82rem;
  white-space: nowrap;
}

.td-amount {
  font-weight: 600;
  color: var(--danger);
  white-space: nowrap;
}

.income-amount {
  color: var(--success);
}

.td-note {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.empty-row {
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
}

.tfoot-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.tfoot-total {
  font-size: 1rem;
}

/* Category badge */
.cat-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
}

.cat-badge[data-cat="0"] { background: rgba(108,99,255,0.15); color: #6C63FF; }
.cat-badge[data-cat="1"] { background: rgba(76,175,80,0.15); color: #4CAF50; }
.cat-badge[data-cat="2"] { background: rgba(255,152,0,0.15); color: #FF9800; }
.cat-badge[data-cat="3"] { background: rgba(255,82,82,0.15); color: #FF5252; }
.cat-badge[data-cat="4"] { background: rgba(33,150,243,0.15); color: #2196F3; }
.cat-badge[data-cat="5"] { background: rgba(156,39,176,0.15); color: #9C27B0; }
.cat-badge[data-cat="6"] { background: rgba(0,188,212,0.15); color: #00BCD4; }
.cat-badge[data-cat="7"] { background: rgba(121,85,72,0.15); color: #795548; }

.btn-del {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: color 0.2s;
  line-height: 1;
}

.btn-del:hover {
  color: var(--danger);
}

/* Category breakdown */
.cat-card {
  margin-bottom: 1.25rem;
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.cat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cat-name {
  width: 110px;
  flex-shrink: 0;
  font-size: 0.85rem;
  color: var(--text-primary);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.cat-name[data-cat="0"] { color: #6C63FF; }
.cat-name[data-cat="1"] { color: #4CAF50; }
.cat-name[data-cat="2"] { color: #FF9800; }
.cat-name[data-cat="3"] { color: #FF5252; }
.cat-name[data-cat="4"] { color: #2196F3; }
.cat-name[data-cat="5"] { color: #9C27B0; }
.cat-name[data-cat="6"] { color: #00BCD4; }
.cat-name[data-cat="7"] { color: #795548; }

.cat-bar-track {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 999px;
  height: 16px;
  overflow: hidden;
}

.cat-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
  min-width: 2px;
}

.cat-bar-fill[data-cat="0"] { background: #6C63FF; }
.cat-bar-fill[data-cat="1"] { background: #4CAF50; }
.cat-bar-fill[data-cat="2"] { background: #FF9800; }
.cat-bar-fill[data-cat="3"] { background: #FF5252; }
.cat-bar-fill[data-cat="4"] { background: #2196F3; }
.cat-bar-fill[data-cat="5"] { background: #9C27B0; }
.cat-bar-fill[data-cat="6"] { background: #00BCD4; }
.cat-bar-fill[data-cat="7"] { background: #795548; }

.cat-pct {
  width: 36px;
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.cat-sum {
  width: 90px;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}

.empty-hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .forms-row {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
