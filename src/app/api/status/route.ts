import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // We use 'HEAD' as it's a lightweight way to check if a server is responsive
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    return NextResponse.json({ status: response.ok ? 'online' : 'offline' });
  } catch (error) {
    // Any network error (timeout, DNS error, etc.) means it's offline
    return NextResponse.json({ status: 'offline' });
  }
}
