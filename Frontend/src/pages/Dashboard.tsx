import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Download, AlertTriangle, CheckCircle } from "lucide-react";
import WidgetGrid from "@/components/dashboard/WidgetGrid";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import ShiftCalendarView from "@/components/dashboard/ShiftCalendarView";

interface ValidationIssue {
  field: string;
  issue_type: string;
  description: string;
  severity: string;
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  payslip_data: any;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedProfile } = useProfile();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [hasUploadedPayslip, setHasUploadedPayslip] = useState<boolean>(false);
  
  // Hent brugerspecifik data når selected profile ændres
  useEffect(() => {
    if (selectedProfile?.user_id) {
      // Hent brugerspecifik data fra localStorage
      const storageKey = `validationResult_${selectedProfile.user_id}`;
      const storedResult = localStorage.getItem(storageKey);
      
      if (storedResult) {
        try {
          const parsedResult = JSON.parse(storedResult);
          setValidationResult(parsedResult);
          setHasUploadedPayslip(true);
        } catch (error) {
          console.error("Fejl ved parsing af valideringsresultat:", error);
          setValidationResult(null);
          setHasUploadedPayslip(false);
        }
      } else {
        // Ingen data for denne bruger
        setValidationResult(null);
        setHasUploadedPayslip(false);
      }
    }
  }, [selectedProfile]);
  
  // Få kun fornavnet fra det fulde navn
  const getFirstName = (fullName: string = '') => {
    return fullName.split(' ')[0];
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.title')}</h1>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {selectedProfile ? `Velkommen tilbage, ${getFirstName(selectedProfile.name)}!` : 'Velkommen tilbage!'}
            </h1>
            <p className="text-muted-foreground">
              Her er dit personlige lønoverblik
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Maj 2025
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('common.export')}
            </Button>
          </div>
        </div>

        {/* Calendar Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Din vagtplan</CardTitle>
          </CardHeader>
          <CardContent>
            <ShiftCalendarView />
          </CardContent>
        </Card>

        {/* Upload lønseddel sektion */}
        <Card className="dashboard-card p-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">{t('common.uploadPayslip')}</h3>
            <p className="text-muted-foreground mb-4">
              Upload din seneste lønseddel for at få en detaljeret analyse og visualisering af din løn
            </p>
            <Button 
              onClick={() => navigate('/upload')} 
              className="mx-auto mt-2 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Start Upload
            </Button>
          </CardContent>
        </Card>

        {/* Validerings Status og Lønseddel Data */}
        {hasUploadedPayslip && validationResult ? (
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
                      : `Vi har fundet ${validationResult.issues?.length || 0} potentielle problemer`}
                  </CardDescription>
                </div>
              </CardHeader>
              {!validationResult.valid && validationResult.issues && (
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
                    Kr. {validationResult.payslip_data?.bruttoløn?.toLocaleString() || '0,00'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600 flex items-center">
                    +2.5% fra sidste måned
                  </p>
                </CardContent>
              </Card>
              
              <Card className="dashboard-card">
                <CardHeader className="pb-2">
                  <CardDescription>{t('dashboard.netSalary.title', 'Nettoløn')}</CardDescription>
                  <CardTitle className="text-2xl">
                    Kr. {validationResult.payslip_data?.nettoløn?.toLocaleString() || '0,00'}
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
                    Kr. {validationResult.payslip_data?.bruttoløn && validationResult.payslip_data?.nettoløn 
                        ? (validationResult.payslip_data.bruttoløn - validationResult.payslip_data.nettoløn).toLocaleString() 
                        : '0,00'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {validationResult.payslip_data?.bruttoløn && validationResult.payslip_data?.nettoløn
                      ? `Svarer til ${((validationResult.payslip_data.bruttoløn - validationResult.payslip_data.nettoløn) / 
                              validationResult.payslip_data.bruttoløn * 100).toFixed(1)}% af din bruttoløn`
                      : `Svarer til 0.0% af din bruttoløn`}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          // Vis kun en informativ besked hvis brugeren ikke har uploadet en lønseddel
          <Card className="dashboard-card p-8 text-center">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {selectedProfile 
                  ? `${getFirstName(selectedProfile.name)}, du har ikke uploadet nogen lønseddel endnu.` 
                  : 'Ingen lønseddel er uploadet endnu.'}
                 Upload en lønseddel for at se analysen.
              </p>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default Dashboard;
