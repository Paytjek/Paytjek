import React, { useState } from 'react';
import { checkBackendHealth } from '../../api/health';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, AlertCircle, Server, RefreshCw } from 'lucide-react';

const ApiHealthCheck: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(import.meta.env.VITE_API_URL || '');

  const handleHealthCheck = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const data = await checkBackendHealth();
      setResult({
        success: true,
        message: 'Successfully connected to backend API',
        data
      });
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Add more helpful information for common errors
      if (errorMessage.includes('fetch') && errorMessage.includes('failed')) {
        errorMessage += `. Make sure backend is running at port 8000 and network is properly configured.`;
      }
      
      setResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server size={20} /> API Connection Test
        </CardTitle>
        <CardDescription>
          Test connection to backend API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Current API URL:</p>
          <p className="text-sm font-mono bg-muted p-2 rounded">{apiUrl}</p>
          <p className="text-xs text-muted-foreground mt-1">
            (In browser, localhost:8000 will be used instead of Docker hostname)
          </p>
        </div>
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            <div className="flex items-center gap-2">
              {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
            </div>
            <AlertDescription className="whitespace-pre-line">{result.message}</AlertDescription>
            
            {result.data && (
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleHealthCheck} disabled={loading} className="mr-2">
          {loading ? 
            <> <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Testing...</> : 
            'Test API Connection'
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiHealthCheck; 