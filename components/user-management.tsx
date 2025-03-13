'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  User, 
  Pencil, 
  Trash, 
  Shield, 
  UserPlus,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Definición de la interfaz de usuario
interface User {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// Mapeo de roles a etiquetas amigables
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
  READONLY: 'Solo Lectura',
};

// Mapeo de roles a colores
const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500',
  MANAGER: 'bg-blue-500',
  OPERATOR: 'bg-green-500',
  READONLY: 'bg-gray-500',
};

// Mapeo de roles a iconos
const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <ShieldCheck className="h-4 w-4 mr-1" />,
  MANAGER: <Shield className="h-4 w-4 mr-1" />,
  OPERATOR: <User className="h-4 w-4 mr-1" />,
  READONLY: <Eye className="h-4 w-4 mr-1" />,
};

// Permisos por rol
const rolePermissions: Record<string, string[]> = {
  ADMIN: [
    'Acceso completo al sistema',
    'Gestión de usuarios',
    'Configuración del sistema',
    'Gestión de citas',
    'Gestión de pagos',
    'Gestión de gastos',
    'Reportes y estadísticas',
    'Respaldos de base de datos',
  ],
  MANAGER: [
    'Gestión de citas',
    'Gestión de pagos',
    'Gestión de gastos',
    'Reportes y estadísticas',
    'Configuración limitada',
  ],
  OPERATOR: [
    'Gestión de citas',
    'Registro de pagos',
    'Registro de gastos',
  ],
  READONLY: [
    'Visualización de citas',
    'Visualización de reportes',
  ],
};

export default function UserManagement() {
  // Estados para la gestión de usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para diálogos
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewPermissionsDialogOpen, setViewPermissionsDialogOpen] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    id: 0,
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'OPERATOR',
    isActive: true,
  });
  
  // Estado para el usuario seleccionado
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Función para obtener usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/usuarios');
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para crear un nuevo usuario
  const createUser = async () => {
    try {
      if (!formData.username || !formData.password || !formData.name) {
        toast.error('Por favor completa los campos obligatorios');
        return;
      }
      
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }
      
      toast.success('Usuario creado correctamente');
      setAddDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear usuario');
      console.error(err);
    }
  };
  
  // Función para actualizar un usuario
  const updateUser = async () => {
    try {
      if (!formData.username || !formData.name) {
        toast.error('Por favor completa los campos obligatorios');
        return;
      }
      
      const response = await fetch(`/api/usuarios/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }
      
      toast.success('Usuario actualizado correctamente');
      setEditDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar usuario');
      console.error(err);
    }
  };
  
  // Función para eliminar un usuario
  const deleteUser = async () => {
    try {
      if (!selectedUser) return;
      
      const response = await fetch(`/api/usuarios/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario');
      }
      
      toast.success('Usuario eliminado correctamente');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar usuario');
      console.error(err);
    }
  };
  
  // Función para preparar la edición de un usuario
  const prepareEditUser = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      password: '', // No incluimos la contraseña actual por seguridad
      name: user.name,
      email: user.email || '',
      role: user.role,
      isActive: user.isActive,
    });
    setEditDialogOpen(true);
  };
  
  // Función para preparar la eliminación de un usuario
  const prepareDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  // Función para ver los permisos de un rol
  const viewRolePermissions = (user: User) => {
    setSelectedUser(user);
    setViewPermissionsDialogOpen(true);
  };
  
  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      id: 0,
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'OPERATOR',
      isActive: true,
    });
  };
  
  // Función para manejar cambios en el formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Función para manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Función para manejar cambios en switches
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  // Función para formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Usuarios del Sistema</h3>
        <Button onClick={() => {
          resetForm();
          setAddDialogOpen(true);
        }} variant="default">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="p-4 border rounded bg-muted text-center">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user.username}
                    </div>
                    {user.email && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className="flex items-center"
                      onClick={() => viewRolePermissions(user)}
                    >
                      {roleIcons[user.role]}
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.lastLogin)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => prepareEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => prepareDeleteUser(user)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Diálogo para añadir usuario */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa los campos para crear un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  placeholder="usuario123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="OPERATOR">Operador</SelectItem>
                    <SelectItem value="READONLY">Solo Lectura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Estado</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createUser}>Crear Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar usuario */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los campos para actualizar la información del usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Nombre de Usuario *</Label>
                <Input
                  id="edit-username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  placeholder="usuario123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nueva Contraseña</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Dejar en blanco para mantener"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="OPERATOR">Operador</SelectItem>
                    <SelectItem value="READONLY">Solo Lectura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Estado</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  />
                  <Label htmlFor="edit-isActive" className="cursor-pointer">
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateUser}>Actualizar Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para eliminar usuario */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="p-4 border rounded bg-muted">
                <p><strong>Usuario:</strong> {selectedUser.username}</p>
                <p><strong>Nombre:</strong> {selectedUser.name}</p>
                <p><strong>Rol:</strong> {roleLabels[selectedUser.role] || selectedUser.role}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteUser}>
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para ver permisos */}
      <Dialog open={viewPermissionsDialogOpen} onOpenChange={setViewPermissionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permisos del Rol</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>Permisos asignados al rol <strong>{roleLabels[selectedUser.role] || selectedUser.role}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="space-y-2">
                {rolePermissions[selectedUser.role]?.map((permission, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewPermissionsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 