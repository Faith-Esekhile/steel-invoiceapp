
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit, Send } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useToast } from '@/hooks/use-toast';

type Invoice = Tables<'invoices'> & {
  clients?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    address?: string;
  };
};

interface InvoiceViewProps {
  invoice: Invoice;
  onBack: () => void;
  onEdit: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, onBack, onEdit }) => {
  const { data: invoiceItems = [] } = useInvoiceItems(invoice.id);
  const { data: companyInfo } = useCompanyInfo();
  const { toast } = useToast();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const invoiceContent = document.getElementById('invoice-content')?.innerHTML || '';
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .company-info { font-size: 18px; font-weight: bold; }
              .invoice-details { text-align: right; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .totals { text-align: right; margin-top: 20px; }
              .bank-details { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
            </style>
          </head>
          <body>
            ${invoiceContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendInvoice = async () => {
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Invoice Sent",
        description: `Invoice ${invoice.invoice_number} has been sent to ${invoice.clients?.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleSendInvoice}>
            <Send className="w-4 h-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      <Card className="steel-card">
        <CardContent className="p-8" id="invoice-content">
          {/* Invoice Header */}
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-600 mb-2">
                {companyInfo?.company_name || 'Marvellous Steel'}
              </h2>
              <p className="text-steel-600">{companyInfo?.tagline || 'Enterprise Solutions'}</p>
              {companyInfo?.address && <p className="text-steel-600 mt-1">{companyInfo.address}</p>}
              {companyInfo?.phone && <p className="text-steel-600">{companyInfo.phone}</p>}
              {companyInfo?.email && <p className="text-steel-600">{companyInfo.email}</p>}
            </div>
            <div className="text-right">
              <h3 className="text-xl font-semibold mb-2">INVOICE</h3>
              <p className="text-steel-600">#{invoice.invoice_number}</p>
            </div>
          </div>

          {/* Bill To & Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Bill To:</h4>
              <div className="text-steel-700">
                <p className="font-medium">{invoice.clients?.company_name}</p>
                <p>{invoice.clients?.contact_name}</p>
                <p>{invoice.clients?.email}</p>
                {invoice.clients?.address && <p>{invoice.clients.address}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Invoice Details:</h4>
              <div className="space-y-2 text-steel-700">
                <div className="flex justify-between">
                  <span>Issue Date:</span>
                  <span>{formatDate(invoice.issue_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span>{formatDate(invoice.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-steel-200">
                  <th className="text-left py-3 font-semibold text-gray-900">Description</th>
                  <th className="text-right py-3 font-semibold text-gray-900">Qty</th>
                  <th className="text-right py-3 font-semibold text-gray-900">Rate</th>
                  <th className="text-right py-3 font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.length > 0 ? (
                  invoiceItems.map((item) => (
                    <tr key={item.id} className="border-b border-steel-100">
                      <td className="py-3 text-steel-700">{item.description}</td>
                      <td className="py-3 text-right text-steel-700">{item.quantity}</td>
                      <td className="py-3 text-right text-steel-700">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 text-right text-steel-700">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-steel-100">
                    <td className="py-3 text-steel-700">Steel fabrication services</td>
                    <td className="py-3 text-right text-steel-700">1</td>
                    <td className="py-3 text-right text-steel-700">{formatCurrency(invoice.subtotal)}</td>
                    <td className="py-3 text-right text-steel-700">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="space-y-2">
                <div className="flex justify-between py-3 border-t-2 border-steel-200">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="mt-8 pt-6 border-t border-steel-200">
            <h4 className="font-semibold text-gray-900 mb-4">Payment Information:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Bank Name:</p>
                  <p className="text-gray-600">Access Bank Plc</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Account Name:</p>
                  <p className="text-gray-600">Marvellous Steel Enterprise</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Account Number:</p>
                  <p className="text-gray-600">0123456789</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Sort Code:</p>
                  <p className="text-gray-600">044150149</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-steel-200">
              <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
              <p className="text-steel-700">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceView;
