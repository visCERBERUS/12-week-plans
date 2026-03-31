<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="visible" class="flashcard-overlay" @click.self="close">
        <div class="flashcard-panel">
          <!-- Close button -->
          <button class="close-btn" @click="close" title="Закрыть (Esc)">✕</button>

          <!-- Done screen -->
          <div v-if="done" class="done-screen">
            <div class="done-emoji">🎉</div>
            <h2 class="done-title">Повторение завершено!</h2>
            <p class="done-sub">Ты прошёл {{ cards.length }} карточ{{ pluralCards(cards.length) }}</p>
            <button class="btn btn-primary" @click="close">Закрыть</button>
          </div>

          <!-- Review screen -->
          <template v-else>
            <div class="review-counter">
              Карточка {{ currentIndex + 1 }} из {{ cards.length }}
            </div>
            <div v-if="currentCard" class="note-label">
              📝 из «{{ currentCard.noteTitle }}»
            </div>

            <!-- Card with slide transition -->
            <Transition :name="slideDirection" mode="out-in">
              <div :key="currentIndex" class="review-card">
                <div class="review-question">{{ currentCard.question }}</div>

                <Transition name="answer-reveal">
                  <div v-if="answerShown" class="review-answer">
                    <div class="answer-divider">——</div>
                    <div class="answer-text">{{ currentCard.answer }}</div>
                  </div>
                </Transition>

                <div v-if="!answerShown" class="show-answer-wrap">
                  <button class="btn btn-primary show-answer-btn" @click="showAnswer">
                    Показать ответ
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Quality buttons -->
            <Transition name="fade-up">
              <div v-if="answerShown" class="quality-section">
                <p class="quality-label">Насколько легко вспомнили?</p>
                <div class="quality-buttons">
                  <button
                    v-for="q in qualityOptions"
                    :key="q.value"
                    class="quality-btn"
                    :class="`quality-${q.value}`"
                    @click="rate(q.value)"
                  >
                    {{ q.emoji }}<br />{{ q.label }}
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Progress bar -->
            <div class="review-progress">
              <div class="progress-bar-wrap">
                <div
                  class="progress-bar-fill"
                  :style="{ width: progressPct + '%' }"
                />
              </div>
              <span class="progress-label">{{ currentIndex }}/{{ cards.length }} ({{ progressPct }}%)</span>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge.js'
import { pluralRu } from '../utils/pluralize.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  cards: { type: Array, default: () => [] },
})

const emit = defineEmits(['close'])

const store = useKnowledgeStore()

const currentIndex = ref(0)
const answerShown = ref(false)
const done = ref(false)
const slideDirection = ref('slide-left')

const qualityOptions = [
  { value: 0, emoji: '😞', label: 'Не помню' },
  { value: 1, emoji: '😕', label: 'Сложно' },
  { value: 2, emoji: '😐', label: 'Нормально' },
  { value: 3, emoji: '🙂', label: 'Легко' },
  { value: 4, emoji: '😄', label: 'Отлично' },
]

const currentCard = computed(() => props.cards[currentIndex.value] || null)
const progressPct = computed(() =>
  props.cards.length > 0 ? Math.round(currentIndex.value / props.cards.length * 100) : 0
)

watch(() => props.visible, (v) => {
  if (v) {
    currentIndex.value = 0
    answerShown.value = false
    done.value = false
  }
})

function showAnswer() {
  answerShown.value = true
}

function rate(quality) {
  const card = currentCard.value
  if (!card) return

  store.reviewFlashcard(card.noteId, card.id, quality)

  slideDirection.value = 'slide-left'
  if (currentIndex.value + 1 >= props.cards.length) {
    done.value = true
  } else {
    currentIndex.value++
    answerShown.value = false
  }
}

function close() {
  emit('close')
}

function pluralCards(n) {
  return pluralRu(n, ['у', 'и', ''])
}

function onKeyDown(e) {
  if (!props.visible) return
  if (e.key === 'Escape') close()
  if (e.key === ' ' && !answerShown.value) {
    e.preventDefault()
    showAnswer()
  }
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.flashcard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.flashcard-panel {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  min-height: 480px;
  padding: 2rem 2rem 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
}

/* Overlay animations */
.overlay-fade-enter-active, .overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }
.overlay-fade-enter-active .flashcard-panel,
.overlay-fade-leave-active .flashcard-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.overlay-fade-enter-from .flashcard-panel,
.overlay-fade-leave-to .flashcard-panel {
  transform: scale(0.95);
  opacity: 0;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--text-secondary);
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}
.close-btn:hover { color: var(--text-primary); background: var(--bg-secondary); }

.review-counter {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.note-label {
  font-size: 0.78rem;
  color: var(--accent);
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

/* Review card */
.review-card {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 200px;
  justify-content: center;
  flex: 1;
}

.review-question {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.5;
}

.answer-divider {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  letter-spacing: 0.2em;
}

.review-answer {
  text-align: center;
  width: 100%;
}

.answer-text {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.show-answer-wrap {
  margin-top: 0.5rem;
}

.show-answer-btn {
  padding: 0.6rem 2rem;
  font-size: 0.95rem;
}

/* Answer reveal animation */
.answer-reveal-enter-active { transition: all 0.3s ease; }
.answer-reveal-enter-from { opacity: 0; transform: translateY(10px); }

/* Slide card transitions */
.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.25s ease;
}
.slide-left-enter-from { opacity: 0; transform: translateX(40px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-40px); }

/* Quality section */
.quality-section {
  margin-top: 1.25rem;
  width: 100%;
  text-align: center;
}

.quality-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.quality-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.quality-btn {
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-size: 0.78rem;
  font-family: inherit;
  transition: all 0.2s;
  min-width: 72px;
  text-align: center;
  line-height: 1.4;
}
.quality-btn:hover { border-color: var(--accent); background: rgba(124, 111, 255, 0.15); }
.quality-0:hover { border-color: var(--danger); background: rgba(239, 68, 68, 0.1); }
.quality-4:hover { border-color: var(--success); background: rgba(74, 222, 128, 0.1); }

/* Fade-up animation for quality section */
.fade-up-enter-active { transition: all 0.3s ease; }
.fade-up-enter-from { opacity: 0; transform: translateY(16px); }

/* Progress */
.review-progress {
  margin-top: 1.25rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Done screen */
.done-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}

.done-emoji { font-size: 3.5rem; }
.done-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.done-sub { font-size: 1rem; color: var(--text-secondary); }

@media (max-width: 600px) {
  .flashcard-panel {
    border-radius: 0;
    min-height: 100vh;
    padding: 1.5rem 1rem;
  }
  .flashcard-overlay {
    padding: 0;
    align-items: flex-start;
  }
  .quality-btn { min-width: 58px; padding: 0.4rem 0.5rem; }
}
</style>
