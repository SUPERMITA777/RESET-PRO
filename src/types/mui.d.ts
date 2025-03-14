declare module '@mui/material' {
  export const Container: any;
  export const Typography: any;
  export const Box: any;
  export const CircularProgress: any;
  export const Alert: any;
  export const Tabs: any;
  export const Tab: any;
  export const Paper: any;
  export const Snackbar: any;
  export const Button: any;
  export const Card: any;
  export const CardContent: any;
  export const Chip: any;
  export const AppBar: any;
  export const Toolbar: any;
  export const IconButton: any;
  export const Menu: any;
  export const MenuItem: any;
  export const useMediaQuery: any;
  export const useTheme: any;
  export const useScrollTrigger: any;
  export const Slide: any;
}

declare module '@mui/icons-material/Menu' {
  const MenuIcon: any;
  export default MenuIcon;
}

declare module '@mui/material/styles' {
  export const styled: any;
}

declare module '@/components/appointments/AppointmentCard' {
  export interface AppointmentCardProps {
    appointment: {
      id: number;
      date: string;
      startTime: string;
      professional: { name: string };
      service: { name: string; price: number };
      status: string;
      paymentStatus: string;
      clientName: string;
    };
    onPay?: (appointmentId: number) => void;
  }
  
  export const AppointmentCard: React.FC<AppointmentCardProps>;
}

declare module '@/hooks/useAppointments' {
  export interface Appointment {
    id: number;
    date: string;
    startTime: string;
    professional: { name: string };
    service: { name: string; price: number };
    status: string;
    paymentStatus: string;
    clientName: string;
  }
  
  export function useAppointments(): {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    payAppointment: (appointmentId: number) => Promise<any>;
    refetch: () => Promise<void>;
  };
} 