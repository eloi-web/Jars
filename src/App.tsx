import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { JarScreen } from './components/JarScreen';
import { LoginModal } from './components/LoginModal';
import { CreateJarModal } from './components/CreateJarModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'jar'>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigateToJar={() => setCurrentScreen('jar')}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      )}
      
      {currentScreen === 'jar' && (
        <JarScreen
          onBack={() => setCurrentScreen('home')}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CreateJarModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}

