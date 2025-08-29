export type Service = {
  name: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  ping?: string;
  pingMethod?: 'HEAD' | 'GET';
  align?: 'left' | 'center' | 'right';
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse';
  backgroundColor?: string;
  textColor?: string;
};

export type ServiceGroup = {
  name: string;
  columns: number;
  services: Service[];
  align?: 'left' | 'center' | 'right';
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse';
};

export type Theme = {
  mainBackground: string;
  titleBackground: string;
  text: string;
  serviceBackground: string;
  serviceBackgroundHover: string;
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
  services?: Service[];
  settings?: {
    showTitleBackgrounds?: boolean;
  };
};