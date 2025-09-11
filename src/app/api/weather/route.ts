import { NextResponse } from 'next/server';

const handleOpenWeatherMap = async (location: string, apiKey: string, units: string) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${units}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Error from OpenWeatherMap API');
    }

    return {
        temp: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
    };
};

const handleWeatherApi = async (location: string, apiKey: string, units: string) => {
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error.message || 'Error from WeatherAPI.com');
    }
    
    const iconCode = data.current.condition.icon.split('/').pop()?.replace('.png', '');
    const isDay = data.current.is_day === 1 ? 'd' : 'n';
    
    const iconMap: { [key: string]: string } = {
        '113': '01', '116': '02', '119': '03', '122': '04', '176': '10', '296': '09',
        '302': '10', '308': '09', '329': '13', '338': '13', '200': '11',
    };
    const finalIcon = `${iconMap[iconCode || '116'] || '02'}${isDay}`;

    return {
        temp: units === 'imperial' ? data.current.temp_f : data.current.temp_c,
        description: data.current.condition.text,
        icon: finalIcon,
        city: data.location.name,
    };
};


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const zipcode = searchParams.get('zipcode');
    const country = searchParams.get('country');
    const apiKey = searchParams.get('apiKey');
    const units = searchParams.get('units') || 'metric';
    const provider = searchParams.get('provider') || 'openweathermap';

    let locationQuery = [city, state, zipcode, country].filter(Boolean).join(',');

    if (!locationQuery || !apiKey) {
        return NextResponse.json({ error: 'Missing location details or API key' }, { status: 400 });
    }

    try {
        let weatherData;
        if (provider === 'weatherapi') {
            weatherData = await handleWeatherApi(locationQuery, apiKey, units);
        } else {
            weatherData = await handleOpenWeatherMap(locationQuery, apiKey, units);
        }
        return NextResponse.json(weatherData);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}