
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building, 
  CreditCard,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanyInfo, useUpdateCompanyInfo } from '@/hooks/useCompanyInfo';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { toast } = useToast();
  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateCompanyInfo = useUpdateCompanyInfo();

  const [companySettings, setCompanySettings] = useState({
    company_name: 'Marvellous Steel Enterprise',
    address: '123 Steel Avenue, Industrial District',
    phone: '+234 (0) 123-456-7890',
    email: 'info@marvellous-steel.com',
    website: 'www.marvellous-steel.com',
    tax_id: 'TAX123456789',
    bank_name: 'Access Bank Plc',
    account_name: 'Marvellous Steel Enterprise',
    account_number: '0123456789',
    sort_code: '044150149'
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    defaultDueDays: '30',
    invoicePrefix: 'INV-',
    nextInvoiceNumber: '001',
    defaultTerms: 'Payment due within 30 days of invoice date.',
    reminderDays: '7'
  });

  // Load company info when it's available
  useEffect(() => {
    if (companyInfo) {
      setCompanySettings({
        company_name: companyInfo.company_name || 'Marvellous Steel Enterprise',
        address: companyInfo.address || '123 Steel Avenue, Industrial District',
        phone: companyInfo.phone || '+234 (0) 123-456-7890',
        email: companyInfo.email || 'info@marvellous-steel.com',
        website: companyInfo.website || 'www.marvellous-steel.com',
        tax_id: companyInfo.tax_id || 'TAX123456789',
        bank_name: companyInfo.bank_name || 'Access Bank Plc',
        account_name: companyInfo.account_name || 'Marvellous Steel Enterprise',
        account_number: companyInfo.account_number || '0123456789',
        sort_code: companyInfo.sort_code || '044150149'
      });
    }
  }, [companyInfo]);


  const handleSaveCompany = async () => {
    try {
      await updateCompanyInfo.mutateAsync({
        company_name: companySettings.company_name,
        address: companySettings.address,
        phone: companySettings.phone,
        email: companySettings.email,
        website: companySettings.website,
        tax_id: companySettings.tax_id,
        bank_name: companySettings.bank_name,
        account_name: companySettings.account_name,
        account_number: companySettings.account_number,
        sort_code: companySettings.sort_code,
      });
      toast({
        title: "Success",
        description: "Company settings saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveInvoice = () => {
    console.log('Saving invoice settings:', invoiceSettings);
    toast({
      title: "Success",
      description: "Invoice settings saved successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-lg">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-steel-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="max-w-4xl space-y-6">

        {/* Company Settings */}
        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <Building className="w-5 h-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companySettings.company_name}
                onChange={(e) => setCompanySettings({...companySettings, company_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={companySettings.address}
                onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={companySettings.website}
                  onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={companySettings.tax_id}
                  onChange={(e) => setCompanySettings({...companySettings, tax_id: e.target.value})}
                />
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="pt-4 border-t border-steel-200">
              <h4 className="font-semibold text-gray-900 mb-4">Bank Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={companySettings.bank_name}
                    onChange={(e) => setCompanySettings({...companySettings, bank_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={companySettings.account_name}
                    onChange={(e) => setCompanySettings({...companySettings, account_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={companySettings.account_number}
                    onChange={(e) => setCompanySettings({...companySettings, account_number: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="sortCode">Sort Code</Label>
                  <Input
                    id="sortCode"
                    value={companySettings.sort_code}
                    onChange={(e) => setCompanySettings({...companySettings, sort_code: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveCompany} 
              className="steel-button"
              disabled={updateCompanyInfo.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateCompanyInfo.isPending ? 'Saving...' : 'Save Company Info'}
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <CreditCard className="w-5 h-5 mr-2" />
              Invoice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultDueDays">Default Due Days</Label>
                <Input
                  id="defaultDueDays"
                  value={invoiceSettings.defaultDueDays}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultDueDays: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="reminderDays">Reminder Days Before Due</Label>
                <Input
                  id="reminderDays"
                  value={invoiceSettings.reminderDays}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, reminderDays: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={invoiceSettings.invoicePrefix}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, invoicePrefix: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="nextInvoiceNumber">Next Invoice Number</Label>
                <Input
                  id="nextInvoiceNumber"
                  value={invoiceSettings.nextInvoiceNumber}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, nextInvoiceNumber: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="defaultTerms">Default Payment Terms</Label>
              <textarea
                id="defaultTerms"
                className="w-full px-3 py-2 border border-steel-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                value={invoiceSettings.defaultTerms}
                onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultTerms: e.target.value})}
              />
            </div>
            <Button onClick={handleSaveInvoice} className="steel-button">
              <Save className="w-4 h-4 mr-2" />
              Save Invoice Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
