# Just A Simple Dash

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A simple, highly customizable, self-hosted application dashboard built with Next.js and Docker. It allows you to create a beautiful startpage for all your services, configured entirely through a simple YAML file.

![Dashboard Screenshot](https://raw.githubusercontent.com/leraptor65/justasimpledash/main/screenshot.png)

## Features

-   **Fully YAML Configurable:** All services, groups, layout, and theme settings are managed in one simple `services.yml` file.
-   **Service Grouping:** Organize your services into logical groups.
-   **Auto-Discovery:** Automatically discovers and displays all running Docker containers.
-   **Live Refresh:** Automatically refreshes the dashboard a few seconds after you save changes to your `services.yml` file.
-   **Customizable Layout:**
    -   Set the number of columns globally or per-group.
    -   Align content (left, center, right) for entire groups or individual services.
    -   Choose a layout for each service (icon above, to the left, or to the right of the name).
-   **Customizable Theming:** Easily change the background, text, and card colors to match your style.
-   **Icon Support:** Use thousands of icons from the `react-icons` library or add your own custom PNG/SVG icons.
-   **Easy Deployment:** Runs as a lightweight Docker container, deployable with a single command.

## Easy Deployment (Recommended)

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
      - ./config:/app/config:ro
      - ./public/icons:/app/public/icons:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    group_add:
      - $(stat -c '%g' /var/run/docker.sock)
```

#### 4\. Start the Dashboard

```bash
docker compose up -d
```

Your dashboard will be available at `http://<your-server-ip>:3000`. The dashboard will auto-refresh a few seconds after you save changes to your `services.yml` file.

\<br\>

\<details\>
\<summary\>\<strong\>Configuration Details (How to edit services.yml)\</strong\>\</summary\>

All dashboard configuration is done in the `config/services.yml` file.

### Global Settings

  - `title`: The main title displayed at the top of the dashboard.
  - `defaultColumns`: The number of columns for services that are not inside a group.
  - `theme`: An object to control the dashboard's color scheme.
      - `background`, `text`, `title`, `group`: Colors for page elements.
      - `card`: Contains `background` and `hover` colors for service cards.

### Groups

The `groups` key contains a list of service groups. Each group has:

  - `name`: The title of the group.
  - `columns`: The number of columns for the grid in this group.
  - `align`: (Optional) `left`, `center`, or `right`.
  - `layout`: (Optional) `vertical` (default), `horizontal`, or `horizontal-reverse`.
  - `services`: A list of service items.

### Services

A service item has the following properties:

  - `name`: The name displayed on the card.
  - `url`: The URL the card links to.
  - `subtitle`: (Optional) A short description displayed under the name.
  - `icon`: (Optional) The icon to display.
  - `align`: (Optional) Overrides the group's `align` setting.
  - `layout`: (Optional) Overrides the group's `layout` setting.

### Adding Icons

1.  **Custom Icons:** Place your `.png` or `.svg` files in `public/icons/` and reference them by filename (e.g., `icon: proxmox.png`).
2.  **React Icons:** Browse available icons at [https://react-icons.github.io/react-icons](https://react-icons.github.io/react-icons) and reference them by name (e.g., `icon: SiJellyfin`).

### Docker Widget

To display auto-discovered Docker containers, add a special service item:

```yaml
services:
  - name: Docker Containers
    widget: "docker"
```

\</details\>

\<br\>

\<details\>
\<summary\>\<strong\>For Developers (Building from Source)\</strong\>\</summary\>

If you want to modify the code, you can build the project from source.

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/leraptor65/justasimpledash.git](https://github.com/leraptor65/justasimpledash.git)
    cd justasimpledash
    ```

2.  **Set Docker Permissions:**
    Create a `.env` file that grants the necessary build-time permissions.

    ```bash
    echo "DOCKER_GROUP_ID=$(stat -c '%g' /var/run/docker.sock)" > .env
    ```

3.  **Install Dependencies & Build:**
    The Docker Compose command will handle everything.

    ```bash
    docker compose up --build -d
    ```

\</details\>

## Technology Stack

  - **Framework:** [Next.js](https://nextjs.org/) / [React](https://reactjs.org/)
  - **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  - **Language:** [TypeScript](https://www.typescriptlang.org/)
  - **Deployment:** [Docker](https://www.docker.com/)

## License

Distributed under the MIT License.

```
```