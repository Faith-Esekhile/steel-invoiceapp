
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;
type Client = Tables<'clients'>;
type InvoiceItem = Tables<'invoice_items'>;
type CompanyInfo = Tables<'company_info'>;

interface InvoiceViewProps {
  invoice: Invoice & {
    clients?: Client;
  };
  onBack: () => void;
  onEdit: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, onBack, onEdit }) => {
  const { toast } = useToast();

  const { data: client, isLoading: isClientLoading, error: clientError } = useQuery({
    queryKey: ['client', invoice.client_id],
    queryFn: async () => {
      if (!invoice.client_id) return null;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', invoice.client_id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!invoice.client_id,
  });

  const { data: items, isLoading: isItemsLoading, error: itemsError } = useQuery({
    queryKey: ['invoiceItems', invoice.id],
    queryFn: async () => {
      if (!invoice.id) return [];
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id);

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!invoice.id,
  });

  const { data: companyInfo, isLoading: isCompanyInfoLoading, error: companyInfoError } = useQuery({
    queryKey: ['companyInfo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    }
  });

  const generatePrintableHTML = (invoice: Invoice, client: Client | null, items: InvoiceItem[], companyInfo: CompanyInfo) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .invoice-container {
          width: 80%;
          margin: auto;
          background: #fff;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #ddd;
        }
        .company-info {
          text-align: left;
        }
        .company-info h1 {
          margin: 0;
          color: #333;
        }
        .company-info p {
          margin: 5px 0;
          color: #666;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details h2 {
          margin: 0;
          color: #333;
        }
        .invoice-details p {
          margin: 5px 0;
          color: #666;
        }
        .invoice-body {
          padding-top: 20px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th, .items-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .items-table th {
          background-color: #f4f4f4;
        }
        .total {
          text-align: right;
          font-size: 1.2em;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          color: #666;
        }
        .tagline {
          font-style: italic;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="company-info">
          <h1>${companyInfo?.company_name || 'Marvellous Steel Enterprise'}</h1>
          <p class="tagline">${companyInfo?.tagline || 'Steel Manufacturing & Fabrication'}</p>
          ${companyInfo?.address ? `<p>${companyInfo.address}</p>` : ''}
          ${companyInfo?.phone ? `<p>Phone: ${companyInfo.phone}</p>` : ''}
          ${companyInfo?.email ? `<p>Email: ${companyInfo.email}</p>` : ''}
          ${companyInfo?.website ? `<p>Website: ${companyInfo.website}</p>` : ''}
        </div>
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Date:</strong> ${format(new Date(invoice.issue_date), 'dd/MM/yyyy')}</p>
          <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), 'dd/MM/yyyy')}</p>
        </div>
      </div>

      <div class="invoice-body">
        <h2>Bill to:</h2>
        <p>${client?.company_name || 'N/A'}</p>
        <p>${client?.address || 'N/A'}</p>
        <p>Email: ${client?.email || 'N/A'}</p>
        <p>Phone: ${client?.phone || 'N/A'}</p>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.unit_price.toFixed(2)}</td>
                <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <strong>Total: $${invoice.total_amount.toFixed(2)}</strong>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>${companyInfo?.footer_text || 'Marvellous Steel Enterprise'}</p>
      </div>
    </body>
    </html>
    `;
  };

  const handlePrint = () => {
    if (!invoice || !client || !items || !companyInfo) {
      toast({
        title: 'Error',
        description: 'Invoice details are still loading.',
        variant: 'destructive',
      });
      return;
    }

    const printableContent = generatePrintableHTML(invoice, client, items, companyInfo);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printableContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      toast({
        title: 'Error',
        description: 'Please allow pop-ups to print the invoice.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!invoice || !client || !items || !companyInfo) {
      toast({
        title: 'Error',
        description: 'Invoice details are still loading.',
        variant: 'destructive',
      });
      return;
    }

    const printableContent = generatePrintableHTML(invoice, client, items, companyInfo);
    const blob = new Blob([printableContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoice.invoice_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isClientLoading || isItemsLoading || isCompanyInfoLoading) {
    return <div className="text-center p-4">Loading invoice details...</div>;
  }

  if (clientError || itemsError || companyInfoError) {
    return <div className="text-center p-4 text-red-500">Error loading invoice details.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
          <Button onClick={handleDownload}>Download</Button>
          <Button variant="secondary" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {companyInfo?.company_name || 'Marvellous Steel Enterprise'}
              </h1>
              <p className="text-gray-600 mb-4">
                {companyInfo?.tagline || 'Steel Manufacturing & Fabrication'}
              </p>
              <div>
                {companyInfo?.address && <p className="text-sm text-gray-500">{companyInfo.address}</p>}
                {companyInfo?.phone && <p className="text-sm text-gray-500">Phone: {companyInfo.phone}</p>}
                {companyInfo?.email && <p className="text-sm text-gray-500">Email: {companyInfo.email}</p>}
                {companyInfo?.website && <p className="text-sm text-gray-500">Website: {companyInfo.website}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-700">Invoice</h2>
              <p className="text-gray-500">Invoice Number: {invoice?.invoice_number}</p>
              <p className="text-gray-500">Issue Date: {format(new Date(invoice?.issue_date), 'PPP')}</p>
              <p className="text-gray-500">Due Date: {format(new Date(invoice?.due_date), 'PPP')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Bill to:</h3>
              <div className="text-gray-600">
                <div>{client?.company_name}</div>
                <div>{client?.address}</div>
                <div>{client?.email}</div>
                <div>{client?.phone}</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Summary:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">${item.unit_price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">${(item.quantity * item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-right mt-4">
            <h2 className="text-2xl font-bold">Total: ${invoice?.total_amount?.toFixed(2)}</h2>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceView;
