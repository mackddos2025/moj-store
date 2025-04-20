'use client';

import { useEffect, useState } from 'react';
import { seedDatabase } from '@/lib/seed-data';

export default function SeedData() {
  const [isSeeding, setIsSeeding] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seedData = async () => {
      try {
        setIsSeeding(true);
        const result = await seedDatabase();
        setIsSeeding(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsSeeding(false);
      }
    };

    seedData();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Seed Database</h1>
        
        {isSeeding === null ? (
          <p className="text-gray-600">Seeding database...</p>
        ) : isSeeding ? (
          <div className="text-green-600">
            <p>✅ Database seeded successfully!</p>
            <p className="mt-2">Sample data has been added to the database.</p>
          </div>
        ) : (
          <div className="text-red-600">
            <p>❌ Failed to seed database!</p>
            {error && <p className="mt-2">Error: {error}</p>}
            <p className="mt-2">Please check your database configuration and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
} 