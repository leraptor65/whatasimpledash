# Just A Simple Dash

A simple, highly customizable, self-hosted application dashboard built with Next.js and Docker. It allows you to create a beautiful startpage for all your services, configured entirely through a simple YAML file.

![Dashboard Screenshot](https://raw.githubusercontent.com/leraptor65/justasimpledash/main/screenshot.png)

## Features

* **Fully YAML Configurable:** All services, groups, layout, and theme settings are managed in one `services.yml` file.
* **In-App Editor:** A built-in GUI editor to modify your `services.yml` configuration directly from the dashboard.
* **Service Grouping:** Organize your services into logical groups.
* **Ping-Based Status Checks:** Add an optional `ping` URL to any service to see a live online/offline status indicator.
* **Live Config Refresh:** The dashboard automatically refreshes a few seconds after you save changes to your configuration.
* **Customizable Layout & Theming:** Control columns, alignment, layout, and all major colors.
* **Icon Support:** Use thousands of icons from the `react-icons` library or add your own custom PNG/SVG icons.
* **Easy Deployment:** Runs as a lightweight Docker container, deployable with a single command.

## Easy Deployment (Recommended)

This is the fastest way to get your dashboard running.

#### 1. Create a Directory and `docker-compose.yml`

First, create a folder for your dashboard and create a `docker-compose.yml` file inside it with the following content:

```yaml
services:
  dashboard:
    image: leraptor65/justasimpledash:latest
    container_name: justasimpledash
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      # These folders will be created on your host machine automatically
      - ./config:/app/config
      - ./public/icons:/app/public/icons
````

#### 2\. Start the Dashboard

Run Docker Compose from within your new directory.

```bash
docker compose up -d
```

The first time you run this, it will automatically create a `config` folder and place a sample `services.yml` file inside it.

#### 3\. Customize

  * Edit the newly created `config/services.yml` file with your services, either manually or by using the in-app editor.
  * Add any custom icons to the `public/icons` folder.
  * Your dashboard will be available at `http://<your-server-ip>:3000`.

## Using the In-App Editor

1.  Navigate to your dashboard.
2.  Click the **settings cog icon** in the top-right corner.
3.  Make your changes in the text editor.
4.  Click **Save Changes**. The dashboard will automatically update with your new configuration.

All dashboard configuration is done in the `config/services.yml` file.

### Global Settings

  * `title`: The main title displayed at the top of the dashboard.
  * `defaultColumns`: The number of columns for services that are not inside a group.
  * `theme`: An object to control the dashboard's color scheme.
      * `background`, `text`, `title`, `group`: Colors for page elements.
      * `card`: Contains `background`, `hover`, `online`, and `offline` colors.

### Groups

The `groups` key contains a list of service groups. Each group has:

  * `name`: The title of the group.
  * `columns`: The number of columns for the grid in this group.
  * `align`: (Optional) `left`, `center`, or `right`.
  * `layout`: (Optional) `vertical` (default), `horizontal`, or `horizontal-reverse`.
  * `services`: A list of service items.

### Services

A service item has the following properties:

  * `name`: The name displayed on the card.
  * `url`: The URL the card links to.
  * `subtitle`: (Optional) A short description displayed under the name.
  * `icon`: (Optional) The icon to display.
  * `ping`: (Optional) A URL to check for an online/offline status dot (e.g., `http://192.168.1.100:8096`).
  * `align`: (Optional) Overrides the group's `align` setting.
  * `layout`: (Optional) Overrides the group's `layout` setting.

### Adding Icons

1.  **Custom Icons:** Place your `.png` or `.svg` files in `public/icons/` and reference them by filename (e.g., `icon: proxmox.png`).
2.  **React Icons:** Browse available icons at https://react-icons.github.io/react-icons and reference them by name (e.g., `icon: SiJellyfin`).


## Build
If you want to modify the code, you can build the project from source.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/leraptor65/justasimpledash.git
    cd justasimpledash
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Build and Run the Container:**

    ```bash
    docker compose up --build -d
    ```


## Technology Stack

  * **Framework:** [Next.js](https://nextjs.org/) / [React](https://react.dev/)
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  * **Language:** [TypeScript](https://www.typescriptlang.org/)
  * **Deployment:** [Docker](https://www.docker.com/)

## License

Distributed under the MIT License.

```
```