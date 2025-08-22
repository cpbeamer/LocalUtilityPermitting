'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Documentation
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Learn how to use the Utility Permitting Copilot
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h2>
              <nav className="space-y-2">
                <a href="#getting-started" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Getting Started
                </a>
                <a href="#811-tickets" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  811 Ticket Management
                </a>
                <a href="#permits" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Permit Processing
                </a>
                <a href="#inspections" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Inspections
                </a>
                <a href="#reports" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Reports & Analytics
                </a>
              </nav>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <section id="getting-started">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Getting Started
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Welcome to the Utility Permitting Copilot. This system helps you manage 811 tickets, 
                  municipal permits, and field operations efficiently.
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Dashboard provides real-time overview of all operations</li>
                  <li>Import 811 tickets directly from the system</li>
                  <li>Auto-generate permit applications</li>
                  <li>Track inspections and compliance</li>
                </ul>
              </section>

              <section id="811-tickets">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  811 Ticket Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Import and manage 811 tickets with automated processing:
                </p>
                <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Click "Import 811 Ticket" from Quick Actions</li>
                  <li>Enter the ticket number</li>
                  <li>System automatically parses ticket data</li>
                  <li>Review and approve parsed information</li>
                  <li>Proceed with permit generation</li>
                </ol>
              </section>

              <section id="permits">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Permit Processing
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  The system automatically prefills permit applications based on 811 ticket data. 
                  Review the generated permits, make any necessary adjustments, and submit directly 
                  to municipal portals.
                </p>
              </section>

              <section id="inspections">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Inspections
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Schedule and track municipal inspections. Upload field photos and documentation 
                  for compliance tracking. All evidence is automatically linked to the relevant 
                  tickets and permits.
                </p>
              </section>

              <section id="reports">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Reports & Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate comprehensive reports for compliance, financial tracking, and operational 
                  analytics. Export data in multiple formats for external processing.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}