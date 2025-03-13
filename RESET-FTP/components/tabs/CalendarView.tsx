import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Appointment } from './agenda-tab'; // Asegúrate de que la ruta sea correcta

const CalendarView = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const boxes = ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"]; // Definir los boxes

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch('/api/appointments');
                const data = await response.json();
                setAppointments(data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchAppointments();
    }, []);

    const handleDateClick = (arg: any) => {
        // Aquí puedes manejar el clic en una fecha para crear un nuevo tratamiento
        console.log('Date clicked:', arg.date);
    };

    const handleEventClick = (arg: any) => {
        // Aquí puedes manejar el clic en un evento para editarlo
        console.log('Event clicked:', arg.event);
    };

    const handleDrop = (info: any) => {
        const { event } = info;
        // Lógica para manejar el evento arrastrado
        console.log('Dropped event:', event);
    };

    const events = appointments.map(appointment => ({
        title: `${appointment.treatmentName} (${appointment.clientName})`,
        start: `${appointment.date}T${appointment.time}`,
        end: `${appointment.date}T${appointment.time}`, // Ajusta la duración según sea necesario
        extendedProps: {
            appointmentId: appointment.id,
            box: appointment.box, // Agregar box a las propiedades extendidas
        },
    }));

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
            selectable={true}
            allDaySlot={false}
            slotDuration="00:30:00" // Duración de los slots de tiempo
            slotLabelInterval={{ minutes: 30 }} // Intervalo de etiquetas de tiempo
            height="auto"
            drop={handleDrop}
        />
    );
};

export default CalendarView; 