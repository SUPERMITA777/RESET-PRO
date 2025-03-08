"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

// Mock data
const initialSales = [
  {
    id: 1,
    date: "2025-03-03",
    product: "Crema Hidratante",
    quantity: 2,
    price: 3500,
    total: 7000,
    client: "Ana García",
  },
  {
    id: 2,
    date: "2025-03-03",
    product: "Serum Vitamina C",
    quantity: 1,
    price: 4800,
    total: 4800,
    client: "Juan Pérez",
  },
]

interface Sale {
  id: number
  date: string
  product: string
  quantity: number
  price: number
  total: number
  client: string
}

export default function SalesTab() {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)

  const handleOpenDialog = (sale: Sale | null = null) => {
    setCurrentSale(sale)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro que desea eliminar esta venta?")) {
      setSales(sales.filter((sale) => sale.id !== id))
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ventas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta (Próximamente)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentSale ? "Editar Venta" : "Nueva Venta"}</DialogTitle>
              <DialogDescription>Esta funcionalidad estará disponible próximamente.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.product}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>${sale.price.toLocaleString("es-AR")}</TableCell>
                <TableCell>${sale.total.toLocaleString("es-AR")}</TableCell>
                <TableCell>{sale.client}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(sale)} disabled>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)} disabled>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

