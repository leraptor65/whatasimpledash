# What A Simple Dash V3 🚀

A simple, highly customizable, and performant self-hosted application dashboard. Re-designed from the ground up for a clean, modern aesthetic that puts your services front and center.

Organize your digital life with an interface that is tailored exactly to your needs.

![Dashboard Screenshot](https://github.com/leraptor65/whatasimpledash/blob/main/Screenshots/home-screenshot.png?raw=true)

## ✨ Features

*   **🎨 High Customization:** Total control over your dashboard's look and feel. Adjust everything from colors and spacing to transparency through a flexible design system.
*   **🛠️ Full In-App Editor:** A rich, tabbed GUI allows you to manage services, groups, theme, and global settings without ever touching a YAML file.
*   **📂 Precision Icon Picker:**
    *   **Standard:** Search through 10,000+ high-quality icons.
    *   **Custom:** Upload, manage, and instantly apply your own PNG/SVG icons.
*   **🖼️ Professional Wallpaper Management:**
    *   **Auto-Optimization:** Uploaded wallpapers are automatically resized and optimized for peak performance and fast loading times.
*   **🔍 Command Palette:** Press `Ctrl+K` to instantly search and launch any service across your entire dashboard.
*   **🔒 Easy Deployment:** Simple, reliable setup using a lightweight Docker image.

## 🚀 Deployment

### 1. Docker Compose
The easiest way to get started is using Docker Compose.

```yaml
services:
  whatasimpledash:
    image: leraptor65/whatasimpledash:latest
    container_name: whatasimpledash
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./config:/app/config
      - ./public/icons:/app/public/icons
      - ./public/backgrounds:/app/public/backgrounds
      - ./public/uploads:/app/public/uploads
```

### 2. Launch
```bash
docker compose up -d
```
Access at `http://localhost:3000`.

## ⚙️ Configuration

While WhatASimpleDash is designed to be managed via the **Settings UI** (Gear Icon), all configuration is persisted in a human-readable `config/services.yml` file.

### Persistent Volumes
To keep your settings and icons across container updates, ensure you map the following volumes:
- `/app/config`: Stores your `services.yml`.
- `/app/public/icons`: Stores your custom uploaded icons.
- `/app/public/backgrounds`: Stores your wallpaper library.
- `/app/public/uploads`: Stores general file uploads.

## 💻 Tech Stack
*   **Framework**: Next.js 14 (Standalone build)
*   **Styling**: Tailwind CSS
*   **State**: Zustand

## 📄 License
MIT License.