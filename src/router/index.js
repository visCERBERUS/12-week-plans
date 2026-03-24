import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import DailyTasks from '../views/DailyTasks.vue'
import WeeklyPlan from '../views/WeeklyPlan.vue'
import MonthlyPlan from '../views/MonthlyPlan.vue'
import YearPlan from '../views/YearPlan.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/daily', component: DailyTasks },
  { path: '/weekly', component: WeeklyPlan },
  { path: '/monthly', component: MonthlyPlan },
  { path: '/yearly', component: YearPlan },
  { path: '/settings', component: Settings },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
