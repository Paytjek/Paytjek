import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useProfile } from '@/contexts/ProfileContext';

// Placeholder for widget grid component
const WidgetGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Widget 1</CardTitle>
      </CardHeader>
      <CardContent>Widget content</CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Widget 2</CardTitle>
      </CardHeader>
      <CardContent>Widget content</CardContent>
    </Card>
  </div>
);

interface ValidationIssue {
  field: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
}

interface PayslipData {
  bruttoløn?: number;
  nettoløn?: number;
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  payslip_data: PayslipData;
}

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedProfile } = useProfile();

  // Sample validation result - in a real app this would come from an API
  const validationResult: ValidationResult | null = {
    valid: false,
    issues: [
      {
        field: 'Arbejdstimer',
        description: 'Du har registreret 160 timer, men din lønseddel viser kun 155 timer',
        severity: 'warning'
      }
    ],
    payslip_data: {
      bruttoløn: 32500,
      nettoløn: 21300
    }
  };

  // Helper to get first name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {selectedProfile ? `Hej ${getFirstName(selectedProfile.name)}` : 'Hej!'}
          </h1>
          <p className="text-muted-foreground">
            Velkommen til dit lønunivers
                      </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            April 2025
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('common.export')}
          </Button>
        </div>
      </div>
      
      {validationResult ? (
        <>
          {/* Validerings Status Card */}
          <Card className={`dashboard-card ${validationResult.valid ? 'border-green-500' : 'border-amber-500'}`}>
            <CardHeader className="flex flex-row items-center">
              {validationResult.valid ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              )}
              <div>
                <CardTitle>
                  {validationResult.valid 
                    ? "Din lønseddel ser korrekt ud" 
                    : "Der er potentielle problemer med din lønseddel"}
                </CardTitle>
                <CardDescription>
                  {validationResult.valid 
                    ? "Vi har valideret din lønseddel og fundet ingen problemer" 
                    : `Vi har fundet ${validationResult.issues.length} potentielle problemer`}
                </CardDescription>
              </div>
            </CardHeader>
            {!validationResult.valid && (
              <CardContent>
                <h3 className="font-medium mb-2">Identificerede problemer:</h3>
                <ul className="space-y-2">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index} className="bg-amber-50 p-3 rounded-md">
                      <div className="font-medium">{issue.field}</div>
                      <div className="text-gray-600">{issue.description}</div>
                      <div className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded ${
                        issue.severity === 'error' ? 'bg-red-100 text-red-800' : 
                        issue.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.severity}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
          
          {/* Lønseddel Data Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>{t('dashboard.grossSalary.title', 'Bruttoløn')}</CardDescription>
                <CardTitle className="text-2xl">
                  Kr. {validationResult.payslip_data.bruttoløn?.toLocaleString() || '0,00'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600 flex items-center">
                  +.5% fra sidste måned
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>{t('dashboard.netSalary.title', 'Nettoløn')}</CardDescription>
                <CardTitle className="text-2xl">
                  Kr. {validationResult.payslip_data.nettoløn?.toLocaleString() || '0,00'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.netSalary.description', 'Beløbet indsættes på din konto')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>{t('dashboard.deductions.title', 'Fradrag')}</CardDescription>
                <CardTitle className="text-2xl">
                  Kr. {validationResult.payslip_data.bruttoløn && validationResult.payslip_data.nettoløn 
                      ? (validationResult.payslip_data.bruttoløn - validationResult.payslip_data.nettoløn).toLocaleString() 
                      : '0,00'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {validationResult.payslip_data.bruttoløn && validationResult.payslip_data.nettoløn
                    ? `Svarer til ${((validationResult.payslip_data.bruttoløn - validationResult.payslip_data.nettoløn) / 
                            validationResult.payslip_data.bruttoløn * 100).toFixed(1)}% af din bruttoløn`
                    : `Svarer til 0.0% af din bruttoløn`}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          <Card className="dashboard-card p-8 text-center">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ingen lønseddel er uploadet endnu. Upload en lønseddel for at se analysen.
              </p>
              <Button onClick={() => navigate('/upload')}>
                {t('common.uploadPayslip', 'Upload lønseddel')}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      
      <Tabs defaultValue="payslip">
        <TabsList>
          <TabsTrigger value="payslip">{t('common.currentPayslip', 'Aktuel lønseddel')}</TabsTrigger>
          <TabsTrigger value="history">{t('common.history', 'Historik')}</TabsTrigger>
        </TabsList>
        <TabsContent value="payslip" className="mt-6">
          <WidgetGrid />
        </TabsContent>
        <TabsContent value="history">
          <div className="h-72 flex items-center justify-center border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">{t('common.historicalData', 'Historiske data kommer snart')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardLayout; 