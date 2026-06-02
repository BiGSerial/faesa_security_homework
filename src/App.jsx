import React, { useState } from 'react';
import LandingView from './components/LandingView';
import VulnerableView from './components/VulnerableView';
import SecureView from './components/SecureView';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'vulnerable' | 'secure'

  return (
    <div className="app-container">
      {currentView === 'landing' && (
        <LandingView onSelectView={setCurrentView} />
      )}
      
      {currentView === 'vulnerable' && (
        <VulnerableView onBack={() => setCurrentView('landing')} />
      )}
      
      {currentView === 'secure' && (
        <SecureView onBack={() => setCurrentView('landing')} />
      )}
    </div>
  );
}
