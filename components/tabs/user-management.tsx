'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, Pencil, Trash2, ShieldAlert, ShieldCheck, Shield, User, UserCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Definir tipos
interface User {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'READONLY';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// Mapeo de roles a etiquetas más amigables
const roleLabels = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
  READONLY: 'Solo Lectura'
};

// Mapeo de roles a colores
const roleColors = {
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
  OPERATOR: 'bg-blue-100 text-blue-800 border-blue-200',
  READONLY: 'bg-gray-100 text-gray-800 border-gray-200'
};

// Mapeo de roles a iconos
const roleIcons = {
  ADMIN: <ShieldAlert className="h-4 w-4" />,
  MANAGER: <ShieldCheck className="h-4 w-4" />,
  OPERATOR: <Shield className="h-4 w-4" />,
  READONLY: <User className="h-4 w-4" />
};

// Permisos por rol
const rolePermissions = {
  ADMIN: [
    'Acceso completo al sistema',
    'Gestión de usuarios',
    'Configuración del sistema',
    'Reportes financieros',
    'Gestión de tratamientos',
    'Gestión de profesionales',
    'Gestión de clientes',
    'Gestión de agenda',
    'Gestión de ventas',
    'Respaldo y restauración de datos'
  ],
  MANAGER: [
    'Reportes financieros',
    'Gestión de tratamientos',
    'Gestión de profesionales',
    'Gestión de clientes',
    'Gestión de agenda',
    'Gestión de ventas'
  ],
  OPERATOR: [
    'Gestión de clientes',
    'Gestión de agenda',
    'Gestión de ventas'
  ],
  READONLY: [
    'Visualización de agenda',
    'Visualización de clientes'
  ]
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Estados para el formulario de nuevo usuario
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'MANAGER' | 'OPERATOR' | 'READONLY'>('OPERATOR');
  const [newIsActive, setNewIsActive] = useState(true);
  
  // Estados para el formulario de edición
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'MANAGER' | 'OPERATOR' | 'READONLY'>('OPERATOR');
  const [editIsActive, setEditIsActive] = useState(true);
  const [changePassword, setChangePassword] = useState(false);

  // Cargar usuarios
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/usuarios');
      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Crear usuario
  const handleCreateUser = async () => {
    try {
      if (!newUsername || !newPassword || !newName) {
        toast({
          title: 'Error',
          description: 'Por favor complete los campos obligatorios',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          email: newEmail || null,
          role: newRole,
          isActive: newIsActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear usuario');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      
      toast({
        title: 'Usuario creado',
        description: `El usuario ${newUser.name} ha sido creado exitosamente`,
      });
      
      // Limpiar formulario
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewEmail('');
      setNewRole('OPERATOR');
      setNewIsActive(true);
      setShowAddDialog(false);
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear usuario',
        variant: 'destructive',
      });
    }
  };

  // Actualizar usuario
  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      
      if (!editUsername || !editName) {
        toast({
          title: 'Error',
          description: 'Por favor complete los campos obligatorios',
          variant: 'destructive',
        });
        return;
      }

      const userData: any = {
        username: editUsername,
        name: editName,
        email: editEmail || null,
        role: editRole,
        isActive: editIsActive,
      };

      // Solo incluir contraseña si se va a cambiar
      if (changePassword && editPassword) {
        userData.password = editPassword;
      }

      const response = await fetch(`/api/usuarios/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => user.id === selectedUser.id ? updatedUser : user));
      
      toast({
        title: 'Usuario actualizado',
        description: `El usuario ${updatedUser.name} ha sido actualizado exitosamente`,
      });
      
      setShowEditDialog(false);
      
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar usuario',
        variant: 'destructive',
      });
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return;

      const response = await fetch(`/api/usuarios/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }

      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      toast({
        title: 'Usuario eliminado',
        description: `El usuario ${selectedUser.name} ha sido eliminado exitosamente`,
      });
      
      setShowDeleteDialog(false);
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar usuario',
        variant: 'destructive',
      });
    }
  };

  // Preparar edición de usuario
  const prepareEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditPassword('');
    setEditName(user.name);
    setEditEmail(user.email || '');
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setChangePassword(false);
    setShowEditDialog(true);
  };

  // Preparar eliminación de usuario
  const prepareDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gestión de Usuarios</h3>
          <p className="text-sm text-muted-foreground">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <UserCog className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Información sobre permisos</AlertTitle>
        <AlertDescription className="text-amber-700">
          Los permisos de los usuarios están determinados por su rol. Asegúrate de asignar el rol adecuado a cada usuario.
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`flex items-center gap-1 ${roleColors[user.role]}`}>
                      {roleIcons[user.role]}
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => prepareEditUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => prepareDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo para agregar usuario */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario para el sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario <span className="text-red-500">*</span></Label>
              <Input
                id="username"
                placeholder="usuario123"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol <span className="text-red-500">*</span></Label>
              <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="MANAGER">Gerente</SelectItem>
                  <SelectItem value="OPERATOR">Operador</SelectItem>
                  <SelectItem value="READONLY">Solo Lectura</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {newRole && rolePermissions[newRole][0]}...
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="is-active">Usuario Activo</Label>
              <Switch
                id="is-active"
                checked={newIsActive}
                onCheckedChange={setNewIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar usuario */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Nombre de Usuario <span className="text-red-500">*</span></Label>
              <Input
                id="edit-username"
                placeholder="usuario123"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="change-password">Cambiar Contraseña</Label>
                <Switch
                  id="change-password"
                  checked={changePassword}
                  onCheckedChange={setChangePassword}
                />
              </div>
              {changePassword && (
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Nueva contraseña"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                placeholder="Juan Pérez"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol <span className="text-red-500">*</span></Label>
              <Select value={editRole} onValueChange={(value: any) => setEditRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="MANAGER">Gerente</SelectItem>
                  <SelectItem value="OPERATOR">Operador</SelectItem>
                  <SelectItem value="READONLY">Solo Lectura</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {editRole && rolePermissions[editRole][0]}...
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-is-active">Usuario Activo</Label>
              <Switch
                id="edit-is-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para eliminar usuario */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="space-y-2">
                <p><strong>Usuario:</strong> {selectedUser.username}</p>
                <p><strong>Nombre:</strong> {selectedUser.name}</p>
                <p><strong>Rol:</strong> {roleLabels[selectedUser.role]}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sección de información de roles */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información de Roles</CardTitle>
          <CardDescription>
            Descripción de los permisos asociados a cada rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ADMIN">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="ADMIN" className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" />
                <span className="hidden sm:inline">Administrador</span>
              </TabsTrigger>
              <TabsTrigger value="MANAGER" className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Gerente</span>
              </TabsTrigger>
              <TabsTrigger value="OPERATOR" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Operador</span>
              </TabsTrigger>
              <TabsTrigger value="READONLY" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Solo Lectura</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ADMIN" className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Administrador</h4>
                <p className="text-sm text-muted-foreground">
                  Acceso completo a todas las funcionalidades del sistema.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  {rolePermissions.ADMIN.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="MANAGER" className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Gerente</h4>
                <p className="text-sm text-muted-foreground">
                  Acceso a la mayoría de las funcionalidades, excepto configuración del sistema y gestión de usuarios.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  {rolePermissions.MANAGER.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="OPERATOR" className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Operador</h4>
                <p className="text-sm text-muted-foreground">
                  Acceso a funcionalidades operativas diarias.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  {rolePermissions.OPERATOR.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="READONLY" className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Solo Lectura</h4>
                <p className="text-sm text-muted-foreground">
                  Acceso limitado a visualización de información.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  {rolePermissions.READONLY.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 