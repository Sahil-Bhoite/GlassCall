import React, { useState, useEffect } from 'react';
import { X, Mic } from 'lucide-react';

interface UserSettingsProps {
  userName: string;
  preferredAudioInput: string;
  onSave: (userName: string, audioDevice: string) => void;
  onClose: () => void;
}

export default function UserSettings({ userName, preferredAudioInput, onSave, onClose }: UserSettingsProps) {
  const [name, setName] = useState(userName);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(preferredAudioInput);

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error('Error accessing audio devices:', err);
      }
    };

    getDevices();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), selectedDevice);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white">User Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-button text-blue-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blue-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-panel text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="audio" className="block text-sm font-medium text-blue-300 mb-2">
              Microphone
            </label>
            <div className="relative">
              <select
                id="audio"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-2xl appearance-none glass-panel text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              >
                {audioDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mic size={20} className="text-blue-300" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium transition-colors backdrop-blur-xl border border-blue-400/10"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}