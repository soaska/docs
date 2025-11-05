<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  apiBase: string
}

const props = defineProps<Props>()

const buildApiUrl = (
  path: string,
  options: { cacheBust?: boolean; query?: Record<string, string | number | boolean> } = {},
) => {
  const url = new URL(path, props.apiBase)
  const { cacheBust = true, query } = options

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value))
    }
  }

  if (cacheBust) {
    url.searchParams.set('ts', Date.now().toString())
  }

  return url.toString()
}

const isTriggering = ref(false)
const isRefreshing = ref(false)
const loadingInitial = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)
const testInProgress = ref(false)
const infoMessage = ref<string | null>(null)

const normaliseResult = (payload: any) => {
  if (!payload) {
    return null
  }
  if (typeof payload === 'object' && payload !== null) {
    if ('result' in payload && payload.result) {
      return payload.result
    }
    return payload
  }
  return null
}

const loadLatestResult = async (silent = false) => {
  try {
    if (silent) {
      isRefreshing.value = true
    } else {
      loadingInitial.value = true
    }

    const response = await fetch(
      buildApiUrl('/api/speedtest/latest'),
      {
        cache: 'no-store',
        headers: {
          'cache-control': 'no-cache',
        },
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch latest speedtest result')
    }

    const data = await response.json()
    const parsed = normaliseResult(data)

    if (parsed) {
      const newResult = parsed
      const oldResult = result.value
      
      // Check if result is new (different tested_at timestamp)
      const isNewResult = !oldResult ||
        new Date(newResult.tested_at).getTime() !== new Date(oldResult.tested_at).getTime()
      
      result.value = newResult
      error.value = null
      
      // If we got a new result and test was in progress, clear the progress state
      if (isNewResult && testInProgress.value) {
        testInProgress.value = false
        infoMessage.value = null
      }
      
      return isNewResult
    } else if (!silent) {
      result.value = null
      error.value = 'No speedtest results available yet'
    }
    
    return false
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load speedtest result'
    if (silent) {
      console.warn('Failed to fetch latest speedtest result:', message)
    } else {
      error.value = message
      result.value = null
    }
    return false
  } finally {
    if (!silent) {
      loadingInitial.value = false
    }
    isRefreshing.value = false
  }
}

const refreshLatest = () => loadLatestResult(true)

const runSpeedTest = async () => {
  if (isTriggering.value || testInProgress.value) {
    return
  }

  isTriggering.value = true
  error.value = null

  try {
    const response = await fetch(
      buildApiUrl('/api/speedtest/trigger', {
        cacheBust: false,
        query: { source: 'web' },
      }),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source: 'web' }),
      },
    )

    if (!response.ok) {
      let message = 'Speed test failed'
      try {
        const data = await response.json()
        message = data.error || data.message || message
      } catch {
        // ignore JSON parse issues
      }
      throw new Error(message)
    }

    const data = await response.json()
    
    // Check if test was accepted (async execution)
    if (data.status === 'accepted') {
      // Set test in progress state
      testInProgress.value = true
      infoMessage.value = data.message || 'Speed test is running. Results will appear in 30-60 seconds.'
      
      // Start polling for results
      startPollingForResults()
    } else {
      // Legacy: result returned immediately
      const parsed = normaliseResult(data)
      if (parsed) {
        result.value = parsed
        error.value = null
      } else {
        await loadLatestResult(true)
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to trigger speedtest'
    testInProgress.value = false
    infoMessage.value = null
  } finally {
    isTriggering.value = false
  }
}

let pollingInterval: ReturnType<typeof setInterval> | null = null

const startPollingForResults = () => {
  // Clear any existing polling
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
  
  let pollCount = 0
  const maxPolls = 15 // 15 * 5 seconds = 75 seconds total
  
  pollingInterval = setInterval(async () => {
    pollCount++
    
    const gotNewResult = await loadLatestResult(true)
    
    // Stop polling if we got a new result or reached max polls
    if (gotNewResult || pollCount >= maxPolls) {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
      
      // Clear progress state after max polls even if no result
      if (pollCount >= maxPolls && !gotNewResult) {
        testInProgress.value = false
        infoMessage.value = null
        if (!result.value) {
          error.value = 'Speed test took longer than expected. Try refreshing manually.'
        }
      }
    }
  }, 5000)
}

