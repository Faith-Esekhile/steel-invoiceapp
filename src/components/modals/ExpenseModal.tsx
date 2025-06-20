
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateExpense, useUpdateExpense } from '@/hooks/useCompanyExpenses';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type CompanyExpense = Tables<'company_expenses'>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: CompanyExpense | null;
}

const categories = [
  'Office Supplies',
  'Marketing',
  'Travel',
  'Utilities',
  'Equipment',
  'Other'
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, expense }) => {
  const [formData, setFormData] = useState({
    expense_name: '',
    amount: '',
    category: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const { toast } = useToast();

  useEffect(() => {
    if (expense) {
      setFormData({
        expense_name: expense.expense_name,
        amount: expense.amount.toString(),
        category: expense.category || '',
        description: expense.description || '',
        expense_date: expense.expense_date
      });
    } else {
      setFormData({
        expense_name: '',
        amount: '',
        category: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expense_name || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const expenseData = {
      expense_name: formData.expense_name,
      amount: parseFloat(formData.amount),
      category: formData.category || null,
      description: formData.description || null,
      expense_date: formData.expense_date
    };

    try {
      if (expense) {
        await updateExpense.mutateAsync({ id: expense.id, ...expenseData });
        toast({
          title: "Success",
          description: "Expense updated successfully!",
        });
      } else {
        await createExpense.mutateAsync(expenseData);
        toast({
          title: "Success",
          description: "Expense created successfully!",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_name">Expense Name *</Label>
              <Input
                id="expense_name"
                value={formData.expense_name}
                onChange={(e) => setFormData({ ...formData, expense_name: e.target.value })}
                placeholder="Enter expense name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expense_date">Expense Date</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createExpense.isPending || updateExpense.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createExpense.isPending || updateExpense.isPending ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
