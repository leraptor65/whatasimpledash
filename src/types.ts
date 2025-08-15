export type Service = {
  name: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  widget?: 'docker';
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
  };
};

export type DashboardConfig = {
  title: string;
  defaultColumns: number;
  theme: Theme;
  groups: ServiceGroup[];
  services: Service[];
};

export type DockerService = { id: string; name: string; image: string; state: string };