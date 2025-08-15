# My Custom Dashboard

A simple, highly customizable, self-hosted application dashboard built from scratch using Next.js and Docker. It allows you to create a beautiful startpage for all your services, configured entirely through a simple YAML file.

![Dashboard Screenshot](https://github.com/leraptor65/dashboard/blob/main/screenshot.png)

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

## Getting Started

Follow these steps to get your own instance of the dashboard running.

### Prerequisites

You must have **Docker** and **Docker Compose** installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/leraptor65/dashboard.git](https://github.com/leraptor65/dashboard.git)
    cd your-repository
    ```

2.  **Set Docker Permissions:**
    The dashboard needs to communicate with the Docker socket to discover containers. Run the following command to create a `.env` file that grants the necessary permissions to the container.
    ```bash
    echo "DOCKER_GROUP_ID=$(stat -c '%g' /var/run/docker.sock)" > .env
    ```

3.  **Add Your Custom Icons (Optional):**
    Place any custom `.png` or `.svg` icons you want to use inside the `public/icons/` directory.

4.  **Configure Your Dashboard:**
    Edit the `config/services.yml` file to add your groups and services. See the detailed **Configuration** section below.

5.  **Build and Run the Container:**
    ```bash
    docker compose up --build -d
    ```
    Your dashboard will now be running at `http://<your-server-ip>:3000`.

## Configuration

All dashboard configuration is done in the `config/services.yml` file.

### Global Settings

These keys are at the top level of the file:

-   `title`: The main title displayed at the top of the dashboard.
-   `defaultColumns`: The number of columns for services that are not inside a group.
-   `theme`: An object to control the dashboard's color scheme.
    -   `background`: The main page background color.
    -   `text`: The default text color.
    -   `title`: The color of the main `title`.
    -   `group`: The color of the group titles and subtitles.
    -   `card`:
        -   `background`: The default background color for service cards.
        -   `hover`: The background color when you hover over a card.

### Groups

The `groups` key contains a list of service groups. Each group is an object with the following properties:

-   `name`: (Required) The title of the group.
-   `columns`: (Required) The number of columns for the grid in this group.
-   `align`: (Optional) The alignment of content within the cards. Options: `left`, `center`, `right`. Defaults to `center`.
-   `layout`: (Optional) The layout of the icon and text within the cards. Options: `vertical` (default), `horizontal`, `horizontal-reverse`.
-   `services`: (Required) A list of services, as defined below.

### Services

A service is an item on your dashboard. It can be defined in a `group` or at the top-level `services` list.

-   `name`: (Required) The name displayed on the card.
-   `url`: The URL the card links to.
-   `subtitle`: (Optional) A short description displayed under the name.
-   `icon`: (Optional) The icon to display. See **Adding Icons** below.
-   `align`: (Optional) Overrides the group's `align` setting for this specific service.
-   `layout`: (Optional) Overrides the group's `layout` setting for this specific service.

### Special Widgets

-   **Docker Widget:** To display the auto-discovered list of running Docker containers, add a special service item like this (usually in the top-level `services` list):
    ```yaml
    services:
      - name: Docker Containers
        widget: "docker"
    ```

## Adding Icons

You can use two types of icons:

1.  **Custom Icons:**
    -   Place your `.png` or `.svg` files in the `public/icons/` directory.
    -   Reference them by their filename in `services.yml`:
        ```yaml
        icon: proxmox.png
        ```

2.  **React Icons:**
    -   This project includes the popular `react-icons` library.
    -   Browse available icons at [https://react-icons.github.io/react-icons](https://react-icons.github.io/react-icons).
    -   Reference them by their name (e.g., `FaGoogle`, `SiPlex`):
        ```yaml
        icon: SiJellyfin
        ```

## Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/) / [React](https://reactjs.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Deployment:** [Docker](https://www.docker.com/)

## License

Distributed under the MIT License.