import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LeadsList from './LeadsList';
import OpportunitiesTable from './OpportunitiesTable';
import TestingControls from './TestingControls';

const ResponsiveLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'opportunities'>('leads');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white shadow">
          <h1 className="text-xl font-bold text-gray-900">Mini Seller Console</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>


        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200">
            <nav className="px-4 py-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('leads');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'leads'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => {
                  setActiveTab('opportunities');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'opportunities'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Opportunities
              </button>
            </nav>
          </div>
        )}
      </div>


      <div className="py-4 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mini Seller Console</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your leads and convert them into opportunities
            </p>
          </div>

          <div className="hidden lg:block">
            <div className="space-y-8">
              <TestingControls />
              <LeadsList />
              <OpportunitiesTable />
            </div>
          </div>

          <div className="lg:hidden">
            <div className="space-y-4">
              <TestingControls />
              {activeTab === 'leads' && <LeadsList />}
              {activeTab === 'opportunities' && <OpportunitiesTable />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
