import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loadLeads } from '../store/slices/leadsSlice';

const TestingControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, leads, filteredLeads } = useAppSelector((state) => state.leads);

  const simulateError = () => {
    dispatch({ type: 'leads/loadLeads/rejected', payload: 'Simulated network error for testing' });
  };

  const simulateLoading = () => {
    dispatch({ type: 'leads/loadLeads/pending' });
    setTimeout(() => {
      dispatch(loadLeads());
    }, 3000);
  };

  const simulateEmptyState = () => {
    dispatch({ type: 'leads/loadLeads/fulfilled', payload: [] });
  };

  const resetToNormalState = () => {
    dispatch(loadLeads());
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Testing Controls</h3>
      <p className="text-sm text-gray-600 mb-4">
        Use these controls to test different UI states:
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={simulateLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Test Loading State
        </button>
        
        <button
          onClick={simulateError}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          Test Error State
        </button>
        
        <button
          onClick={simulateEmptyState}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
        >
          Test Empty State
        </button>
        
        <button
          onClick={resetToNormalState}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          Reset to Normal
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>Status: {isLoading ? 'Loading...' : 'Ready'}</div>
          <div>Error: {error ? 'Yes' : 'None'}</div>
          <div>Total Leads: {leads.length}</div>
          <div>Filtered Leads: {filteredLeads.length}</div>
        </div>
      </div>
    </div>
  );
};

export default TestingControls;
