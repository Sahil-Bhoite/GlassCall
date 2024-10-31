import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UserSettings from './UserSettings';

interface JoinCallProps {
  onJoin: (roomId: string, userName: string, audioDevice: string) => void;
  onBack: () => void;
}

export default function JoinCall({ onJoin, onBack }: JoinCallProps) {
  const [roomId, setRoomId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [preferredAudioInput, setPreferredAudioInput] = useState('');

  const handleJoin = () => {
    if (!userName) {
      setShowSettings(true);
      return;
    }
    onJoin(roomId, userName, preferredAudioInput);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 animated-bg">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl">
        <button
          onClick={onBack}
          className="mb-6 text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Join a Call</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-zinc-400 mb-2">
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full px-4 py-3 rounded-xl glass-panel text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={!roomId}
            className="w-full py-3 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Call
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
            onJoin(roomId, name, audioDevice);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}