import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

function uuid() {
  return crypto.randomUUID()
}

function nowISO() {
  return new Date().toISOString()
}

// SM-2 algorithm constants
const SM2_MIN_EASE = 1.3
const SM2_MAX_EASE = 3.0

// SM-2 algorithm
function sm2(card, quality) {
  // quality: 0 (fail), 1 (hard), 2 (ok), 3 (easy), 4 (perfect)
  let { ease, interval, repetitions } = card

  if (quality < 2) {
    // Forgot — reset
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * ease)
    }
    repetitions++
    ease = ease + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02))
    if (ease < SM2_MIN_EASE) ease = SM2_MIN_EASE
    if (quality === 3) interval = Math.round(interval * 1.1)
    if (quality === 4) {
      interval = Math.round(interval * 1.2)
      ease = Math.min(ease + 0.1, SM2_MAX_EASE)
    }
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    ease,
    interval,
    repetitions,
    lastReviewed: nowISO(),
    nextReview: nextReview.toISOString(),
  }
}

export const useKnowledgeStore = defineStore('knowledge', () => {
  const stored = JSON.parse(localStorage.getItem('vis-knowledge') || '{}')

  const folders = ref(stored.folders || [])
  const notes = ref(stored.notes || [])

  watch([folders, notes], () => {
    localStorage.setItem('vis-knowledge', JSON.stringify({
      folders: folders.value,
      notes: notes.value,
    }))
  }, { deep: true })

  // --- Folder actions ---
  function addFolder(name, icon = '📁', color = '#7C6FFF') {
    folders.value.push({
      id: uuid(),
      name,
      icon,
      color,
      createdAt: nowISO(),
      order: folders.value.length,
    })
  }

  function updateFolder(id, data) {
    const folder = folders.value.find(f => f.id === id)
    if (folder) Object.assign(folder, data)
  }

  function deleteFolder(id) {
    folders.value = folders.value.filter(f => f.id !== id)
    // Move notes to unfiled
    notes.value.forEach(n => {
      if (n.folderId === id) n.folderId = null
    })
  }

  function reorderFolders(ids) {
    ids.forEach((id, index) => {
      const folder = folders.value.find(f => f.id === id)
      if (folder) folder.order = index
    })
  }

  // --- Note actions ---
  function addNote(folderId = null, title = 'Новая заметка') {
    const note = {
      id: uuid(),
      folderId,
      title,
      content: '',
      tags: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
      isPinned: false,
      flashcards: [],
    }
    notes.value.push(note)
    return note.id
  }

  function updateNote(id, data) {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      Object.assign(note, data)
      note.updatedAt = nowISO()
    }
  }

  function deleteNote(id) {
    notes.value = notes.value.filter(n => n.id !== id)
  }

  function togglePinNote(id) {
    const note = notes.value.find(n => n.id === id)
    if (note) note.isPinned = !note.isPinned
  }

  // --- Flashcard actions ---
  function addFlashcard(noteId, question, answer) {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.flashcards.push({
        id: uuid(),
        question,
        answer,
        lastReviewed: null,
        nextReview: null,
        ease: 2.5,
        interval: 0,
        repetitions: 0,
      })
      note.updatedAt = nowISO()
    }
  }

  function updateFlashcard(noteId, cardId, data) {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      const card = note.flashcards.find(c => c.id === cardId)
      if (card) Object.assign(card, data)
    }
  }

  function deleteFlashcard(noteId, cardId) {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.flashcards = note.flashcards.filter(c => c.id !== cardId)
    }
  }

  function reviewFlashcard(noteId, cardId, quality) {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const card = note.flashcards.find(c => c.id === cardId)
    if (!card) return
    const result = sm2(card, quality)
    Object.assign(card, result)
  }

  // --- Getters ---
  const getDueFlashcards = computed(() => {
    const now = new Date()
    const result = []
    for (const note of notes.value) {
      for (const card of note.flashcards) {
        if (!card.nextReview || new Date(card.nextReview) <= now) {
          result.push({ ...card, noteId: note.id, noteTitle: note.title })
        }
      }
    }
    return result
  })

  function getNotesForFolder(folderId) {
    return notes.value.filter(n => n.folderId === folderId)
  }

  function searchNotes(query) {
    if (!query) return notes.value
    const q = query.toLowerCase()
    return notes.value.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  const getNoteStats = computed(() => {
    const total = notes.value.length
    const allCards = notes.value.flatMap(n => n.flashcards)
    const totalCards = allCards.length
    const learnedCards = allCards.filter(c => c.repetitions >= 2).length
    const learnedPct = totalCards > 0 ? Math.round(learnedCards / totalCards * 100) : 0
    return { total, totalCards, learnedCards, learnedPct }
  })

  return {
    folders,
    notes,
    addFolder,
    updateFolder,
    deleteFolder,
    reorderFolders,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,
    getDueFlashcards,
    getNotesForFolder,
    searchNotes,
    getNoteStats,
  }
})
