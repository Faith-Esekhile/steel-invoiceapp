
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Building, 
  CreditCard,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@marvellous-steel.com',
    phone: '+234 (0) 123-456-7890'
  });

  const [companySettings, setCompanySettings] = useState({
    companyName: 'Marvellous Steel Enterprise',
    address: '123 Steel Avenue, Industrial District',
    city: 'Lagos',
    state: 'Lagos State',
    zipCode: '100001',
    taxId: 'TAX123456789'
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    defaultDueDays: '30',
    invoicePrefix: 'INV-',
    nextInvoiceNumber: '001',
    defaultTerms: 'Payment due within 30 days of invoice date.',
    reminderDays: '7'
  });

  const handleSaveProfile = () => {
    console.log('Saving user profile:', userProfile);
    toast({
      title: "Success",
      description: "User profile saved successfully",
    });
  };

  const handleSaveCompany = () => {
    console.log('Saving company settings:', companySettings);
    toast({
      title: "Success",
      description: "Company settings saved successfully",
    });
  };

  const handleSaveInvoice = () => {
    console.log('Saving invoice settings:', invoiceSettings);
    toast({
      title: "Success",
      description: "Invoice settings saved successfully",
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-steel-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* User Profile */}
        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <User className="w-5 h-5 mr-2" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={userProfile.firstName}
                  onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={userProfile.lastName}
                  onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
              />
            </div>
            <Button onClick={handleSaveProfile} className="steel-button">
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

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
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={companySettings.city}
                  onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={companySettings.state}
                  onChange={(e) => setCompanySettings({...companySettings, state: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={companySettings.zipCode}
                  onChange={(e) => setCompanySettings({...companySettings, zipCode: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={companySettings.taxId}
                onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
              />
            </div>
            <Button onClick={handleSaveCompany} className="steel-button">
              <Save className="w-4 h-4 mr-2" />
              Save Company Info
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
