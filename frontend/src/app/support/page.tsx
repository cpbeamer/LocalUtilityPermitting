'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    alert('Support request submitted');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Contact Support
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get help with the Utility Permitting Copilot
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Submit a Request
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your issue in detail"
                />
              </div>

              <Button onClick={handleSubmit} disabled={!subject || !message}>
                Submit Request
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Help
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Technical Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">support@austinutils.com</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1-800-UTILITY</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Business Hours</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monday - Friday: 8 AM - 6 PM CST</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">24/7 Emergency Support Available</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Common Issues
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Unable to import 811 ticket</li>
                <li>• Permit submission errors</li>
                <li>• Login or authentication issues</li>
                <li>• Report generation problems</li>
                <li>• Data synchronization delays</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}