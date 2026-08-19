<script setup lang="ts">
const { type = 'primary', size = 'md' } = defineProps<{
  type?: 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'ghost'
  size?: 'sm' | 'md' | 'icon'
}>()
</script>

<template>
  <button class="ui-button" :class="[`ui-button--${type}`, `ui-button--${size}`]">
    <slot name="icon" />
    <slot />
  </button>
</template>

<style scoped lang="scss">
@use 'button.scss';
</style>
