"use client";
import React, { useEffect, useState } from "react";
import { API_URL } from '../../../lib/config';
import { getValidToken } from '../../../lib/auth';

const AuthDebugPage = () => {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // Collect debug information
    const collectDebugInfo = () => {
      try {
        // Check localStorage directly
        const rawToken = localStorage.getItem('token');
        
        // Check token through utility function
        const validToken = getValidToken();
        
        // Try to decode token
        let decodedToken = null;
        let tokenParts = null;
        
        if (validToken) {
          tokenParts = validToken.split('.');
          
          try {
            // Get the payload part of the JWT (the second part)
            const base64Url = validToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Decode the base64 string
            const jsonPayload = decodeURIComponent(
              atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join('')
            );

            decodedToken = JSON.parse(jsonPayload);
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
        
        // Store all debug information
        const info = {
          hasRawToken: !!rawToken,
          rawTokenLength: rawToken ? rawToken.length : 0,
          rawTokenPreview: rawToken ? `${rawToken.substring(0, 10)}...` : null,
          
          hasValidToken: !!validToken,
          validTokenLength: validToken ? validToken.length : 0,
          validTokenPreview: validToken ? `${validToken.substring(0, 10)}...` : null,
          
          isValidFormat: validToken ? /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/.test(validToken) : false,
          tokenParts: tokenParts ? tokenParts.length : 0,
          
          decodedToken: decodedToken,
          tokenExpiry: decodedToken?.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : 'N/A',
          tokenIssuedAt: decodedToken?.iat ? new Date(decodedToken.iat * 1000).toLocaleString() : 'N/A',
          isExpired: decodedToken?.exp ? (decodedToken.exp * 1000 < Date.now()) : 'Unknown',
          
          apiUrl: API_URL,
          browserInfo: navigator.userAgent
        };
        
        setDebugInfo(info);
      } catch (error) {
        setDebugInfo({ error: String(error) });
      }
    };
    
    collectDebugInfo();
  }, []);
  
  const testEndpoint = async () => {
    const results: Record<string, any> = {};
    
    try {
      const token = getValidToken();
      
      // Test 1: No auth header
      try {
        const res1 = await fetch(`${API_URL}/api/students/all`);
        results.noAuthTest = {
          status: res1.status,
          statusText: res1.statusText,
          success: res1.ok
        };
      } catch (error) {
        results.noAuthTest = { error: String(error) };
      }
      
      // Test 2: With auth header
      if (token) {
        try {
          const res2 = await fetch(`${API_URL}/api/students/all`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          results.withAuthTest = {
            status: res2.status,
            statusText: res2.statusText,
            success: res2.ok
          };
          
          if (res2.ok) {
            // Successfully got data!
            const data = await res2.json();
            results.withAuthTest.dataCount = Array.isArray(data) ? data.length : 'Not an array';
          } else {
            try {
              const errorText = await res2.text();
              results.withAuthTest.errorText = errorText;
            } catch (e) {}
          }
          
        } catch (error) {
          results.withAuthTest = { error: String(error) };
        }
      } else {
        results.withAuthTest = { error: 'No valid token available' };
      }
      
      setTestResults(results);
    } catch (error) {
      setTestResults({ error: String(error) });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-amber-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Token Information</h2>
        
        <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="text-amber-300 font-semibold">{key}: </span>
              <span>
                {typeof value === 'object' && value !== null 
                  ? JSON.stringify(value, null, 2) 
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Tests</h2>
        <button 
          onClick={testEndpoint}
          className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors"
        >
          Run API Tests
        </button>
        
        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 bg-gray-800 p-4 rounded-lg overflow-auto">
            <h3 className="text-xl font-semibold mb-2">Test Results</h3>
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} className="mb-4">
                <h4 className="text-lg font-semibold text-amber-300">{key}</h4>
                <pre className="whitespace-pre-wrap">
                  {typeof value === 'object' && value !== null 
                    ? JSON.stringify(value, null, 2) 
                    : String(value)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Common Solutions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ensure you're logged in and have a valid token</li>
          <li>Check if your token is expired (see Token Information section)</li>
          <li>Try logging out and logging back in to refresh your token</li>
          <li>Verify that the API URL is correct ({API_URL})</li>
          <li>Check that your backend is correctly validating JWT tokens</li>
          <li>Make sure the backend and frontend share the same JWT secret for validation</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDebugPage;