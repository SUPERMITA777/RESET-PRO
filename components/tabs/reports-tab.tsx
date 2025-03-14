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

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// Interfaces para los datos del reporte
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

interface ReportSummary {
  totalAppointments: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

interface DailyReportData {
  date: string;
  appointments: DailyAppointment[];
  paymentSummary: PaymentSummary[];
  expenseSummary: ExpenseSummary[];
  summary: ReportSummary;
}

export default function ReportsTab() {
  const [reportType, setReportType] = useState("daily")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [dailyAppointments, setDailyAppointments] = useState<DailyAppointment[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([])
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary[]>([])
  const [reportSummary, setReportSummary] = useState<ReportSummary>({
    totalAppointments: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0
  })

  // Datos para el gráfico de métodos de pago
  const paymentMethodsData = paymentSummary.map(item => ({
    name: item.method,
    value: item.total
  }));

  const fetchDailyReport = async () => {
    try {
      setIsLoading(true);
      
      // Formatear la fecha seleccionada como YYYY-MM-DD
      const formattedDate = selectedDate;
      
      const response = await fetch(`/api/reports/daily?date=${formattedDate}`);
      if (!response.ok) {
        throw new Error(`Error al obtener el reporte: ${response.statusText}`);
      }
      
      const data: DailyReportData = await response.json();
      
      // Actualizar el estado con los datos recibidos
      setDailyAppointments(data.appointments);
      setPaymentSummary(data.paymentSummary);
      setExpenseSummary(data.expenseSummary);
      setReportSummary(data.summary);
      
      return data;
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte diario",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === "daily" && selectedDate) {
      fetchDailyReport();
    }
  }, [reportType, selectedDate]);

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
      
      // Crear un texto con el resumen del reporte
      const reportText = `
📊 *Reporte Diario: ${date}*

📋 *Resumen:*
- Turnos: ${reportSummary?.totalAppointments || 0}
- Ingresos: $${(reportSummary?.totalRevenue || 0).toLocaleString("es-AR")}
- Gastos: $${(reportSummary?.totalExpenses || 0).toLocaleString("es-AR")}
- Balance: $${(reportSummary?.netIncome || 0).toLocaleString("es-AR")}

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reportes</h2>
        <div className="flex space-x-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de reporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Reporte Diario</SelectItem>
              <SelectItem value="monthly">Reporte Mensual</SelectItem>
              <SelectItem value="custom">Reporte Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reportType === "daily" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Seleccionar Fecha</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  className="mx-auto"
                />
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Opciones de Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="report-date">Fecha del Reporte</Label>
                  <Input
                    id="report-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setDate(e.target.value ? new Date(e.target.value) : undefined);
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button onClick={handlePrintReport} className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Reporte
                  </Button>
                  <Button onClick={handleExportReport} className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir por WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div id="daily-report-content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Turnos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportSummary?.totalAppointments || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos Totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(reportSummary?.totalRevenue || 0).toLocaleString("es-AR")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gastos Totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(reportSummary?.totalExpenses || 0).toLocaleString("es-AR")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingreso Neto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(reportSummary?.netIncome || 0).toLocaleString("es-AR")}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="appointments">
              <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full">
                <TabsTrigger value="appointments">Turnos</TabsTrigger>
                <TabsTrigger value="payment-methods">Métodos de Pago</TabsTrigger>
                <TabsTrigger value="expenses">Gastos</TabsTrigger>
                <TabsTrigger value="commissions">Comisiones</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="space-y-4" data-value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Turnos del Día</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Cargando datos...</div>
                    ) : dailyAppointments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Tratamiento</TableHead>
                            <TableHead>Profesional</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>{appointment.client}</TableCell>
                              <TableCell>{appointment.treatment}</TableCell>
                              <TableCell>{appointment.professional}</TableCell>
                              <TableCell>{appointment.time}</TableCell>
                              <TableCell className="text-right">${appointment.amount.toLocaleString("es-AR")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">No hay turnos para esta fecha</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payment-methods" className="space-y-4" data-value="payment-methods">
                <Card>
                  <CardHeader>
                    <CardTitle>Métodos de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        {isLoading ? (
                          <div className="text-center py-4">Cargando datos...</div>
                        ) : paymentSummary.length > 0 ? (
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
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4">No hay pagos para esta fecha</div>
                        )}
                      </div>
                      
                      <div className="h-[300px]">
                        {paymentMethodsData.length > 0 && (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentMethodsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {paymentMethodsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `$${Number(value).toLocaleString("es-AR")}`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="expenses" className="space-y-4" data-value="expenses">
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos del Día</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Cargando datos...</div>
                    ) : expenseSummary.length > 0 ? (
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
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">No hay gastos para esta fecha</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="commissions" className="space-y-4" data-value="commissions">
                <Card>
                  <CardHeader>
                    <CardTitle>Comisiones por Profesional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      Funcionalidad de comisiones en desarrollo
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {reportType === "monthly" && (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-4">Reporte Mensual</h3>
          <p>Funcionalidad en desarrollo</p>
        </div>
      )}

      {reportType === "custom" && (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-4">Reporte Personalizado</h3>
          <p>Funcionalidad en desarrollo</p>
        </div>
      )}
    </div>
  )
} 