import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalStorage } from '~/composables/useLocalStorage.ts'

const NOTES_KEY = 'nebus:notes'
const DRAFT_KEY = 'nebus:draft'

const note = { id: 'n1', title: 'Заметка', items: [{ id: 'i1', text: 'Пункт', done: false }] }

const { loadNotes, saveNotes, loadDraft, saveDraft, clearDraft } = useLocalStorage()

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('сохраняет заметки вместе с версией схемы', () => {
    saveNotes([note])

    const stored = JSON.parse(localStorage.getItem(NOTES_KEY)!)

    expect(stored.version).toBe(1)
    expect(stored.data).toEqual([note])
  })

  it('читает записанное обратно', () => {
    saveNotes([note])

    expect(loadNotes()).toEqual([note])
  })

  it('возвращает пустой список, когда в хранилище ничего нет', () => {
    expect(loadNotes()).toEqual([])
  })

  it('игнорирует данные чужой версии схемы', () => {
    localStorage.setItem(NOTES_KEY, JSON.stringify({ version: 99, data: [note] }))

    expect(loadNotes()).toEqual([])
  })

  it('игнорирует старый формат без версии', () => {
    localStorage.setItem(NOTES_KEY, JSON.stringify([note]))

    expect(loadNotes()).toEqual([])
  })

  it('не падает на битом JSON', () => {
    localStorage.setItem(NOTES_KEY, '{сломано')

    expect(loadNotes()).toEqual([])
  })

  it('отсеивает элементы неправильной формы', () => {
    localStorage.setItem(NOTES_KEY, JSON.stringify({ version: 1, data: [{ мусор: 1 }, note] }))

    expect(loadNotes()).toEqual([note])
  })

  describe('черновик', () => {
    it('сохраняется и читается', () => {
      saveDraft(note)

      expect(loadDraft()).toEqual(note)
    })

    it('возвращает null, когда черновика нет', () => {
      expect(loadDraft()).toBeNull()
    })

    it('возвращает null, если в ключе лежит не заметка', () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, data: [1, 2, 3] }))

      expect(loadDraft()).toBeNull()
    })

    it('удаляется', () => {
      saveDraft(note)
      clearDraft()

      expect(loadDraft()).toBeNull()
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull()
    })
  })
})
