# What A Simple Dash V2

A simple, highly customizable, self-hosted application dashboard. It allows you to create a beautiful start page for all your services, configured entirely through a simple YAML file.

![Dashboard Screenshot](https://github.com/leraptor65/whatasimpledash/blob/main/Screenshots/home-screenshot.png?raw=true)

## Features

*   **Fully YAML Configurable:** All services, groups, layout, and theme settings are managed in one `services.yml` file.
*   **Advanced In-App Editor:** A built-in GUI with collapsible sections and a full color picker (with transparency support) to modify your configuration, plus a raw YAML editor.
*   **"Type-to-Search":** Simply start typing anywhere to instantly bring up a fuzzy search modal for all your services.
*   **Widgets:** Built-in widgets for **Clock** and **Weather** (via OpenWeatherMap or WeatherAPI).
*   **Service Grouping:** Organize your services into logical groups with customizable title alignment (Left, Center, Right).
*   **Live Config Refresh:** The dashboard automatically refreshes a few seconds after you save changes.
*   **Highly Customizable Theming:** Control all major colors, toggle backgrounds for titles and service cards, and manage dashboard wallpapers with restoration history.
*   **Custom Backgrounds:** Set a custom background by uploading an image or pointing to a web URL, with support for blur effects.
*   **Icon Management:** Upload, view, and manage custom icons directly from the settings interface, or use thousands of icons from `react-icons`.
*   **Easy Deployment:** Runs as a lightweight Docker container, deployable with a single command.

## Easy Deployment (Recommended)

This is the fastest way to get your dashboard running.

#### 1. Create a Directory

First, create a folder where you want to store your dashboard's configuration.

```bash
mkdir whatasimpledash
cd whatasimpledash
```

#### 2. Create the `compose.yml` File

You can either download the `compose.yml` file or create it manually with the following content:

**Download using `curl`:**

```bash
curl -o compose.yml https://raw.githubusercontent.com/leraptor65/whatasimpledash/main/docker-compose.yml
```

**Or download using `wget`:**

```bash
wget -O compose.yml https://raw.githubusercontent.com/leraptor65/whatasimpledash/main/docker-compose.yml
```

**Or, create a file named `compose.yml` and add the following:**

```yaml
services:
  whatasimpledash:
    image: leraptor65/whatasimpledash:latest
    container_name: whatasimpledash
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      # These folders will be created on your host machine automatically
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config:/app/config
      - ./public/icons:/app/public/icons
      - ./public/uploads:/app/public/uploads
```

#### 3. Start the Dashboard

Run Docker Compose from within your directory.

```bash
docker compose pull
docker compose up -d
```

The first time you run this, it will automatically create a `config` folder and place a sample `services.yml` file inside it.

#### 4. Customize

*   Edit the newly created `config/services.yml` file with your services, either manually or by using the in-app editor.
*   Add any custom icons to the `public/icons` folder.
*   Your dashboard will be available at `http://<your-server-ip>:3000`.

## Configuration

All dashboard configuration is done in the `config/services.yml` file.

### Global Settings

*   `title`: The main title displayed at the top of the dashboard.
*   `defaultColumns`: The number of columns for services that are not inside a group.
*   `backgrounds`: Configuration for the dashboard's background images.
    *   `active`: The currently active background image file.
    *   `history`: A list of previously used background images.
*   `settings`: An object for miscellaneous toggles.
    *   `showBackground`: `true` or `false` to toggle the main dashboard wallpaper.
    *   `showTitleBackgrounds`: `true` or `false` to show a background behind titles.
    *   `showServiceBackgrounds`: `true` or `false` to show a background/shadow on service cards.
    *   `backgroundBlur`: A number representing the blur intensity of the background image.
    *   `localIp`: An IP address from which "local" services will be visible.
*   `theme`: An object to control the dashboard's color scheme. All colors support hex (`#RRGGBB`) and rgba (`rgba(r,g,b,a)`) for transparency.
    *   `mainBackground`: Main background color.
    *   `titleBackground`: Background for the main title and group titles.
    *   `text`: The primary text color for titles and services.
    *   `serviceBackground`: Background on the service cards.
    *   `serviceBackgroundHover`: Hover background on the service cards.

### Widgets

The `widgets` key contains configuration for dashboard widgets displayed at the top.

*   `columns`: Number of columns for the widget grid.
*   `items`: A list of widget objects.
    *   `type`: `clock` or `weather`.
    *   `name`: (Optional) Internal name for the widget.
    *   **Common Options**:
        *   `backgroundColor`: Custom background color.
        *   `textColor`: Custom text color.
    *   **Clock Options**:
        *   `timeZone`: IANA Timezone string (e.g., `America/New_York`).
        *   `format`: `12h` or `24h`.
    *   **Weather Options**:
        *   `provider`: `openweathermap` or `weatherapi`.
        *   `apiKey`: API key for the chosen provider.
        *   `city`, `state`, `country`, `zipcode`: Location identifiers.
        *   `units`: `metric`, `imperial`, or `standard`.

### Groups

The `groups` key contains a list of service groups. Each group has:

*   `name`: The title of the group.
*   `columns`: The number of columns for the grid in this group.
*   `collapsed`: (Optional) `true` to have the group collapsed by default.
*   `align`: (Optional) `left`, `center`, or `right` for service items.
*   `titleAlign`: (Optional) `left`, `center`, or `right` for the group title itself.
*   `layout`: (Optional) `vertical` (default), `horizontal`, or `horizontal-reverse`.
*   `services`: A list of service items.

### Services

A service item has the following properties:

*   `name`: The name displayed on the card.
*   `url`: The URL the card links to.
*   `subtitle`: (Optional) A short description displayed under the name.
*   `icon`: (Optional) The icon to display.
*   `showIcon`: (Optional) `true` or `false` to show/hide the icon (defaults to `true`).
*   `align`: (Optional) Overrides the group's `align` setting.
*   `layout`: (Optional) Overrides the group's `layout` setting.
*   `backgroundColor`: (Optional) A custom background color for the service card.
*   `textColor`: (Optional) A custom text color for the service card.
*   `local`: (Optional) A boolean (`true` or `false`) that, if true, will only show the service if the dashboard is being accessed from the `localIp` defined in the settings.

### Adding Icons

1.  **Custom Icons:** Place your `.png` or `.svg` files in `public/icons/` and reference them by filename (e.g., `icon: proxmox.png`). You can also upload them via the settings UI.
2.  **React Icons:** Browse available icons at [https://react-icons.github.io/react-icons](https://react-icons.github.io/react-icons) and reference them by name (e.g., `icon: FaGithub` or `icon: SiJellyfin`).

## Build from Source (for Developers)

If you want to modify the code, you can build the project from source.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/leraptor65/whatasimpledash.git
    cd whatasimpledash
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Build and Run the Development Container:**
    Use the `docker-compose.dev.yml` file to build and run the container.

    ```bash
    docker compose -f docker-compose.dev.yml up --build -d
    ```

## Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) / [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Deployment:** [Docker](https://www.docker.com/)

## License

Distributed under the MIT License.