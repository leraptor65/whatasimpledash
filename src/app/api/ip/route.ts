import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Use request.ip, which is aware of x-forwarded-for behind a trusted proxy
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  return NextResponse.json({ ip });
}