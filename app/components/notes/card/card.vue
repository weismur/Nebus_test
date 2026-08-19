<script setup lang="ts">
import type { NoteTodoItem } from '~/types/note-todo-item.ts'

const { title, items } = defineProps<{
  title: string
  items: NoteTodoItem[]
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const MAX_VISIBLE_ITEMS = 3

const remaining = computed(() => items.length - MAX_VISIBLE_ITEMS)
const visibleItems = computed(() => items.slice(0, MAX_VISIBLE_ITEMS))

const remainingText = computed(() => remaining.value === 1 ? 'пункт' : remaining.value < 5 ? 'пункта' : 'пунктов')
</script>

<template>
  <div class="notes-card">
    <div class="notes-card__header">
      <h3 class="notes-card__title">
        {{ title }}
      </h3>
      <div class="notes-card__actions">
        <UIButton type="secondary" size="sm" @click="$emit('edit')">
          Изменить
        </UIButton>
        <UIButton type="danger" size="sm" @click="$emit('delete')">
          Удалить
        </UIButton>
      </div>
    </div>

    <ul class="notes-card__list">
      <li v-for="(item, index) in visibleItems" :key="index" class="notes-card__item">
        <UICheckbox v-model="item.done" disabled>
          {{ item.text }}
        </UICheckbox>
      </li>
    </ul>

    <div v-if="remaining > 0" class="notes-card__more">
      + ещё {{ remaining }} {{ remainingText }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'card.scss';
</style>
