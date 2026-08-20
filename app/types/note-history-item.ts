import type { NoteTodoItem } from '~/types/note-todo-item.ts'

interface AddItemHistoryEntry {
  type: 'add-item'
  index: number
  item: NoteTodoItem
}

interface RemoveItemHistoryEntry {
  type: 'remove-item'
  index: number
  item: NoteTodoItem
}

interface UpdateTitleHistoryEntry {
  type: 'update-title'
  before: string
  after: string
}

interface UpdateItemTextHistoryEntry {
  type: 'update-item-text'
  itemId: string
  before: string
  after: string
}

interface ToggleItemHistoryEntry {
  type: 'toggle-item'
  itemId: string
  before: boolean
  after: boolean
}

export type NoteHistoryItem
  = | AddItemHistoryEntry
    | RemoveItemHistoryEntry
    | UpdateTitleHistoryEntry
    | UpdateItemTextHistoryEntry
    | ToggleItemHistoryEntry
