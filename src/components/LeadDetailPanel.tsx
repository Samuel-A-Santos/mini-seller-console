import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  closeDetailPanel, 
  updateLeadOptimistic, 
  rollbackLeadUpdate, 
  updateLead,
  removeLead
} from '../store/slices/leadsSlice';
import { createOpportunity } from '../store/slices/opportunitiesSlice';
import type { Lead } from '../types';

const LeadDetailPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedLead, isDetailPanelOpen, error } = useAppSelector((state) => state.leads);
  const { isLoading: isCreatingOpportunity } = useAppSelector((state) => state.opportunities);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Lead>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedLead) {
      setEditValues({
        status: selectedLead.status,
        email: selectedLead.email,
      });
    }
  }, [selectedLead]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEditStart = (field: string) => {
    setEditingField(field);
    setValidationErrors({});
  };

  const handleEditCancel = () => {
    if (selectedLead) {
      setEditValues({
        status: selectedLead.status,
        email: selectedLead.email,
      });
    }
    setEditingField(null);
    setValidationErrors({});
  };

  const handleEditSave = async (field: string) => {
    if (!selectedLead) return;

    const value = editValues[field as keyof Lead];
    if (!value) return;

    const errors: Record<string, string> = {};
    if (field === 'email' && !validateEmail(value as string)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const originalLead = { ...selectedLead };
    const updates = { [field]: value };

    dispatch(updateLeadOptimistic({ id: selectedLead.id, updates }));
    setEditingField(null);
    setValidationErrors({});

    try {
      await dispatch(updateLead({ id: selectedLead.id, updates })).unwrap();
    } catch (error) {
      dispatch(rollbackLeadUpdate({ id: selectedLead.id, originalLead }));
      setEditValues({
        status: originalLead.status,
        email: originalLead.email,
      });
    }
  };

  const handleConvertToOpportunity = async () => {
    if (!selectedLead) return;

    try {
      await dispatch(createOpportunity(selectedLead)).unwrap();
      dispatch(removeLead(selectedLead.id));
      dispatch(closeDetailPanel());
    } catch (error) {
      console.error('Failed to convert lead to opportunity:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!selectedLead) return null;

  return (
    <Transition.Root show={isDetailPanelOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => dispatch(closeDetailPanel())}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={React.Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={React.Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => dispatch(closeDetailPanel())}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                        Lead Details
                      </Dialog.Title>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <div className="mx-4 sm:mx-6 mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                          <XCircleIcon className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Name</label>
                              <div className="mt-1 text-sm text-gray-900">{selectedLead.name}</div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Company</label>
                              <div className="mt-1 text-sm text-gray-900">{selectedLead.company}</div>
                            </div>

                            {/* Email - Editable */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              {editingField === 'email' ? (
                                <div className="mt-1">
                                  <input
                                    type="email"
                                    value={editValues.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                      validationErrors.email ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                  )}
                                  <div className="mt-2 flex space-x-2">
                                    <button
                                      onClick={() => handleEditSave('email')}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                                    >
                                      <CheckIcon className="h-3 w-3 mr-1" />
                                      Save
                                    </button>
                                    <button
                                      onClick={handleEditCancel}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 flex items-center justify-between">
                                  <span className="text-sm text-gray-900">{selectedLead.email}</span>
                                  <button
                                    onClick={() => handleEditStart('email')}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Source</label>
                              <div className="mt-1 text-sm text-gray-900">{selectedLead.source}</div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Score</label>
                              <div className="mt-1">
                                <span className={`text-sm font-medium ${
                                  selectedLead.score >= 90 ? 'text-green-600' :
                                  selectedLead.score >= 80 ? 'text-green-500' :
                                  selectedLead.score >= 70 ? 'text-yellow-600' : 'text-red-500'
                                }`}>
                                  {selectedLead.score}
                                </span>
                              </div>
                            </div>

                            {/* Status - Editable */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Status</label>
                              {editingField === 'status' ? (
                                <div className="mt-1">
                                  <select
                                    value={editValues.status || ''}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="unqualified">Unqualified</option>
                                  </select>
                                  <div className="mt-2 flex space-x-2">
                                    <button
                                      onClick={() => handleEditSave('status')}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                                    >
                                      <CheckIcon className="h-3 w-3 mr-1" />
                                      Save
                                    </button>
                                    <button
                                      onClick={handleEditCancel}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 flex items-center justify-between">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    selectedLead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                    selectedLead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                    selectedLead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {selectedLead.status}
                                  </span>
                                  <button
                                    onClick={() => handleEditStart('status')}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                          <button
                            onClick={handleConvertToOpportunity}
                            disabled={isCreatingOpportunity || selectedLead.status === 'unqualified'}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                              selectedLead.status === 'unqualified'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : isCreatingOpportunity
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                          >
                            {isCreatingOpportunity ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Converting...
                              </>
                            ) : (
                              'Convert to Opportunity'
                            )}
                          </button>
                          {selectedLead.status === 'unqualified' && (
                            <p className="mt-2 text-xs text-gray-500">
                              Cannot convert unqualified leads to opportunities
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LeadDetailPanel;
