import type { NoteTodoItem } from '~/types/note-todo-item.ts'

export interface Note {
  id: string
  title: string
  items: NoteTodoItem[]
}
