"use client";

import { useState, useEffect } from 'react';
import type { WidgetConfig } from '@/types';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaBolt, FaSmog } from 'react-icons/fa';

type WeatherWidgetProps = {
  widget: WidgetConfig;
  textColor?: string;
};

type WeatherData = {
  temp: number;
  description: string;
  icon: string;
  city: string;
};

const weatherIconMap: { [key: string]: React.ElementType } = {
    '01d': FaSun, '01n': FaSun,
    '02d': FaCloud, '02n': FaCloud,
    '03d': FaCloud, '03n': FaCloud,
    '04d': FaCloud, '04n': FaCloud,
    '09d': FaCloudRain, '09n': FaCloudRain,
    '10d': FaCloudRain, '10n': FaCloudRain,
    '11d': FaBolt, '11n': FaBolt,
    '13d': FaSnowflake, '13n': FaSnowflake,
    '50d': FaSmog, '50n': FaSmog,
};

export const WeatherWidget = ({ widget, textColor }: WeatherWidgetProps) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            if ((!widget.city && !widget.zipcode) || !widget.apiKey) {
                setError("City or Zipcode and API key are required.");
                return;
            }

            const query = new URLSearchParams({
                city: widget.city || '',
                state: widget.state || '',
                zipcode: widget.zipcode || '',
                country: widget.country || '',
                apiKey: widget.apiKey,
                units: widget.units || 'metric',
                provider: widget.provider || 'openweathermap',
            }).toString();

            try {
                const res = await fetch(`/api/weather?${query}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch weather');
                setWeather(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 600000); // every 10 minutes
        return () => clearInterval(interval);
    }, [widget]);

    const unitSymbol = widget.units === 'imperial' ? '°F' : '°C';
    const WeatherIcon = weather ? weatherIconMap[weather.icon] || FaCloud : FaCloud;

    return (
        <div className="flex flex-col justify-center h-full text-center" style={{ color: textColor }}>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {weather && !error && (
                <>
                    <div className="flex items-center justify-center gap-4">
                        <WeatherIcon size={40} />
                        <span className="text-4xl font-bold">{Math.round(weather.temp)}{unitSymbol}</span>
                    </div>
                    <p className="text-sm capitalize opacity-80">{weather.description}</p>
                    <p className="text-xs opacity-60">{weather.city}</p>
                </>
            )}
        </div>
    );
};