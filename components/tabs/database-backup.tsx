'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type Backup = {
  fileName: string;
  size: number;
  createdAt: string;
};

export default function DatabaseBackup() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  // Cargar lista de respaldos
  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/database/restore');
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Error al cargar respaldos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los respaldos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Crear respaldo
  const createBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/database/backup');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Respaldo creado',
          description: `El respaldo ${data.fileName} se ha creado correctamente`,
          variant: 'default',
        });
        loadBackups(); // Recargar lista de respaldos
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el respaldo',
        variant: 'destructive',
      });
    } finally {
      setBackupLoading(false);
    }
  };

  // Restaurar respaldo
  const restoreBackup = async () => {
    if (!selectedBackup) return;
    
    setRestoreLoading(true);
    try {
      const response = await fetch('/api/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: selectedBackup }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Base de datos restaurada',
          description: 'La base de datos se ha restaurado correctamente',
          variant: 'default',
        });
        setRestoreDialogOpen(false);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al restaurar la base de datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudo restaurar la base de datos',
        variant: 'destructive',
      });
    } finally {
      setRestoreLoading(false);
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Cargar respaldos al montar el componente
  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Respaldo y Restauración de Base de Datos
        </CardTitle>
        <CardDescription>
          Crea respaldos de la base de datos y restáuralos cuando sea necesario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Crear un respaldo antes de realizar cambios importantes en la aplicación.
              La restauración sobrescribirá todos los datos actuales.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h3 className="text-lg font-medium">Respaldos disponibles</h3>
            <Button 
              onClick={createBackup} 
              disabled={backupLoading}
              className="flex items-center gap-2"
            >
              {backupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Crear Respaldo
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay respaldos disponibles
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.fileName}>
                      <TableCell className="font-medium">{backup.fileName}</TableCell>
                      <TableCell>{formatDate(backup.createdAt)}</TableCell>
                      <TableCell>{formatFileSize(backup.size)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={restoreDialogOpen && selectedBackup === backup.fileName} onOpenChange={(open) => {
                          setRestoreDialogOpen(open);
                          if (!open) setSelectedBackup(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => setSelectedBackup(backup.fileName)}
                            >
                              <Upload className="h-3 w-3" />
                              Restaurar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmar Restauración</DialogTitle>
                              <DialogDescription>
                                ¿Estás seguro de que deseas restaurar la base de datos con el respaldo <strong>{backup.fileName}</strong>?
                                <br /><br />
                                <span className="text-destructive font-semibold">
                                  ¡Advertencia! Esta acción sobrescribirá todos los datos actuales.
                                </span>
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setRestoreDialogOpen(false);
                                  setSelectedBackup(null);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={restoreBackup}
                                disabled={restoreLoading}
                                className="flex items-center gap-2"
                              >
                                {restoreLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4" />
                                )}
                                Restaurar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={loadBackups} disabled={loading}>
          Actualizar lista
        </Button>
      </CardFooter>
    </Card>
  );
} 