import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función auxiliar para limpiar todas las tablas
async function clearAllTables() {
  try {
    // Limpiar tablas en orden inverso (para respetar restricciones de clave foránea)
    await prisma.payment.deleteMany({});
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.professionalAvailability.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.professional.deleteMany({});

    // Verificar si el esquema tiene las nuevas tablas y eliminarlas si es necesario
    try {
      // @ts-ignore - Service puede no estar definido en versiones antiguas
      await prisma.service.deleteMany({});
      // @ts-ignore - ServiceCategory puede no estar definido en versiones antiguas
      await prisma.serviceCategory.deleteMany({});
    } catch (error) {
      console.log('Aviso: Las tablas Service o ServiceCategory no existen o no se pueden limpiar', error);
    }

    await prisma.treatment.deleteMany({});
    // No eliminamos usuarios para mantener la seguridad
    
    return true;
  } catch (error) {
    console.error('Error al limpiar tablas:', error);
    throw error;
  }
}

// Función para limpiar los campos id de un objeto antes de enviarlo a Prisma
function cleanDataForCreate(data: any) {
  // Crear una copia del objeto sin el campo id
  const { id, ...cleanedData } = data;
  
  // Lista de campos conocidos para cada modelo para evitar campos desconocidos
  const knownFields: Record<string, string[]> = {
    treatment: ['name', 'description', 'price', 'duration', 'createdAt', 'updatedAt'],
    professional: ['name', 'speciality', 'email', 'phone', 'active', 'color', 'createdAt', 'updatedAt'],
    professionalAvailability: ['professionalId', 'startDate', 'endDate', 'dayOfWeek', 'createdAt', 'updatedAt'],
    client: ['name', 'email', 'phone', 'birthDate', 'address', 'notes', 'createdAt', 'updatedAt'],
    availability: ['name', 'startDate', 'endDate', 'dayOfWeek', 'createdAt', 'updatedAt'],
    paymentMethod: ['name', 'description', 'createdAt', 'updatedAt'],
    product: ['name', 'description', 'price', 'stock', 'createdAt', 'updatedAt'],
    serviceCategory: ['name', 'description', 'createdAt', 'updatedAt'],
    service: ['name', 'description', 'price', 'duration', 'categoryId', 'createdAt', 'updatedAt'],
    appointment: ['date', 'startTime', 'endTime', 'status', 'notes', 'clientId', 'professionalId', 'treatmentId', 'serviceId', 'createdAt', 'updatedAt'],
    sale: ['date', 'total', 'status', 'notes', 'clientId', 'createdAt', 'updatedAt'],
    saleItem: ['quantity', 'price', 'saleId', 'productId', 'createdAt', 'updatedAt'],
    payment: ['amount', 'paymentDate', 'paymentMethodId', 'saleId', 'appointmentId', 'createdAt', 'updatedAt'],
    expense: ['description', 'amount', 'date', 'category', 'paymentMethod', 'notes', 'createdAt', 'updatedAt']
  };
  
  // Detectar el tipo de entidad según los campos (esto es una estimación simplificada)
  let entityType = '';
  if ('price' in cleanedData && 'duration' in cleanedData && !('stock' in cleanedData)) {
    if ('categoryId' in cleanedData) {
      entityType = 'service';
    } else {
      entityType = 'treatment';
    }
  } else if ('speciality' in cleanedData) {
    entityType = 'professional';
  } else if ('birthDate' in cleanedData) {
    entityType = 'client';
  } else if ('stock' in cleanedData) {
    entityType = 'product';
  } else if ('dayOfWeek' in cleanedData && 'professionalId' in cleanedData) {
    entityType = 'professionalAvailability';
  } else if ('dayOfWeek' in cleanedData && !('professionalId' in cleanedData)) {
    entityType = 'availability';
  } else if ('status' in cleanedData && 'clientId' in cleanedData && 'date' in cleanedData) {
    entityType = 'appointment';
  } else if ('total' in cleanedData) {
    entityType = 'sale';
  } else if ('quantity' in cleanedData && 'saleId' in cleanedData) {
    entityType = 'saleItem';
  } else if ('paymentDate' in cleanedData) {
    entityType = 'payment';
  } else if ('amount' in cleanedData && 'category' in cleanedData) {
    entityType = 'expense';
  } else if ('description' in cleanedData && !('price' in cleanedData) && !('amount' in cleanedData)) {
    if ('categoryId' in cleanedData) {
      entityType = 'service';
    } else {
      entityType = 'paymentMethod';
    }
  }
  
  // Si no pudimos detectar el tipo, devolvemos los datos sin el id solamente
  if (!entityType || !knownFields[entityType]) {
    return cleanedData;
  }
  
  // Filtrar campos desconocidos
  const result: Record<string, any> = {};
  
  // Añadir sólo los campos conocidos
  Object.keys(cleanedData).forEach(key => {
    if (knownFields[entityType].includes(key)) {
      result[key] = cleanedData[key];
    }
  });
  
  return result;
}

