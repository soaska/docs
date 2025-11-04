<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  apiBase: string
}

const props = defineProps<Props>()

const buildApiUrl = (path: string) => {
  const url = new URL(path, props.apiBase)
  url.searchParams.set('ts', Date.now().toString())
  return url.toString()
}

const loading = ref(false)
const loadingLatest = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

const fetchLatestResult = async () => {
  try {
    loadingLatest.value = true
    const response = await fetch(buildApiUrl('/api/speedtest/latest'), {
      cache: 'no-store',
      headers: {
        'cache-control': 'no-cache',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch latest speedtest result')
    }
    
    const data = await response.json()
    if (data && data.download_mbps !== undefined) {
      result.value = data
    }
  } catch (e) {
    // Silently fail for latest result fetch - it's not critical
    console.warn('Failed to fetch latest speedtest result:', e)
  } finally {
    loadingLatest.value = false
  }
}

const refreshResult = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(buildApiUrl('/api/speedtest/latest'), {
      cache: 'no-store',
      headers: {
        'cache-control': 'no-cache',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch latest speedtest result')
    }
    
    const data = await response.json()
    if (data && data.download_mbps !== undefined) {
      result.value = data
    } else {
      error.value = 'No speedtest results available'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load speedtest result'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLatestResult()
})
</script>

<template>
  <div class="speedtest-section">
    <h3>🚀 Speed Test</h3>
    
    <button
      @click="refreshResult"
      :disabled="loading || loadingLatest"
      class="speedtest-button refresh-button"
    >
      {{ loading ? '🔄 Refreshing...' : '🔄 Refresh Latest Result' }}
    </button>
    
    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>
    
    <div v-if="loadingLatest && !result" class="loading-message">
      🔄 Loading latest result...
    </div>
    
    <div v-if="result" class="result-card">
      <h4>{{ loading ? '🔄 Refreshing...' : '✅ Latest Speed Test Result' }}</h4>
      <div class="result-grid">
        <div class="result-item">
          <span class="label">⬇️ Download</span>
          <span class="value">{{ result.download_mbps.toFixed(2) }} Mbps</span>
        </div>
        <div class="result-item">
          <span class="label">⬆️ Upload</span>
          <span class="value">{{ result.upload_mbps.toFixed(2) }} Mbps</span>
        </div>
        <div class="result-item">
          <span class="label">📡 Ping</span>
          <span class="value">{{ result.ping_ms.toFixed(2) }} ms</span>
        </div>
      </div>
      <div class="server-info">
        <p>📍 Server: {{ result.server_name }}</p>
        <p>🌐 Location: {{ result.server_location }}</p>
        <p>🕐 Tested: {{ new Date(result.tested_at).toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speedtest-section {
  padding: 24px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.speedtest-section h3 {
  margin-bottom: 16px;
  font-size: 1.2em;
}

.speedtest-button {
  width: 100%;
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.speedtest-button:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
}

.speedtest-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger);
  border-radius: 6px;
}

.loading-message {
  margin-top: 16px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  text-align: center;
  font-style: italic;
}

.result-card {
  margin-top: 24px;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.result-card h4 {
  margin-bottom: 16px;
  color: var(--vp-c-brand-1);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item .label {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.result-item .value {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.server-info {
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

.server-info p {
  margin: 4px 0;
}
</style>