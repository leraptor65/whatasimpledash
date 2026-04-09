import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const zipcode = searchParams.get('zipcode');
  const country = searchParams.get('country');
  const apiKey = searchParams.get('apiKey');
  const units = searchParams.get('units') || 'metric';
  // provider is usually openweathermap for now
  
  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  let query = '';
  if (zipcode) {
    query = `zip=${zipcode}${country ? `,${country}` : ''}`;
  } else if (city) {
    query = `q=${city}${state ? `,${state}` : ''}${country ? `,${country}` : ''}`;
  } else {
    return NextResponse.json({ error: "City or Zipcode is required" }, { status: 400 });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=${units}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch weather from provider" }, { status: res.status });
    }

    return NextResponse.json({
      temp: data.main.temp,
      description: data.weather[0]?.description || 'Unknown',
      icon: data.weather[0]?.icon || '01d',
      city: data.name
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ error: "Internal server error fetching weather" }, { status: 500 });
  }
}
