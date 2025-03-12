"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Filter, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface PaymentMethod {
  id: number;
  name: string;
  total: number;
}

interface Expense {
  id: number;
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  paymentMethodName: string;
}

interface Income {
  id: number;
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  paymentMethodName: string;
}

export default function AdminTab() {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("resumen");
  
  // Estados para los filtros de fecha
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Estados para los datos
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, name: "Efectivo", total: 12500 },
    { id: 2, name: "Transferencia", total: 45000 },
    { id: 3, name: "Tarjeta de Crédito", total: 32000 },
    { id: 4, name: "Tarjeta de Débito", total: 15000 },
  ]);
  
  // Estados para gastos
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, date: new Date().toISOString().split('T')[0], amount: 2500, description: "Compra de productos de limpieza", paymentMethodId: 1, paymentMethodName: "Efectivo" },
    { id: 2, date: new Date().toISOString().split('T')[0], amount: 5000, description: "Pago de servicio de Internet", paymentMethodId: 2, paymentMethodName: "Transferencia" },
  ]);
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'paymentMethodName'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: "",
    paymentMethodId: 0
  });
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  
  // Estados para ingresos
  const [incomes, setIncomes] = useState<Income[]>([
    { id: 1, date: new Date().toISOString().split('T')[0], amount: 10000, description: "Ingreso de caja chica", paymentMethodId: 1, paymentMethodName: "Efectivo" },
    { id: 2, date: new Date().toISOString().split('T')[0], amount: 20000, description: "Transferencia de propietario", paymentMethodId: 2, paymentMethodName: "Transferencia" },
  ]);
  const [newIncome, setNewIncome] = useState<Omit<Income, 'id' | 'paymentMethodName'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: "",
    paymentMethodId: 0
  });
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState<Income | null>(null);
  
  // Estados para retiros
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("");
  const [withdrawalPerson, setWithdrawalPerson] = useState("");

  useEffect(() => {
    // Aquí iría la lógica para cargar los datos desde la API
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    // Simulación de carga de datos (en una implementación real, aquí se llamaría a la API)
    console.log(`Fetching data from ${startDate} to ${endDate}`);
    
    try {
      // Simulación de carga de métodos de pago
      // En una implementación real, aquí se llamaría a la API
      
      // Simulación de carga de gastos
      // En una implementación real, aquí se llamaría a la API
      
      // Simulación de carga de ingresos
      // En una implementación real, aquí se llamaría a la API
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Función para manejar la creación o actualización de un gasto
  const handleSaveExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.paymentMethodId) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentExpense) {
        // Actualizar gasto existente
        const updatedExpenses = expenses.map(exp => 
          exp.id === currentExpense.id 
            ? { 
                ...exp, 
                date: newExpense.date,
                amount: newExpense.amount,
                description: newExpense.description,
                paymentMethodId: newExpense.paymentMethodId,
                paymentMethodName: paymentMethods.find(m => m.id === newExpense.paymentMethodId)?.name || ""
              } 
            : exp
        );
        setExpenses(updatedExpenses);
        
        // Actualizar el saldo del método de pago
        updatePaymentMethodBalance("expense", currentExpense.amount, newExpense.amount, currentExpense.paymentMethodId, newExpense.paymentMethodId);
      } else {
        // Crear nuevo gasto
        const newId = expenses.length > 0 ? Math.max(...expenses.map(exp => exp.id)) + 1 : 1;
        const paymentMethodName = paymentMethods.find(m => m.id === newExpense.paymentMethodId)?.name || "";
        
        const expense: Expense = {
          id: newId,
          date: newExpense.date,
          amount: newExpense.amount,
          description: newExpense.description,
          paymentMethodId: newExpense.paymentMethodId,
          paymentMethodName
        };
        
        setExpenses([...expenses, expense]);
        
        // Actualizar el saldo del método de pago
        updatePaymentMethodBalance("expense", 0, newExpense.amount, 0, newExpense.paymentMethodId);
      }
      
      toast({
        title: "Éxito",
        description: `Gasto ${currentExpense ? 'actualizado' : 'creado'} correctamente.`,
      });
      
      setIsExpenseDialogOpen(false);
      resetExpenseForm();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: `No se pudo ${currentExpense ? 'actualizar' : 'crear'} el gasto. Intente nuevamente.`,
        variant: "destructive",
      });
    }
  };

  // Función para manejar la creación o actualización de un ingreso
  const handleSaveIncome = async () => {
    if (!newIncome.amount || !newIncome.description || !newIncome.paymentMethodId) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentIncome) {
        // Actualizar ingreso existente
        const updatedIncomes = incomes.map(inc => 
          inc.id === currentIncome.id 
            ? { 
                ...inc, 
                date: newIncome.date,
                amount: newIncome.amount,
                description: newIncome.description,
                paymentMethodId: newIncome.paymentMethodId,
                paymentMethodName: paymentMethods.find(m => m.id === newIncome.paymentMethodId)?.name || ""
              } 
            : inc
        );
        setIncomes(updatedIncomes);
        
        // Actualizar el saldo del método de pago
        updatePaymentMethodBalance("income", currentIncome.amount, newIncome.amount, currentIncome.paymentMethodId, newIncome.paymentMethodId);
      } else {
        // Crear nuevo ingreso
        const newId = incomes.length > 0 ? Math.max(...incomes.map(inc => inc.id)) + 1 : 1;
        const paymentMethodName = paymentMethods.find(m => m.id === newIncome.paymentMethodId)?.name || "";
        
        const income: Income = {
          id: newId,
          date: newIncome.date,
          amount: newIncome.amount,
          description: newIncome.description,
          paymentMethodId: newIncome.paymentMethodId,
          paymentMethodName
        };
        
        setIncomes([...incomes, income]);
        
        // Actualizar el saldo del método de pago
        updatePaymentMethodBalance("income", 0, newIncome.amount, 0, newIncome.paymentMethodId);
      }
      
      toast({
        title: "Éxito",
        description: `Ingreso ${currentIncome ? 'actualizado' : 'creado'} correctamente.`,
      });
      
      setIsIncomeDialogOpen(false);
      resetIncomeForm();
    } catch (error) {
      console.error("Error saving income:", error);
      toast({
        title: "Error",
        description: `No se pudo ${currentIncome ? 'actualizar' : 'crear'} el ingreso. Intente nuevamente.`,
        variant: "destructive",
      });
    }
  };

  // Función para actualizar el saldo de un método de pago cuando se crea/actualiza un gasto o ingreso
  const updatePaymentMethodBalance = (
    type: "expense" | "income", 
    oldAmount: number, 
    newAmount: number, 
    oldMethodId: number, 
    newMethodId: number
  ) => {
    setPaymentMethods(prev => {
      const updated = [...prev];
      
      // Si se está modificando un registro existente, revertir el efecto del valor anterior
      if (oldAmount > 0 && oldMethodId > 0) {
        const oldMethodIndex = updated.findIndex(m => m.id === oldMethodId);
        if (oldMethodIndex >= 0) {
          if (type === "expense") {
            updated[oldMethodIndex].total += oldAmount; // Devolver el dinero al método
          } else {
            updated[oldMethodIndex].total -= oldAmount; // Quitar el ingreso anterior
          }
        }
      }
      
      // Aplicar el nuevo valor
      if (newAmount > 0 && newMethodId > 0) {
        const newMethodIndex = updated.findIndex(m => m.id === newMethodId);
        if (newMethodIndex >= 0) {
          if (type === "expense") {
            updated[newMethodIndex].total -= newAmount; // Descontar el gasto
          } else {
            updated[newMethodIndex].total += newAmount; // Agregar el ingreso
          }
        }
      }
      
      return updated;
    });
  };

  // Función para eliminar un gasto
  const handleDeleteExpense = (expense: Expense) => {
    if (confirm("¿Está seguro que desea eliminar este gasto?")) {
      setExpenses(expenses.filter(exp => exp.id !== expense.id));
      
      // Devolver el dinero al método de pago
      updatePaymentMethodBalance("expense", expense.amount, 0, expense.paymentMethodId, 0);
      
      toast({
        title: "Éxito",
        description: "Gasto eliminado correctamente.",
      });
    }
  };

  // Función para eliminar un ingreso
  const handleDeleteIncome = (income: Income) => {
    if (confirm("¿Está seguro que desea eliminar este ingreso?")) {
      setIncomes(incomes.filter(inc => inc.id !== income.id));
      
      // Quitar el ingreso del método de pago
      updatePaymentMethodBalance("income", income.amount, 0, income.paymentMethodId, 0);
      
      toast({
        title: "Éxito",
        description: "Ingreso eliminado correctamente.",
      });
    }
  };

  // Función para abrir el diálogo de gasto
  const openExpenseDialog = (expense: Expense | null = null) => {
    if (expense) {
      setCurrentExpense(expense);
      setNewExpense({
        date: expense.date,
        amount: expense.amount,
        description: expense.description,
        paymentMethodId: expense.paymentMethodId
      });
    } else {
      setCurrentExpense(null);
      resetExpenseForm();
    }
    setIsExpenseDialogOpen(true);
  };

  // Función para abrir el diálogo de ingreso
  const openIncomeDialog = (income: Income | null = null) => {
    if (income) {
      setCurrentIncome(income);
      setNewIncome({
        date: income.date,
        amount: income.amount,
        description: income.description,
        paymentMethodId: income.paymentMethodId
      });
    } else {
      setCurrentIncome(null);
      resetIncomeForm();
    }
    setIsIncomeDialogOpen(true);
  };

  // Función para resetear el formulario de gasto
  const resetExpenseForm = () => {
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: "",
      paymentMethodId: 0
    });
  };

  // Función para resetear el formulario de ingreso
  const resetIncomeForm = () => {
    setNewIncome({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: "",
      paymentMethodId: 0
    });
  };

  // Función para manejar el retiro de dinero
  const handleWithdraw = async () => {
    if (!withdrawalAmount || !withdrawalMethod || !withdrawalPerson) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Aquí iría la lógica para registrar el retiro en la API
      console.log("Registrando retiro:", {
        amount: parseFloat(withdrawalAmount),
        method: withdrawalMethod,
        person: withdrawalPerson,
      });
      
      toast({
        title: "Retiro registrado",
        description: "El retiro de dinero se ha registrado correctamente.",
      });
      
      // Reset fields
      setWithdrawalAmount("");
      setWithdrawalMethod("");
      setWithdrawalPerson("");
    } catch (error) {
      console.error("Error recording withdrawal:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al registrar el retiro.",
        variant: "destructive",
      });
    }
  };

  // Calcular totales para el resumen
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">ADMINISTRACIÓN</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate">Desde:</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate">Hasta:</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={fetchData} variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="resumen">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Ingresos Totales:</span>
                    <span className="font-semibold text-green-600">${totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Gastos Totales:</span>
                    <span className="font-semibold text-red-600">${totalExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">Saldo:</span>
                    <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Saldo por Medio de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex justify-between items-center">
                      <span>{method.name}:</span>
                      <span className={`font-semibold ${method.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${method.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Retiro de Dinero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="withdrawalPerson">¿Quién retira?</Label>
                  <Input
                    id="withdrawalPerson"
                    value={withdrawalPerson}
                    onChange={(e) => setWithdrawalPerson(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawalMethod">Método de Retiro</Label>
                  <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="withdrawalAmount">Cantidad a Retirar</Label>
                  <Input
                    id="withdrawalAmount"
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleWithdraw} className="mt-4">Registrar Retiro</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Gastos */}
        <TabsContent value="gastos">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Registro de Gastos</h3>
            <Button onClick={() => openExpenseDialog()} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Gasto
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Medio de Pago</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.paymentMethodName}</TableCell>
                    <TableCell>${expense.amount.toLocaleString("es-AR")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openExpenseDialog(expense)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay gastos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Diálogo para crear/editar gastos */}
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{currentExpense ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
                <DialogDescription>
                  Complete los datos del gasto. Este gasto se descontará del método de pago seleccionado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expenseDate">Fecha</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseAmount">Monto</Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      value={newExpense.amount || ""}
                      onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expenseMethod">Método de Pago</Label>
                  <Select 
                    value={newExpense.paymentMethodId ? newExpense.paymentMethodId.toString() : ""} 
                    onValueChange={(value) => setNewExpense({...newExpense, paymentMethodId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name} (Saldo: ${method.total.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expenseDescription">Descripción</Label>
                  <Textarea
                    id="expenseDescription"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveExpense}>
                  {currentExpense ? "Actualizar" : "Guardar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Pestaña de Ingresos */}
        <TabsContent value="ingresos">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Registro de Ingresos</h3>
            <Button onClick={() => openIncomeDialog()} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Ingreso
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Medio de Pago</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{income.date}</TableCell>
                    <TableCell>{income.description}</TableCell>
                    <TableCell>{income.paymentMethodName}</TableCell>
                    <TableCell>${income.amount.toLocaleString("es-AR")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openIncomeDialog(income)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {incomes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay ingresos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Diálogo para crear/editar ingresos */}
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{currentIncome ? "Editar Ingreso" : "Nuevo Ingreso"}</DialogTitle>
                <DialogDescription>
                  Complete los datos del ingreso. Este ingreso se agregará al método de pago seleccionado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incomeDate">Fecha</Label>
                    <Input
                      id="incomeDate"
                      type="date"
                      value={newIncome.date}
                      onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="incomeAmount">Monto</Label>
                    <Input
                      id="incomeAmount"
                      type="number"
                      value={newIncome.amount || ""}
                      onChange={(e) => setNewIncome({...newIncome, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="incomeMethod">Método de Pago</Label>
                  <Select 
                    value={newIncome.paymentMethodId ? newIncome.paymentMethodId.toString() : ""} 
                    onValueChange={(value) => setNewIncome({...newIncome, paymentMethodId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name} (Saldo: ${method.total.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="incomeDescription">Descripción</Label>
                  <Textarea
                    id="incomeDescription"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveIncome}>
                  {currentIncome ? "Actualizar" : "Guardar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}