// Endpoint para restaurar un respaldo desde un archivo subido por el usuario
export async function POST(request: NextRequest) {
  let errors = [];
  let successGroups = [];
  
  try {
    console.log('Iniciando proceso de restauración...');
    
    // Obtener el archivo enviado
    const formData = await request.formData();
    const file = formData.get('backupFile') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó un archivo de respaldo' },
        { status: 400 }
      );
    }
    
    // Verificar que sea un archivo JSON
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser de tipo JSON' },
        { status: 400 }
      );
    }
    
    // Leer el contenido del archivo
    console.log(`Leyendo archivo de respaldo: ${file.name}`);
    const fileContent = await file.text();
    const backupData = JSON.parse(fileContent);
    console.log('Archivo de respaldo leído correctamente');
    
    // Primero limpiamos todas las tablas fuera de la transacción
    console.log('Limpiando tablas existentes...');
    await clearAllTables();
    console.log('Tablas existentes limpiadas correctamente');
    
    // Restaurar datos por grupos para reducir el tamaño de la transacción
    
    // Grupo 1: Tratamientos y Categorías de Servicios
    if (backupData.treatments?.length || backupData.serviceCategories?.length) {
      try {
        console.log('Restaurando Grupo 1: Tratamientos y Categorías de Servicios...');
        await prisma.$transaction(async (tx) => {
          // Restaurar tratamientos
          if (backupData.treatments?.length) {
            for (const treatment of backupData.treatments) {
              try {
                await tx.treatment.create({ data: {
                  ...cleanDataForCreate(treatment),
                  createdAt: new Date(treatment.createdAt),
                  updatedAt: new Date(treatment.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar tratamiento: ${JSON.stringify(treatment)}`, error);
                throw new Error(`Error al restaurar tratamiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
          
          // Restaurar las categorías de servicios si existen en el backup
          if (backupData.serviceCategories?.length) {
            try {
              for (const category of backupData.serviceCategories) {
                // @ts-ignore - ServiceCategory puede no estar definido en versiones antiguas
                await tx.serviceCategory.create({ data: {
                  ...cleanDataForCreate(category),
                  createdAt: new Date(category.createdAt),
                  updatedAt: new Date(category.updatedAt)
                }});
              }
            } catch (error) {
              console.log('Aviso: No se pudieron restaurar las categorías de servicios', error);
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 1 restaurado correctamente');
        successGroups.push('Tratamientos y Categorías de Servicios');
      } catch (error) {
        console.error('Error al restaurar Grupo 1:', error);
        errors.push(`Error en Grupo 1: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Grupo 2: Profesionales y Disponibilidad
    if (backupData.professionals?.length || backupData.professionalAvailability?.length) {
      try {
        console.log('Restaurando Grupo 2: Profesionales y Disponibilidad...');
        await prisma.$transaction(async (tx) => {
          // Restaurar profesionales
          if (backupData.professionals?.length) {
            for (const professional of backupData.professionals) {
              try {
                await tx.professional.create({ data: {
                  ...cleanDataForCreate(professional),
                  createdAt: new Date(professional.createdAt),
                  updatedAt: new Date(professional.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar profesional: ${JSON.stringify(professional)}`, error);
                throw new Error(`Error al restaurar profesional: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
          
          // Restaurar disponibilidad de profesionales
          if (backupData.professionalAvailability?.length) {
            for (const availability of backupData.professionalAvailability) {
              try {
                await tx.professionalAvailability.create({ data: {
                  ...cleanDataForCreate(availability),
                  startDate: new Date(availability.startDate),
                  endDate: new Date(availability.endDate),
                  createdAt: new Date(availability.createdAt),
                  updatedAt: new Date(availability.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar disponibilidad de profesional: ${JSON.stringify(availability)}`, error);
                throw new Error(`Error al restaurar disponibilidad de profesional: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 2 restaurado correctamente');
        successGroups.push('Profesionales y Disponibilidad');
      } catch (error) {
        console.error('Error al restaurar Grupo 2:', error);
        errors.push(`Error en Grupo 2: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Grupo 3: Clientes y Servicios
    if (backupData.clients?.length || backupData.services?.length) {
      try {
        console.log('Restaurando Grupo 3: Clientes y Servicios...');
        await prisma.$transaction(async (tx) => {
          // Restaurar clientes
          if (backupData.clients?.length) {
            for (const client of backupData.clients) {
              try {
                await tx.client.create({ data: {
                  ...cleanDataForCreate(client),
                  createdAt: new Date(client.createdAt),
                  updatedAt: new Date(client.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar cliente: ${JSON.stringify(client)}`, error);
                throw new Error(`Error al restaurar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
          
          // Restaurar los servicios si existen en el backup
          if (backupData.services?.length) {
            try {
              for (const service of backupData.services) {
                try {
                  // @ts-ignore - Service puede no estar definido en versiones antiguas
                  await tx.service.create({ data: {
                    ...cleanDataForCreate(service),
                    createdAt: new Date(service.createdAt),
                    updatedAt: new Date(service.updatedAt)
                  }});
                } catch (error) {
                  console.error(`Error al restaurar servicio: ${JSON.stringify(service)}`, error);
                  throw new Error(`Error al restaurar servicio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                }
              }
            } catch (error) {
              console.log('Aviso: No se pudieron restaurar los servicios', error);
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 3 restaurado correctamente');
        successGroups.push('Clientes y Servicios');
      } catch (error) {
        console.error('Error al restaurar Grupo 3:', error);
        errors.push(`Error en Grupo 3: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Grupo 4: Disponibilidad y Métodos de Pago
    if (backupData.availability?.length || backupData.paymentMethods?.length) {
      try {
        console.log('Restaurando Grupo 4: Disponibilidad y Métodos de Pago...');
        await prisma.$transaction(async (tx) => {
          // Restaurar disponibilidad general
          if (backupData.availability?.length) {
            for (const availability of backupData.availability) {
              try {
                await tx.availability.create({ data: {
                  ...cleanDataForCreate(availability),
                  startDate: new Date(availability.startDate),
                  endDate: new Date(availability.endDate),
                  createdAt: new Date(availability.createdAt),
                  updatedAt: new Date(availability.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar disponibilidad: ${JSON.stringify(availability)}`, error);
                throw new Error(`Error al restaurar disponibilidad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
          
          // Restaurar métodos de pago
          if (backupData.paymentMethods?.length) {
            for (const method of backupData.paymentMethods) {
              try {
                await tx.paymentMethod.create({ data: {
                  ...cleanDataForCreate(method),
                  createdAt: new Date(method.createdAt),
                  updatedAt: new Date(method.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar método de pago: ${JSON.stringify(method)}`, error);
                throw new Error(`Error al restaurar método de pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 4 restaurado correctamente');
        successGroups.push('Disponibilidad y Métodos de Pago');
      } catch (error) {
        console.error('Error al restaurar Grupo 4:', error);
        errors.push(`Error en Grupo 4: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Grupo 5: Productos
    if (backupData.products?.length) {
      try {
        console.log('Restaurando Grupo 5: Productos...');
        await prisma.$transaction(async (tx) => {
          for (const product of backupData.products) {
            try {
              await tx.product.create({ data: {
                ...cleanDataForCreate(product),
                createdAt: new Date(product.createdAt),
                updatedAt: new Date(product.updatedAt)
              }});
            } catch (error) {
              console.error(`Error al restaurar producto: ${JSON.stringify(product)}`, error);
              throw new Error(`Error al restaurar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 5 restaurado correctamente');
        successGroups.push('Productos');
      } catch (error) {
        console.error('Error al restaurar Grupo 5:', error);
        errors.push(`Error en Grupo 5: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Grupo 6: Citas
    if (backupData.appointments?.length) {
      try {
        console.log('Restaurando Grupo 6: Citas...');
        await prisma.$transaction(async (tx) => {
          for (const appointment of backupData.appointments) {
            try {
              const appointmentData = {
                ...cleanDataForCreate(appointment),
                date: new Date(appointment.date),
                createdAt: new Date(appointment.createdAt),
                updatedAt: new Date(appointment.updatedAt)
              };
              
              // Añadir campos opcionales solo si existen
              if (appointment.startTime) {
                appointmentData.startTime = new Date(appointment.startTime);
              }
              if (appointment.endTime) {
                appointmentData.endTime = new Date(appointment.endTime);
              }
              
              await tx.appointment.create({ data: appointmentData });
            } catch (error) {
              console.error(`Error al restaurar cita: ${JSON.stringify(appointment)}`, error);
              throw new Error(`Error al restaurar cita: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 6 restaurado correctamente');
        successGroups.push('Citas');
      } catch (error) {
        console.error('Error al restaurar Grupo 6:', error);
        errors.push(`Error en Grupo 6: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Grupo 7: Ventas y Artículos de Venta
    if (backupData.sales?.length || backupData.saleItems?.length) {
      try {
        console.log('Restaurando Grupo 7: Ventas y Artículos de Venta...');
        await prisma.$transaction(async (tx) => {
          // Restaurar ventas
          if (backupData.sales?.length) {
            for (const sale of backupData.sales) {
              try {
                await tx.sale.create({ data: {
                  ...cleanDataForCreate(sale),
                  date: new Date(sale.date),
                  createdAt: new Date(sale.createdAt),
                  updatedAt: new Date(sale.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar venta: ${JSON.stringify(sale)}`, error);
                throw new Error(`Error al restaurar venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
          
          // Restaurar artículos de venta
          if (backupData.saleItems?.length) {
            for (const item of backupData.saleItems) {
              try {
                await tx.saleItem.create({ data: {
                  ...cleanDataForCreate(item),
                  createdAt: new Date(item.createdAt),
                  updatedAt: new Date(item.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar artículo de venta: ${JSON.stringify(item)}`, error);
                throw new Error(`Error al restaurar artículo de venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 7 restaurado correctamente');
        successGroups.push('Ventas y Artículos de Venta');
      } catch (error) {
        console.error('Error al restaurar Grupo 7:', error);
        errors.push(`Error en Grupo 7: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Grupo 8: Pagos y Gastos
    if (backupData.payments?.length || backupData.expenses?.length) {
      try {
        console.log('Restaurando Grupo 8: Pagos y Gastos...');
        await prisma.$transaction(async (tx) => {
          // Restaurar pagos
          if (backupData.payments?.length) {
            for (const payment of backupData.payments) {
              try {
                await tx.payment.create({ data: {
                  ...cleanDataForCreate(payment),
                  createdAt: new Date(payment.createdAt),
                  updatedAt: new Date(payment.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar pago: ${JSON.stringify(payment)}`, error);
                throw new Error(`Error al restaurar pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
          
          // Restaurar gastos
          if (backupData.expenses?.length) {
            for (const expense of backupData.expenses) {
              try {
                await tx.expense.create({ data: {
                  ...cleanDataForCreate(expense),
                  date: new Date(expense.date),
                  createdAt: new Date(expense.createdAt),
                  updatedAt: new Date(expense.updatedAt)
                }});
              } catch (error) {
                console.error(`Error al restaurar gasto: ${JSON.stringify(expense)}`, error);
                throw new Error(`Error al restaurar gasto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }
          }
        }, {
          timeout: 30000,
          maxWait: 5000,
        });
        console.log('Grupo 8 restaurado correctamente');
        successGroups.push('Pagos y Gastos');
      } catch (error) {
        console.error('Error al restaurar Grupo 8:', error);
        errors.push(`Error en Grupo 8: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        // Continuamos con el siguiente grupo
      }
    }
    
    // Verificar resultado de la restauración
    if (errors.length > 0) {
      console.log('La restauración se completó con errores:', errors);
      
      let errorMessage = `La restauración se completó parcialmente con ${errors.length} errores. `;
      if (successGroups.length > 0) {
        errorMessage += `Los siguientes grupos se restauraron correctamente: ${successGroups.join(', ')}. `;
      }
      errorMessage += `Errores: ${errors.map((e, i) => `(${i + 1}) ${e}`).join(' ')}`;
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          partialSuccess: successGroups.length > 0,
          successGroups,
          errors
        },
        { status: 500 }
      );
    }
    
    console.log('Restauración completada correctamente');
    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos restaurada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al restaurar la base de datos:', error);
    let errorMessage = 'Error al restaurar la base de datos';
    
    // Proporcionar un mensaje de error más descriptivo
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Mensajes específicos para errores comunes
      if (errorMessage.includes('Transaction already closed') || errorMessage.includes('timeout')) {
        errorMessage = 'La operación de restauración tardó demasiado tiempo. La base de datos puede ser demasiado grande para restaurar en una sola transacción. Intente con un respaldo más pequeño o contacte al administrador.';
      } else if (errorMessage.includes('Unknown argument') || errorMessage.includes('Invalid `prisma')) {
        errorMessage = `Error de validación al restaurar los datos: ${errorMessage}. El esquema de la base de datos puede haber cambiado desde que se creó el respaldo. Por favor contacte al administrador.`;
      } else if (errorMessage.includes('Unexpected token') || errorMessage.includes('JSON')) {
        errorMessage = 'El archivo de respaldo no es un JSON válido. Por favor seleccione un archivo de respaldo correcto.';
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        partialSuccess: successGroups.length > 0,
        successGroups,
        errors: [...errors, errorMessage]
      },
      { status: 500 }
    );
  }
} 