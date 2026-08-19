<script setup lang="ts">
import type { Note } from '~/types/note.ts'

const notes: Note[] = [
  {
    id: 1,
    title: 'Ремонт на кухне',
    items: [
      { text: 'Замерить столешницу', done: false },
      { text: 'Выбрать плитку', done: true },
      { text: 'Позвонить мастеру в среду', done: false },
      { text: 'Заказать доставку', done: false },
    ],
  },
  {
    id: 2,
    title: 'Собеседование, подготовка',
    items: [
      { text: 'Обновить резюме', done: true },
      { text: 'Повторить вопросы по алгоритмам', done: false },
      { text: 'Подготовить вопросы работодателю', done: false },
    ],
  },
  {
    id: 3,
    title: 'Список покупок',
    items: [
      { text: 'Молоко', done: false },
      { text: 'Хлеб', done: true },
      { text: 'Яйца', done: false },
    ],
  },
  {
    id: 4,
    title: 'Поездка на выходные',
    items: [
      { text: 'Забронировать отель', done: false },
      { text: 'Проверить билеты', done: true },
    ],
  },
]

const { $modal } = useNuxtApp()

const deleteDescription = computed(() => {
  // TODO()
})

function requestDelete(note: Note) {
  // TODO()
}

function confirmDelete() {
  // TODO()
}
</script>

<template>
  <div class="notes">
    <NotesHeader />
    <div class="notes__list">
      <NotesCard
        v-for="note in notes"
        :key="note.id"
        :title="note.title"
        :items="note.items"
        @delete="requestDelete(note)"
      />
    </div>

    <ModalDefaultModal name="delete-note" @cancel="$modal.close()">
      <template #title>
        Удалить заметку?
      </template>
      <template #description>
        {{ deleteDescription }}
      </template>
      <template #actions>
        <UIButton type="secondary" @click="$modal.close()">
          Отмена
        </UIButton>
        <UIButton type="danger-solid" @click="confirmDelete">
          Удалить
        </UIButton>
      </template>
    </ModalDefaultModal>
  </div>
</template>

<style scoped lang="scss">
@use 'notes.scss';
</style>
