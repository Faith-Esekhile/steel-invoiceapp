
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Download, Print } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'> & {
  clients?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    address: string | null;
  };
};

interface InvoiceViewProps {
  invoice: Invoice;
  onBack: () => void;
  onEdit: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, onBack, onEdit }) => {
  const { user } = useAuth();

  // Fetch company info
  const { data: companyInfo } = useQuery({
    queryKey: ['company-info', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch invoice items
  const { data: invoiceItems = [] } = useQuery({
    queryKey: ['invoice-items', invoice.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, we'll just trigger print dialog
    // In a real app, you might want to generate a PDF
    handlePrint();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Print className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          {/* Company Header */}
          <div className="border-b pb-6 mb-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {companyInfo?.company_name || 'Your Company'}
                </h1>
                <p className="text-gray-600 mb-4">
                  {companyInfo?.tagline || 'Professional Services'}
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  {companyInfo?.address && <p>{companyInfo.address}</p>}
                  {companyInfo?.phone && <p>Phone: {companyInfo.phone}</p>}
                  {companyInfo?.email && <p>Email: {companyInfo.email}</p>}
                  {companyInfo?.website && <p>Website: {companyInfo.website}</p>}
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">INVOICE</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Invoice #:</span> {invoice.invoice_number}</p>
                  <p><span className="font-medium">Issue Date:</span> {formatDate(invoice.issue_date)}</p>
                  <p><span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{invoice.clients?.company_name || 'Client Name'}</p>
              {invoice.clients?.address && <p>{invoice.clients.address}</p>}
              {invoice.clients?.email && <p>{invoice.clients.email}</p>}
              {invoice.clients?.contact_name && <p>Contact: {invoice.clients.contact_name}</p>}
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.length > 0 ? (
                  invoiceItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-800">{item.description}</td>
                      <td className="py-3 px-4 text-right text-gray-800">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-800">Professional Services</td>
                    <td className="py-3 px-4 text-right text-gray-800">1</td>
                    <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(invoice.subtotal)}</td>
                    <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Tax:</span>
                    <span className="text-gray-900">{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {invoice.notes && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Information */}
          {companyInfo?.bank_name && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p><span className="font-medium">Bank:</span> {companyInfo.bank_name}</p>
                  <p><span className="font-medium">Account Name:</span> {companyInfo.account_name}</p>
                </div>
                <div>
                  <p><span className="font-medium">Account Number:</span> {companyInfo.account_number}</p>
                  <p><span className="font-medium">Sort Code:</span> {companyInfo.sort_code}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 mt-8 text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p className="mt-2">
              {companyInfo?.company_name || 'Your Company'} - Professional Invoice Management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceView;
