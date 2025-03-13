import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Appointment } from './agenda-tab'; // Asegúrate de que la ruta sea correcta

const BOXES = ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"];
const ITEM_TYPE = 'APPOINTMENT';

const Calendar = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);

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

    const moveAppointment = async (appointmentId: number, box: string) => {
        // Lógica para actualizar la cita en la base de datos
        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ box }), // Actualiza el box de la cita
            });

            if (!response.ok) {
                throw new Error('Error updating appointment');
            }

            // Actualiza el estado local
            setAppointments(prev => prev.map(app => 
                app.id === appointmentId ? { ...app, box } : app
            ));
        } catch (error) {
            console.error('Error moving appointment:', error);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-5 gap-4">
                {BOXES.map(box => (
                    <Box key={box} box={box} appointments={appointments} moveAppointment={moveAppointment} />
                ))}
            </div>
        </DndProvider>
    );
};

const Box = ({ box, appointments, moveAppointment }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ITEM_TYPE,
        drop: (item) => moveAppointment(item.id, box),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    return (
        <div ref={drop} className={`border p-2 ${isOver ? 'bg-gray-200' : 'bg-white'}`}>
            <h3 className="font-bold">{box}</h3>
            {appointments.filter(app => app.box === box).map(appointment => (
                <AppointmentItem key={appointment.id} appointment={appointment} />
            ))}
        </div>
    );
};

const AppointmentItem = ({ appointment }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ITEM_TYPE,
        item: { id: appointment.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} className={`p-2 border ${isDragging ? 'opacity-50' : ''}`}>
            <div>{appointment.treatmentName} ({appointment.clientName})</div>
            <div>{appointment.time}</div>
        </div>
    );
};

export default Calendar; 