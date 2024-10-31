import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Settings,
  MessageCircle,
  Users,
  Hand,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface VideoControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isConnected: boolean;
  isHost: boolean;
  handRaised: boolean;
  audioDevices: MediaDeviceInfo[];
  selectedAudioDevice: string;
  unreadMessages: number;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onAudioDeviceChange: (deviceId: string) => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleHandRaise: () => void;
}

export default function VideoControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isConnected,
  isHost,
  handRaised,
  audioDevices,
  selectedAudioDevice,
  unreadMessages,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onAudioDeviceChange,
  onToggleChat,
  onToggleParticipants,
  onToggleHandRaise,
}: VideoControlsProps) {
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  
  const audioMenuRef = useRef<HTMLDivElement>(null);
  const audioButtonRef = useRef<HTMLDivElement>(null);
  const videoMenuRef = useRef<HTMLDivElement>(null);
  const videoButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadVideoDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(cameras);
        if (cameras.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(cameras[0].deviceId);
        }
      } catch (err) {
        console.error('Error loading video devices:', err);
      }
    };
    loadVideoDevices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (!audioMenuRef.current || !audioMenuRef.current.contains(event.target as Node)) &&
        (!audioButtonRef.current || !audioButtonRef.current.contains(event.target as Node))
      ) {
        setShowAudioMenu(false);
      }
      if (
        (!videoMenuRef.current || !videoMenuRef.current.contains(event.target as Node)) &&
        (!videoButtonRef.current || !videoButtonRef.current.contains(event.target as Node))
      ) {
        setShowVideoMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVideoDeviceChange = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId);
    // Implementation for changing video device would go here
    setShowVideoMenu(false);
  };

  return (
    <div className="mt-6 flex justify-center items-center gap-4">
      <div className="relative flex items-stretch" ref={audioButtonRef}>
        <button
          onClick={onToggleMute}
          className={`px-4 py-3 rounded-l-2xl glass-button ${
            isMuted ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : 'text-blue-300'
          } border-r-0`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button
          onClick={() => setShowAudioMenu(!showAudioMenu)}
          className={`px-3 py-3 rounded-r-2xl glass-button text-blue-300 hover:bg-white/10 ${
            showAudioMenu ? 'bg-white/10' : ''
          }`}
          title="Audio settings"
        >
          {showAudioMenu ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {showAudioMenu && (
          <div
            ref={audioMenuRef}
            className="absolute top-full left-0 mt-2 w-64 glass-panel rounded-2xl p-3 shadow-lg controls-dropdown"
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <Settings size={16} className="text-blue-300" />
              <span className="text-sm text-blue-300">Select Microphone</span>
            </div>
            {audioDevices.map(device => (
              <button
                key={device.deviceId}
                onClick={() => {
                  onAudioDeviceChange(device.deviceId);
                  setShowAudioMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
                  selectedAudioDevice === device.deviceId
                    ? 'bg-blue-500/20 text-white'
                    : 'text-blue-300 hover:bg-white/5'
                }`}
              >
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex items-stretch" ref={videoButtonRef}>
        <button
          onClick={onToggleVideo}
          className={`px-4 py-3 rounded-l-2xl glass-button ${
            isVideoOff ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : 'text-blue-300'
          } border-r-0`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <button
          onClick={() => setShowVideoMenu(!showVideoMenu)}
          className={`px-3 py-3 rounded-r-2xl glass-button text-blue-300 hover:bg-white/10 ${
            showVideoMenu ? 'bg-white/10' : ''
          }`}
          title="Video settings"
        >
          {showVideoMenu ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {showVideoMenu && (
          <div
            ref={videoMenuRef}
            className="absolute top-full left-0 mt-2 w-64 glass-panel rounded-2xl p-3 shadow-lg controls-dropdown"
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <Settings size={16} className="text-blue-300" />
              <span className="text-sm text-blue-300">Select Camera</span>
            </div>
            {videoDevices.map(device => (
              <button
                key={device.deviceId}
                onClick={() => handleVideoDeviceChange(device.deviceId)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
                  selectedVideoDevice === device.deviceId
                    ? 'bg-blue-500/20 text-white'
                    : 'text-blue-300 hover:bg-white/5'
                }`}
              >
                {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onToggleScreenShare}
        className={`px-4 py-3 rounded-2xl glass-button ${
          isScreenSharing ? 'bg-blue-500/20 hover:bg-blue-500/30' : ''
        } text-blue-300`}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        <Monitor size={24} />
      </button>

      {!isHost && (
        <button
          onClick={onToggleHandRaise}
          className={`px-4 py-3 rounded-2xl glass-button ${
            handRaised ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300' : 'text-blue-300'
          }`}
          title={handRaised ? 'Lower hand' : 'Raise hand'}
        >
          <Hand size={24} className={handRaised ? 'raised-hand' : ''} />
        </button>
      )}

      <div className="h-8 w-px bg-white/10" />

      <button
        onClick={onToggleParticipants}
        className="px-4 py-3 rounded-2xl glass-button text-blue-300"
        title="Participants"
      >
        <Users size={24} />
      </button>

      <div className="relative">
        <button
          onClick={onToggleChat}
          className="px-4 py-3 rounded-2xl glass-button text-blue-300"
          title="Chat"
        >
          <MessageCircle size={24} />
        </button>
        {unreadMessages > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xs font-medium">{unreadMessages}</span>
          </div>
        )}
      </div>

      {isConnected && (
        <button
          onClick={onEndCall}
          className="px-4 py-3 rounded-2xl glass-button bg-red-500/20 hover:bg-red-500/30 text-red-300"
          title="End call"
        >
          <PhoneOff size={24} />
        </button>
      )}
    </div>
  );
}