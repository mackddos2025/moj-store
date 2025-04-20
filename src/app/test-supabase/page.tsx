'use client';

import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/lib/test-supabase';

export default function TestSupabase() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await testSupabaseConnection();
        setIsConnected(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsConnected(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        
        {isConnected === null ? (
          <p className="text-gray-600">Testing connection...</p>
        ) : isConnected ? (
          <div className="text-green-600">
            <p>✅ Connection successful!</p>
            <p className="mt-2">Supabase is properly configured and connected.</p>
          </div>
        ) : (
          <div className="text-red-600">
            <p>❌ Connection failed!</p>
            {error && <p className="mt-2">Error: {error}</p>}
            <p className="mt-2">Please check your Supabase configuration and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
} 