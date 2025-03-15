'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Download, Upload, Database, AlertTriangle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

export default function DatabaseBackup() {
  const [createLoading, setCreateLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Crear respaldo
  const createBackup = async () => {
    try {
      setCreateLoading(true);
      
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear respaldo");
      }
      
      // Obtener el blob del respaldo
      const blob = await response.blob();
      
      // Crear una URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un elemento de descarga
      const a = document.createElement('a');
      a.href = url;
      
      // Obtener el nombre de archivo del Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'respaldo_db.json';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      a.download = fileName;
      
      // Agregar el elemento al documento
      document.body.appendChild(a);
      
      // Iniciar la descarga
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Éxito",
        description: "Respaldo creado correctamente. Se ha iniciado la descarga.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al crear respaldo:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      toast({
        title: "Error",
        description: `Error al crear respaldo: ${errorMessage}`,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Restaurar respaldo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRestoreDialogOpen(true);
    }
  };
  
  const restoreBackup = async () => {
    const file = fileInputRef.current?.files?.[0];
    
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo de respaldo.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRestoreLoading(true);
      setRestoreStatus("Iniciando restauración de la base de datos...");

      // Crear formData con el archivo
      const formData = new FormData();
      formData.append('backupFile', file);

      const response = await fetch('/api/database/restore', {
        method: 'POST',
        body: formData,
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
        
        // Limpiar el input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
    }
  };

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
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Crear un respaldo antes de realizar cambios importantes en la aplicación.
              La restauración sobrescribirá todos los datos actuales.
            </AlertDescription>
          </Alert>
          
          {/* Sección de crear respaldo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Crear respaldo</h3>
            <p className="text-sm text-muted-foreground">
              Crea un respaldo de tu base de datos actual. El archivo se descargará directamente a tu computadora.
            </p>
            <Button 
              onClick={createBackup} 
              disabled={createLoading}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              {createLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando respaldo...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar respaldo de base de datos
                </>
              )}
            </Button>
          </div>
          
          {/* Sección de restaurar respaldo */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Restaurar respaldo</h3>
            <p className="text-sm text-muted-foreground">
              Restaura tu base de datos utilizando un archivo de respaldo previamente guardado.
            </p>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="backupFile">Seleccionar archivo de respaldo</Label>
              <input
                ref={fileInputRef}
                id="backupFile"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 w-full md:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  Seleccionar archivo
                </Button>
                {fileInputRef.current?.files?.[0] && (
                  <span className="text-sm py-2">{fileInputRef.current.files[0].name}</span>
                )}
              </div>
            </div>
            
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Restaurar base de datos</DialogTitle>
                  <DialogDescription>
                    ¿Está seguro que desea restaurar la base de datos con el archivo seleccionado?
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
            
          </div>
          
          {/* Nota sobre compatibilidad */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Compatibilidad</AlertTitle>
            <AlertDescription>
              Los respaldos son compatibles entre diferentes instalaciones, pero pueden 
              haber problemas si la estructura de la base de datos ha cambiado significativamente 
              entre versiones. Si experimenta problemas, inténtelo con una versión más 
              reciente del respaldo.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
} 