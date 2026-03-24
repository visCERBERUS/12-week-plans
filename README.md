<div align="center">

# 🗓️ Vis Method — 12-Week Plans

**Система планирования и продуктивности на основе методологии 12-недельного года**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-2.1-FFD859?style=for-the-badge&logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[🇷🇺 Русский](#-русский) · [🇬🇧 English](#-english) · [🇪🇸 Español](#-español) · [🇨🇳 中文](#-中文)

</div>

---

## 🇷🇺 Русский

### 📌 О проекте

**Vis Method** — это веб-приложение для планирования и отслеживания продуктивности, основанное на методологии **12-недельного года** (12 Week Year). Вместо годового планирования вы фокусируетесь на 12-недельных спринтах, что позволяет достигать целей быстрее и эффективнее.

### ✨ Возможности

| Модуль | Описание |
|---|---|
| 📊 **Дашборд** | Общий обзор прогресса, статистика выполнения задач, обратный отсчёт до конца 12-недельного периода |
| ✅ **Ежедневные задачи** | Управление задачами на каждый день с приоритетами и статусами |
| 📅 **Ежедневный трекер** | Отслеживание привычек и ежедневных показателей |
| 📋 **Недельный план** | Планирование задач на текущую неделю |
| 🗓️ **Месячный план** | Стратегические цели на месяц |
| 🎯 **Годовой план** | Долгосрочное видение и цели на год |
| 💰 **Финансы** | Учёт доходов, расходов и финансовых целей |
| 🍅 **Помодоро-таймер** | Встроенный таймер по технике Помодоро для концентрации |
| 📈 **Трекер продуктивности** | Аналитика и графики эффективности |
| ⚙️ **Настройки** | Персонализация приложения |

### 🛠️ Технологии

- **Vue.js 3.4** — реактивный UI-фреймворк с Composition API
- **Vue Router 4** — клиентская маршрутизация (SPA)
- **Pinia 2** — управление состоянием приложения
- **Vite 5** — молниеносная сборка и dev-сервер
- **LocalStorage** — хранение данных на стороне клиента (без backend)
- **Google Fonts** (Inter, Montserrat) — типографика
- **Render.com** — конфигурация деплоя

### 📁 Структура проекта

```
12-week-plans/
├── public/                  # Статические ресурсы
├── src/
│   ├── assets/              # Изображения, стили
│   ├── components/
│   │   ├── AppLogo.vue      # Логотип приложения
│   │   ├── AppNav.vue       # Навигационная панель
│   │   ├── CountdownTimer.vue
│   │   ├── PlanTaskCard.vue
│   │   └── TaskCard.vue
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   ├── tasks.js
│   │   ├── dailyTracker.js
│   │   ├── finance.js
│   │   ├── monthlyPlan.js
│   │   ├── weeklyPlan.js
│   │   ├── yearPlan.js
│   │   ├── pomodoro.js
│   │   └── settings.js
│   ├── views/
│   │   ├── Dashboard.vue
│   │   ├── DailyTasks.vue
│   │   ├── DailyTracker.vue
│   │   ├── WeeklyPlan.vue
│   │   ├── MonthlyPlan.vue
│   │   ├── YearPlan.vue
│   │   ├── Finance.vue
│   │   ├── PomodoroTimer.vue
│   │   ├── ProductivityTracker.vue
│   │   └── Settings.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
├── package.json
└── render.yaml
```

### 🚀 Установка и запуск

#### Требования

- [Node.js](https://nodejs.org/) версии **18+**
- npm (входит в комплект Node.js)

#### Шаг 1 — Клонирование репозитория

```bash
git clone https://github.com/AshCorporate/12-week-plans.git
cd 12-week-plans
```

#### Шаг 2 — Установка зависимостей

```bash
npm install
```

#### Шаг 3 — Запуск в режиме разработки

```bash
npm run dev
```

Приложение откроется по адресу: **http://localhost:5173**

#### Шаг 4 — Сборка для продакшна

```bash
npm run build
```

Собранные файлы появятся в папке `dist/`.

#### Шаг 5 — Предпросмотр сборки

```bash
npm run preview
```

### ☁️ Деплой на Render.com

1. Зарегистрируйтесь на [render.com](https://render.com)
2. Нажмите **New → Static Site**
3. Подключите репозиторий `AshCorporate/12-week-plans`
4. Render автоматически обнаружит `render.yaml`:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `./dist`
5. Нажмите **Deploy** — сайт будет готов за ~2 минуты ✅

### 💾 Хранение данных

Все данные сохраняются в **LocalStorage** браузера — серверная часть не нужна.

---

## 🇬🇧 English

### 📌 About the Project

**Vis Method** is a web-based planning and productivity tracking application built on the **12 Week Year** methodology. Instead of annual planning, you focus on 12-week sprints, allowing you to achieve goals faster and more efficiently.

### ✨ Features

| Module | Description |
|---|---|
| 📊 **Dashboard** | Overall progress overview, task completion stats, 12-week countdown |
| ✅ **Daily Tasks** | Manage daily tasks with priorities and statuses |
| 📅 **Daily Tracker** | Track habits and daily metrics |
| 📋 **Weekly Plan** | Plan tasks for the current week |
| 🗓️ **Monthly Plan** | Strategic goals for the month |
| 🎯 **Year Plan** | Long-term vision and annual goals |
| 💰 **Finance** | Track income, expenses and financial goals |
| 🍅 **Pomodoro Timer** | Built-in Pomodoro technique timer for focus sessions |
| 📈 **Productivity Tracker** | Analytics and performance charts |
| ⚙️ **Settings** | Application personalization |

### 🛠️ Tech Stack

- **Vue.js 3.4** — reactive UI framework with Composition API
- **Vue Router 4** — client-side routing (SPA)
- **Pinia 2** — application state management
- **Vite 5** — lightning-fast build tool and dev server
- **LocalStorage** — client-side data persistence (no backend required)
- **Google Fonts** (Inter, Montserrat) — typography
- **Render.com** — deployment configuration

### 🚀 Installation & Setup

#### Requirements

- [Node.js](https://nodejs.org/) version **18+**
- npm (bundled with Node.js)

#### Step 1 — Clone the repository

```bash
git clone https://github.com/AshCorporate/12-week-plans.git
cd 12-week-plans
```

#### Step 2 — Install dependencies

```bash
npm install
```

#### Step 3 — Start development server

```bash
npm run dev
```

Available at: **http://localhost:5173**

#### Step 4 — Build for production

```bash
npm run build
```

#### Step 5 — Preview production build

```bash
npm run preview
```

### ☁️ Deploy to Render.com

1. Sign up at [render.com](https://render.com)
2. Click **New → Static Site**
3. Connect the `AshCorporate/12-week-plans` repository
4. Render auto-detects `render.yaml`:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `./dist`
5. Click **Deploy** — live in ~2 minutes ✅

### 💾 Data Storage

All data is stored in the browser's **LocalStorage** — no server required.

---

## 🇪🇸 Español

### 📌 Sobre el proyecto

**Vis Method** es una aplicación web de planificación y seguimiento de productividad basada en la metodología de **12 semanas al año**. En lugar de la planificación anual, te enfocas en sprints de 12 semanas para alcanzar metas más rápido.

### ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 📊 **Panel principal** | Vista general del progreso, estadísticas de tareas, cuenta regresiva de 12 semanas |
| ✅ **Tareas diarias** | Gestión de tareas con prioridades y estados |
| 📅 **Seguimiento diario** | Seguimiento de hábitos y métricas diarias |
| 📋 **Plan semanal** | Planificación para la semana actual |
| 🗓️ **Plan mensual** | Objetivos estratégicos del mes |
| 🎯 **Plan anual** | Visión a largo plazo y metas anuales |
| 💰 **Finanzas** | Registro de ingresos, gastos y metas financieras |
| 🍅 **Temporizador Pomodoro** | Temporizador integrado con la técnica Pomodoro |
| 📈 **Tracker de productividad** | Análisis y gráficos de rendimiento |
| ⚙️ **Ajustes** | Personalización de la aplicación |

### 🛠️ Tecnologías

- **Vue.js 3.4** — framework de UI reactivo con Composition API
- **Vue Router 4** — enrutamiento del lado del cliente (SPA)
- **Pinia 2** — gestión del estado de la aplicación
- **Vite 5** — herramienta de construcción ultrarrápida
- **LocalStorage** — persistencia de datos en el cliente (sin backend)
- **Google Fonts** (Inter, Montserrat) — tipografía

### 🚀 Instalación

#### Requisitos

- [Node.js](https://nodejs.org/) versión **18+**

```bash
git clone https://github.com/AshCorporate/12-week-plans.git
cd 12-week-plans
npm install
npm run dev        # → http://localhost:5173
npm run build      # Compilar para producción
npm run preview    # Vista previa
```

### ☁️ Despliegue en Render.com

1. Regíстрируйтесь на [render.com](https://render.com)
2. **New → Static Site** → подключите этот репозиторий
3. Render автоматически обнаружит `render.yaml`
4. Нажмите **Deploy** ✅

---

## 🇨🇳 中文

### 📌 项目简介

**Vis Method** 是一款基于 **12周年度法**（12 Week Year）方法论构建的网页端规划与效率追踪应用。专注于12周冲刺周期，而非年度规划，从而更快实现目标。

### ✨ 功能模块

| 模块 | 描述 |
|---|---|
| 📊 **仪表板** | 总体进度概览、任务完成统计、12周倒计时 |
| ✅ **每日任务** | 管理每天任务，支持优先级和状态 |
| 📅 **每日追踪** | 习惯与每日指标追踪 |
| 📋 **周计划** | 本周任务规划 |
| 🗓️ **月计划** | 当月战略目标 |
| 🎯 **年计划** | 长期愿景与年度目标 |
| 💰 **财务管理** | 收入、支出及财务目标 |
| 🍅 **番茄时钟** | 内置番茄工作法计时器 |
| 📈 **效率追踪** | 绩效分析与图表 |
| ⚙️ **设置** | 应用个性化配置 |

### 🛠️ 技术栈

- **Vue.js 3.4** — 基于 Composition API 的响应式 UI 框架
- **Vue Router 4** — 客户端路由（SPA）
- **Pinia 2** — 应用状态管理
- **Vite 5** — 极速构建工具
- **LocalStorage** — 客户端数据持久化（无需后端）
- **Google Fonts** — 字体排版

### 🚀 安装与启动

#### 环境要求

- [Node.js](https://nodejs.org/) 版本 **18+**

```bash
git clone https://github.com/AshCorporate/12-week-plans.git
cd 12-week-plans
npm install
npm run dev        # → http://localhost:5173
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
```

### ☁️ 部署到 Render.com

1. 在 [render.com](https://render.com) 注册
2. **New → Static Site** → 连接仓库
3. Render 自动检测 `render.yaml`
4. 点击 **Deploy** — 约2分钟上线 ✅

### 💾 数据存储

所有数据存储在浏览器的 **LocalStorage** 中，无需服务器，关闭后数据依然保留。

---

<div align="center">

## ⚡ Quick Start

```bash
git clone https://github.com/AshCorporate/12-week-plans.git && cd 12-week-plans && npm install && npm run dev
```

**→ http://localhost:5173**

---

Made with ❤️ using [Vue.js](https://vuejs.org/) · Deployed on [Render.com](https://render.com)

</div>
