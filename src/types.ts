export type Service = {
  name: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  ping?: string;
  pingMethod?: 'HEAD' | 'GET';
  align?: 'left' | 'center' | 'right';
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse';
};

export type ServiceGroup = {
  name: string;
  columns: number;
  services: Service[];
  align?: 'left' | 'center' | 'right';
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse';
};

export type Theme = {
  background: string;
  text: string;
  title: string;
  group: string;
  card: {
    background: string;
    hover: string;
    online: string;
    offline: string;
  };
};

export type DashboardConfig = {
  title: string;
  defaultColumns: number;
  theme: Theme;
  groups: ServiceGroup[];
  services?: Service[];
};
