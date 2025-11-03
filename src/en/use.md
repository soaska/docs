# How to Use {#usage}

<script setup>
const ADDRESS = 'proxi.soaska.ru';
const PORT = '6666';
</script>

## Getting Proxy Server Address {#get-address}

Current SOCKS5 proxy server address and port:

- **Server**: {{ ADDRESS }}
- **Port**: {{ PORT }}

You can also find it on:
- Main website [proxi.soaska.ru](https://proxi.soaska.ru)
- Project README on [GitHub](https://github.com/soaska/proxy)
- By messaging on Telegram: [@cumsorg](https://t.me/cumsorg)

> [!NOTE]
> The proxy only works with Telegram domains (telegram.org, t.me, telesco.pe, telegram.me, tg.dev).
> Connecting to other resources through this proxy is not possible.

## Telegram Desktop {#telegram-desktop}

1. Open Telegram Desktop
2. Go to **Settings** → **Advanced** → **Connection type**
3. Select **Use custom proxy**
4. Click **Add proxy**
5. Select **SOCKS5** type
6. Fill in the fields:
   - **Server**: {{ ADDRESS }}
   - **Port**: {{ PORT }}
   - **Username**: leave empty
   - **Password**: leave empty
7. Click **Save**
8. Make sure the proxy is activated (checkbox next to it)

## Telegram for Android {#telegram-android}

1. Open Telegram
2. Go to **Settings** → **Data and Storage** → **Proxy Settings**
3. Tap **Add Proxy**
4. Select **SOCKS5**
5. Fill in the fields:
   - **Server**: {{ ADDRESS }}
   - **Port**: {{ PORT }}
   - **Username**: leave empty
   - **Password**: leave empty
6. Tap **Save**
7. Enable the **Use Proxy** toggle

## Telegram for iOS {#telegram-ios}

1. Open Telegram
2. Go to **Settings** → **Data and Storage** → **Proxy**
3. Tap **Add Proxy**
4. Select **SOCKS5**
5. Fill in the fields:
   - **Server**: {{ ADDRESS }}
   - **Port**: {{ PORT }}
   - **Username**: leave empty
   - **Password**: leave empty
6. Tap **Done**
7. Enable the proxy by tapping on it

## Telegram Web {#telegram-web}

Telegram Web automatically uses your browser's system proxy settings.

To configure proxy in your browser:

### Chrome/Edge/Brave

1. Open **Settings** → **System** → **Open your computer's proxy settings**
2. Follow the instructions for your operating system

### Firefox

1. Open **Settings** → **General** → **Network Settings** → **Settings**
2. Select **Manual proxy configuration**
3. In the **SOCKS Host** field, enter {{ ADDRESS }}
4. In the **Port** field, enter {{ PORT }}
5. Select **SOCKS v5**
6. Click **OK**

## Connection Check {#check-connection}

After configuring the proxy:

1. Telegram should connect automatically
2. In the proxy settings, you will see the connection status
3. If the connection doesn't work, check:
   - Correctness of the entered address and port
   - Internet availability
   - Proxy server address is up to date

## Alternative Methods {#alternatives}

### Proxy Link (t.me)

You can share proxy settings via a special link:

```
https://t.me/socks?server={{ ADDRESS }}&port={{ PORT }}
```

When you follow such a link, Telegram will automatically offer to add the proxy.

### QR Code

Some versions of Telegram support adding a proxy via QR code. Generate a QR code with the proxy link and scan it in the app.

## Need Help? {#help}

If you have problems connecting:

- Telegram: [@cumsorg](https://t.me/cumsorg)
- Email: [soaska@cornspace.su](mailto:soaska@cornspace.su)
- GitHub Issues: [github.com/soaska/proxy](https://github.com/soaska/proxy/issues)
