'use client';

import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  console.log('Current theme:', theme);
  console.log('HTML classes:', document.documentElement.className);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your application preferences
              </p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={logout} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Profile
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Name:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{user?.name}</span>
            </div>
            <div className="flex">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Email:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{user?.email}</span>
            </div>
            <div className="flex">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Role:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="flex">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Organization:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{user?.organization?.name}</span>
            </div>
          </div>
        </div>

        {/* Theme Settings Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Theme Mode
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Switch between light and dark theme modes
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out bg-gray-200 dark:bg-gray-600"
              aria-label="Toggle theme"
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`inline-block w-4 h-4 transform transition-transform duration-200 ease-in-out bg-white rounded-full shadow-lg ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current theme: <span className="font-medium text-gray-900 dark:text-gray-100">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Your preference is saved automatically and will persist across sessions.
            </p>
          </div>
        </div>

        {/* Additional Settings Sections */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Notification settings will be available in a future update.
          </p>
        </div>
      </main>
    </div>
  );
}