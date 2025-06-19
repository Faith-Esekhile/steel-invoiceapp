import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useClients } from '@/hooks/useClients';
import { useInventory } from '@/hooks/useInventory';
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { useCreateInvoiceItems, useUpdateInventoryQuantity } from '@/hooks/useInvoiceItems';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'> & {
  clients?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    address?: string;
  };
};

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  inventory_id?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '',
    issue_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: '',
    status: 'draft' as 'draft' | 'pending' | 'paid' | 'overdue'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, line_total: 0 }
  ]);

  const { data: clients = [] } = useClients();
  const { data: inventory = [] } = useInventory();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const createInvoiceItems = useCreateInvoiceItems();
  const updateInventoryQuantity = useUpdateInventoryQuantity();
  const { toast } = useToast();

  useEffect(() => {
    if (invoice && isOpen) {
      console.log('Loading invoice data:', invoice);
      setFormData({
        client_id: invoice.client_id,
        invoice_number: invoice.invoice_number,
        issue_date: new Date(invoice.issue_date),
        due_date: new Date(invoice.due_date),
        notes: invoice.notes || '',
        status: invoice.status as 'draft' | 'pending' | 'paid' | 'overdue'
      });
      
      // For existing invoices, show a simple line item based on subtotal
      setItems([{
        id: '1',
        description: 'Steel fabrication services',
        quantity: 1,
        unit_price: invoice.subtotal,
        line_total: invoice.subtotal
      }]);
    } else if (!invoice && isOpen) {
      const invoiceCount = Date.now().toString().slice(-4);
      setFormData({
        client_id: '',
        invoice_number: `INV-${invoiceCount}`,
        issue_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: '',
        status: 'draft'
      });
      setItems([{ id: '1', description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
    }
  }, [invoice, isOpen]);

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.line_total, 0);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.line_total = calculateItemTotal(
            field === 'quantity' ? Number(value) : updatedItem.quantity,
            field === 'unit_price' ? Number(value) : updatedItem.unit_price
          );
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleInventorySelect = (itemId: string, inventoryItemId: string) => {
    const inventoryItem = inventory.find(item => item.id === inventoryItemId);
    if (inventoryItem) {
      handleItemChange(itemId, 'description', inventoryItem.name);
      handleItemChange(itemId, 'unit_price', inventoryItem.unit_price);
      
      // Store inventory_id for quantity reduction
      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, inventory_id: inventoryItemId }
          : item
      ));
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      line_total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtotal = calculateSubtotal();
    const invoiceData = {
      client_id: formData.client_id,
      invoice_number: formData.invoice_number,
      issue_date: format(formData.issue_date, 'yyyy-MM-dd'),
      due_date: format(formData.due_date, 'yyyy-MM-dd'),
      notes: formData.notes,
      status: formData.status, // Ensure status is explicitly passed
      subtotal: subtotal,
      tax_amount: 0,
      total_amount: subtotal
    };

    try {
      let invoiceId: string;

      if (invoice) {
        // Update existing invoice - ensure status is properly updated
        console.log('Updating invoice with data:', invoiceData);
        console.log('Status being updated to:', formData.status);
        
        const updatedInvoice = await updateInvoice.mutateAsync({ 
          id: invoice.id, 
          ...invoiceData
        });
        
        console.log('Invoice updated successfully:', updatedInvoice);
        invoiceId = invoice.id;
      } else {
        // Create new invoice
        const newInvoice = await createInvoice.mutateAsync(invoiceData);
        invoiceId = newInvoice.id;
        
        // Create invoice items
        const invoiceItems = items.map(item => ({
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total
        }));
        
        await createInvoiceItems.mutateAsync(invoiceItems);
        
        // Reduce inventory quantities for items that have inventory_id
        for (const item of items) {
          if (item.inventory_id && item.quantity > 0) {
            await updateInventoryQuantity.mutateAsync({
              inventoryId: item.inventory_id,
              quantityToReduce: item.quantity
            });
          }
        }
      }

      toast({
        title: "Success",
        description: invoice ? "Invoice updated successfully" : "Invoice created successfully",
      });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
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

            <div>
              <Label htmlFor="invoice_number">Invoice Number *</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Issue Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.issue_date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.issue_date}
                    onSelect={(date) => date && setFormData({ ...formData, issue_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.due_date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => date && setFormData({ ...formData, due_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'draft' | 'pending' | 'paid' | 'overdue') => {
                console.log('Status changing from', formData.status, 'to:', value);
                setFormData(prev => ({ ...prev, status: value }));
              }}
            >
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

          {/* Line Items - only show for new invoices */}
          {!invoice && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-semibold">Invoice Items</Label>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Item #{index + 1}</span>
                      {items.length > 1 && (
                        <Button 
                          type="button" 
                          onClick={() => removeItem(item.id)}
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${item.id}`}>Description *</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`description-${item.id}`}
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            required
                          />
                          {inventory.length > 0 && (
                            <Select onValueChange={(value) => handleInventorySelect(item.id, value)}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="From inventory" />
                              </SelectTrigger>
                              <SelectContent>
                                {inventory.map((inventoryItem) => (
                                  <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                                    {inventoryItem.name} - {formatCurrency(inventoryItem.unit_price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`unit_price-${item.id}`}>Unit Price (₦) *</Label>
                        <Input
                          id={`unit_price-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Line Total</Label>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(item.line_total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes for this invoice..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInvoice.isPending || updateInvoice.isPending}>
              {createInvoice.isPending || updateInvoice.isPending ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
