<script setup lang="ts">
defineProps<{
  error?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <input
    v-model="model"
    v-bind="$attrs"
    class="ui-input"
    :class="{ 'ui-input--error': error }"
  >
</template>

<style scoped lang="scss">
@use 'input.scss';
</style>
