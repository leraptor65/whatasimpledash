# What A Simple Dash V2 🚀

A simple, highly customizable, self-hosted application dashboard. Use it to organize all your services, configured entirely through a simple YAML file or a rich in-app editor.

**Now powered by a lightweight Go backend!**

![Dashboard Screenshot](https://github.com/leraptor65/whatasimpledash/blob/main/Screenshots/home-screenshot.png?raw=true)

## ✨ Features

*   **⚡ Fast Go Backend:** Re-engineered with Go for speed, efficiency, and a tiny memory footprint.
*   **🛠️ Full In-App Editor:** Manage services, groups, theme, and settings with a GUI. No need to touch YAML if you don't want to.
*   **📂 Tabbed Icon Picker:**
    *   **Standard:** Search thousands of built-in FontAwesome icons.
    *   **Custom:** Upload your own PNG/SVG icons and resize/manage them easily.
*   **🖼️ Advanced Background Config:**
    *   **Auto-Resizing:** Uploaded wallpapers are automatically optimized to 1920x1080 (High Quality).
    *   **Modifiers:** Apply effects like **Blur**, **Vignette**, **Pixelate**, or hide the wallpaper entirely.
*   **🎨 Deep Theming:** Control colors, transparency, and style.
*   **🔍 Quick Search:** Just start typing to instantly filter and launch services.
*   **⛅ Widgets:** Clock and Weather (OpenWeatherMap / WeatherAPI).
*   **🔒 Deployment:** Simple Docker container.

## 🚀 Easy Deployment

### 1. Create Compose File
Download `docker-compose.yml` or create it:

```yaml
services:
  whatasimpledash:
    image: leraptor65/whatasimpledash:latest
    container_name: whatasimpledash
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config:/app/config
      - ./public/icons:/app/public/icons
      - ./public/backgrounds:/app/public/backgrounds
```

### 2. Start
```bash
docker compose up -d
```
Access at `http://localhost:3000`.

## ⚙️ Configuration

Configuration is stored in `config/services.yml` but can be edited via the Settings UI (Gear Icon).

### Global Settings
*   **Backgrounds**: Manage active wallpaper and history.
    *   **Modifiers**: Choose between `None`, `Blur`, `Vignette`, `Pixelate`, or `No Wallpaper`.
*   **Theme**: Customize colors for background, text, titles, and cards. Support for transparency (RGBA).

### Services & Groups
*   **Drag & Drop**: (Planned/In-Progress) Organize groups.
*   **Icons**: Upload custom icons via the "Custom" tab in the editor or drop files into `public/icons`.

## 🛠️ Build from Source

1.  **Clone**: `git clone https://github.com/leraptor65/whatasimpledash.git`
2.  **Build**: `./build-go.sh` (Requires Docker)
3.  **Run**: Access `http://localhost:8081` (Dev port)

## 💻 Tech Stack
*   **Frontend**: Next.js, React, Tailwind CSS
*   **Backend**: Go (Golang) standard library + `imaging` for processing
*   **Container**: Docker (Multi-stage build)

## 📄 License
MIT License.