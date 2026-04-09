
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
  serviceText?: string;
};

export type Backgrounds = {
  active?: string;
  history?: string[];
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
  };
};