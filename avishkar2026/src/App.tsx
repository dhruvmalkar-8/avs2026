import React from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingView } from './components/landing/LandingView';
import { SurvivorView } from './components/survivor/SurvivorView';
import { RescueDashboard } from './components/rescue/RescueDashboard';
import { SimulationView } from './components/simulation/SimulationView';
import { LimitationsView } from './components/limitations/LimitationsView';

const MainContent: React.FC = () => {
  const { currentView } = useEmergency();

  return (
    <main style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {currentView === 'LANDING' && <LandingView />}
      {currentView === 'SURVIVOR' && <SurvivorView />}
      {currentView === 'RESCUE' && <RescueDashboard />}
      {currentView === 'SIMULATION' && <SimulationView />}
      {currentView === 'LIMITATIONS' && <LimitationsView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <EmergencyProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <MainContent />
        <Footer />
      </div>
    </EmergencyProvider>
  );
};

export default App;
