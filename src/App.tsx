import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import JoinCall from './components/JoinCall';
import VideoCall from './components/VideoCall';

type View = 'landing' | 'join' | 'call';

interface UserSettings {
  name: string;
  audioDevice: string;
}

function App() {
  const [view, setView] = useState<View>('landing');
  const [roomId, setRoomId] = useState<string>();
  const [userSettings, setUserSettings] = useState<UserSettings>({ name: '', audioDevice: '' });

  const handleStartCall = (name: string, audioDevice: string) => {
    setUserSettings({ name, audioDevice });
    setRoomId(undefined);
    setView('call');
  };

  const handleJoinCall = (id: string, name: string, audioDevice: string) => {
    setUserSettings({ name, audioDevice });
    setRoomId(id);
    setView('call');
  };

  const handleBack = () => {
    setView('landing');
    setRoomId(undefined);
  };

  return (
    <>
      {view === 'landing' && (
        <LandingPage
          onStart={handleStartCall}
          onJoin={() => setView('join')}
        />
      )}
      {view === 'join' && (
        <JoinCall
          onJoin={(id, name, audioDevice) => handleJoinCall(id, name, audioDevice)}
          onBack={handleBack}
        />
      )}
      {view === 'call' && (
        <VideoCall
          roomId={roomId}
          userName={userSettings.name}
          audioDevice={userSettings.audioDevice}
          onBack={handleBack}
        />
      )}
    </>
  );
}

export default App;