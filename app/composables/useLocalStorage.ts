import type { Note } from '~/types/note.ts'

const NOTES_KEY = 'nebus:notes'
const DRAFT_KEY = 'nebus:draft'
const SCHEMA_VERSION = 1

interface StoredPayload {
  version: number
  data: unknown
}

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== 'object')
    return false

  const note = value as Note

  return typeof note.id === 'string'
    && typeof note.title === 'string'
    && Array.isArray(note.items)
}

function readStored(key: string): unknown {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')

    if (!raw || typeof raw !== 'object')
      return null

    const stored = raw as StoredPayload

    return stored.version === SCHEMA_VERSION ? stored.data : null
  }
  catch {
    return null
  }
}

function writeStored(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ version: SCHEMA_VERSION, data }))
  }
  catch (error) {
    console.error('Не удалось записать в хранилище:', key, error)
  }
}

export function useLocalStorage() {
  function loadNotes(): Note[] {
    const data = readStored(NOTES_KEY)

    return Array.isArray(data) ? data.filter(isNote) : []
  }

  function saveNotes(notes: Note[]) {
    writeStored(NOTES_KEY, notes)
  }

  function loadDraft(): Note | null {
    const data = readStored(DRAFT_KEY)

    return isNote(data) ? data : null
  }

  function saveDraft(note: Note) {
    writeStored(DRAFT_KEY, note)
  }

  function watchNotesChange(handler: () => void) {
    window.addEventListener('storage', (event) => {
      if (event.key === NOTES_KEY)
        handler()
    })
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    }
    catch (error) {
      console.error('Не удалось удалить черновик', error)
    }
  }

  return {
    loadNotes,
    saveNotes,
    loadDraft,
    saveDraft,
    clearDraft,
    watchNotesChange,
  }
}
