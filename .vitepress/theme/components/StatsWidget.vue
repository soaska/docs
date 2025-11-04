<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const stats = ref<Stats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const API_BASE = import.meta.env.VITE_API_URL || 'https://proxi.soaska.ru:8080'

const fetchStats = async () => {
  try {
    loading.value = true
    const response = await fetch(`${API_BASE}/api/stats/public`)
    if (!response.ok) throw new Error('Failed to fetch stats')
    stats.value = await response.json()
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  fetchStats()
  // Refresh every 30 seconds
  setInterval(fetchStats, 30000)
})
</script>

<template>
  <div class="stats-widget">
    <div v-if="loading && !stats" class="loading">
      <p>Loading statistics...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>❌ {{ error }}</p>
      <button @click="fetchStats">Retry</button>
    </div>
    
    <div v-else-if="stats" class="stats-content">
      <div class="stats-grid">
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
      
      <div class="geo-section">
        <h3>🌍 Geographic Distribution</h3>
        <GeoChart :data="stats.countries" />
      </div>
      
      <SpeedTestButton :api-base="API_BASE" />
      
      <div class="last-update">
        Last updated: {{ new Date(stats.updated_at).toLocaleString() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-widget {
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin: 24px 0;
}

.loading, .error {
  text-align: center;
  padding: 48px;
}

.error button {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.error button:hover {
  background: var(--vp-c-brand-2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.geo-section {
  margin-bottom: 32px;
}

.geo-section h3 {
  margin-bottom: 16px;
  font-size: 1.2em;
}

.last-update {
  text-align: center;
  font-size: 0.9em;
  color: var(--vp-c-text-2);
  margin-top: 16px;
}
</style>