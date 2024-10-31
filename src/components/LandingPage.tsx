import React, { useState } from 'react';
import { Video, Users } from 'lucide-react';
import UserSettings from './UserSettings';

interface LandingPageProps {
  onStart: (userName: string, preferredAudioInput: string) => void;
  onJoin: () => void;
}

export default function LandingPage({ onStart, onJoin }: LandingPageProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [preferredAudioInput, setPreferredAudioInput] = useState('');

  const handleStart = () => {
    if (!userName) {
      setShowSettings(true);
      return;
    }
    onStart(userName, preferredAudioInput);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 animated-bg">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-3">GlassCall</h1>
        <p className="text-zinc-400 text-center mb-8">Secure video calls with crystal clear quality</p>
        
        <div className="space-y-4">
          <button
            onClick={handleStart}
            className="w-full p-4 rounded-2xl glass-button group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Video size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Start New Call</p>
                  <p className="text-zinc-400 text-sm">Create a private room</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
                →
              </div>
            </div>
          </button>

          <button
            onClick={onJoin}
            className="w-full p-4 rounded-2xl glass-button group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                  <Users size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Join Call</p>
                  <p className="text-zinc-400 text-sm">Using room ID</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
                →
              </div>
            </div>
          </button>
        </div>
      </div>

      {showSettings && (
        <UserSettings
          userName={userName}
          preferredAudioInput={preferredAudioInput}
          onSave={(name, audioDevice) => {
            setUserName(name);
            setPreferredAudioInput(audioDevice);
            setShowSettings(false);
            onStart(name, audioDevice);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}