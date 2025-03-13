'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus, Trash2, Pencil, Settings, Database, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatabaseBackup from './database-backup';
import UserManagement from '../user-management';

interface PaymentMethod {
    id: number;
    name: string;
    isActive: boolean;
}

export default function SettingsTab() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [newPaymentMethodName, setNewPaymentMethodName] = useState("");
    const [newPaymentMethodSurcharge, setNewPaymentMethodSurcharge] = useState("0");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentMethodName, setPaymentMethodName] = useState("");
    const [paymentMethodSurcharge, setPaymentMethodSurcharge] = useState("0");
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [logo, setLogo] = useState<string | null>(null);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch('/api/payment-methods');
            const data = await response.json();
            setPaymentMethods(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            setLoading(false);
        }
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setLogo(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
                    <p className="text-muted-foreground">
                        Administra la configuración de la aplicación
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="database" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Base de Datos</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Usuarios</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notificaciones</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración General</CardTitle>
                            <CardDescription>
                                Configura los ajustes generales de la aplicación
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="app-name">Nombre de la Aplicación</Label>
                                <Input id="app-name" defaultValue="RESET-PRO" />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="dark-mode">Modo Oscuro</Label>
                                <Switch id="dark-mode" />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="notifications">Notificaciones</Label>
                                <Switch id="notifications" defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo</Label>
                                <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                                {logo && <img src={logo} alt="Logo" className="mt-2 h-20" />}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="database" className="space-y-4">
                    <DatabaseBackup />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Usuarios</CardTitle>
                            <CardDescription>
                                Administra los usuarios y sus permisos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserManagement />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Notificaciones</CardTitle>
                            <CardDescription>
                                Configura cómo y cuándo recibir notificaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                                <Switch id="email-notifications" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="push-notifications">Notificaciones Push</Label>
                                <Switch id="push-notifications" />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="appointment-reminders">Recordatorios de Citas</Label>
                                <Switch id="appointment-reminders" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Métodos de Pago</h3>
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Agregar Método de Pago
                        </Button>
                    </div>

                    {loading ? (
                        <p>Cargando métodos de pago...</p>
                    ) : paymentMethods.length === 0 ? (
                        <p>No hay métodos de pago configurados.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {paymentMethods.map((method) => (
                                <Card key={method.id} className={`${!method.isActive ? 'opacity-60' : ''}`}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{method.name}</CardTitle>
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs ${method.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                                {method.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => {
                                                    setSelectedPaymentMethod(method);
                                                    setPaymentMethodName(method.name);
                                                    setShowEditDialog(true);
                                                }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Diálogos para agregar y editar métodos de pago */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Método de Pago</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                placeholder="Efectivo, Tarjeta, etc."
                                value={newPaymentMethodName}
                                onChange={(e) => setNewPaymentMethodName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surcharge">Recargo (%)</Label>
                            <Input
                                id="surcharge"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={newPaymentMethodSurcharge}
                                onChange={(e) => setNewPaymentMethodSurcharge(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Método de Pago</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre</Label>
                            <Input
                                id="edit-name"
                                placeholder="Efectivo, Tarjeta, etc."
                                value={paymentMethodName}
                                onChange={(e) => setPaymentMethodName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-surcharge">Recargo (%)</Label>
                            <Input
                                id="edit-surcharge"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={paymentMethodSurcharge}
                                onChange={(e) => setPaymentMethodSurcharge(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="is-active">Activo</Label>
                            <Switch
                                id="is-active"
                                checked={selectedPaymentMethod?.isActive}
                                onCheckedChange={(checked) => {
                                    if (selectedPaymentMethod) {
                                        setSelectedPaymentMethod({
                                            ...selectedPaymentMethod,
                                            isActive: checked,
                                        });
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 