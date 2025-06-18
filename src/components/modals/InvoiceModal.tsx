
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Invoice = Tables<'invoices'>;
type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    client_id: '',
    issue_date: '',
    due_date: '',
    notes: '',
    status: 'draft' as InvoiceStatus,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Steel fabrication services', quantity: 1, unit_price: 1000, line_total: 1000 }
  ]);

  const { data: clients = [] } = useClients();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        setFormData({
          invoice_number: invoice.invoice_number,
          client_id: invoice.client_id,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          notes: invoice.notes || '',
          status: invoice.status as InvoiceStatus,
        });
        // For existing invoices, use actual data or default item
        setItems([{ description: 'Steel fabrication services', quantity: 1, unit_price: invoice.subtotal, line_total: invoice.subtotal }]);
      } else {
        // Generate invoice number
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        setFormData({
          invoice_number: invoiceNumber,
          client_id: '',
          issue_date: today,
          due_date: dueDate,
          notes: '',
          status: 'draft',
        });
        setItems([{ description: 'Steel fabrication services', quantity: 1, unit_price: 1000, line_total: 1000 }]);
      }
    }
  }, [invoice, isOpen]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const total_amount = subtotal; // No tax
    return { subtotal, tax_amount: 0, total_amount };
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate line total
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].line_total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    if (!formData.invoice_number.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invoice number",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, tax_amount, total_amount } = calculateTotals();
    
    try {
      if (invoice) {
        await updateInvoice.mutateAsync({
          id: invoice.id,
          ...formData,
          subtotal,
          tax_amount,
          total_amount,
        });
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        });
      } else {
        await createInvoice.mutateAsync({
          ...formData,
          subtotal,
          tax_amount,
          total_amount,
        });
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
      }
      onClose();
    } catch (error) {
      console.error('Invoice save error:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { subtotal, total_amount } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number" className="text-sm font-medium">Invoice Number *</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client_id" className="text-sm font-medium">Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date" className="text-sm font-medium">Issue Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="due_date" className="text-sm font-medium">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select value={formData.status} onValueChange={(value: InvoiceStatus) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-sm font-medium">Invoice Items</Label>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg">
                  <div className="col-span-5">
                    <Label className="text-sm">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Total</Label>
                    <Input
                      value={formatCurrency(item.line_total)}
                      readOnly
                      className="bg-gray-50 mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="space-y-2 text-right">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total_amount)}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or terms..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={createInvoice.isPending || updateInvoice.isPending}
            >
              {createInvoice.isPending || updateInvoice.isPending ? 
                'Saving...' : 
                (invoice ? 'Update Invoice' : 'Create Invoice')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
