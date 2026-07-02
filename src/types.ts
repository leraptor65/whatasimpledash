
export type Service = {
  name: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  showIcon?: boolean; // Default to true if undefined
  backgroundColor?: string;
  textColor?: string;
  hidden?: boolean;
};

export type ServiceGroup = {
  name: string;
  columns: number;
  services: Service[];
  titleBackgroundColor?: string; // Custom background color for group title
  titleTextColor?: string;       // Custom text color for group title
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
  serviceText?: string;
};

export type BackgroundEffect =
  | 'none'
  | 'blur'
  | 'vignette'
  | 'darken'
  | 'grayscale'
  | 'sepia'
  | 'pixelate';

export type Backgrounds = {
  active?: string;
  effect?: BackgroundEffect;
  effectIntensity?: number; // 0-100
};


export type DashboardConfig = {
  title: string;
  defaultColumns: number;
  theme: Theme;
  backgrounds?: Backgrounds;
  groups: ServiceGroup[];
  services?: Service[]; // This will now be officially for ungrouped services
  settings?: {
    showTitleBackgrounds?: boolean;
    showServiceBackgrounds?: boolean;
    showBackground?: boolean;

    localIp?: string;
    customGreeting?: string;
    customHelpText?: string;
    hideGreeting?: boolean;
    showGreetingBackground?: boolean;
    greetingRadius?: number;
    smoothScroll?: boolean;
    smoothScrollSpeed?: number;
  };
};