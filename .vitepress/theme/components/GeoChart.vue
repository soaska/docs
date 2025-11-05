<script setup lang="ts">
import { computed } from 'vue'

interface Country {
  country: string
  country_name: string
  connections: number
  percentage: number
}

interface Props {
  data: Country[]
}

const props = defineProps<Props>()

const topCountries = computed(() => props.data.slice(0, 10))

const getCountryFlag = (code: string) => {
  const flags: Record<string, string> = {
    'RU': '🇷🇺',
    'US': '🇺🇸',
    'DE': '🇩🇪',
    'GB': '🇬🇧',
    'FR': '🇫🇷',
    'NL': '🇳🇱',
    'CN': '🇨🇳',
    'JP': '🇯🇵',
    'KR': '🇰🇷',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'PL': '🇵🇱',
    'UA': '🇺🇦',
    'TR': '🇹🇷',
    'SE': '🇸🇪',
    'NO': '🇳🇴',
    'FI': '🇫🇮',
    'DK': '🇩🇰',
    'CH': '🇨🇭',
    'AT': '🇦🇹',
    'BE': '🇧🇪',
    'CZ': '🇨🇿',
    'GR': '🇬🇷',
    'PT': '🇵🇹',
    'RO': '🇷🇴',
    'HU': '🇭🇺',
    'SG': '🇸🇬',
    'HK': '🇭🇰',
    'TW': '🇹🇼',
    'TH': '🇹🇭',
    'VN': '🇻🇳',
    'ID': '🇮🇩',
    'MY': '🇲🇾',
    'PH': '🇵🇭',
    'MX': '🇲🇽',
    'AR': '🇦🇷',
    'CL': '🇨🇱',
    'CO': '🇨🇴',
    'ZA': '🇿🇦',
    'EG': '🇪🇬',
    'IL': '🇮🇱',
    'AE': '🇦🇪',
    'SA': '🇸🇦',
    'NG': '🇳🇬',
    'KE': '🇰🇪',
  }
  return flags[code] || '🌍'
}
</script>

<template>
  <div class="geo-chart">
    <div v-for="country in topCountries" :key="country.country" class="country-row">
      <div class="country-info">
        <span class="flag">{{ getCountryFlag(country.country) }}</span>
        <span class="name">{{ country.country_name }}</span>
      </div>
      <div class="stats">
        <div class="bar-container">
          <div class="bar" :style="{ width: `${country.percentage}%` }"></div>
        </div>
        <div class="numbers">
          <span class="percentage">{{ country.percentage.toFixed(1) }}%</span>
          <span class="connections">{{ country.connections.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.geo-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.country-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.country-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 150px;
}

.flag {
  font-size: 1.5em;
}

.name {
  font-weight: 500;
}

.stats {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-container {
  flex: 1;
  height: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  border-radius: 12px;
  transition: width 0.5s ease;
}

.numbers {
  display: flex;
  gap: 12px;
  min-width: 120px;
  justify-content: flex-end;
  font-size: 0.9em;
}

.percentage {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.connections {
  color: var(--vp-c-text-2);
}
</style>