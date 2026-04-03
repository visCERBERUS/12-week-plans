<template>
  <div class="plan1c">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1 class="page-title hero-title">🏗️ 6-недельный план: 1С-разработчик</h1>
      <p class="hero-subtitle">Цель — первый оффер как можно быстрее</p>
      <div class="stats-row">
        <div class="stat-card card">
          <div class="stat-value">42</div>
          <div class="stat-label">дня</div>
        </div>
        <div class="stat-card card">
          <div class="stat-value">14</div>
          <div class="stat-label">помидоров/день</div>
        </div>
        <div class="stat-card card">
          <div class="stat-value">3</div>
          <div class="stat-label">проекта</div>
        </div>
      </div>
    </div>

    <!-- Daily Structure -->
    <section class="section">
      <h2 class="section-title">🍅 Ежедневная структура (14 помидоров)</h2>
      <div class="pomodoro-grid">
        <div
          v-for="p in pomodoroItems"
          :key="p.num"
          class="pomo-card"
          :class="'pomo-' + p.type"
        >
          <div class="pomo-num">P{{ p.num }}</div>
          <div class="pomo-name">{{ p.name }}</div>
          <div class="pomo-desc">{{ p.desc }}</div>
        </div>
      </div>
    </section>

    <!-- Base Rules -->
    <section class="section">
      <h2 class="section-title">📌 Базовые правила</h2>
      <div class="card rules-card">
        <ol class="rules-list">
          <li v-for="(rule, i) in baseRules" :key="i" class="rule-item">
            <span class="rule-icon">{{ rule.icon }}</span>
            <span class="rule-text">{{ rule.text }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- 6 Weeks Goals -->
    <section class="section">
      <h2 class="section-title">📅 6 недель — цели</h2>
      <div class="weeks-grid">
        <div
          v-for="week in weeks"
          :key="week.num"
          class="week-card card"
          :class="'week-color-' + week.num"
        >
          <div class="week-header" @click="toggleWeek(week.num)">
            <div class="week-header-left">
              <span class="week-icon">{{ week.icon }}</span>
              <div>
                <div class="week-title">Неделя {{ week.num }}: {{ week.goal }}</div>
                <div class="week-result">✅ {{ week.result }}</div>
              </div>
            </div>
            <span class="week-toggle">{{ openWeeks.includes(week.num) ? '▲' : '▼' }}</span>
          </div>
          <div v-if="openWeeks.includes(week.num)" class="week-body">
            <ul class="week-topics">
              <li v-for="(topic, ti) in week.topics" :key="ti">{{ topic }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Portfolio Projects -->
    <section class="section">
      <h2 class="section-title">💼 3 проекта для портфолио</h2>
      <div class="projects-grid">
        <div v-for="proj in projects" :key="proj.num" class="project-card card">
          <div class="project-header">
            <span class="project-icon">{{ proj.icon }}</span>
            <div>
              <div class="project-title">Проект {{ proj.num }}: {{ proj.name }}</div>
            </div>
          </div>
          <ul class="project-features">
            <li v-for="(feat, fi) in proj.features" :key="fi">{{ feat }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Must-have Interview -->
    <section class="section">
      <h2 class="section-title">🎯 Must-have для собеседования</h2>
      <div class="interview-grid">
        <div v-for="(topic, i) in interviewTopics" :key="i" class="interview-badge">
          <span class="interview-num">{{ i + 1 }}</span>
          <span class="interview-text">{{ topic }}</span>
        </div>
      </div>
    </section>

    <!-- Resources -->
    <section class="section">
      <h2 class="section-title">📚 Ресурсы</h2>
      <div class="card">
        <ul class="resources-list">
          <li v-for="res in resources" :key="res.title" class="resource-item">
            <span class="resource-icon">{{ res.icon }}</span>
            <div class="resource-info">
              <a :href="res.url" target="_blank" rel="noopener noreferrer" class="resource-link">{{ res.title }}</a>
              <span class="resource-source">{{ res.source }}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- My Legend -->
    <section class="section">
      <h2 class="section-title">🗣️ Моя легенда</h2>
      <div class="card legend-card">
        <div class="legend-quote">
          «У меня сильная классическая разработческая база: C++, C#, Python, алгоритмы, БД, математика.
          Я целенаправленно вошел в 1С, за последние недели собрал 3 прикладных проекта на платформе:
          склад/продажи, CRM light и учёт денежных потоков. Реализовал документы, справочники, регистры накопления,
          запросы, СКД, формы, роли и бизнес-логику проведения. Ищу стартовую позицию junior 1С разработчика
          с быстрым ростом.»
        </div>
      </div>
    </section>

    <!-- Detailed Weekly Plan Accordion -->
    <section class="section">
      <h2 class="section-title">📋 Детальный план по неделям</h2>
      <div class="accordion-list">
        <div
          v-for="week in detailedWeeks"
          :key="week.num"
          class="accordion-item card"
        >
          <div class="accordion-header" @click="toggleDetail(week.num)">
            <span>Неделя {{ week.num }}: {{ week.title }}</span>
            <span class="accordion-toggle">{{ openDetails.includes(week.num) ? '▲' : '▼' }}</span>
          </div>
          <div v-if="openDetails.includes(week.num)" class="accordion-body">
            <div v-for="day in week.days" :key="day.day" class="detail-day">
              <div class="detail-day-title">День {{ day.day }}: {{ day.title }}</div>
              <ul class="detail-tasks">
                <li v-for="(task, ti) in day.tasks" :key="ti">{{ task }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const openWeeks = ref([])
const openDetails = ref([])

function toggleWeek(num) {
  const idx = openWeeks.value.indexOf(num)
  if (idx === -1) openWeeks.value.push(num)
  else openWeeks.value.splice(idx, 1)
}

function toggleDetail(num) {
  const idx = openDetails.value.indexOf(num)
  if (idx === -1) openDetails.value.push(num)
  else openDetails.value.splice(idx, 1)
}

const pomodoroItems = [
  { num: 1, name: 'Теория — новая тема', desc: 'Изучение + демонстрация', type: 'theory' },
  { num: 2, name: 'Теория — повтор', desc: 'Повтор вчерашнего материала', type: 'theory' },
  { num: 3, name: 'Теория — примеры', desc: 'Разбор и анализ примеров', type: 'theory' },
  { num: 4, name: 'Теория — конспект', desc: 'Структурированный конспект', type: 'theory' },
  { num: 5, name: 'Практика 1С', desc: 'Работа в конфигураторе 1С', type: 'practice' },
  { num: 6, name: 'Практика 1С', desc: 'Работа в конфигураторе 1С', type: 'practice' },
  { num: 7, name: 'Практика 1С', desc: 'Работа в конфигураторе 1С', type: 'practice' },
  { num: 8, name: 'Практика 1С', desc: 'Работа в конфигураторе 1С', type: 'practice' },
  { num: 9, name: 'Портфолио', desc: 'README, скрины, описание функционала', type: 'portfolio' },
  { num: 10, name: 'Портфолио', desc: 'Оформление и публикация', type: 'portfolio' },
  { num: 11, name: 'Карьера', desc: 'Отклики, резюме, вакансии', type: 'career' },
  { num: 12, name: 'Карьера', desc: 'Анализ рынка и отклики', type: 'career' },
  { num: 13, name: 'Сертификация', desc: 'Тесты и задачи на сертификат', type: 'cert' },
  { num: 14, name: 'Дневник', desc: 'Ретроспектива + план на завтра', type: 'diary' },
]

const baseRules = [
  { icon: '🖥️', text: 'Каждый день работаешь в 1С руками' },
  { icon: '💼', text: 'Каждый день пополняешь портфолио' },
  { icon: '📨', text: 'С конца 2-й недели — ежедневные отклики' },
  { icon: '🎤', text: 'С 3-й недели — ежедневная отработка ответов на собеседование' },
  { icon: '📝', text: 'С 4-й недели — решение задач под сертификацию (минимум 1 помидор в день)' },
  { icon: '✍️', text: 'Всё изученное оформляешь в заметки «что умею показать работодателю»' },
]

const weeks = [
  {
    num: 1,
    icon: '🚀',
    goal: 'Вход в платформу и базовые объекты',
    result: 'Мини-база (Контрагенты + Номенклатура + Поступление + Установка цен), резюме v1',
    topics: [
      'Установка и настройка 1С:Предприятие 8.3',
      'Конфигуратор: структура конфигурации',
      'Справочник Контрагенты — создание, реквизиты, формы',
      'Справочник Номенклатура — группы, артикул, ед.изм',
      'Документ Поступление товаров — шапка, ТЧ, проведение',
      'Регистр сведений: установка цен',
      'Первичное резюме — Google Docs / hh.ru',
    ],
  },
  {
    num: 2,
    icon: '📦',
    goal: 'Регистры накопления, движения, запросы, СКД',
    result: 'Проект «Склад/Продажи» v1.0',
    topics: [
      'Регистр накопления ТоварыНаСкладах',
      'Движения документов, проведение',
      'Язык запросов 1С — выборки, условия, итоги',
      'Схема компоновки данных — отчёт по остаткам',
      'Документ Реализация товаров',
      'Роли: менеджер / кладовщик / администратор',
      'Портфолио: README + скрины + GitHub',
    ],
  },
  {
    num: 3,
    icon: '🛠️',
    goal: 'Управляемые формы, клиент-сервер, права, CRM light',
    result: 'Проект «Заказы/CRM»',
    topics: [
      'Управляемые формы — клиентский/серверный контекст',
      'Директивы &НаКлиенте, &НаСервере, &НаКлиентеНаСервере',
      'Справочник Клиенты, документ ЗаказКлиента',
      'Бизнес-статусы и переходы между ними',
      'Отчёт по воронке / статусам / просроченным',
      'Проверки заполнения формы',
      'Ежедневные отклики на вакансии',
    ],
  },
  {
    num: 4,
    icon: '⚡',
    goal: 'Уровень «берём на junior»: отладка, производительность, проект 3',
    result: '3 проекта + 30 ответов на вопросы собеседования',
    topics: [
      'Отладчик 1С — точки останова, просмотр переменных',
      'Профилировщик запросов, план запроса',
      'Проект 3: Финансовый учёт (ДДС, cashflow)',
      'Регистр накопления ДенежныеСредства',
      'Отчёт план-факт по периоду',
      '30 вопросов/ответов для собеседования',
      'Оформление всех 3 проектов в портфолио',
    ],
  },
  {
    num: 5,
    icon: '📤',
    goal: 'Режим «получить оффер»',
    result: '40–50 откликов, 3 оформленных проекта, 50 вопросов/ответов',
    topics: [
      'Массовые отклики: 8–10 в день',
      'Подготовка к техническим собеседованиям',
      'Финальное оформление 3 проектов',
      '50 вопросов/ответов на собеседование',
      'Подготовка к задачам на сертификат 1С:Специалист',
    ],
  },
  {
    num: 6,
    icon: '🏆',
    goal: 'Финальный штурм: собесы + сертификат',
    result: 'Офферы/финальные собесы + готовность к первому сертификату',
    topics: [
      'Технические собеседования — практика, фидбэк',
      'Решение задач уровня 1С:Специалист',
      'Повторение всех ключевых тем',
      'Переговоры и выбор оффера',
      'Подготовка к экзамену на сертификат',
    ],
  },
]

const projects = [
  {
    num: 1,
    icon: '🏭',
    name: 'Склад и продажи',
    features: [
      'Справочники: Номенклатура, Контрагенты, Склады',
      'Документы: Поступление, Реализация',
      'Регистр накопления: ТоварыНаСкладах',
      'Проведение документов, отчёт по остаткам',
      'Печатная форма (ТОРГ-12)',
      'Роли: менеджер / кладовщик / администратор',
    ],
  },
  {
    num: 2,
    icon: '🤝',
    name: 'Заказы и задачи / CRM light',
    features: [
      'Справочник Клиенты, документ ЗаказКлиента',
      'Бизнес-статусы, формы списков/объекта',
      'Проверки заполнения',
      'Отчёт по воронке / статусам / просроченным',
      'Напоминания и обработки',
    ],
  },
  {
    num: 3,
    icon: '💰',
    name: 'Финансовый mini-control',
    features: [
      'Статьи ДДС, ПоступлениеДС / СписаниеДС',
      'Регистр накопления ДенежныеСредства',
      'Отчёт cashflow',
      'План-факт по периоду',
      'Аналитика по статьям',
    ],
  },
]

const interviewTopics = [
  'Платформа и конфигурация',
  'Объекты метаданных',
  'Справочник / документ / перечисление / константа',
  'Табличная часть',
  'Проведение документа',
  'Регистр сведений vs регистр накопления',
  'Остатки и обороты',
  'Измерения / ресурсы / реквизиты',
  'Запросы 1С',
  'СКД',
  'Формы и модули',
  'Клиент/сервер',
  'Права и роли',
  'Отладка',
  'Типовые ошибки новичка',
  'Как реализовать складской учёт',
  'Как проверять отрицательные остатки',
  'Как сделать отчёт по продажам',
  'Что уже делал руками',
  'Почему именно 1С',
]

const resources = [
  { icon: '📗', title: 'Учебная версия 1С:Предприятие 8.3', url: 'https://v8.1c.ru/edu/editionforstu/', source: 'v8.1c.ru' },
  { icon: '📘', title: 'Практическое пособие разработчика Радченко/Хрусталевой', url: 'https://v8.1c.ru/metod/books/book.jsp?id=522', source: 'v8.1c.ru' },
  { icon: '📙', title: '101 совет начинающим разработчикам', url: 'https://v8.1c.ru/metod/books/book.jsp?id=552', source: 'v8.1c.ru' },
  { icon: '📕', title: 'Сборник задач для подготовки к «1С:Специалист»', url: 'https://v8.1c.ru/metod/books/book.jsp?id=555', source: 'v8.1c.ru' },
  { icon: '📓', title: 'Версия книги с 1C:EDT', url: 'https://v8.1c.ru/metod/books/book.jsp?id=617', source: 'v8.1c.ru' },
  { icon: '🌐', title: 'Официальная документация 1C:Enterprise', url: 'https://1c-dn.com/1c_enterprise/documentation/', source: '1c-dn.com' },
]

const detailedWeeks = [
  {
    num: 1,
    title: 'Вход в платформу и базовые объекты',
    days: [
      {
        day: 1,
        title: 'Установка и первый запуск',
        tasks: [
          'P1–P4: Установка 1С 8.3, создание учебной ИБ, интерфейс конфигуратора',
          'P5–P8: Создание первого справочника «Контрагенты» с реквизитами',
          'P9–P10: Скрин справочника в README на GitHub',
          'P11–P12: Зарегистрироваться на hh.ru, изучить 5 вакансий junior 1С',
          'P13: Пройти тест по интерфейсу конфигуратора (v8.1c.ru)',
          'P14: Записать что сделал, план на завтра',
        ],
      },
      {
        day: 2,
        title: 'Справочник Номенклатура',
        tasks: [
          'P1–P4: Теория — иерархические справочники, группы, подчинённые',
          'P5–P8: Создать справочник Номенклатура: артикул, ед.изм., группы',
          'P9–P10: Обновить README, добавить скрины формы справочника',
          'P11–P12: Составить базовое резюме v1 в Google Docs',
          'P13: Тест по объектам метаданных',
          'P14: Ретроспектива дня',
        ],
      },
      {
        day: 3,
        title: 'Документ Поступление товаров',
        tasks: [
          'P1–P4: Теория — документы, реквизиты шапки, табличные части',
          'P5–P8: Создать документ Поступление: шапка (контрагент, дата), ТЧ (номенклатура, кол-во, цена)',
          'P9–P10: README: описать структуру документа',
          'P11–P12: Опубликовать резюме на hh.ru',
          'P13: Тест «документы и ТЧ»',
          'P14: Дневник',
        ],
      },
      {
        day: 4,
        title: 'Регистр сведений: Цены',
        tasks: [
          'P1–P4: Теория — регистры сведений, отличие от накопления',
          'P5–P8: Создать регистр сведений ЦеныНоменклатуры, привязать к документу УстановкаЦен',
          'P9–P10: Портфолио: добавить регистр в описание проекта',
          'P11–P12: Изучить ещё 5 вакансий, выписать требования',
          'P13: Задача на регистр сведений',
          'P14: Ретроспектива',
        ],
      },
      {
        day: 5,
        title: 'Проведение и формы',
        tasks: [
          'P1–P4: Теория — процедура ОбработкаПроведения, управляемые формы',
          'P5–P8: Написать проведение для Поступления, настроить форму документа',
          'P9–P10: Обновить README, добавить схему проекта',
          'P11–P12: Отправить первые 2 отклика на hh.ru',
          'P13: Практика: написать простой запрос к регистру',
          'P14: Дневник дня',
        ],
      },
      {
        day: 6,
        title: 'Отчёт по остаткам (СКД)',
        tasks: [
          'P1–P4: Теория — схема компоновки данных, источники данных',
          'P5–P8: Создать отчёт ОстаткиТоваров на базе СКД',
          'P9–P10: Финализировать проект 1 в портфолио (скрины отчёта)',
          'P11–P12: Обновить резюме, добавить проект 1',
          'P13: Тест по СКД',
          'P14: Ретроспектива недели (кратко)',
        ],
      },
      {
        day: 7,
        title: 'Итоги недели 1',
        tasks: [
          'P1–P4: Повторить все темы недели 1: справочники, документы, регистры, формы, проведение, СКД',
          'P5–P8: Зафиксировать и дополнить проект 1, написать модульный тест логики',
          'P9–P10: Оформить итоговый README проекта 1 (v1.0)',
          'P11–P12: Изучить рынок вакансий, составить список компаний',
          'P13: Решить 3 задачи на запросы',
          'P14: Полная ретроспектива недели, план на неделю 2',
        ],
      },
    ],
  },
  {
    num: 2,
    title: 'Регистры накопления, движения, запросы, СКД',
    days: [
      { day: 1, title: 'Регистр накопления', tasks: ['Теория: виды регистров, измерения/ресурсы', 'Создать ТоварыНаСкладах', 'Отклик x2, портфолио'] },
      { day: 2, title: 'Движения документов', tasks: ['Теория: набор записей, проведение', 'Реализовать движения для Поступления', 'Портфолио update'] },
      { day: 3, title: 'Документ Реализация', tasks: ['Создать документ Реализация с движениями расхода', 'Проверить остатки через запрос', 'Отклики x2'] },
      { day: 4, title: 'Запросы: выборки, условия, итоги', tasks: ['Практика запросов: ВЫБРАТЬ, ГДЕ, ИТОГИ', 'Запрос остатков по складу', 'Тест по запросам'] },
      { day: 5, title: 'Запросы: соединения, вложенные', tasks: ['ЛЕВОЕ СОЕДИНЕНИЕ, вложенные запросы', 'Запрос продаж по контрагентам', 'Отклики x3'] },
      { day: 6, title: 'СКД: отчёт по продажам', tasks: ['Отчёт ПродажиПоКонтрагентам на СКД', 'Группировки, отборы, оформление', 'Обновить README проекта'] },
      { day: 7, title: 'Итоги недели 2', tasks: ['Финализировать проект «Склад/Продажи» v1.0', 'Роли: менеджер/кладовщик/админ', 'Ретроспектива + план на неделю 3', 'Отклики x3'] },
    ],
  },
  {
    num: 3,
    title: 'Управляемые формы, клиент-сервер, CRM light',
    days: [
      { day: 1, title: 'Управляемые формы', tasks: ['Теория клиент-серверного взаимодействия', 'Директивы &НаКлиенте/&НаСервере', 'Отклики x3'] },
      { day: 2, title: 'Справочник Клиенты', tasks: ['Создать Клиенты с реквизитами', 'Кастомная форма списка', 'Портфолио update'] },
      { day: 3, title: 'Документ ЗаказКлиента', tasks: ['Создать заказ, ТЧ, статусы', 'Бизнес-логика смены статусов', 'Отклики x3'] },
      { day: 4, title: 'Проверки заполнения', tasks: ['ПроверкаЗаполнения, программные проверки', 'Подсветка незаполненных полей', 'Первая отработка вопросов собеседования'] },
      { day: 5, title: 'Отчёт по воронке', tasks: ['СКД: воронка статусов, просроченные', 'Отбор по менеджеру, периоду', 'Отклики x3'] },
      { day: 6, title: 'Напоминания/Обработки', tasks: ['Регламентные задания или обработки', 'Отправка напоминания по заказам', 'Портфолио проекта 2'] },
      { day: 7, title: 'Итоги недели 3', tasks: ['Финализировать проект «Заказы/CRM»', 'Ретроспектива + план на неделю 4', 'Отклики x5', '10 вопросов собеседования'] },
    ],
  },
  {
    num: 4,
    title: 'Уровень junior: отладка, производительность, проект 3',
    days: [
      { day: 1, title: 'Отладчик 1С', tasks: ['Точки останова, стек вызовов, просмотр переменных', 'Найти и исправить баг в старом проекте', 'Отклики x3'] },
      { day: 2, title: 'Профилировщик запросов', tasks: ['Анализ плана запроса', 'Оптимизировать медленный запрос', 'Начать проект 3 (финансы)'] },
      { day: 3, title: 'Проект 3: структура', tasks: ['Статьи ДДС, регистр ДенежныеСредства', 'ПоступлениеДС / СписаниеДС', 'Отклики x3'] },
      { day: 4, title: 'Отчёт cashflow', tasks: ['СКД cashflow по статьям и периодам', 'План-факт сравнение', 'Тест и задачи к сертификату'] },
      { day: 5, title: 'Аналитика', tasks: ['Детализация аналитики финансов', 'Доработка форм и отчётов', 'Отклики x5'] },
      { day: 6, title: 'Завершение проекта 3', tasks: ['Финализация финансового проекта', 'README и скрины', '15 вопросов собеседования'] },
      { day: 7, title: 'Итоги недели 4', tasks: ['3 проекта + 30 вопросов/ответов', 'Ретроспектива', 'Отклики x5', 'Тест сертификации'] },
    ],
  },
  {
    num: 5,
    title: 'Режим «получить оффер»',
    days: [
      { day: 1, title: 'Интенсивные отклики', tasks: ['8–10 откликов в день', 'Подготовка кейсов для собеседований', 'Задачи сертификации'] },
      { day: 2, title: 'Техническое собеседование', tasks: ['Практика live coding 1С', 'Разбор ошибок и доработка', 'Отклики x8'] },
      { day: 3, title: 'Финальные доработки портфолио', tasks: ['Чистый код, документация', 'Скрины и видео-демо', 'Отклики x8'] },
      { day: 4, title: 'Вопросы собеседования', tasks: ['40 вопросов/ответов', 'Практика объяснения проектов', 'Отклики x8'] },
      { day: 5, title: 'Анализ фидбэка', tasks: ['Доработки по фидбэку рекрутеров', 'Задачи к сертификату', 'Отклики x8'] },
      { day: 6, title: 'Прокачка слабых мест', tasks: ['Повторить сложные темы', '50 вопросов/ответов', 'Отклики x8'] },
      { day: 7, title: 'Итоги недели 5', tasks: ['40–50 откликов суммарно за неделю', 'Ретроспектива', 'Подготовка к финальным собесам'] },
    ],
  },
  {
    num: 6,
    title: 'Финальный штурм: собесы + сертификат',
    days: [
      { day: 1, title: 'Финальные собесы', tasks: ['Технические собеседования', 'Анализ результатов', 'Отклики x5'] },
      { day: 2, title: 'Задачи на сертификат', tasks: ['Решение задач уровня 1С:Специалист', 'Повторение запросов и СКД', 'Собесы'] },
      { day: 3, title: 'Переговоры и офферы', tasks: ['Переговоры по условиям', 'Принятие решения', 'Задачи сертификации'] },
      { day: 4, title: 'Итоговое повторение', tasks: ['Повтор всех 20 тем собеседования', 'Финальная подготовка к экзамену', 'Офферы / доп. собесы'] },
      { day: 5, title: 'Экзамен 1С:Специалист', tasks: ['Подготовка к сдаче сертификата', 'Финальные правки в портфолио'] },
      { day: 6, title: 'Итоги и следующий шаг', tasks: ['Принятие оффера или продолжение поиска', 'Итоговая ретроспектива 6 недель'] },
      { day: 7, title: 'Финал', tasks: ['Документирование опыта', 'Plan B и следующие цели', 'Отдых'] },
    ],
  },
]
</script>

<style scoped>
.plan1c {
  max-width: 960px;
  padding-bottom: 3rem;
}

/* Hero */
.hero-section {
  margin-bottom: 2.5rem;
}

.hero-title {
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.stats-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 120px;
  text-align: center;
  padding: 1.25rem 1rem;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Sections */
.section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

/* Pomodoro Grid */
.pomodoro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

.pomo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pomo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--accent-glow);
}

.pomo-num {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  opacity: 0.8;
}

.pomo-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
  line-height: 1.2;
}

.pomo-desc {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

.pomo-theory { border-top: 3px solid var(--accent); }
.pomo-theory .pomo-num { color: var(--accent); }

.pomo-practice { border-top: 3px solid var(--success); }
.pomo-practice .pomo-num { color: var(--success); }

.pomo-portfolio { border-top: 3px solid #60A8FF; }
.pomo-portfolio .pomo-num { color: #60A8FF; }

.pomo-career { border-top: 3px solid #FFB020; }
.pomo-career .pomo-num { color: #FFB020; }

.pomo-cert { border-top: 3px solid var(--danger); }
.pomo-cert .pomo-num { color: var(--danger); }

.pomo-diary { border-top: 3px solid var(--text-secondary); }
.pomo-diary .pomo-num { color: var(--text-secondary); }

/* Rules */
.rules-card {
  padding: 1.5rem;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: rules-counter;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(124, 111, 255, 0.06);
  border-radius: 8px;
  border-left: 3px solid var(--accent);
  transition: background 0.2s;
}

.rule-item:hover {
  background: rgba(124, 111, 255, 0.12);
}

.rule-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.rule-text {
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Weeks Grid */
.weeks-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.week-card {
  padding: 0;
  overflow: hidden;
  border-left: 4px solid var(--accent);
  transition: box-shadow 0.2s;
}

.week-color-1 { border-left-color: #7C6FFF; }
.week-color-2 { border-left-color: #50C878; }
.week-color-3 { border-left-color: #60A8FF; }
.week-color-4 { border-left-color: #FFB020; }
.week-color-5 { border-left-color: #F06060; }
.week-color-6 { border-left-color: #C878FF; }

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.week-header:hover {
  background: rgba(255, 255, 255, 0.04);
}

.week-header-left {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.week-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 0.1rem;
}

.week-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.3;
}

.week-result {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.week-toggle {
  color: var(--text-secondary);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.week-body {
  padding: 0 1.25rem 1rem 1.25rem;
  border-top: 1px solid var(--border);
  animation: slideDown 0.2s ease;
}

.week-topics {
  padding: 0.75rem 0 0 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.week-topics li {
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.4;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.project-card {
  padding: 1.25rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-glow);
}

.project-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.project-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.project-title {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.3;
}

.project-features {
  padding: 0 0 0 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.project-features li {
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Interview Grid */
.interview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
}

.interview-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  transition: border-color 0.2s, background 0.2s;
}

.interview-badge:hover {
  border-color: var(--accent);
  background: rgba(124, 111, 255, 0.08);
}

.interview-num {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
  min-width: 1.2rem;
  text-align: right;
  flex-shrink: 0;
}

.interview-text {
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.3;
}

/* Resources */
.resources-list {
  list-style: none;
  padding: 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.resource-item:hover {
  background: rgba(124, 111, 255, 0.06);
}

.resource-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.resource-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.resource-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.resource-source {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Legend */
.legend-card {
  padding: 1.75rem 2rem;
  border-left: 4px solid var(--accent);
  background: linear-gradient(135deg, rgba(124, 111, 255, 0.08) 0%, var(--bg-card) 100%);
}

.legend-quote {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
  font-style: italic;
  quotes: "«" "»";
}

/* Accordion */
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.accordion-item {
  padding: 0;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: background 0.2s;
}

.accordion-header:hover {
  background: rgba(255, 255, 255, 0.04);
}

.accordion-toggle {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.accordion-body {
  padding: 0.75rem 1.25rem 1.25rem;
  border-top: 1px solid var(--border);
  animation: slideDown 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-day {
  background: rgba(255, 255, 255, 0.025);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  border-left: 2px solid var(--border);
}

.detail-day-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.detail-tasks {
  padding: 0 0 0 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-tasks li {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .stats-row {
    gap: 0.75rem;
  }

  .stat-card {
    min-width: 80px;
  }

  .stat-value {
    font-size: 1.6rem;
  }

  .pomodoro-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.5rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .interview-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .legend-card {
    padding: 1.25rem;
  }
}
</style>
