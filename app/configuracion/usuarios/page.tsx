'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { 
  Pencil, 
  Trash2, 
  UserPlus, 
  Check, 
  X 
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface User {
  id: number
  username: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'READONLY'
  isActive: boolean
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR' as User['role']
  })
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editPassword, setEditPassword] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('Error al cargar usuarios')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        toast.success('Usuario creado exitosamente')
        fetchUsers()
        // Resetear formulario
        setNewUser({
          username: '',
          name: '',
          email: '',
          password: '',
          role: 'OPERATOR'
        })
        setIsCreateDialogOpen(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear usuario')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editUser) return
    
    try {
      const token = localStorage.getItem('token')
      const userData = {
        ...editUser,
        password: editPassword || undefined
      }
      
      const response = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        toast.success('Usuario actualizado exitosamente')
        fetchUsers()
        setIsEditDialogOpen(false)
        setEditUser(null)
        setEditPassword('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar usuario')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/usuarios/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Usuario desactivado exitosamente')
        fetchUsers()
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar usuario')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      const token = localStorage.getItem('token')
      const userData = {
        ...user,
        isActive: !user.isActive
      }
      
      const response = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        toast.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente`)
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cambiar estado del usuario')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuración de Usuarios</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Crear Nuevo Usuario</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label>Nombre de Usuario</label>
                <Input 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required 
                  placeholder="Ingrese nombre de usuario"
                />
              </div>
              <div>
                <label>Nombre Completo</label>
                <Input 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required 
                  placeholder="Ingrese nombre completo"
                />
              </div>
              <div>
                <label>Correo Electrónico</label>
                <Input 
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required 
                  placeholder="Ingrese correo electrónico"
                />
              </div>
              <div>
                <label>Contraseña</label>
                <Input 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required 
                  placeholder="Ingrese contraseña"
                />
              </div>
              <div>
                <label>Rol</label>
                <Select 
                  value={newUser.role}
                  onValueChange={(value: User['role']) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="OPERATOR">Operador</SelectItem>
                    <SelectItem value="READONLY">Solo Lectura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Crear Usuario
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Usuarios Existentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div 
              key={user.id} 
              className={`bg-white p-4 rounded-lg shadow-md ${!user.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <p>@{user.username}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span 
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'MANAGER' ? 'bg-yellow-100 text-yellow-800' :
                        user.role === 'OPERATOR' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span 
                      className={`px-2 py-1 rounded text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      setEditUser(user)
                      setEditPassword('')
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      setUserToDelete(user)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <Label htmlFor={`active-${user.id}`} className="text-sm">
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </Label>
                <Switch 
                  id={`active-${user.id}`}
                  checked={user.isActive}
                  onCheckedChange={() => handleToggleActive(user)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label>Nombre de Usuario</label>
                <Input 
                  value={editUser.username}
                  onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label>Nombre Completo</label>
                <Input 
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label>Correo Electrónico</label>
                <Input 
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label>Nueva Contraseña (dejar en blanco para mantener la actual)</label>
                <Input 
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nueva contraseña (opcional)"
                />
              </div>
              <div>
                <label>Rol</label>
                <Select 
                  value={editUser.role}
                  onValueChange={(value: User['role']) => setEditUser({...editUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="OPERATOR">Operador</SelectItem>
                    <SelectItem value="READONLY">Solo Lectura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="user-active"
                  checked={editUser.isActive}
                  onCheckedChange={(checked) => setEditUser({...editUser, isActive: checked})}
                />
                <Label htmlFor="user-active">Usuario activo</Label>
              </div>
              <Button type="submit" className="w-full">
                Guardar Cambios
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desactivación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar al usuario {userToDelete?.name}? 
              Esta acción marcará al usuario como inactivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Desactivar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 