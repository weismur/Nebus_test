<script setup lang="ts">
import Button from '~/components/UI/button/button.vue'
</script>

<template>
  <header class="notes-header">
    <div class="notes-header__title-wrapper">
      <h1 class="notes-header__title">
        Заметки
      </h1>
      <span class="notes-header__count">4</span>
    </div>
    <Button type="primary">
      Новая заметка
    </Button>
  </header>
</template>

<style scoped lang="scss">
@use 'header.scss';
</style>
