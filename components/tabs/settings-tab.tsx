import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Plus, Trash2, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface PaymentMethod {
  id: number;
  name: string;
  surcharge: number; // Porcentaje de recargo
  isActive: boolean;
}

interface SettingsTabProps {
    logo: string | null;
    setLogo: (logo: string | null) => void;
}

export default function SettingsTab({ logo, setLogo }: SettingsTabProps) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentMethodName, setPaymentMethodName] = useState("");
    const [paymentMethodSurcharge, setPaymentMethodSurcharge] = useState("0");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Cargar los métodos de pago
        const fetchPaymentMethods = async () => {
            try {
                const response = await fetch("/api/payment-methods");
                if (response.ok) {
                    const data = await response.json();
                    setPaymentMethods(data);
                }
            } catch (error) {
                console.error("Error fetching payment methods:", error);
            }
        };

        fetchPaymentMethods();
    }, []);

    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result);
                localStorage.setItem("logo", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenPaymentMethodDialog = (paymentMethod: PaymentMethod | null = null) => {
        if (paymentMethod) {
            setCurrentPaymentMethod(paymentMethod);
            setPaymentMethodName(paymentMethod.name);
            setPaymentMethodSurcharge(paymentMethod.surcharge.toString());
            setIsEditing(true);
        } else {
            setCurrentPaymentMethod(null);
            setPaymentMethodName("");
            setPaymentMethodSurcharge("0");
            setIsEditing(false);
        }
        setIsPaymentMethodDialogOpen(true);
    };

    const handleSavePaymentMethod = async () => {
        if (!paymentMethodName) {
            toast({
                title: "Error",
                description: "El nombre del método de pago es obligatorio",
                variant: "destructive",
            });
            return;
        }

        try {
            const method = {
                id: isEditing && currentPaymentMethod ? currentPaymentMethod.id : Date.now(),
                name: paymentMethodName,
                surcharge: parseFloat(paymentMethodSurcharge),
                isActive: true,
            };

            if (isEditing && currentPaymentMethod) {
                // Actualizar método existente
                const response = await fetch(`/api/payment-methods/${currentPaymentMethod.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(method),
                });

                if (response.ok) {
                    setPaymentMethods(
                        paymentMethods.map((m) => (m.id === currentPaymentMethod.id ? method : m))
                    );
                    toast({
                        title: "Método de pago actualizado",
                        description: "El método de pago se ha actualizado correctamente",
                    });
                }
            } else {
                // Crear nuevo método
                const response = await fetch("/api/payment-methods", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(method),
                });

                if (response.ok) {
                    setPaymentMethods([...paymentMethods, method]);
                    toast({
                        title: "Método de pago creado",
                        description: "El método de pago se ha creado correctamente",
                    });
                }
            }

            setIsPaymentMethodDialogOpen(false);
        } catch (error) {
            console.error("Error saving payment method:", error);
            toast({
                title: "Error",
                description: "Ha ocurrido un error al guardar el método de pago",
                variant: "destructive",
            });
        }
    };

    const handleDeletePaymentMethod = async (id: number) => {
        if (confirm("¿Está seguro que desea eliminar este método de pago?")) {
            try {
                const response = await fetch(`/api/payment-methods/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
                    toast({
                        title: "Método de pago eliminado",
                        description: "El método de pago se ha eliminado correctamente",
                    });
                }
            } catch (error) {
                console.error("Error deleting payment method:", error);
                toast({
                    title: "Error",
                    description: "Ha ocurrido un error al eliminar el método de pago",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Configuración</h2>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Logo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input type="file" accept="image/*" onChange={handleLogoChange} />
                        {logo && <img src={logo} alt="Logo" className="mt-2 h-20" />}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Medios de Pago</h3>
                    <Button onClick={() => handleOpenPaymentMethodDialog()} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Medio de Pago
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {paymentMethods.map((method) => (
                        <Card key={method.id} className="hover:bg-slate-50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{method.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenPaymentMethodDialog(method)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeletePaymentMethod(method.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Recargo: {method.surcharge}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={isPaymentMethodDialogOpen} onOpenChange={setIsPaymentMethodDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Editar Método de Pago" : "Nuevo Método de Pago"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={paymentMethodName}
                                onChange={(e) => setPaymentMethodName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="surcharge">Recargo (%)</Label>
                            <Input
                                id="surcharge"
                                type="number"
                                min="0"
                                step="0.01"
                                value={paymentMethodSurcharge}
                                onChange={(e) => setPaymentMethodSurcharge(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentMethodDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSavePaymentMethod}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 