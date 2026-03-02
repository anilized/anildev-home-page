# Anildev Links Page

React + Tailwind tabanli, yayinci odakli bir links sayfasi.

## Ozellikler

- TikTok, YouTube, Instagram ve Kick link kartlari
- Linklerin kategoriye gore ayrilmasi:
  - `CANLI YAYINLAR`
  - `YAYIN KESITLERI`
  - `SOSYAL MEDYA`
- Son YouTube videosunu otomatik cekme
- Shorts filtreleme (yalnizca uzun format video gosterir)
- Neon-yesil (cyber) tema

## Teknolojiler

- React 19
- Vite 7
- Tailwind CSS 4 (`@tailwindcss/vite`)
- TypeScript

## Kurulum

```bash
npm install
npm run dev
```

Build almak icin:

```bash
npm run build
```

## Docker

Uygulama Docker imaji icinde Nginx ile `anildev.io/links` altinda servis edilmek uzere hazirlandi.

Image build:

```bash
docker build -t anildev-links .
```

Container calistirma:

```bash
docker run -d --name anildev-links -p 8080:80 anildev-links
```

Test:

```bash
curl http://localhost:8080/links/
```

Notlar:

- Varsayilan build base path: `/links/`
- Farkli bir base path icin:

```bash
docker build -t anildev-links --build-arg APP_BASE_PATH=/my-path/ .
```

## Docker Compose

`docker-compose.yml` dosyasi varsayilan olarak:

- app'i build eder
- build sırasında `APP_BASE_PATH=/links/` kullanir
- container'i `8080` portunda yayinlar

Calistirma:

```bash
docker compose up -d --build
```

Durdurma:

```bash
docker compose down
```

Test:

```bash
curl http://localhost:8080/links/
```

## Ozellestirme

### 1. Sosyal linkler ve kanal bilgisi

Dosya: `src/siteConfig.ts`

- `creatorName`
- `tagline`
- `youtubeChannelId`
- `links.tiktok`
- `links.youtube`
- `links.instagram`
- `links.kick`

### 2. Logo

- Aktif logo dosyasi: `public/streamer-logo.png`
- Su an UI icinde aktif olarak kullanilmiyor.

### 3. Tema (logo ile uyumlu neon stil)

Dosya: `src/index.css`

- Arka plan renkleri: `:root` altindaki `--bg-*` degiskenleri
- Cam panel stili: `.glass-panel`
- Baslik fontu ve glow: `.title-font`, `.neon-text`

## Not

Son video bolumu, YouTube RSS feed'ini JSON formatina ceviren servis uzerinden cekilir ve en yeni **uzun format** video secilir.
