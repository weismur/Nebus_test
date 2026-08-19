<script setup lang="ts">
import type { NoteTodoItem } from '~/types/note-todo-item.ts'

const title = ref('Ремонт на кухне')

const items = ref<NoteTodoItem[]>([
  { text: 'Замерить столешницу', done: false },
  { text: 'Выбрать плитку', done: true },
  { text: 'Позвонить мастеру в среду', done: false },
  { text: 'Заказать доставку', done: false },
])

const doneCount = computed(() => items.value.filter(item => item.done).length)

function removeItem(index: number) {
  items.value.splice(index, 1)
}

const { $modal } = useNuxtApp()

const deleteDescription = computed(() => {
  // TODO()
})

function requestDelete() {
  // TODO()
}

function confirmDelete() {
  // TODO()
}
</script>

<template>
  <div class="notes-detail">
    <div class="notes-detail__card">
      <NotesActions :history-index="12" :history-total="50" can-undo @delete="requestDelete" />

      <div class="notes-detail__body">
        <div class="notes-detail__field">
          <span class="notes-detail__label">Название</span>
          <UIInput v-model="title" class="notes-detail__title-input" />
        </div>

        <div class="notes-detail__tasks">
          <div class="notes-detail__tasks-header">
            <span class="notes-detail__label">Задачи</span>
            <span class="notes-detail__progress">{{ doneCount }} из {{ items.length }} выполнено</span>
          </div>

          <ul class="notes-detail__list">
            <li
              v-for="(item, index) in items"
              :key="index"
              class="notes-detail__row"
            >
              <UICheckbox v-model="item.done">
                <UIInput v-model="item.text" />
              </UICheckbox>
              <button type="button" class="notes-detail__remove" @click="removeItem(index)">
                ✕
              </button>
            </li>
          </ul>

          <UIButton type="ghost" class="notes-detail__add">
            + Добавить пункт
          </UIButton>
        </div>
      </div>
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
@use 'detail.scss';
</style>