const checkIfTestInProgress = async () => {
  // Check if the latest result is very recent (within last 2 minutes)
  // This helps detect if a test was triggered but page wasn't refreshed
  if (result.value && result.value.tested_at) {
    const testTime = new Date(result.value.tested_at).getTime()
    const now = Date.now()
    const twoMinutesAgo = now - (2 * 60 * 1000)
    
    // If test is very recent and within typical test duration window
    if (testTime > twoMinutesAgo) {
      // Check if enough time has passed for a cooldown
      const cooldownMs = 10 * 60 * 1000 // 10 minutes
      const timeSinceTest = now - testTime
      
      if (timeSinceTest < 60 * 1000) {
        // Test was within last minute - might still be running or just completed
        // Don't set as in progress since we already have the result
        return
      }
    }
  }
}

onMounted(async () => {
  await loadLatestResult()
  await checkIfTestInProgress()
})
</script>

<template>
  <div class="speedtest-section">
    <h3>🚀 Speed Test</h3>

    <div class="button-row">
      <button
        @click="runSpeedTest"
        :disabled="isTriggering || isRefreshing || testInProgress"
        class="speedtest-button primary"
      >
        {{ isTriggering ? '⏳ Starting test…' : testInProgress ? '⏳ Test in progress…' : '▶ Run Speed Test' }}
      </button>

      <button
        @click="refreshLatest"
        :disabled="isRefreshing || isTriggering || testInProgress"
        class="speedtest-button secondary"
      >
        {{ isRefreshing ? '🔄 Refreshing…' : '🔁 Refresh Latest Result' }}
      </button>
    </div>

    <div v-if="testInProgress && infoMessage" class="info-message">
      ⏳ {{ infoMessage }}
    </div>

    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>

    <div v-if="loadingInitial && !result" class="loading-message">
      🔄 Loading latest result…
    </div>

    <div v-else-if="!result && !loadingInitial && !error" class="empty-state">
      No speedtest results recorded yet.
    </div>

    <div v-if="result" class="result-card">
      <h4>{{ testInProgress ? '🔄 Previous Result (New test in progress…)' : '✅ Latest Speed Test Result' }}</h4>
      <div class="result-grid">
        <div class="result-item">
          <span class="label">⬇️ Download</span>
          <span class="value">{{ Number(result.download_mbps ?? 0).toFixed(2) }} Mbps</span>
        </div>
        <div class="result-item ping-item">
          <span class="label">📡 Ping</span>
          <span class="value">{{ Number(result.ping_ms ?? 0).toFixed(2) }} ms</span>
        </div>
        <div class="result-item">
          <span class="label">⬆️ Upload</span>
          <span class="value">{{ Number(result.upload_mbps ?? 0).toFixed(2) }} Mbps</span>
        </div>
      </div>
      <div class="server-info">
        <p>📍 Server: {{ result.server_name || 'Unknown' }}</p>
        <p>🌐 Location: {{ result.server_location || 'Unknown' }}</p>
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
  margin-bottom: 20px;
  font-size: 1.2em;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.speedtest-button {
  flex: 1 1 200px;
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.speedtest-button.primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.speedtest-button.secondary {
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 60%, transparent);
}

.speedtest-button.primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
}

.speedtest-button.secondary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
  transform: translateY(-2px);
}

.speedtest-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger);
  border-radius: 6px;
}

.loading-message,
.empty-state {
  margin-top: 16px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  text-align: center;
}

.loading-message {
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
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item.ping-item {
  justify-content: center;
  align-items: center;
  text-align: center;
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

.info-message {
  margin-top: 16px;
  padding: 12px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  color: var(--vp-c-brand-1);
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  font-weight: 500;
}

@media (max-width: 540px) {
  .button-row {
    flex-direction: column;
  }

  .speedtest-button {
    width: 100%;
  }

  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>