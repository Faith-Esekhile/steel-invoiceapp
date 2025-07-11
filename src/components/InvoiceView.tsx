import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Download, Printer } from 'lucide-react';
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

  // Add print styles when component mounts
  useEffect(() => {
    const printStyles = `
      <style id="invoice-print-styles">
        @media print {
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          body * { visibility: hidden; }
          .invoice-print-content, .invoice-print-content * { visibility: visible; }
          .invoice-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .print\\:hidden { display: none !important; }
          .invoice-header-bg { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important; }
          .invoice-blue-accent { background: #1e40af !important; }
          .invoice-blue-text { color: #1e40af !important; }
          .invoice-blue-border { border-color: #1e40af !important; }
        }
      </style>
    `;
    
    // Remove existing print styles
    const existingStyles = document.getElementById('invoice-print-styles');
    if (existingStyles) {
      existingStyles.remove();
    }
    
    // Add new print styles
    document.head.insertAdjacentHTML('beforeend', printStyles);
    
    return () => {
      const styles = document.getElementById('invoice-print-styles');
      if (styles) {
        styles.remove();
      }
    };
  }, []);

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
    <div className="min-h-screen bg-gray-50 p-6 space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button onClick={onEdit} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Edit className="w-4 h-4" />
            Edit Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-print-content">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Header with Blue Gradient */}
          <div className="invoice-header-bg bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {companyInfo?.company_name || 'Your Company'}
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {companyInfo?.tagline ? companyInfo.tagline.replace(' Solutions', '') : 'Professional Services'}
                </p>
                <div className="text-sm text-blue-100 space-y-1">
                  {companyInfo?.address && <p>{companyInfo.address}</p>}
                  {companyInfo?.phone && <p>Phone: {companyInfo.phone}</p>}
                  {companyInfo?.email && <p>Email: {companyInfo.email}</p>}
                  {companyInfo?.website && <p>Website: {companyInfo.website}</p>}
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-3xl font-bold mb-4">INVOICE</h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="font-medium">Invoice #:</span> {invoice.invoice_number}</p>
                  <p><span className="font-medium">Issue Date:</span> {formatDate(invoice.issue_date)}</p>
                  <p><span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Bill To Section */}
            <div className="mb-8">
              <div className="invoice-blue-accent bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                <h3 className="text-lg font-semibold">Bill To:</h3>
              </div>
              <div className="border border-blue-200 border-t-0 rounded-b-lg p-4 bg-blue-50/30">
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium text-lg invoice-blue-text text-blue-800">{invoice.clients?.company_name || 'Client Name'}</p>
                  {invoice.clients?.address && <p>{invoice.clients.address}</p>}
                  {invoice.clients?.email && <p>{invoice.clients.email}</p>}
                  {invoice.clients?.contact_name && <p>Contact: {invoice.clients.contact_name}</p>}
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8 overflow-hidden rounded-lg border border-blue-200">
              <table className="w-full">
                <thead>
                  <tr className="invoice-blue-accent bg-blue-600 text-white">
                    <th className="text-left py-4 px-6 font-semibold">Description</th>
                    <th className="text-right py-4 px-6 font-semibold">Qty</th>
                    <th className="text-right py-4 px-6 font-semibold">Unit Price</th>
                    <th className="text-right py-4 px-6 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.length > 0 ? (
                    invoiceItems.map((item, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'} border-b border-blue-100`}>
                        <td className="py-4 px-6 text-gray-800">{item.description}</td>
                        <td className="py-4 px-6 text-right text-gray-800">{item.quantity}</td>
                        <td className="py-4 px-6 text-right text-gray-800">{formatCurrency(item.unit_price)}</td>
                        <td className="py-4 px-6 text-right text-gray-800 font-medium">{formatCurrency(item.line_total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-blue-50/30 border-b border-blue-100">
                      <td className="py-4 px-6 text-gray-800">Professional Services</td>
                      <td className="py-4 px-6 text-right text-gray-800">1</td>
                      <td className="py-4 px-6 text-right text-gray-800">{formatCurrency(invoice.subtotal)}</td>
                      <td className="py-4 px-6 text-right text-gray-800 font-medium">{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="space-y-2">
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between py-1 text-gray-700">
                        <span>Tax:</span>
                        <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 font-bold text-xl">
                      <span className="invoice-blue-text text-blue-800">Total:</span>
                      <span className="invoice-blue-text text-blue-800">{formatCurrency(invoice.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {invoice.notes && (
              <div className="mb-8">
                <div className="invoice-blue-accent bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                  <h3 className="text-lg font-semibold">Notes:</h3>
                </div>
                <div className="border border-blue-200 border-t-0 rounded-b-lg p-4 bg-blue-50/30">
                  <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {companyInfo?.bank_name && (
              <div className="mb-8">
                <div className="invoice-blue-accent bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                  <h3 className="text-lg font-semibold">Payment Information:</h3>
                </div>
                <div className="border border-blue-200 border-t-0 rounded-b-lg p-4 bg-blue-50/30">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p><span className="font-medium invoice-blue-text text-blue-700">Bank:</span> {companyInfo.bank_name}</p>
                      <p><span className="font-medium invoice-blue-text text-blue-700">Account Name:</span> {companyInfo.account_name}</p>
                    </div>
                    <div>
                      <p><span className="font-medium invoice-blue-text text-blue-700">Account Number:</span> {companyInfo.account_number}</p>
                      <p><span className="font-medium invoice-blue-text text-blue-700">Sort Code:</span> {companyInfo.sort_code}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 border-t border-blue-200 pt-6">
              <p className="font-medium invoice-blue-text text-blue-700">Thank you for your business!</p>
              <p className="mt-2">
                {companyInfo?.company_name || 'Your Company'} - Professional Invoice Management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
