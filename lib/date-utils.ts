// Configuración para Argentina (GMT-3)
const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Formatea una fecha en formato argentino (DD/MM/YYYY)
 */
export function formatDateArgentina(date: Date | string): string {
  let year: number, month: number, day: number;
  
  if (typeof date === 'string') {
    // Si es una fecha en formato ISO (YYYY-MM-DD)
    if (date.includes('-') && date.length <= 10) {
      const parts = date.split('-').map(Number);
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      // Si es una fecha completa, usar UTC para evitar problemas de zona horaria
      const d = new Date(date);
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    }
  } else {
    // Si es un objeto Date, usar UTC para evitar problemas de zona horaria
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
  }
  
  // Formatear manualmente en formato DD/MM/YYYY
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/**
 * Formatea una hora en formato argentino (HH:MM)
 */
export function formatTimeArgentina(time: string | Date): string {
  let hours: number, minutes: number;
  
  if (typeof time === 'string') {
    // Si es una hora en formato HH:MM
    if (time.length <= 5) {
      const parts = time.split(':').map(Number);
      hours = parts[0];
      minutes = parts[1];
    } else {
      // Si es una fecha completa, usar UTC para evitar problemas de zona horaria
      const d = new Date(time);
      // Ajustar a GMT-3 (Argentina)
      hours = (d.getUTCHours() - 3 + 24) % 24;
      minutes = d.getUTCMinutes();
    }
  } else {
    // Si es un objeto Date, usar UTC para evitar problemas de zona horaria
    // Ajustar a GMT-3 (Argentina)
    hours = (time.getUTCHours() - 3 + 24) % 24;
    minutes = time.getUTCMinutes();
  }
  
  // Formatear manualmente en formato HH:MM
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convierte una fecha en formato DD/MM/YYYY a formato ISO (YYYY-MM-DD)
 */
export function parseArgentinaDateToISO(dateStr: string): string {
  const parts = dateStr.split('/').map(Number);
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Obtiene la fecha actual en Argentina en formato ISO (YYYY-MM-DD)
 */
export function getCurrentDateArgentina(): string {
  // Obtener la fecha y hora actual en UTC
  const now = new Date();
  
  // Ajustar a GMT-3 (Argentina)
  const utcHours = now.getUTCHours();
  const argentinaHours = (utcHours - 3 + 24) % 24;
  
  // Si en Argentina es antes de las 3 AM, todavía es el día anterior
  const dayOffset = argentinaHours < utcHours ? -1 : 0;
  
  // Crear una nueva fecha UTC y ajustar el día si es necesario
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate() + dayOffset;
  
  // Crear la fecha ajustada
  const argentinaDate = new Date(Date.UTC(year, month, day));
  
  // Formatear en ISO
  return `${argentinaDate.getUTCFullYear()}-${String(argentinaDate.getUTCMonth() + 1).padStart(2, '0')}-${String(argentinaDate.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Obtiene la hora actual en Argentina en formato HH:MM
 */
export function getCurrentTimeArgentina(): string {
  // Obtener la fecha y hora actual en UTC
  const now = new Date();
  
  // Ajustar a GMT-3 (Argentina)
  const hours = (now.getUTCHours() - 3 + 24) % 24;
  const minutes = now.getUTCMinutes();
  
  // Formatear en HH:MM
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Normaliza una fecha en formato ISO (YYYY-MM-DD) para asegurarse de que esté en la zona horaria de Argentina
 */
export function normalizeArgentinaDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Si ya está en formato ISO, extraer los componentes
  const parts = dateStr.split('T')[0].split('-');
  
  // Simplemente devolver la fecha en formato ISO sin manipulación
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

/**
 * Crea un objeto Date ajustado a la zona horaria de Argentina
 */
export function createArgentinaDate(dateStr?: string, timeStr?: string): Date {
  if (!dateStr && !timeStr) {
    // Si no se proporcionan fecha y hora, usar la fecha y hora actual en UTC
    const now = new Date();
    // Ajustar a GMT-3 (Argentina)
    const hours = now.getUTCHours() - 3;
    // Si las horas son negativas, es el día anterior
    const dayOffset = hours < 0 ? -1 : 0;
    // Crear una nueva fecha UTC
    return new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + dayOffset,
      (hours + 24) % 24,
      now.getUTCMinutes()
    ));
  }
  
  if (dateStr && !timeStr) {
    // Si solo se proporciona la fecha, usar las 12:00 (mediodía) para evitar problemas
    const parts = dateStr.split('-').map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  }
  
  if (!dateStr && timeStr) {
    // Si solo se proporciona la hora, usar la fecha actual
    const now = new Date();
    const timeParts = timeStr.split(':').map(Number);
    return new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      timeParts[0],
      timeParts[1]
    ));
  }
  
  // Si se proporcionan ambos, crear la fecha y hora específica
  const dateParts = dateStr!.split('-').map(Number);
  const timeParts = timeStr!.split(':').map(Number);
  
  // Crear la fecha en UTC para evitar ajustes automáticos de zona horaria
  return new Date(Date.UTC(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2],
    timeParts[0],
    timeParts[1]
  ));
}

/**
 * Compara dos fechas teniendo en cuenta solo la parte de la fecha (sin la hora)
 * @returns -1 si date1 < date2, 0 si son iguales, 1 si date1 > date2
 */
export function compareDatesOnly(date1: Date | string, date2: Date | string): number {
  // Normalizar las fechas a strings en formato ISO
  const d1Str = typeof date1 === 'string' ? date1.split('T')[0] : formatDateToISO(date1);
  const d2Str = typeof date2 === 'string' ? date2.split('T')[0] : formatDateToISO(date2);
  
  // Comparar las fechas como strings
  if (d1Str < d2Str) return -1;
  if (d1Str > d2Str) return 1;
  return 0;
}

/**
 * Formatea una fecha a formato ISO (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  // Usar UTC para evitar problemas de zona horaria
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compara dos horas en formato HH:MM
 * @returns -1 si time1 < time2, 0 si son iguales, 1 si time1 > time2
 */
export function compareTimesOnly(time1: string, time2: string): number {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  if (hours1 < hours2) return -1;
  if (hours1 > hours2) return 1;
  if (minutes1 < minutes2) return -1;
  if (minutes1 > minutes2) return 1;
  
  return 0; // Son iguales
}

/**
 * Verifica si una fecha es anterior a la fecha actual en Argentina
 * @returns true si la fecha es anterior a hoy (es una fecha pasada)
 */
export function isDateBeforeToday(dateStr: string): boolean {
  // Obtener la fecha actual en Argentina
  const todayArgentina = getCurrentDateArgentina();
  
  // Normalizar ambas fechas para comparación
  const normalizedDate = normalizeArgentinaDate(dateStr);
  const normalizedToday = normalizeArgentinaDate(todayArgentina);
  
  // Comparar las fechas
  return normalizedDate < normalizedToday;
}

/**
 * Verifica si una fecha y hora son anteriores a la fecha y hora actual en Argentina
 * @returns true si la fecha y hora son anteriores a ahora (es un momento pasado)
 */
export function isDateTimeBeforeNow(dateStr: string, timeStr: string): boolean {
  // Obtener la fecha y hora actual en Argentina
  const todayArgentina = getCurrentDateArgentina();
  const nowArgentina = getCurrentTimeArgentina();
  
  // Normalizar las fechas para comparación
  const normalizedDate = normalizeArgentinaDate(dateStr);
  const normalizedToday = normalizeArgentinaDate(todayArgentina);
  
  // Primero comparar las fechas
  if (normalizedDate < normalizedToday) return true;
  if (normalizedDate > normalizedToday) return false;
  
  // Si la fecha es la misma, comparar las horas
  return timeStr < nowArgentina;
} 