
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit, Send } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'> & {
  clients?: {
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
    // PDF generation functionality would go here
    console.log('Generating PDF for invoice:', invoice.id);
  };

  const handleSendInvoice = () => {
    // Email sending functionality would go here
    console.log('Sending invoice:', invoice.id);
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
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-600 mb-2">Marvellous Steel</h2>
              <p className="text-steel-600">Enterprise Solutions</p>
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
                <tr className="border-b border-steel-100">
                  <td className="py-3 text-steel-700">Steel fabrication services</td>
                  <td className="py-3 text-right text-steel-700">1</td>
                  <td className="py-3 text-right text-steel-700">{formatCurrency(invoice.subtotal)}</td>
                  <td className="py-3 text-right text-steel-700">{formatCurrency(invoice.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-steel-700">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-steel-700">Tax:</span>
                  <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-steel-200">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
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
