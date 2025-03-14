// Cargar variables de entorno desde .env
require('dotenv').config();

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hash } = require('bcrypt');

async function main() {
    console.log('Iniciando seed de la base de datos...');

    // Crear usuario administrador
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            name: 'Administrador',
            email: 'admin@example.com',
            role: 'ADMIN',
        },
    });
    console.log('Usuario administrador creado:', admin.username);

    // Crear categorías de servicios
    const categories = [
        { name: 'Faciales' },
        { name: 'Corporales' },
        { name: 'Depilación' },
        { name: 'Manicura y Pedicura' },
    ];

    for (const category of categories) {
        await prisma.serviceCategory.upsert({
            where: { id: categories.indexOf(category) + 1 },
            update: category,
            create: {
                ...category,
            },
        });
    }
    console.log('Categorías de servicios creadas');

    // Crear servicios
    const services = [
        { name: 'Limpieza Facial Profunda', description: 'Limpieza completa con extracción', price: 3500, duration: 60, categoryId: 1 },
        { name: 'Hidratación Facial', description: 'Tratamiento hidratante para todo tipo de piel', price: 2800, duration: 45, categoryId: 1 },
        { name: 'Masaje Descontracturante', description: 'Masaje para aliviar tensiones', price: 4200, duration: 60, categoryId: 2 },
        { name: 'Drenaje Linfático', description: 'Técnica para eliminar líquidos', price: 3800, duration: 60, categoryId: 2 },
        { name: 'Depilación Piernas Completas', description: 'Depilación con cera', price: 2500, duration: 45, categoryId: 3 },
        { name: 'Depilación Axilas', description: 'Depilación con cera', price: 800, duration: 15, categoryId: 3 },
        { name: 'Manicura Tradicional', description: 'Limado, cutículas y esmaltado', price: 1200, duration: 30, categoryId: 4 },
        { name: 'Pedicura Completa', description: 'Tratamiento completo para pies', price: 1800, duration: 45, categoryId: 4 },
    ];

    for (const service of services) {
        await prisma.service.upsert({
            where: { id: services.indexOf(service) + 1 },
            update: service,
            create: {
                ...service,
            },
        });
    }
    console.log('Servicios creados');

    // Crear profesionales
    const professionals = [
        { name: 'María López', specialty: 'Cosmetóloga' },
        { name: 'Carlos Rodríguez', specialty: 'Masajista' },
        { name: 'Sandra Gómez', specialty: 'Esteticista' },
    ];

    for (const professional of professionals) {
        await prisma.professional.upsert({
            where: { id: professionals.indexOf(professional) + 1 },
            update: professional,
            create: {
                ...professional,
            },
        });
    }
    console.log('Profesionales creados');

    // Crear clientes
    const clients = [
        { name: 'Ana García', email: 'ana@example.com', phone: '1123456789' },
        { name: 'Juan Pérez', email: 'juan@example.com', phone: '1187654321' },
        { name: 'Laura Martínez', email: 'laura@example.com', phone: '1156789012' },
        { name: 'Roberto Sánchez', email: 'roberto@example.com', phone: '1145678901' },
        { name: 'Claudia Torres', email: 'claudia@example.com', phone: '1198765432' },
    ];

    for (const client of clients) {
        await prisma.client.upsert({
            where: { id: clients.indexOf(client) + 1 },
            update: client,
            create: {
                ...client,
            },
        });
    }
    console.log('Clientes creados');

    // Crear métodos de pago
    const paymentMethods = [
        { name: 'Efectivo' },
        { name: 'Tarjeta de Crédito' },
        { name: 'Tarjeta de Débito' },
        { name: 'Transferencia' },
        { name: 'Mercado Pago' },
    ];

    for (const method of paymentMethods) {
        await prisma.paymentMethod.upsert({
            where: { id: paymentMethods.indexOf(method) + 1 },
            update: method,
            create: {
                ...method,
            },
        });
    }
    console.log('Métodos de pago creados');

    // Crear citas para el día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = [
        { 
            date: today, 
            time: '09:00', 
            status: 'CONFIRMADO', 
            professionalId: 1, 
            treatmentId: 1, 
            clientId: 1, 
            box: 'Box 1', 
            price: 3500, 
            duration: 60,
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0)
        },
        { 
            date: today, 
            time: '10:30', 
            status: 'CONFIRMADO', 
            professionalId: 2, 
            treatmentId: 3, 
            clientId: 2, 
            box: 'Box 2', 
            price: 4200, 
            duration: 60,
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30)
        },
        { 
            date: today, 
            time: '11:45', 
            status: 'CONFIRMADO', 
            professionalId: 3, 
            treatmentId: 7, 
            clientId: 3, 
            box: 'Box 3', 
            price: 1200, 
            duration: 30,
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 45),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 15)
        },
        { 
            date: today, 
            time: '14:00', 
            status: 'CONFIRMADO', 
            professionalId: 1, 
            treatmentId: 2, 
            clientId: 4, 
            box: 'Box 1', 
            price: 2800, 
            duration: 45,
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 45)
        },
        { 
            date: today, 
            time: '16:30', 
            status: 'CONFIRMADO', 
            professionalId: 3, 
            treatmentId: 5, 
            clientId: 5, 
            box: 'Box 2', 
            price: 2500, 
            duration: 45,
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 15)
        },
    ];

    for (const appointment of appointments) {
        await prisma.appointment.upsert({
            where: { id: appointments.indexOf(appointment) + 1 },
            update: appointment,
            create: {
                ...appointment,
            },
        });
    }
    console.log('Citas creadas para el día actual');

    // Crear ventas y pagos para el día actual
    const sales = [
        {
            date: today,
            clientId: 1,
            appointmentId: 1,
            total: 3500,
            status: 'completed',
            items: {
                create: [
                    {
                        treatmentId: 1,
                        quantity: 1,
                        price: 3500,
                        subtotal: 3500
                    }
                ]
            },
            payments: {
                create: [
                    {
                        paymentMethodId: 1, // Efectivo
                        amount: 3500
                    }
                ]
            }
        },
        {
            date: today,
            clientId: 2,
            appointmentId: 2,
            total: 4200,
            status: 'completed',
            items: {
                create: [
                    {
                        treatmentId: 3,
                        quantity: 1,
                        price: 4200,
                        subtotal: 4200
                    }
                ]
            },
            payments: {
                create: [
                    {
                        paymentMethodId: 2, // Tarjeta de Crédito
                        amount: 4200
                    }
                ]
            }
        },
        {
            date: today,
            clientId: 3,
            appointmentId: 3,
            total: 1200,
            status: 'completed',
            items: {
                create: [
                    {
                        treatmentId: 7,
                        quantity: 1,
                        price: 1200,
                        subtotal: 1200
                    }
                ]
            },
            payments: {
                create: [
                    {
                        paymentMethodId: 4, // Transferencia
                        amount: 1200
                    }
                ]
            }
        },
        {
            date: today,
            clientId: 4,
            appointmentId: 4,
            total: 2800,
            status: 'completed',
            items: {
                create: [
                    {
                        treatmentId: 2,
                        quantity: 1,
                        price: 2800,
                        subtotal: 2800
                    }
                ]
            },
            payments: {
                create: [
                    {
                        paymentMethodId: 1, // Efectivo
                        amount: 2800
                    }
                ]
            }
        },
        {
            date: today,
            clientId: 5,
            appointmentId: 5,
            total: 2500,
            status: 'completed',
            items: {
                create: [
                    {
                        treatmentId: 5,
                        quantity: 1,
                        price: 2500,
                        subtotal: 2500
                    }
                ]
            },
            payments: {
                create: [
                    {
                        paymentMethodId: 3, // Tarjeta de Débito
                        amount: 2500
                    }
                ]
            }
        },
    ];

    for (const sale of sales) {
        await prisma.sale.create({
            data: sale
        });
    }
    console.log('Ventas y pagos creados para el día actual');

    // Crear gastos para el día actual
    const expenses = [
        {
            description: 'Compra de productos de limpieza',
            amount: 1500,
            date: today,
            category: 'Insumos',
            paymentMethod: 'Efectivo'
        },
        {
            description: 'Pago de servicios',
            amount: 2800,
            date: today,
            category: 'Servicios',
            paymentMethod: 'Transferencia'
        }
    ];

    for (const expense of expenses) {
        await prisma.expense.upsert({
            where: { id: expenses.indexOf(expense) + 1 },
            update: expense,
            create: {
                ...expense,
            },
        });
    }
    console.log('Gastos creados para el día actual');

    console.log('Seed completado exitosamente');
}

main()
    .catch((e) => {
        console.error('Error durante el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
