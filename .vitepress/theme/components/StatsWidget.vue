<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import StatCard from './StatCard.vue'
import GeoChart from './GeoChart.vue'
import SpeedTestButton from './SpeedTestButton.vue'

interface Stats {
  uptime_seconds: number
  total_connections: number
  active_connections: number
  total_traffic_gb: number
  countries: Array<{
    country: string
    country_name: string
    connections: number
    percentage: number
  }>
  updated_at: string
}

interface FetchOptions {
  silent?: boolean
}

const stats = ref<Stats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isRefreshing = ref(false)

const API_BASE =
  ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_URL) ??
  'https://proxi.soaska.ru:8080'

let refreshTimer: number | null = null

const fetchStats = async (options: FetchOptions = {}) => {
  const { silent = false } = options
  const shouldShowFullLoader = !silent || !stats.value

  try {
    if (shouldShowFullLoader) {
      loading.value = true
    } else {
      isRefreshing.value = true
    }

    const response = await fetch(`${API_BASE}/api/stats/public`)
    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }
    stats.value = await response.json()
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    if (shouldShowFullLoader) {
      loading.value = false
    }
    isRefreshing.value = false
  }
}

const retryFetch = () => {
  fetchStats()
}

const refreshStats = () => {
  fetchStats({ silent: true })
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const formatTraffic = (gb: number) => {
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`
  return `${gb.toFixed(2)} GB`
}

const hasCountries = computed(() => (stats.value?.countries?.length ?? 0) > 0)

const lastUpdatedAbsolute = computed(() =>
  stats.value ? new Date(stats.value.updated_at).toLocaleString() : ''
)

const lastUpdatedRelative = computed(() => {
  if (!stats.value) return ''
  const updated = new Date(stats.value.updated_at)
  if (Number.isNaN(updated.getTime())) return ''
  const diffSeconds = Math.max(0, Math.floor((Date.now() - updated.getTime()) / 1000))

  if (diffSeconds < 45) return 'just now'
  if (diffSeconds < 120) return '1 minute ago'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`
  if (diffSeconds < 7200) return '1 hour ago'
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`
  if (diffSeconds < 172800) return '1 day ago'
  return `${Math.floor(diffSeconds / 86400)} days ago`
})

const statusLabel = computed(() => {
  if (!stats.value) return 'Offline'
  return stats.value.active_connections > 0 ? 'Live' : 'Idle'
})

const statusTone = computed(() => {
  if (!stats.value) return 'muted' as const
  return stats.value.active_connections > 0 ? 'positive' : 'idle'
})

onMounted(() => {
  fetchStats()
  refreshTimer = window.setInterval(() => fetchStats({ silent: true }), 30000)
})

onBeforeUnmount(() => {
  if (refreshTimer !== null) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<template>
  <div class="stats-widget">
    <div class="stats-widget__glow" aria-hidden="true"></div>

    <div v-if="loading && !stats" class="loading" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p>Loading latest statistics…</p>
    </div>

    <div v-else-if="!stats && error" class="error" role="alert">
      <p>❌ {{ error }}</p>
      <button type="button" @click="retryFetch">Retry</button>
    </div>

    <div v-else class="stats-content">
      <div v-if="error" class="error-inline" role="alert">
        <span>⚠️ {{ error }}</span>
        <button type="button" @click="refreshStats">Retry</button>
      </div>

      <div v-if="stats" class="stats-body">
        <header class="stats-header">
          <div class="stats-heading">
            <p class="eyebrow">Live metrics</p>
            <h2>Server health overview</h2>
            <p class="subtitle">
              Monitor the proxy in real time and spot trends at a glance.
            </p>
          </div>
          <div class="header-meta">
            <span class="status-chip" :class="statusTone">
              <span class="status-dot" aria-hidden="true"></span>
              {{ statusLabel }}
            </span>
            <button
              type="button"
              class="refresh-button"
              @click="refreshStats"
              :disabled="isRefreshing"
            >
              <span v-if="isRefreshing" class="button-spinner" aria-hidden="true"></span>
              <span>{{ isRefreshing ? 'Refreshing…' : 'Refresh' }}</span>
            </button>
          </div>
        </header>

        <div class="stats-grid" role="list" aria-label="Key server statistics">
          <StatCard
            icon="🔗"
            title="Total Connections"
            :value="stats.total_connections.toLocaleString()"
          />
          <StatCard
            icon="👥"
            title="Active Now"
            :value="stats.active_connections.toString()"
            highlight
          />
          <StatCard
            icon="📈"
            title="Total Traffic"
            :value="formatTraffic(stats.total_traffic_gb)"
          />
          <StatCard
            icon="⏱"
            title="Uptime"
            :value="formatUptime(stats.uptime_seconds)"
          />
        </div>

        <section class="geo-section" aria-labelledby="geo-title">
          <div class="section-heading">
            <h3 id="geo-title">🌍 Geographic distribution</h3>
            <span v-if="lastUpdatedRelative" class="microcopy">
              Updated {{ lastUpdatedRelative }}
            </span>
          </div>
          <GeoChart v-if="hasCountries" :data="stats.countries" />
          <p v-else class="geo-empty">Not enough data to display geography yet.</p>
        </section>

        <footer class="stats-footer">
          <SpeedTestButton :api-base="API_BASE" />
          <div class="last-update">
            <span class="label">Last synced</span>
            <time :datetime="stats.updated_at">{{ lastUpdatedAbsolute }}</time>
            <span v-if="lastUpdatedRelative" class="relative">
              ({{ lastUpdatedRelative }})
            </span>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-widget {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 5vw, 40px);
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 75%, transparent);
  box-shadow: 0 28px 60px -40px rgba(15, 23, 42, 0.6);
}

.stats-widget__glow {
  position: absolute;
  inset: -60% -20% auto -20%;
  height: 120%;
  background: radial-gradient(65% 65% at 50% 30%, color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent) 0%, transparent 70%);
  opacity: 0.35;
  pointer-events: none;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 64px 24px;
}

.loading p,
.error p {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid color-mix(in srgb, var(--vp-c-divider) 65%, transparent);
  border-top-color: var(--vp-c-brand-1);
  animation: spin 0.8s linear infinite;
}

.error button {
  margin-top: 12px;
  padding: 8px 18px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease;
}

.error button:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.stats-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.error-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.35);
  color: #fca5a5;
  font-size: 0.95rem;
}

.error-inline button {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(248, 113, 113, 0.45);
  color: rgba(248, 113, 113, 0.9);
  font-weight: 600;
  transition: background 0.3s ease, color 0.3s ease;
}

.error-inline button:hover {
  background: rgba(248, 113, 113, 0.15);
  color: rgba(248, 113, 113, 1);
}

.stats-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
}

.stats-heading {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.stats-heading h2 {
  margin: 0;
  font-size: clamp(1.6rem, 1.4rem + 0.8vw, 2.2rem);
  color: var(--vp-c-text-1);
}

.subtitle {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  font-size: 0.95rem;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  background: color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent);
  color: color-mix(in srgb, var(--vp-c-brand-1) 90%, var(--vp-c-text-1) 10%);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 40%, transparent);
}

.status-chip.positive {
  background: color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 48%, transparent);
  color: color-mix(in srgb, var(--vp-c-brand-1) 92%, white 8%);
}

.status-chip.positive .status-dot {
  background: var(--vp-c-brand-1);
}

.status-chip.idle {
  background: color-mix(in srgb, var(--vp-c-bg-soft) 88%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-divider) 60%, transparent);
  color: var(--vp-c-text-2);
}

.status-chip.idle .status-dot {
  background: var(--vp-c-text-3);
  box-shadow: none;
}

.status-chip.muted {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.4);
  color: rgba(148, 163, 184, 0.92);
}

.status-chip.muted .status-dot {
  background: currentColor;
  box-shadow: none;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

.refresh-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 30px -24px color-mix(in srgb, var(--vp-c-brand-1) 65%, transparent);
  background: color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: wait;
  transform: none;
  box-shadow: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.geo-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 70%, transparent);
  background: var(--vp-c-bg);
}

.section-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-heading h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.microcopy {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.geo-empty {
  margin: 0;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.08);
}

.stats-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.last-update {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.last-update .label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.last-update time {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.last-update .relative {
  color: var(--vp-c-text-3);
}

@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-meta {
    width: 100%;
    justify-content: space-between;
  }

  .stats-footer {
    align-items: center;
  }
}

@media (max-width: 540px) {
  .refresh-button {
    width: 100%;
    justify-content: center;
  }

  .error-inline {
    flex-direction: column;
    align-items: flex-start;
  }

  .error-inline button {
    width: 100%;
    justify-content: center;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>