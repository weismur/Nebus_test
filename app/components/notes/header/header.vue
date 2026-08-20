<script setup lang="ts">
defineEmits<{
  addNote: []
}>()
</script>

<template>
  <header class="notes-header">
    <div class="notes-header__title-wrapper">
      <h1 class="notes-header__title">
        Заметки
      </h1>
      <span class="notes-header__count">4</span>
    </div>
    <UIButton type="primary" @click="$emit('addNote')">
      Новая заметка
    </UIButton>
  </header>
</template>

<style scoped lang="scss">
@use 'header.scss';
</style>
