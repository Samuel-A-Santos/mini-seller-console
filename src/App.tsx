import { useEffect } from 'react';
import { useAppDispatch } from './hooks/redux';
import { loadLeads } from './store/slices/leadsSlice';
import ResponsiveLayout from './components/ResponsiveLayout';
import LeadDetailPanel from './components/LeadDetailPanel';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadLeads());
  }, [dispatch]);

  return (
    <>
      <ResponsiveLayout />
      <LeadDetailPanel />
    </>
  );
}

export default App;
