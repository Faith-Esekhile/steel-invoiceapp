
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
    status: 'draft' as const,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, line_total: 0 }
  ]);

  const { data: clients = [] } = useClients();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { toast } = useToast();

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        notes: invoice.notes || '',
        status: invoice.status as 'draft' | 'pending' | 'paid' | 'overdue',
      });
    } else {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      setFormData({
        invoice_number: invoiceNumber,
        client_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        status: 'draft',
      });
      setItems([{ description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
    }
  }, [invoice, isOpen]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const tax_amount = subtotal * 0.1; // 10% tax
    const total_amount = subtotal + tax_amount;
    return { subtotal, tax_amount, total_amount };
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
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { subtotal, tax_amount, total_amount } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_id">Client</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'draft' | 'pending' | 'paid' | 'overdue') => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
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
              <Label>Invoice Items</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={item.line_total.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={createInvoice.isPending || updateInvoice.isPending}
            >
              {createInvoice.isPending || updateInvoice.isPending ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
