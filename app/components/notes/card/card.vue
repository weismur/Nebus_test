<script setup lang="ts">
import type { Note } from '~/types/note.ts'

const { item } = defineProps<{
  item: Note
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const MAX_VISIBLE_ITEMS = 3

const remaining = computed(() => item.items.length - MAX_VISIBLE_ITEMS)
const visibleItems = computed(() => item.items.slice(0, MAX_VISIBLE_ITEMS))

const remainingText = computed(() => declination(remaining.value, 'пункт', 'пункта', 'пунктов'))
</script>

<template>
  <div class="notes-card">
    <div class="notes-card__header">
      <h3 class="notes-card__title" :class="{ 'notes-card__title--blank': !item.title }">
        {{ item.title || 'Без названия' }}
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
      <li v-for="todo in visibleItems" :key="todo.id" class="notes-card__item">
        <UICheckbox :model-value="todo.done" disabled>
          {{ todo.text }}
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
