<script setup lang="ts">
defineProps<{
  modelValue: string | number
  id: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="watercolor-input-group" :class="{ 'has-error': error }">
    <label :for="id" class="watercolor-label">{{ label }}</label>
    <input
      :id="id"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="watercolor-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<style scoped lang="scss">
.watercolor-input-group {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  
  &.has-error {
    .watercolor-input {
      border-bottom-color: #d9534f; /* Soft red */
    }
    
    .watercolor-label {
      color: #d9534f;
    }
  }
}

.error-message {
  font-family: var(--font-serif);
  color: #d9534f;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  font-style: italic;
}

.watercolor-label {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-forest-green);
  margin-bottom: 0.5rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.watercolor-input {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--color-sage-green);
  padding: 0.5rem 0;
  font-family: var(--font-sans); /* Input text should be readable */
  font-size: 1.2rem;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
  border-radius: 0; 
  
  &:focus {
    outline: none;
    border-bottom-color: var(--color-forest-green);
    background-color: rgba(255, 255, 255, 0.4);
  }

  &::placeholder {
    color: var(--color-sage-green);
    opacity: 0.7;
    font-style: italic;
  }
}
</style>
