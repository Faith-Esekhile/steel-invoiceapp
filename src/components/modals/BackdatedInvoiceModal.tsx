import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Search, UserPlus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useClients } from '@/hooks/useClients';
import { useInventory } from '@/hooks/useInventory';
import { useCreateBackdatedInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { useCreateInvoiceItems } from '@/hooks/useInvoiceItems';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import ClientModal from './ClientModal';

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
  inventory_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface BackdatedInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
}

type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

const BackdatedInvoiceModal: React.FC<BackdatedInvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const [formData, setFormData] = useState<{
    client_id: string;
    invoice_number: string;
    issue_date: Date;
    due_date: Date;
    notes: string;
    status: InvoiceStatus;
  }>({
    client_id: '',
    invoice_number: '',
    issue_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: '',
    status: 'draft'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', inventory_name: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }
  ]);

  const [clientSearch, setClientSearch] = useState('');
  const [inventorySearches, setInventorySearches] = useState<Record<string, string>>({});
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const { data: clients = [] } = useClients();
  const { data: inventory = [] } = useInventory();
  const createBackdatedInvoice = useCreateBackdatedInvoice();
  const updateInvoice = useUpdateInvoice();
  const createInvoiceItems = useCreateInvoiceItems();
  const { toast } = useToast();

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.contact_name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Filter inventory based on search (don't check availability for backdated invoices)
  const getFilteredInventory = (searchTerm: string) => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  useEffect(() => {
    if (invoice && isOpen) {
      setFormData({
        client_id: invoice.client_id,
        invoice_number: invoice.invoice_number,
        issue_date: new Date(invoice.issue_date),
        due_date: new Date(invoice.due_date),
        notes: invoice.notes || '',
        status: invoice.status as InvoiceStatus
      });
      
      setItems([{
        id: '1',
        inventory_name: '',
        description: 'Steel fabrication services',
        quantity: 1,
        unit_price: invoice.subtotal,
        line_total: invoice.subtotal
      }]);
    } else if (!invoice && isOpen) {
      const invoiceCount = Date.now().toString().slice(-4);
      setFormData({
        client_id: '',
        invoice_number: `BD-INV-${invoiceCount}`,
        issue_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: '',
        status: 'draft'
      });
      setItems([{ id: '1', inventory_name: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
      setInventorySearches({});
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
      setItems(prevItems => prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            inventory_name: inventoryItem.name,
            description: inventoryItem.name,
            unit_price: inventoryItem.unit_price,
            line_total: calculateItemTotal(item.quantity, inventoryItem.unit_price)
          };
          return updatedItem;
        }
        return item;
      }));
      
      setInventorySearches(prev => ({
        ...prev,
        [itemId]: ''
      }));
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      inventory_name: '',
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
      setInventorySearches(prev => {
        const newSearches = { ...prev };
        delete newSearches[id];
        return newSearches;
      });
    }
  };

  const validateItems = () => {
    for (const item of items) {
      if (!item.description || item.quantity <= 0 || item.unit_price <= 0) {
        return false;
      }
    }
    return true;
  };

  const handleAddNewClient = () => {
    setIsClientModalOpen(true);
    setIsClientDropdownOpen(false);
  };

  const handleClientModalClose = () => {
    setIsClientModalOpen(false);
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

    if (!invoice && !validateItems()) {
      toast({
        title: "Error",
        description: "Please fill in all item details",
        variant: "destructive",
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const invoiceData = {
      client_id: formData.client_id,
      invoice_number: formData.invoice_number,
      issue_date: format(formData.issue_date, 'yyyy-MM-dd'),
      due_date: format(formData.due_date, 'yyyy-MM-dd'),
      notes: formData.notes,
      status: formData.status,
      subtotal: subtotal,
      tax_amount: 0,
      total_amount: subtotal,
      is_backdated: true
    };

    try {
      let invoiceId: string;

      if (invoice) {
        const updatedInvoice = await updateInvoice.mutateAsync({ 
          id: invoice.id, 
          ...invoiceData
        });
        invoiceId = invoice.id;
      } else {
        const newInvoice = await createBackdatedInvoice.mutateAsync(invoiceData);
        invoiceId = newInvoice.id;
        
        // Create invoice items (no inventory reduction for backdated invoices)
        const invoiceItems = items.map(item => ({
          invoice_id: invoiceId,
          inventory_item_id: null, // Backdated invoices don't link to current inventory
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total
        }));
        
        await createInvoiceItems.mutateAsync(invoiceItems);
      }

      toast({
        title: "Success",
        description: invoice ? "Backdated invoice updated successfully" : "Backdated invoice created successfully",
      });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save backdated invoice",
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {invoice ? 'Edit Backdated Invoice' : 'Create New Backdated Invoice'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-blue-800 text-sm font-medium">
                  Backdated invoices use inventory item names but don't reduce current stock quantities.
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client *</Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setIsClientDropdownOpen(true);
                      }}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      className="pl-10"
                    />
                  </div>
                  {isClientDropdownOpen && clientSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        <>
                          {filteredClients.map((client) => (
                            <div
                              key={client.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setFormData({ ...formData, client_id: client.id });
                                setClientSearch(client.company_name);
                                setIsClientDropdownOpen(false);
                              }}
                            >
                              <div className="font-medium">{client.company_name}</div>
                              <div className="text-sm text-gray-600">{client.contact_name}</div>
                            </div>
                          ))}
                          <div
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 text-blue-600 font-medium flex items-center"
                            onClick={handleAddNewClient}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add New Client
                          </div>
                        </>
                      ) : (
                        <div
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-blue-600 font-medium flex items-center"
                          onClick={handleAddNewClient}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add New Client
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {!clientSearch && (
                  <Select value={formData.client_id} onValueChange={(value) => {
                    setFormData({ ...formData, client_id: value });
                    const selectedClient = clients.find(c => c.id === value);
                    if (selectedClient) {
                      setClientSearch(selectedClient.company_name);
                    }
                  }}>
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
                )}
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
                      className="p-3 pointer-events-auto"
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
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value: InvoiceStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-medium">Line Items</Label>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4">
                        <Label>Item</Label>
                        <div className="relative">
                          <Input
                            placeholder="Search inventory..."
                            value={inventorySearches[item.id] || item.inventory_name || ''}
                            onChange={(e) => {
                              setInventorySearches(prev => ({
                                ...prev,
                                [item.id]: e.target.value
                              }));
                            }}
                          />
                          {inventorySearches[item.id] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {getFilteredInventory(inventorySearches[item.id]).map((inventoryItem) => (
                                <div
                                  key={inventoryItem.id}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleInventorySelect(item.id, inventoryItem.id)}
                                >
                                  <div className="font-medium">{inventoryItem.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {formatCurrency(inventoryItem.unit_price)} - Available: {inventoryItem.quantity}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <Input
                          type="text"
                          value={formatCurrency(item.line_total)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Description</Label>
                      <Input
                        placeholder="Item description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-medium">
                    Total: {formatCurrency(calculateSubtotal())}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {invoice ? 'Update' : 'Create'} Backdated Invoice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={handleClientModalClose}
      />
    </>
  );
};

export default BackdatedInvoiceModal;