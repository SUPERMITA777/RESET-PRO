import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, Printer, Share2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateArgentina } from "@/lib/date-utils"
import { toast } from "@/components/ui/use-toast"

// Datos de ejemplo para los gráficos
const salesData = [
  { name: "Ene", ventas: 4000 },
  { name: "Feb", ventas: 3000 },
  { name: "Mar", ventas: 2000 },
  { name: "Abr", ventas: 2780 },
  { name: "May", ventas: 1890 },
  { name: "Jun", ventas: 2390 },
  { name: "Jul", ventas: 3490 },
]

const treatmentsData = [
  { name: "Masaje", value: 400 },
  { name: "Facial", value: 300 },
  { name: "Depilación", value: 300 },
  { name: "Manicura", value: 200 },
  { name: "Pedicura", value: 100 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// Datos de ejemplo para el reporte diario
interface DailyAppointment {
  id: number;
  client: string;
  treatment: string;
  professional: string;
  time: string;
  amount: number;
  paymentMethod: string;
  deposit: number;
  totalPaid: number;
  commissionPercentage?: number;
  commissionAmount?: number;
}

interface PaymentSummary {
  method: string;
  total: number;
}

interface ExpenseSummary {
  description: string;
  amount: number;
  paymentMethod: string;
}

// Datos de ejemplo para el reporte diario
const mockDailyAppointments: DailyAppointment[] = [
  { id: 1, client: "Ana García", treatment: "Masaje Relajante", professional: "María López", time: "09:00", amount: 3500, paymentMethod: "Efectivo", deposit: 0, totalPaid: 0 },
  { id: 2, client: "Juan Pérez", treatment: "Corte de Pelo", professional: "Carlos Rodríguez", time: "10:30", amount: 1200, paymentMethod: "Tarjeta de Crédito", deposit: 0, totalPaid: 0 },
  { id: 3, client: "Laura Martínez", treatment: "Manicura", professional: "Sandra Gómez", time: "11:45", amount: 800, paymentMethod: "Transferencia", deposit: 0, totalPaid: 0 },
  { id: 4, client: "Roberto Sánchez", treatment: "Facial", professional: "María López", time: "14:00", amount: 2500, paymentMethod: "Efectivo", deposit: 0, totalPaid: 0 },
  { id: 5, client: "Claudia Torres", treatment: "Depilación", professional: "Sandra Gómez", time: "16:30", amount: 1800, paymentMethod: "Tarjeta de Débito", deposit: 0, totalPaid: 0 },
];

const mockPaymentSummary: PaymentSummary[] = [
  { method: "Efectivo", total: 6000 },
  { method: "Tarjeta de Crédito", total: 1200 },
  { method: "Tarjeta de Débito", total: 1800 },
  { method: "Transferencia", total: 800 },
];

const mockExpenseSummary: ExpenseSummary[] = [
  { description: "Compra de productos de limpieza", amount: 1500, paymentMethod: "Efectivo" },
  { description: "Pago de servicios", amount: 2800, paymentMethod: "Transferencia" },
];

export default function ReportsTab() {
  const [reportType, setReportType] = useState("daily")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [dailyAppointments, setDailyAppointments] = useState<DailyAppointment[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([])
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary[]>([])

  // Datos para el gráfico de métodos de pago
  const paymentMethodsData = paymentSummary.map(item => ({
    name: item.method,
    value: item.total
  }));

  const fetchDailyReport = async () => {
    try {
      // Formatear la fecha seleccionada como YYYY-MM-DD
      const formattedDate = selectedDate ? 
        `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : 
        new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/reports/daily?date=${formattedDate}`);
      if (!response.ok) {
        throw new Error(`Error al obtener el reporte: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  };

  useEffect(() => {
    if (reportType === "daily" && selectedDate) {
      fetchDailyReport();
    }
  }, [reportType, selectedDate]);

  // Calcular totales
  const totalAppointments = dailyAppointments.length;
  const totalRevenue = dailyAppointments.reduce((sum, app) => sum + app.amount, 0);
  const totalExpenses = expenseSummary.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Handler para cambio de fecha en el componente Calendar
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const formattedDate = newDate.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
    }
  };

  // Handler para imprimir el reporte
  const handlePrintReport = () => {
    window.print();
  };

  // Handler para exportar el reporte
  const handleExportReport = async () => {
    try {
      // Verificar si html2canvas está disponible
      const html2canvas = await import('html2canvas').then(module => module.default);
      
      // Obtener el elemento que contiene el reporte
      const reportElement = document.getElementById('daily-report-content');
      
      if (!reportElement) {
        throw new Error("No se pudo encontrar el contenido del reporte");
      }
      
      // Crear una copia del elemento para manipularlo sin afectar la UI
      const clonedElement = reportElement.cloneNode(true) as HTMLElement;
      clonedElement.style.padding = '20px';
      clonedElement.style.backgroundColor = 'white';
      
      // Añadir temporalmente al DOM para capturarlo
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      document.body.appendChild(clonedElement);
      
      // Capturar la imagen
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // Mayor calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Eliminar el elemento clonado
      document.body.removeChild(clonedElement);
      
      // Convertir a imagen JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Crear un enlace para descargar la imagen
      const link = document.createElement('a');
      link.download = `reporte-diario-${selectedDate}.jpg`;
      link.href = dataUrl;
      
      // Guardar la imagen localmente
      link.click();
      
      // Crear mensaje para WhatsApp
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const reportText = `📊 *Reporte Diario: ${date}*\n\nAdjunto imagen del reporte.`;
      
      // Abrir WhatsApp con el mensaje (sin la imagen, ya que WhatsApp Web no permite adjuntar archivos directamente)
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
      window.open(whatsappUrl, '_blank');
      
      // Informar al usuario
      alert("La imagen se ha guardado. Puedes adjuntarla manualmente al chat de WhatsApp que se abrirá a continuación.");
      
    } catch (error) {
      console.error("Error al exportar el reporte:", error);
      
      // Fallback en caso de error
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const totalRevenue = dailyAppointments.reduce((sum, app) => sum + app.amount, 0);
      
      // Crear un texto con el resumen del reporte
      const reportText = `
📊 *Reporte Diario: ${date}*

📋 *Resumen:*
- Turnos: ${dailyAppointments.length}
- Ingresos: $${totalRevenue.toLocaleString("es-AR")}
- Gastos: $${totalExpenses.toLocaleString("es-AR")}
- Balance: $${netIncome.toLocaleString("es-AR")}

💰 *Métodos de Pago:*
${paymentSummary.map(p => `- ${p.method}: $${p.total.toLocaleString("es-AR")}`).join('\n')}

Para ver el reporte completo, accede a la aplicación.
      `;
      
      // Codificar el texto para WhatsApp
      const encodedText = encodeURIComponent(reportText);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      
      // Abrir WhatsApp en una nueva pestaña
      window.open(whatsappUrl, '_blank');
    }
  };

  // Función para asegurar que todas las pestañas estén inicializadas
  const initializeAllTabs = async () => {
    // Lista de valores de pestañas que necesitamos inicializar
    const tabValues = ["appointments", "payment-methods", "expenses", "commissions"];
    
    // Guardar el valor de la pestaña actual
    const currentTabValue = document.querySelector('[role="tab"][data-state="active"]')?.getAttribute('value') || tabValues[0];
    
    // Activar cada pestaña brevemente para asegurar que su contenido se renderice
    for (const tabValue of tabValues) {
      const tabElement = document.querySelector(`[role="tab"][value="${tabValue}"]`) as HTMLElement;
      if (tabElement) {
        tabElement.click();
        // Esperar un momento para que se renderice el contenido
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Volver a la pestaña original
    const originalTab = document.querySelector(`[role="tab"][value="${currentTabValue}"]`) as HTMLElement;
    if (originalTab) {
      originalTab.click();
      // Esperar un momento para que se renderice el contenido
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  // Handler para exportar el reporte completo (incluye todas las pestañas)
  const handleExportFullReport = async () => {
    try {
      // Verificar si html2canvas está disponible
      const html2canvas = await import('html2canvas').then(module => module.default);
      
      // Mostrar mensaje de carga
      toast({
        title: "Generando reporte",
        description: "Esto puede tomar unos segundos...",
      });
      
      // Inicializar todas las pestañas antes de capturar
      await initializeAllTabs();
      
      // Obtener el elemento que contiene el reporte
      const reportElement = document.getElementById('daily-report-content');
      
      if (!reportElement) {
        throw new Error("No se pudo encontrar el contenido del reporte");
      }
      
      // Crear un nuevo elemento para contener todo el reporte
      const fullReportContainer = document.createElement('div');
      fullReportContainer.style.backgroundColor = 'white';
      fullReportContainer.style.padding = '30px';
      fullReportContainer.style.width = '1200px';
      fullReportContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Añadir un título con la fecha
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">Reporte Diario</h1>
          <h2 style="font-size: 20px; color: #666;">${selectedDate}</h2>
        </div>
      `;
      fullReportContainer.appendChild(titleDiv);
      
      // Clonar las tarjetas de resumen
      const summaryCards = reportElement.querySelector('.grid');
      if (summaryCards) {
        const summaryClone = summaryCards.cloneNode(true) as HTMLElement;
        fullReportContainer.appendChild(summaryClone);
      }
      
      // Añadir separador
      fullReportContainer.appendChild(createSeparator("Turnos"));
      
      // Obtener y clonar la tabla de turnos
      const appointmentsTable = document.querySelector('[data-value="appointments"] table');
      if (appointmentsTable) {
        const tableClone = appointmentsTable.cloneNode(true) as HTMLElement;
        tableClone.style.width = '100%';
        tableClone.style.borderCollapse = 'collapse';
        tableClone.style.marginBottom = '30px';
        
        // Aplicar estilos a las celdas de la tabla
        const cells = tableClone.querySelectorAll('th, td');
        cells.forEach(cell => {
          (cell as HTMLElement).style.border = '1px solid #ddd';
          (cell as HTMLElement).style.padding = '8px';
          (cell as HTMLElement).style.textAlign = 'left';
        });
        
        // Aplicar estilos a los encabezados
        const headers = tableClone.querySelectorAll('th');
        headers.forEach(header => {
          (header as HTMLElement).style.backgroundColor = '#f2f2f2';
          (header as HTMLElement).style.fontWeight = 'bold';
        });
        
        fullReportContainer.appendChild(tableClone);
      }
      
      // Añadir separador
      fullReportContainer.appendChild(createSeparator("Métodos de Pago"));
      
      // Obtener y clonar la tabla de métodos de pago
      const paymentTable = document.querySelector('[data-value="payment-methods"] table');
      if (paymentTable) {
        const tableClone = paymentTable.cloneNode(true) as HTMLElement;
        tableClone.style.width = '100%';
        tableClone.style.borderCollapse = 'collapse';
        tableClone.style.marginBottom = '30px';
        
        // Aplicar estilos a las celdas
        const cells = tableClone.querySelectorAll('th, td');
        cells.forEach(cell => {
          (cell as HTMLElement).style.border = '1px solid #ddd';
          (cell as HTMLElement).style.padding = '8px';
          (cell as HTMLElement).style.textAlign = 'left';
        });
        
        // Aplicar estilos a los encabezados
        const headers = tableClone.querySelectorAll('th');
        headers.forEach(header => {
          (header as HTMLElement).style.backgroundColor = '#f2f2f2';
          (header as HTMLElement).style.fontWeight = 'bold';
        });
        
        fullReportContainer.appendChild(tableClone);
      }
      
      // Añadir separador
      fullReportContainer.appendChild(createSeparator("Gastos"));
      
      // Obtener y clonar la tabla de gastos
      const expensesTable = document.querySelector('[data-value="expenses"] table');
      if (expensesTable) {
        const tableClone = expensesTable.cloneNode(true) as HTMLElement;
        tableClone.style.width = '100%';
        tableClone.style.borderCollapse = 'collapse';
        tableClone.style.marginBottom = '30px';
        
        // Aplicar estilos a las celdas
        const cells = tableClone.querySelectorAll('th, td');
        cells.forEach(cell => {
          (cell as HTMLElement).style.border = '1px solid #ddd';
          (cell as HTMLElement).style.padding = '8px';
          (cell as HTMLElement).style.textAlign = 'left';
        });
        
        // Aplicar estilos a los encabezados
        const headers = tableClone.querySelectorAll('th');
        headers.forEach(header => {
          (header as HTMLElement).style.backgroundColor = '#f2f2f2';
          (header as HTMLElement).style.fontWeight = 'bold';
        });
        
        fullReportContainer.appendChild(tableClone);
      }
      
      // Añadir separador
      fullReportContainer.appendChild(createSeparator("Comisiones"));
      
      // Obtener y clonar la tabla de comisiones
      const commissionsTable = document.querySelector('[data-value="commissions"] table');
      if (commissionsTable) {
        const tableClone = commissionsTable.cloneNode(true) as HTMLElement;
        tableClone.style.width = '100%';
        tableClone.style.borderCollapse = 'collapse';
        tableClone.style.marginBottom = '30px';
        
        // Aplicar estilos a las celdas
        const cells = tableClone.querySelectorAll('th, td');
        cells.forEach(cell => {
          (cell as HTMLElement).style.border = '1px solid #ddd';
          (cell as HTMLElement).style.padding = '8px';
          (cell as HTMLElement).style.textAlign = 'left';
        });
        
        // Aplicar estilos a los encabezados
        const headers = tableClone.querySelectorAll('th');
        headers.forEach(header => {
          (header as HTMLElement).style.backgroundColor = '#f2f2f2';
          (header as HTMLElement).style.fontWeight = 'bold';
        });
        
        fullReportContainer.appendChild(tableClone);
      }
      
      // Añadir pie de página
      const footerDiv = document.createElement('div');
      footerDiv.innerHTML = `
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          <p>RESET-SOFT - Sistema de Gestión de Centro de Estética</p>
        </div>
      `;
      fullReportContainer.appendChild(footerDiv);
      
      // Añadir temporalmente al DOM para capturarlo
      fullReportContainer.style.position = 'absolute';
      fullReportContainer.style.left = '-9999px';
      document.body.appendChild(fullReportContainer);
      
      // Capturar la imagen
      const canvas = await html2canvas(fullReportContainer, {
        scale: 2, // Mayor calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        windowHeight: 3000 // Altura suficiente para todo el contenido
      });
      
      // Eliminar el elemento temporal
      document.body.removeChild(fullReportContainer);
      
      // Convertir a imagen JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Crear un enlace para descargar la imagen
      const link = document.createElement('a');
      link.download = `reporte-completo-${selectedDate}.jpg`;
      link.href = dataUrl;
      
      // Guardar la imagen localmente
      link.click();
      
      // Crear mensaje para WhatsApp
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const reportText = `📊 *Reporte Diario Completo: ${date}*\n\nAdjunto imagen del reporte completo.`;
      
      // Abrir WhatsApp con el mensaje
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
      window.open(whatsappUrl, '_blank');
      
      // Informar al usuario
      toast({
        title: "Reporte generado",
        description: "La imagen se ha guardado. Puedes adjuntarla manualmente al chat de WhatsApp que se abrirá a continuación.",
      });
      
    } catch (error) {
      console.error("Error al exportar el reporte completo:", error);
      toast({
        title: "Error",
        description: "No se pudo generar la imagen del reporte. Intente nuevamente.",
        variant: "destructive",
      });
      
      // Fallback en caso de error - enviar solo texto
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const reportText = `
📊 *Reporte Diario Completo: ${date}*

📋 *Resumen:*
- Turnos: ${dailyAppointments.length}
- Ingresos: $${totalRevenue.toLocaleString("es-AR")}
- Gastos: $${totalExpenses.toLocaleString("es-AR")}
- Balance: $${netIncome.toLocaleString("es-AR")}

💰 *Métodos de Pago:*
${paymentSummary.map(p => `- ${p.method}: $${p.total.toLocaleString("es-AR")}`).join('\n')}

Para ver el reporte completo, accede a la aplicación.
      `;
      
      // Codificar el texto para WhatsApp
      const encodedText = encodeURIComponent(reportText);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      
      // Abrir WhatsApp en una nueva pestaña
      window.open(whatsappUrl, '_blank');
    }
  };
  
  // Función auxiliar para crear separadores con título
  const createSeparator = (title: string) => {
    const separator = document.createElement('div');
    separator.innerHTML = `
      <div style="margin: 30px 0 15px 0; border-bottom: 2px solid #eaeaea;">
        <h3 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px;">${title}</h3>
      </div>
    `;
    return separator;
  };

  const dailySummary = dailyAppointments.map(appointment => ({
    clientName: appointment.client,
    professional: appointment.professional,
    subTreatment: appointment.treatment,
    price: appointment.amount,
    deposit: appointment.deposit,
    totalPaid: appointment.totalPaid,
    paymentMethod: appointment.paymentMethod,
  }));

  return (
    <div className="space-y-6" id="report-content">
      <h2 className="text-2xl font-bold">Reportes</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Reporte Diario</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="treatments">Tratamientos</SelectItem>
                  <SelectItem value="clients">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "daily" && (
              <div className="space-y-2">
                <Label>Fecha</Label>
                <div className="flex flex-col gap-2">
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <Button onClick={fetchDailyReport} disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Generar Reporte"}
                  </Button>
                </div>
              </div>
            )}

            {reportType !== "daily" && (
              <>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="border rounded-md"
                  />
                </div>
                <Button className="w-full">Generar Reporte</Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {reportType === "daily" ? "Reporte Diario" : 
               reportType === "sales" ? "Reporte de Ventas" : 
               reportType === "treatments" ? "Reporte de Tratamientos" : "Reporte de Clientes"}
            </CardTitle>
            {reportType === "daily" && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrintReport}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleExportFullReport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir por WhatsApp
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {reportType === "daily" ? (
              <div className="space-y-6" id="daily-report-content">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Turnos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{totalAppointments}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString("es-AR")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Gastos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString("es-AR")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${netIncome.toLocaleString("es-AR")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="appointments" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="appointments">Turnos</TabsTrigger>
                    <TabsTrigger value="payment-methods">Métodos de Pago</TabsTrigger>
                    <TabsTrigger value="expenses">Gastos</TabsTrigger>
                    <TabsTrigger value="commissions">Comisiones</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="appointments" className="pt-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Profesional</TableHead>
                            <TableHead>Sub-Tratamiento</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Seña</TableHead>
                            <TableHead>Subtotal Abonado</TableHead>
                            <TableHead>Medio de Pago</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>{appointment.client}</TableCell>
                              <TableCell>{appointment.professional}</TableCell>
                              <TableCell>{appointment.treatment}</TableCell>
                              <TableCell>${appointment.amount.toLocaleString("es-AR")}</TableCell>
                              <TableCell>${appointment.deposit.toLocaleString("es-AR")}</TableCell>
                              <TableCell>${appointment.totalPaid.toLocaleString("es-AR")}</TableCell>
                              <TableCell>{appointment.paymentMethod}</TableCell>
                            </TableRow>
                          ))}
                          {dailyAppointments.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                No hay turnos registrados para esta fecha
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payment-methods" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Método de Pago</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paymentSummary.map((payment, index) => (
                              <TableRow key={index}>
                                <TableCell>{payment.method}</TableCell>
                                <TableCell className="text-right">${payment.total.toLocaleString("es-AR")}</TableCell>
                              </TableRow>
                            ))}
                            {paymentSummary.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                                  No hay datos de métodos de pago para esta fecha
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="h-[300px] flex items-center justify-center">
                        {paymentMethodsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentMethodsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {paymentMethodsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-muted-foreground">No hay datos disponibles</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="expenses" className="pt-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Método de Pago</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenseSummary.map((expense, index) => (
                            <TableRow key={index}>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell>{expense.paymentMethod}</TableCell>
                              <TableCell className="text-right">${expense.amount.toLocaleString("es-AR")}</TableCell>
                            </TableRow>
                          ))}
                          {expenseSummary.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                No hay gastos registrados para esta fecha
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="commissions" className="pt-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Profesional</TableHead>
                            <TableHead>Sub-Tratamiento</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>% Comisión</TableHead>
                            <TableHead className="text-right">Monto Comisión</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyAppointments.map((appointment) => {
                            // Calcular la comisión (en caso de que no venga de la API)
                            const commissionPercentage = appointment.commissionPercentage || 0;
                            const commissionAmount = appointment.commissionAmount || 
                              (appointment.amount * (commissionPercentage / 100));
                            
                            return (
                              <TableRow key={`commission-${appointment.id}`}>
                                <TableCell>{appointment.professional}</TableCell>
                                <TableCell>{appointment.treatment}</TableCell>
                                <TableCell>{appointment.client}</TableCell>
                                <TableCell>${appointment.amount.toLocaleString("es-AR")}</TableCell>
                                <TableCell>{commissionPercentage}%</TableCell>
                                <TableCell className="text-right">${commissionAmount.toLocaleString("es-AR")}</TableCell>
                              </TableRow>
                            );
                          })}
                          {dailyAppointments.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                No hay comisiones registradas para esta fecha
                              </TableCell>
                            </TableRow>
                          )}
                          {dailyAppointments.length > 0 && (
                            <TableRow className="font-bold">
                              <TableCell colSpan={5} className="text-right">Total Comisiones:</TableCell>
                              <TableCell className="text-right">
                                ${dailyAppointments.reduce((sum, app) => {
                                  const commissionPercentage = app.commissionPercentage || 0;
                                  const commissionAmount = app.commissionAmount || 
                                    (app.amount * (commissionPercentage / 100));
                                  return sum + commissionAmount;
                                }, 0).toLocaleString("es-AR")}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Gráfico</TabsTrigger>
                  <TabsTrigger value="table">Tabla</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="pt-4">
                  {reportType === "sales" && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ventas" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {reportType === "treatments" && (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={treatmentsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {treatmentsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {reportType === "clients" && (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">Seleccione filtros para generar el reporte de clientes</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="table" className="pt-4">
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left font-medium">Nombre</th>
                          <th className="p-2 text-left font-medium">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportType === "sales" &&
                          salesData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{item.name}</td>
                              <td className="p-2">${item.ventas}</td>
                            </tr>
                          ))}
                        {reportType === "treatments" &&
                          treatmentsData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{item.name}</td>
                              <td className="p-2">{item.value}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 