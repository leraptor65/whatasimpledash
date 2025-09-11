"use client";

import type { DashboardConfig, WidgetConfig } from '@/types';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';

type WidgetCardProps = {
  widget: WidgetConfig;
  theme: DashboardConfig['theme'];
};

export const WidgetCard = ({ widget, theme }: WidgetCardProps) => {
  const backgroundColor = widget.backgroundColor || theme.serviceBackground;
  const textColor = widget.textColor || theme.text;

  const cardStyle = {
    backgroundColor,
    color: textColor,
  };

  return (
    <div className="relative rounded-xl p-4 shadow-lg flex h-24 transition-colors" style={cardStyle}>
      {widget.type === 'clock' && <ClockWidget widget={widget} textColor={textColor} />}
      {widget.type === 'weather' && <WeatherWidget widget={widget} textColor={textColor} />}
    </div>
  );
};