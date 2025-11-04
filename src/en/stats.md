---
layout: doc
title: Statistics
titleTemplate: :title • Proxi
---

# Server Statistics {#stats}

Real-time statistics of the SOCKS5 proxy server operation.

<StatsWidget />

## About Statistics {#about}

This page shows public statistics of the proxy server operation:

- **Total Connections** - total number of connections since server start
- **Active Now** - number of active connections at the moment
- **Total Traffic** - total volume of data transferred through the proxy
- **Uptime** - server uptime without restarts
- **Geographic Distribution** - distribution of connections by country

Statistics are updated automatically every 30 seconds.

## Speed Test {#speedtest}

You can run a server speed test by clicking the "Run Speed Test" button above. The test measures download speed, upload speed, and ping to the nearest server.

::: info Limitation
Speed test can be run no more than once every 10 minutes to prevent server overload.
:::

## Privacy {#privacy}

Public statistics do not contain:
- User IP addresses
- Detailed connection information
- Personal data

All statistics are anonymized and show only general server operation metrics.