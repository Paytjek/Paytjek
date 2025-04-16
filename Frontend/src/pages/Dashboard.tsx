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
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  useEffect(() => {
    // Hent valideringsresultatet fra localStorage
    const storedResult = localStorage.getItem("validationResult");
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        setValidationResult(parsedResult);
      } catch (error) {
        console.error("Fejl ved parsing af valideringsresultat:", error);
      }
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.viewData')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            March 2025
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
                <CardDescription>{t('dashboard.grossSalary.title')}</CardDescription>
                <CardTitle className="text-2xl">
                  Kr. {validationResult.payslip_data.bruttoløn?.toLocaleString() || '0,00'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600 flex items-center">
                  {t('dashboard.grossSalary.increase', { percent: 2.5 })}
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>{t('dashboard.netSalary.title')}</CardDescription>
                <CardTitle className="text-2xl">
                  Kr. {validationResult.payslip_data.nettoløn?.toLocaleString() || '0,00'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.netSalary.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>{t('dashboard.deductions.title')}</CardDescription>
                <CardTitle className="text-2xl">
                  Kr. {validationResult.payslip_data.bruttoløn && validationResult.payslip_data.nettoløn 
                      ? (validationResult.payslip_data.bruttoløn - validationResult.payslip_data.nettoløn).toLocaleString() 
                      : '0,00'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {validationResult.payslip_data.bruttoløn && validationResult.payslip_data.nettoløn
                    ? t('dashboard.deductions.description', { 
                        percent: ((validationResult.payslip_data.bruttoløn - validationResult.payslip_data.nettoløn) / 
                                validationResult.payslip_data.bruttoløn * 100).toFixed(1) 
                      })
                    : t('dashboard.deductions.description', { percent: '0.0' })}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="dashboard-card p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ingen lønseddel er uploadet endnu. Upload en lønseddel for at se analysen.
            </p>
            <Button onClick={() => navigate('/upload')}>
              {t('common.uploadPayslip')}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="payslip">
        <TabsList>
          <TabsTrigger value="payslip">{t('common.currentPayslip')}</TabsTrigger>
          <TabsTrigger value="history">{t('common.history')}</TabsTrigger>
        </TabsList>
        <TabsContent value="payslip" className="mt-6">
          <WidgetGrid />
        </TabsContent>
        <TabsContent value="history">
          <div className="h-72 flex items-center justify-center border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">{t('common.historicalData')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
