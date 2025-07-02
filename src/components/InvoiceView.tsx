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

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const invoiceContent = document.getElementById('invoice-content')?.innerHTML || '';
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
                padding: 30px;
                background: #ffffff;
                color: #1f2937;
                line-height: 1.6;
                font-size: 14px;
              }
              
              .invoice-container {
                background: white;
                max-width: 850px;
                margin: 0 auto;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              
              .invoice-header {
                background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
                color: white;
                padding: 40px;
                position: relative;
              }
              
              .invoice-header::before {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 100px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                transform: translate(30px, -30px);
              }
              
              .header-content {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                position: relative;
                z-index: 1;
              }
              
              .company-info h1 {
                font-size: 28px;
                font-weight: 800;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
              }
              
              .company-info .tagline {
                font-size: 16px;
                opacity: 0.9;
                margin-bottom: 16px;
                font-weight: 500;
              }
              
              .company-info p {
                font-size: 14px;
                opacity: 0.85;
                margin-bottom: 4px;
              }
              
              .invoice-title {
                text-align: right;
              }
              
              .invoice-title h2 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
              }
              
              .invoice-title .invoice-number {
                font-size: 18px;
                opacity: 0.9;
                font-weight: 600;
              }
              
              .invoice-body {
                padding: 40px;
              }
              
              .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
                padding: 30px;
                background: #f8fafc;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
              }
              
              .bill-to h3, .invoice-info h3 {
                color: #1E40AF;
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 16px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
              }
              
              .bill-to p, .invoice-info p {
                margin-bottom: 8px;
                color: #4b5563;
                font-size: 14px;
              }
              
              .bill-to .company-name {
                font-weight: 700;
                color: #1f2937;
                font-size: 16px;
                margin-bottom: 6px;
              }
              
              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid #e5e7eb;
              }
              
              .invoice-table th {
                background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
                color: white;
                padding: 16px 12px;
                text-align: left;
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .invoice-table th:last-child {
                text-align: right;
              }
              
              .invoice-table td {
                padding: 16px 12px;
                border-bottom: 1px solid #e5e7eb;
                color: #4b5563;
                font-size: 14px;
              }
              
              .invoice-table td:last-child {
                text-align: right;
                font-weight: 600;
                color: #1f2937;
              }
              
              .invoice-table tr:nth-child(even) {
                background-color: #f9fafb;
              }
              
              .invoice-total {
                display: flex;
                justify-content: flex-end;
                margin: 30px 0;
              }
              
              .total-section {
                background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                min-width: 280px;
                text-align: center;
                box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.3);
              }
              
              .total-section h3 {
                font-size: 13px;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
                opacity: 0.9;
              }
              
              .total-amount {
                font-size: 18px;
                font-weight: 700;
                letter-spacing: -0.3px;
              }
              
              .payment-info {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 2px solid #2563eb;
                border-radius: 12px;
                padding: 30px;
                margin: 40px 0;
                page-break-inside: avoid;
              }
              
              .payment-info h3 {
                color: #1E40AF;
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 20px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .bank-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                max-width: 100%;
              }
              
              .bank-detail {
                text-align: center;
                padding: 16px 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #bfdbfe;
                min-height: 70px;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              
              .bank-detail .label {
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
                font-weight: 600;
              }
              
              .bank-detail .value {
                font-size: 14px;
                font-weight: 700;
                color: #1f2937;
                word-break: break-word;
              }
              
              .notes-section {
                margin-top: 40px;
                padding: 25px;
                background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                border-left: 5px solid #f59e0b;
                border-radius: 0 8px 8px 0;
                page-break-inside: avoid;
              }
              
              .notes-section h3 {
                color: #92400e;
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .notes-section p {
                color: #78350f;
                line-height: 1.6;
                font-size: 14px;
              }
              
              @media print {
                body {
                  background: white !important;
                  padding: 10px !important;
                }
                
                .invoice-container {
                  box-shadow: none !important;
                  border: 1px solid #000 !important;
                }
                
                .invoice-header {
                  background: #1E40AF !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .invoice-table th {
                  background: #1E40AF !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .total-section {
                  background: #1E40AF !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .payment-info {
                  background: #eff6ff !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .bank-details {
                  grid-template-columns: 1fr 1fr !important;
                  gap: 12px !important;
                }
                
                .bank-detail {
                  min-height: 60px !important;
                  padding: 12px 8px !important;
                }
              }
              
              @page {
                margin: 0.5in;
                size: A4;
              }
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

  const handleSendWhatsApp = () => {
    const clientPhone = invoice.clients?.phone;
    
    console.log('Raw client phone:', clientPhone);
    
    if (!clientPhone || clientPhone.trim() === '') {
      toast({
        title: "Phone Number Required",
        description: "Client phone number is required to send via WhatsApp. Please update the client information.",
        variant: "destructive",
      });
      return;
    }

    // More flexible phone number cleaning and validation
    let cleanPhone = clientPhone.replace(/[\s\-\(\)\+\.]/g, '');
    
    console.log('Phone after cleaning special chars:', cleanPhone);
    
    // Handle different phone number formats
    if (cleanPhone.startsWith('0')) {
      // Nigerian number starting with 0
      cleanPhone = '234' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('234')) {
      // Already has country code
      // Keep as is
    } else if (cleanPhone.length === 10 && /^[0-9]+$/.test(cleanPhone)) {
      // 10 digit number without country code
      cleanPhone = '234' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      // 11 digit number starting with 0
      cleanPhone = '234' + cleanPhone.substring(1);
    }
    
    console.log('Final cleaned phone number:', cleanPhone);
    
    // Validate the final phone number
    if (!/^234[0-9]{10}$/.test(cleanPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: `The phone number "${clientPhone}" appears to be invalid. Please check the client's phone number format.`,
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
    
    console.log('WhatsApp URL:', whatsappUrl);
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Opened",
      description: `Invoice details sent to WhatsApp for ${invoice.clients?.contact_name} (${cleanPhone})`,
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

      <Card className="steel-card">
        <CardContent className="p-8" id="invoice-content">
          <div className="invoice-container">
            <div className="invoice-header">
              <div className="header-content">
                <div className="company-info">
                  <h1>{companyInfo?.company_name || 'Marvellous Steel'}</h1>
                  <p className="tagline">{companyInfo?.tagline || 'Enterprise Solutions'}</p>
                  {companyInfo?.address && <p>{companyInfo.address}</p>}
                  {companyInfo?.phone && <p>Phone: {companyInfo.phone}</p>}
                  {companyInfo?.email && <p>Email: {companyInfo.email}</p>}
                </div>
                <div className="invoice-title">
                  <h2>INVOICE</h2>
                  <p className="invoice-number">#{invoice.invoice_number}</p>
                </div>
              </div>
            </div>
            
            <div className="invoice-body">
              <div className="invoice-details">
                <div className="bill-to">
                  <h3>Bill To</h3>
                  <p className="company-name">{invoice.clients?.company_name}</p>
                  <p>{invoice.clients?.contact_name}</p>
                  <p>{invoice.clients?.email}</p>
                  {invoice.clients?.phone && <p>Phone: {invoice.clients.phone}</p>}
                  {invoice.clients?.address && <p>{invoice.clients.address}</p>}
                </div>
                <div className="invoice-info">
                  <h3>Invoice Details</h3>
                  <p><strong>Issue Date:</strong> {formatDate(invoice.issue_date)}</p>
                  <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
                  <p><strong>Status:</strong> {invoice.status.toUpperCase()}</p>
                </div>
              </div>
              
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.length > 0 ? 
                    invoiceItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unit_price)}</td>
                        <td>{formatCurrency(item.line_total)}</td>
                      </tr>
                    )) : 
                    <tr>
                      <td>Steel fabrication services</td>
                      <td>1</td>
                      <td>{formatCurrency(invoice.subtotal)}</td>
                      <td>{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                  }
                </tbody>
              </table>
              
              <div className="invoice-total">
                <div className="total-section">
                  <h3>Total Amount</h3>
                  <div className="total-amount">{formatCurrency(invoice.total_amount)}</div>
                </div>
              </div>
              
              <div className="payment-info">
                <h3>Payment Information</h3>
                <div className="bank-details">
                  <div className="bank-detail">
                    <div className="label">Bank Name</div>
                    <div className="value">{companyInfo?.bank_name || 'Access Bank Plc'}</div>
                  </div>
                  <div className="bank-detail">
                    <div className="label">Account Name</div>
                    <div className="value">{companyInfo?.account_name || 'Marvellous Steel Enterprise'}</div>
                  </div>
                  <div className="bank-detail">
                    <div className="label">Account Number</div>
                    <div className="value">{companyInfo?.account_number || '0123456789'}</div>
                  </div>
                  <div className="bank-detail">
                    <div className="label">Sort Code</div>
                    <div className="value">{companyInfo?.sort_code || '044150149'}</div>
                  </div>
                </div>
              </div>
              
              {invoice.notes && (
                <div className="notes-section">
                  <h3>Notes</h3>
                  <p>{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceView;
