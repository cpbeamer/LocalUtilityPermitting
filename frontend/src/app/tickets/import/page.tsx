'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ImportTicketPage() {
  const router = useRouter();
  const [ticketNumber, setTicketNumber] = useState('');

  const handleImport = () => {
    alert('Ticket import functionality will be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Import 811 Ticket
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Import a new ticket from the 811 system
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div>
              <label htmlFor="ticket" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                811 Ticket Number
              </label>
              <input
                id="ticket"
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter ticket number (e.g., TX-811-2025-12347)"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleImport} disabled={!ticketNumber}>
                Import Ticket
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}