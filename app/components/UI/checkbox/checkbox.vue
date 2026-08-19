<script setup lang="ts">
const { disabled = false } = defineProps<{
  disabled?: boolean
}>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="ui-checkbox" :class="{ 'ui-checkbox--disabled': disabled }">
    <input
      v-model="model"
      v-bind="$attrs"
      type="checkbox"
      class="ui-checkbox__input"
      :disabled="disabled"
    >
    <span class="ui-checkbox__box" />
    <span v-if="$slots.default" class="ui-checkbox__label"><slot /></span>
  </label>
</template>

<style scoped lang="scss">
@use 'checkbox.scss';
</style>
