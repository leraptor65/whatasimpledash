"use client";

import { useState, useEffect } from 'react';
import type { WidgetConfig } from '@/types';

type ClockWidgetProps = {
  widget: WidgetConfig;
  textColor?: string;
};

export const ClockWidget = ({ widget, textColor }: ClockWidgetProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: widget.format === '12h',
    timeZone: widget.timeZone,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: widget.timeZone,
  };

  return (
    <div className="flex flex-col justify-center h-full text-center" style={{ color: textColor }}>
      <div className="text-4xl font-bold">
        {time.toLocaleTimeString(undefined, timeOptions)}
      </div>
      <div className="text-sm opacity-80">
        {time.toLocaleDateString(undefined, dateOptions)}
      </div>
    </div>
  );
};