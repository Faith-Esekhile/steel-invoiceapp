
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
    phone?: string;
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

  const generatePDFContent = () => {
    return `
      <div class="invoice-header">
        <div class="company-info">
          <h1>${companyInfo?.company_name || 'Marvellous Steel'}</h1>
          <p class="tagline">${companyInfo?.tagline || 'Enterprise Solutions'}</p>
          ${companyInfo?.address ? `<p>${companyInfo.address}</p>` : ''}
          ${companyInfo?.phone ? `<p>Phone: ${companyInfo.phone}</p>` : ''}
          ${companyInfo?.email ? `<p>Email: ${companyInfo.email}</p>` : ''}
        </div>
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p class="invoice-number">#${invoice.invoice_number}</p>
        </div>
      </div>
      
      <div class="invoice-details">
        <div class="detail-section">
          <h3>BILL TO</h3>
          <p class="company-name">${invoice.clients?.company_name}</p>
          <p>${invoice.clients?.contact_name}</p>
          <p>${invoice.clients?.email}</p>
          ${invoice.clients?.phone ? `<p>Phone: ${invoice.clients.phone}</p>` : ''}
          ${invoice.clients?.address ? `<p>${invoice.clients.address}</p>` : ''}
        </div>
        <div class="detail-section">
          <h3>INVOICE DETAILS</h3>
          <p><strong>Issue Date:</strong> ${formatDate(invoice.issue_date)}</p>
          <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
          <p><strong>Status:</strong> 
            <span class="status-badge status-${invoice.status}">
              ${invoice.status.toUpperCase()}
            </span>
          </p>
        </div>
      </div>
      
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceItems.length > 0 ? 
            invoiceItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${formatCurrency(item.line_total)}</td>
              </tr>
            `).join('') : 
            `<tr>
              <td>Steel fabrication services</td>
              <td>1</td>
              <td>${formatCurrency(invoice.subtotal)}</td>
              <td>${formatCurrency(invoice.subtotal)}</td>
            </tr>`
          }
        </tbody>
      </table>
      
      <div class="invoice-total">
        <div class="total-section">
          <h3>Total Amount</h3>
          <div class="total-amount">${formatCurrency(invoice.total_amount)}</div>
        </div>
      </div>
      
      <div class="payment-info">
        <h3>PAYMENT INFORMATION</h3>
        <div class="bank-details">
          <div class="bank-detail">
            <div class="label">BANK NAME</div>
            <div class="value">${companyInfo?.bank_name || 'Access Bank Plc'}</div>
          </div>
          <div class="bank-detail">
            <div class="label">ACCOUNT NAME</div>
            <div class="value">${companyInfo?.account_name || 'Marvellous Steel Enterprise'}</div>
          </div>
          <div class="bank-detail">
            <div class="label">ACCOUNT NUMBER</div>
            <div class="value">${companyInfo?.account_number || '0123456789'}</div>
          </div>
          <div class="bank-detail">
            <div class="label">SORT CODE</div>
            <div class="value">${companyInfo?.sort_code || '044150149'}</div>
          </div>
        </div>
      </div>
      
      ${invoice.notes ? `
        <div class="notes-section">
          <h3>Notes</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}
    `;
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const invoiceContent = generatePDFContent();
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 20px;
                background: #f9fafb;
                color: #1f2937;
                line-height: 1.6;
                font-size: 14px;
              }
              
              .invoice-container {
                background: white;
                max-width: 800px;
                margin: 0 auto;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
                padding: 32px;
              }
              
              .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 32px;
                padding-bottom: 24px;
                border-bottom: 2px solid #dbeafe;
              }
              
              .company-info h1 {
                font-size: 24px;
                font-weight: 700;
                color: #1e40af;
                margin-bottom: 8px;
              }
              
              .company-info .tagline {
                color: #6b7280;
                margin-bottom: 16px;
                font-size: 14px;
              }
              
              .company-info p {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 4px;
              }
              
              .invoice-title {
                text-align: right;
              }
              
              .invoice-title h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1e40af;
                margin-bottom: 8px;
              }
              
              .invoice-title .invoice-number {
                font-size: 18px;
                color: #4b5563;
              }
              
              .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 32px;
                margin-bottom: 32px;
              }
              
              .detail-section {
                background: #f9fafb;
                padding: 24px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              }
              
              .detail-section h3 {
                color: #1e40af;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 16px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .detail-section p {
                margin-bottom: 8px;
                color: #4b5563;
                font-size: 14px;
              }
              
              .detail-section .company-name {
                font-weight: 600;
                color: #1f2937;
                font-size: 16px;
                margin-bottom: 8px;
              }
              
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .status-paid { background: #dcfce7; color: #166534; }
              .status-pending { background: #fef3c7; color: #92400e; }
              .status-overdue { background: #fee2e2; color: #991b1b; }
              .status-draft { background: #f3f4f6; color: #374151; }
              
              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 32px 0;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                overflow: hidden;
              }
              
              .invoice-table th {
                background: #1e40af;
                color: white;
                padding: 12px 16px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                border: none;
              }
              
              .invoice-table th:last-child {
                text-align: right;
              }
              
              .invoice-table td {
                padding: 12px 16px;
                border-bottom: 1px solid #e5e7eb;
                color: #4b5563;
                font-size: 14px;
                border-left: none;
                border-right: none;
              }
              
              .invoice-table td:last-child {
                text-align: right;
                font-weight: 600;
                color: #1f2937;
              }
              
              .invoice-table tbody tr:nth-child(even) {
                background-color: #f9fafb;
              }
              
              .invoice-table tbody tr:hover {
                background-color: #f3f4f6;
              }
              
              .invoice-total {
                display: flex;
                justify-content: flex-end;
                margin: 32px 0;
              }
              
              .total-section {
                background: #1e40af;
                color: white;
                padding: 24px;
                border-radius: 8px;
                min-width: 280px;
                text-align: center;
              }
              
              .total-section h3 {
                font-size: 14px;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                opacity: 0.9;
                font-weight: 600;
              }
              
              .total-amount {
                font-size: 24px;
                font-weight: 700;
              }
              
              .payment-info {
                background: #eff6ff;
                border: 2px solid #2563eb;
                border-radius: 8px;
                padding: 24px;
                margin: 32px 0;
              }
              
              .payment-info h3 {
                color: #1e40af;
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 16px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .bank-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
              }
              
              .bank-detail {
                text-align: center;
                padding: 16px;
                background: white;
                border-radius: 6px;
                border: 1px solid #bfdbfe;
              }
              
              .bank-detail .label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                font-weight: 600;
              }
              
              .bank-detail .value {
                font-size: 14px;
                font-weight: 700;
                color: #1f2937;
              }
              
              .notes-section {
                margin-top: 32px;
                padding: 20px;
                background: #fffbeb;
                border-left: 4px solid #f59e0b;
                border-radius: 0 6px 6px 0;
              }
              
              .notes-section h3 {
                color: #92400e;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 8px;
              }
              
              .notes-section p {
                color: #78350f;
                font-size: 14px;
                line-height: 1.5;
              }
              
              @media print {
                body { 
                  background: white !important; 
                  padding: 10px !important; 
                }
                .invoice-container { 
                  box-shadow: none !important; 
                  border: none !important;
                }
              }
              
              @page { 
                margin: 0.5in; 
                size: A4; 
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${invoiceContent}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendWhatsApp = () => {
    const clientPhone = invoice.clients?.phone;
    
    console.log('Client phone from database:', clientPhone);
    
    if (!clientPhone || clientPhone.trim() === '') {
      toast({
        title: "Phone Number Required",
        description: "Client phone number is required to send via WhatsApp. Please update the client information.",
        variant: "destructive",
      });
      return;
    }

    // Clean and format the phone number
    let cleanPhone = clientPhone.replace(/[\s\-\(\)\+\.]/g, '');
    
    console.log('Phone after removing special characters:', cleanPhone);
    
    // Handle different Nigerian phone number formats
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      // Nigerian number starting with 0 (e.g., 08012345678)
      cleanPhone = '234' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('234')) {
      // Already has country code (e.g., 2348012345678)
      // Keep as is
    } else if (cleanPhone.length === 10 && /^[78][01]/.test(cleanPhone)) {
      // 10 digit number starting with 7 or 8 (e.g., 8012345678)
      cleanPhone = '234' + cleanPhone;
    } else if (cleanPhone.length === 11 && /^[78][01]/.test(cleanPhone.substring(1))) {
      // 11 digit number where second digit starts with 7 or 8
      cleanPhone = '234' + cleanPhone.substring(1);
    }
    
    console.log('Final formatted phone number:', cleanPhone);
    
    // Basic validation - should be 234 followed by 10 digits
    if (!/^234[0-9]{10}$/.test(cleanPhone)) {
      console.log('Phone validation failed for:', cleanPhone);
      toast({
        title: "Invalid Phone Number Format",
        description: `Unable to format phone number "${clientPhone}". Please ensure it's a valid Nigerian number (e.g., 08012345678 or +2348012345678).`,
        variant: "destructive",
      });
      return;
    }
    
    // Create WhatsApp message
    const message = `Hello ${invoice.clients?.contact_name || 'there'}!

Your invoice is ready:

🧾 Invoice #: ${invoice.invoice_number}
💰 Amount: ${formatCurrency(invoice.total_amount)}
📅 Due Date: ${formatDate(invoice.due_date)}

📞 ${companyInfo?.company_name || 'Marvellous Steel'}
${companyInfo?.phone ? `Phone: ${companyInfo.phone}` : ''}
${companyInfo?.email ? `Email: ${companyInfo.email}` : ''}

Thank you for your business! 🙏`;

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('Opening WhatsApp URL:', whatsappUrl);
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Opened",
      description: `Invoice details sent to WhatsApp for ${invoice.clients?.contact_name} (+${cleanPhone})`,
    });
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
          <Button onClick={handleSendWhatsApp} className="bg-green-600 hover:bg-green-700">
            <Send className="w-4 h-4 mr-2" />
            Send via WhatsApp
          </Button>
        </div>
      </div>

      {/* Company Header Card */}
      <Card className="steel-card">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-blue-100">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 mb-2">
                {companyInfo?.company_name || 'Marvellous Steel'}
              </h1>
              <p className="text-gray-600 mb-4">
                {companyInfo?.tagline || 'Enterprise Solutions'}
              </p>
              {companyInfo?.address && <p className="text-sm text-gray-600">{companyInfo.address}</p>}
              {companyInfo?.phone && <p className="text-sm text-gray-600">Phone: {companyInfo.phone}</p>}
              {companyInfo?.email && <p className="text-sm text-gray-600">Email: {companyInfo.email}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold text-blue-700 mb-2">INVOICE</h2>
              <p className="text-xl text-gray-600">#{invoice.invoice_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="steel-card">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-blue-700 text-lg font-semibold uppercase tracking-wide">
              Bill To
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {invoice.clients?.company_name}
            </h3>
            <p className="text-gray-700 mb-1">{invoice.clients?.contact_name}</p>
            <p className="text-gray-700 mb-1">{invoice.clients?.email}</p>
            {invoice.clients?.phone && (
              <p className="text-gray-700 mb-1">Phone: {invoice.clients.phone}</p>
            )}
            {invoice.clients?.address && (
              <p className="text-gray-700">{invoice.clients.address}</p>
            )}
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-blue-700 text-lg font-semibold uppercase tracking-wide">
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Issue Date:</span>
                <span className="text-gray-900">{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Due Date:</span>
                <span className="text-gray-900">{formatDate(invoice.due_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Status:</span>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table Card */}
      <Card className="steel-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Description</th>
                  <th className="px-6 py-4 text-left font-semibold">Qty</th>
                  <th className="px-6 py-4 text-left font-semibold">Rate</th>
                  <th className="px-6 py-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.length > 0 ? 
                  invoiceItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 text-gray-700">{item.description}</td>
                      <td className="px-6 py-4 text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-700">{formatCurrency(item.unit_price)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  )) : 
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">Steel fabrication services</td>
                    <td className="px-6 py-4 text-gray-700">1</td>
                    <td className="px-6 py-4 text-gray-700">{formatCurrency(invoice.subtotal)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Total Card */}
      <div className="flex justify-end">
        <Card className="bg-blue-700 text-white min-w-80">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide opacity-90">
              Total Amount
            </h3>
            <div className="text-3xl font-bold">
              {formatCurrency(invoice.total_amount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Information Card */}
      <Card className="steel-card border-2 border-blue-200 bg-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-blue-700 text-xl font-bold uppercase tracking-wide">
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                Bank Name
              </div>
              <div className="font-bold text-gray-900">
                {companyInfo?.bank_name || 'Access Bank Plc'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                Account Name
              </div>
              <div className="font-bold text-gray-900">
                {companyInfo?.account_name || 'Marvellous Steel Enterprise'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                Account Number
              </div>
              <div className="font-bold text-gray-900">
                {companyInfo?.account_number || '0123456789'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                Sort Code
              </div>
              <div className="font-bold text-gray-900">
                {companyInfo?.sort_code || '044150149'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Card */}
      {invoice.notes && (
        <Card className="steel-card border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-lg font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceView;
