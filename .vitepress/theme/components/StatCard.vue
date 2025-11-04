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
  position: relative;
  display: grid;
  grid-template-columns: minmax(52px, auto) 1fr;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 70%, transparent);
  background: var(--vp-c-bg);
  box-shadow: 0 20px 45px -32px rgba(15, 23, 42, 0.55);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(15, 23, 42, 0.08));
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 55px -30px rgba(15, 23, 42, 0.65);
}

.stat-card:hover::after {
  opacity: 0.85;
}

.icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  color: var(--vp-c-brand-1);
  font-size: 2rem;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.stat-card:hover .icon {
  transform: scale(1.05);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  margin: 0;
}

.value {
  font-size: clamp(1.8rem, 1.6rem + 0.6vw, 2.4rem);
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.1;
}

.stat-card.highlight {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 65%, transparent);
  box-shadow: 0 32px 60px -30px color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
}

.stat-card.highlight::after {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent),
    color-mix(in srgb, var(--vp-c-brand-2) 12%, transparent)
  );
}

.stat-card.highlight .icon {
  background: color-mix(in srgb, var(--vp-c-brand-1) 28%, transparent);
  color: color-mix(in srgb, var(--vp-c-brand-1) 92%, white 8%);
}

.stat-card.highlight .value {
  color: var(--vp-c-brand-1);
}

@media (max-width: 540px) {
  .stat-card {
    padding: 20px;
    grid-template-columns: minmax(48px, auto) 1fr;
  }

  .icon {
    width: 52px;
    height: 52px;
  }
}
</style>