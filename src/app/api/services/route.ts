import Docker from 'dockerode';
import { NextResponse } from 'next/server';

// Connect to the Docker socket
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function GET() {
  try {
    // Fetch all running containers
    const containers = await docker.listContainers();

    // Format the data to be more useful for the frontend
    const services = containers.map((container) => ({
      id: container.Id,
      name: container.Names[0].replace('/', ''), // Clean up the name
      image: container.Image,
      state: container.State,
      status: container.Status,
    }));

    // Send the list of services as a JSON response
    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch containers' },
      { status: 500 }
    );
  }
}