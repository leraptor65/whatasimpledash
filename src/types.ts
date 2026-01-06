export type WidgetConfig = {
  name: string; // Add name for easier identification in the editor
  type: 'clock' | 'weather';
  provider?: 'openweathermap' | 'weatherapi';
  timeZone?: string;
  format?: '12h' | '24h';
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  apiKey?: string;
  units?: 'metric' | 'imperial' | 'standard';
  backgroundColor?: string;
  textColor?: string;
};

export type Service = {
  name: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  showIcon?: boolean; // Default to true if undefined
  align?: 'left' | 'center' | 'right';
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse' | 'vertical-reverse';
  backgroundColor?: string;
  textColor?: string;
  hidden?: boolean;
};

export type ServiceGroup = {
  name: string;
  columns: number;
  services: Service[];
  align?: 'left' | 'center' | 'right';
  titleAlign?: 'left' | 'center' | 'right';
  titleBackgroundColor?: string; // Custom background color for group title
  titleTextColor?: string;       // Custom text color for group title
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse';
  collapsed?: boolean;
};

export type Theme = {
  mainBackground: string;
  titleBackground: string;
  text: string;
  serviceBackground: string;
  serviceBackgroundHover: string;
  groupTitleBackground?: string;
  groupTitleText?: string;
};

export type Backgrounds = {
  active?: string;
  history?: string[];
};

export type WidgetSection = {
  columns: number;
  items: WidgetConfig[];
}

export type DashboardConfig = {
  title: string;
  defaultColumns: number;
  theme: Theme;
  backgrounds?: Backgrounds;
  widgets?: WidgetSection; // New dedicated section for widgets
  groups: ServiceGroup[];
  services?: Service[]; // This will now be officially for ungrouped services
  settings?: {
    showTitleBackgrounds?: boolean;
    showServiceBackgrounds?: boolean; // New option
    showBackground?: boolean; // New option for main wallpaper
    lastActiveBackground?: string; // To restore bg when toggled back on
    backgroundBlur?: number;
    localIp?: string;
  };
};