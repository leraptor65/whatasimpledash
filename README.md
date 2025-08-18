# Just A Simple Dash

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A simple, highly customizable, self-hosted application dashboard built with Next.js and Docker. It allows you to create a beautiful startpage for all your services, configured entirely through a simple YAML file.

![Dashboard Screenshot](https://raw.githubusercontent.com/leraptor65/justasimpledash/main/screenshot.png)

## Features

-   **Fully YAML Configurable:** All services, groups, layout, and theme settings are managed in one simple `services.yml` file.
-   **Service Grouping:** Organize your services into logical groups.
-   **Ping-Based Status Checks:** Add an optional `ping` URL to any service to see a live online/offline status indicator.
-   **Live Config Refresh:** The dashboard automatically refreshes a few seconds after you save changes to your `services.yml` file.
-   **Customizable Layout & Theming:** Control columns, alignment, layout, and all major colors.
-   **Icon Support:** Use thousands of icons from the `react-icons` library or add your own custom PNG/SVG icons.
-   **Easy Deployment:** Runs as a lightweight Docker container, deployable with a single command.

## Easy Deployment

This is the fastest way to get your dashboard running.

#### 1. Create Folders
Create the necessary directories for your configuration and custom icons.
```bash
mkdir -p config public/icons
````

#### 2\. Create Configuration

  - Create a file named `config/services.yml`. You can use the [sample file in this repository](https://www.google.com/search?q=https://github.com/leraptor65/justasimpledash/blob/main/config/services.yml) as a starting point.
  - Place any custom icons you want to use into the `public/icons` folder.

#### 3\. Create `docker-compose.yml`

Create a `docker-compose.yml` file and paste the following content into it:

```yaml
services:
  dashboard:
    image: leraptor65/justasimpledash:latest
    container_name: justasimpledash
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./config:/app/config
      - ./public/icons:/app/public/icons:ro
```

#### 4\. Start the Dashboard

```bash
docker compose up -d
```

Your dashboard will be available at `http://<your-server-ip>:3000`.

All dashboard configuration is done in the `config/services.yml` file.

### Service Properties

  - `name`: The name displayed on the card.
  - `url`: The URL the card links to.
  - `subtitle`: (Optional) A short description.
  - `icon`: (Optional) An icon from `react-icons` or a custom file in `public/icons/`.
  - `ping`: (Optional) A URL to check for an online/offline status dot. This should be a base URL that responds to network requests (e.g., `http://192.168.1.100:8096`).
  - `align`, `layout`, etc.

### Theme Properties

The `theme` object also supports `online` and `offline` color properties for the status dots.

## Technology Stack

  - **Framework:** [Next.js](https://nextjs.org/) / [React](https://www.google.com/search?q=https://react.js.org/)
  - **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  - **Language:** [TypeScript](https://www.typescriptlang.org/)
  - **Deployment:** [Docker](https://www.docker.com/)

## License

Distributed under the MIT License.
