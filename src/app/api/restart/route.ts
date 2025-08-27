import { NextResponse } from 'next/server';
import Docker from 'dockerode';

// Function to restart the container
async function restartContainer() {
  try {
    const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    const container = docker.getContainer('whatasimpledash');
    await container.restart();
    return { success: true };
  } catch (error) {
    console.error("Failed to restart container:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: message };
  }
}

export async function POST(request: Request) {
  const result = await restartContainer();
  if (result.success) {
    return NextResponse.json({ success: true, message: 'Container restarting...' });
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
}