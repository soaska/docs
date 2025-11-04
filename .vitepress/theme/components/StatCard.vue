<script setup lang="ts">
interface Props {
  icon: string
  title: string
  value: string
  highlight?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="stat-card" :class="{ highlight }">
    <div class="icon">{{ icon }}</div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="value">{{ value }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s;
}

.stat-card.highlight {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 2em;
  line-height: 1;
}

.content {
  flex: 1;
}

.title {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.value {
  font-size: 1.8em;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.stat-card.highlight .value {
  color: var(--vp-c-brand-1);
}
</style>