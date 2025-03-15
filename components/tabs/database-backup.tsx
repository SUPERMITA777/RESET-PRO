'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Upload, Database, AlertTriangle, CheckCircle, Archive } from 'lucide-react';
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
  const [restoreStatus, setRestoreStatus] = useState<string>("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createStatus, setCreateStatus] = useState<string>("");

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
    try {
      setCreateLoading(true);
      setCreateStatus("Creando respaldo...");

      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear respaldo");
      }

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Respaldo creado correctamente.",
          variant: "default",
        });
        setCreateStatus("Respaldo creado correctamente");
        // Recargar lista de respaldos
        loadBackups();
      } else {
        throw new Error(result.error || "Error al crear respaldo");
      }
    } catch (error) {
      console.error("Error al crear respaldo:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      toast({
        title: "Error",
        description: `Error al crear respaldo: ${errorMessage}`,
        variant: "destructive",
        duration: 6000,
      });
      setCreateStatus(`Falló la creación: ${errorMessage}`);
    } finally {
      setCreateLoading(false);
    }
  };

  // Restaurar respaldo
  const restoreBackup = async () => {
    if (!selectedBackup) {
      toast({
        title: "Error",
        description: "Por favor seleccione un respaldo para restaurar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRestoreLoading(true);
      setRestoreStatus("Iniciando restauración de la base de datos...");

      const response = await fetch('/api/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: selectedBackup }),
      });

      // Si la respuesta tarda más de 5 segundos, mostrar mensaje de espera
      const messageTimeout = setTimeout(() => {
        setRestoreStatus("La restauración está en progreso. Esto puede tardar varios minutos para bases de datos grandes...");
      }, 5000);

      // Si tarda más de 30 segundos, actualizar nuevamente el mensaje
      const longMessageTimeout = setTimeout(() => {
        setRestoreStatus("La restauración continúa en proceso. Por favor no cierre esta ventana...");
      }, 30000);

      const result = await response.json();

      // Limpiar los timeouts cuando tengamos respuesta
      clearTimeout(messageTimeout);
      clearTimeout(longMessageTimeout);

      if (!response.ok) {
        // Si hay éxito parcial, mostrar un mensaje diferente
        if (result.partialSuccess) {
          const successGroupsText = result.successGroups.join(', ');
          toast({
            title: "Restauración Parcial",
            description: `Se restauraron parcialmente los datos. Grupos restaurados: ${successGroupsText}`,
            variant: "default",
            duration: 8000,
          });
          setRestoreStatus(`Restauración parcial completada. Se restauraron: ${successGroupsText}. Algunos datos no pudieron ser restaurados debido a incompatibilidades.`);
          setTimeout(() => setRestoreDialogOpen(false), 5000);
          return;
        }
        
        throw new Error(result.error || "Error al restaurar la base de datos");
      }

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Base de datos restaurada correctamente.",
          variant: "default",
        });
        setRestoreStatus("Restauración completada correctamente");
        setRestoreDialogOpen(false);
      } else {
        throw new Error(result.error || "Error al restaurar la base de datos");
      }
    } catch (error) {
      console.error("Error al restaurar la base de datos:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al restaurar la base de datos";
      
      let displayError = errorMessage;
      // Simplificar mensajes de error comunes
      if (errorMessage.includes("tardó demasiado tiempo")) {
        displayError = "La operación tomó demasiado tiempo. La base de datos puede ser muy grande.";
      } else if (errorMessage.includes("Error de validación")) {
        displayError = "El formato del respaldo es incompatible con la versión actual de la aplicación.";
      }
      
      toast({
        title: "Error",
        description: `Error al restaurar la base de datos: ${displayError}`,
        variant: "destructive",
        duration: 6000,
      });
      setRestoreStatus(`Falló la restauración: ${displayError}`);
    } finally {
      setRestoreLoading(false);
      // Recargar lista de respaldos
      loadBackups();
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
            
            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              {createStatus && (
                <div className="p-2 bg-secondary rounded-md w-full sm:w-auto">
                  <p className="text-xs font-medium">{createStatus}</p>
                </div>
              )}
              
              <Button 
                onClick={createBackup} 
                disabled={createLoading}
                className="flex items-center gap-2"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Crear Respaldo
                  </>
                )}
              </Button>
            </div>
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
                              <DialogTitle>Restaurar base de datos</DialogTitle>
                              <DialogDescription>
                                ¿Está seguro que desea restaurar la base de datos con el respaldo: {backup.fileName}?
                                <br />
                                Esta acción no se puede deshacer y reemplazará todos los datos actuales.
                                <br />
                                <br />
                                <span className="font-medium text-yellow-600">
                                  La restauración puede tardar varios minutos si la base de datos es grande.
                                  No cierre la aplicación durante este proceso.
                                </span>
                              </DialogDescription>
                            </DialogHeader>
                            
                            {restoreStatus && (
                              <div className="my-2 p-3 bg-secondary rounded-md">
                                <p className="text-sm font-medium">{restoreStatus}</p>
                              </div>
                            )}
                            
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setRestoreDialogOpen(false)}
                                disabled={restoreLoading}
                              >
                                Cancelar
                              </Button>
                              <Button
                                variant="default"
                                onClick={restoreBackup}
                                disabled={restoreLoading}
                              >
                                {restoreLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Restaurando...
                                  </>
                                ) : (
                                  "Restaurar"
                                )}
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