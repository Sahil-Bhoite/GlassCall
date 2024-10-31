import React, { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';
import { nanoid } from 'nanoid';
import { ArrowLeft, Copy, Check, Camera } from 'lucide-react';
import VideoControls from './VideoControls';
import Toast, { ToastType } from './Toast';
import Chat from './Chat';
import ParticipantList from './ParticipantList';

interface VideoCallProps {
  roomId?: string;
  userName: string;
  audioDevice: string;
  onBack: () => void;
}

interface ToastState {
  message: string;
  type: ToastType;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  handRaised: boolean;
}

const VIDEO_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 }
};

export default function VideoCall({ roomId: propRoomId, userName, audioDevice, onBack }: VideoCallProps) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [roomId, setRoomId] = useState(propRoomId || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [availableAudioDevices, setAvailableAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(audioDevice);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(!propRoomId);
  const [handRaised, setHandRaised] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const connectionRef = useRef<any>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: VIDEO_CONSTRAINTS,
        audio: { deviceId: selectedAudioDevice }
      });
      
      // Basic auto-framing using face detection (if supported)
      if ('FaceDetector' in window) {
        const faceDetector = new (window as any).FaceDetector();
        setInterval(async () => {
          if (localVideoRef.current) {
            try {
              const faces = await faceDetector.detect(localVideoRef.current);
              if (faces.length > 0) {
                const face = faces[0].boundingBox;
                const videoWidth = localVideoRef.current.videoWidth;
                const videoHeight = localVideoRef.current.videoHeight;
                const scale = Math.min(
                  videoWidth / face.width,
                  videoHeight / face.height
                ) * 0.8;
                
                localVideoRef.current.style.transform = `scale(${scale})`;
                localVideoRef.current.style.transformOrigin = `${face.x + face.width / 2}px ${face.y + face.height / 2}px`;
              }
            } catch (e) {
              console.error('Face detection error:', e);
            }
          }
        }, 1000);
      }
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCameraError(false);
      return stream;
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(true);
      showToast('Failed to access camera/microphone. Please check permissions.', 'error');
      return null;
    }
  };

  useEffect(() => {
    const newPeer = new Peer(nanoid());
    setPeer(newPeer);
    initializeCamera();

    setParticipants([
      {
        id: newPeer.id,
        name: userName,
        isHost: !propRoomId,
        isMuted: false,
        handRaised: false
      }
    ]);

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      newPeer.destroy();
    };
  }, []);

  useEffect(() => {
    const loadAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAvailableAudioDevices(audioInputs);
      } catch (err) {
        console.error('Error loading audio devices:', err);
      }
    };

    loadAudioDevices();
  }, []);

  useEffect(() => {
    if (!peer) return;

    peer.on('call', async (call) => {
      const stream = await initializeCamera();
      if (stream) {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        
        connectionRef.current = call;
        setIsConnected(true);
        showToast('Connected to call', 'success');
      }
    });

    // Handle data connection for chat and controls
    peer.on('connection', (conn) => {
      conn.on('data', (data: any) => {
        if (data.type === 'chat') {
          setMessages(prev => [...prev, {
            id: nanoid(),
            sender: data.sender,
            content: data.content,
            timestamp: new Date(data.timestamp)
          }]);
          if (!showChat) {
            setUnreadMessages(prev => prev + 1);
          }
        } else if (data.type === 'participantUpdate') {
          setParticipants(data.participants);
        } else if (data.type === 'handRaise') {
          setParticipants(prev => prev.map(p => 
            p.id === data.participantId ? { ...p, handRaised: data.raised } : p
          ));
        }
      });
    });
  }, [peer]);

  const startCall = async () => {
    const stream = await initializeCamera();
    if (stream && peer) {
      const call = peer.call(roomId, stream);
      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      connectionRef.current = call;
      setIsConnected(true);
      showToast('Connected to call', 'success');
    }
  };

  useEffect(() => {
    if (propRoomId && peer) {
      setRoomId(propRoomId);
      startCall();
    }
  }, [propRoomId, peer]);

  const changeAudioDevice = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    if (localStreamRef.current) {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: VIDEO_CONSTRAINTS,
        audio: { deviceId }
      });
      
      const audioTrack = newStream.getAudioTracks()[0];
      const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];
      
      if (oldAudioTrack) {
        localStreamRef.current.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }
      
      localStreamRef.current.addTrack(audioTrack);
      
      if (connectionRef.current) {
        const sender = connectionRef.current.peerConnection
          ?.getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === 'audio');
        
        if (sender) {
          sender.replaceTrack(audioTrack);
        }
      }
      
      showToast('Audio device changed', 'success');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      showToast(isMuted ? 'Microphone unmuted' : 'Microphone muted', 'info');
      
      // Update participant mute status
      setParticipants(prev => prev.map(p => 
        p.id === peer?.id ? { ...p, isMuted: !isMuted } : p
      ));
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
      showToast(isVideoOff ? 'Camera turned on' : 'Camera turned off', 'info');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        const stream = await initializeCamera();
        if (stream && connectionRef.current) {
          connectionRef.current.peerConnection?.getSenders().forEach((sender: RTCRtpSender) => {
            if (sender.track?.kind === 'video') {
              sender.replaceTrack(stream.getVideoTracks()[0]);
            }
          });
        }
        showToast('Screen sharing stopped', 'info');
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            ...VIDEO_CONSTRAINTS,
            cursor: 'always'
          }
        });
        
        screenStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        if (connectionRef.current) {
          connectionRef.current.peerConnection?.getSenders().forEach((sender: RTCRtpSender) => {
            if (sender.track?.kind === 'video') {
              sender.replaceTrack(screenStream.getVideoTracks()[0]);
            }
          });
        }

        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
        
        showToast('Screen sharing started', 'success');
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      if (err instanceof Error) {
        showToast(
          err.name === 'NotAllowedError' 
            ? 'Screen sharing permission denied' 
            : 'Failed to start screen sharing',
          'error'
        );
      }
    }
  };

  const sendMessage = (content: string) => {
    const message = {
      id: nanoid(),
      sender: userName,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    
    // Send to all peers
    if (peer) {
      const connections = peer.connections;
      Object.values(connections).forEach((conns: any) => {
        conns.forEach((conn: any) => {
          conn.send({
            type: 'chat',
            ...message
          });
        });
      });
    }
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    // Notify other participants
    if (peer) {
      const connections = peer.connections;
      Object.values(connections).forEach((conns: any) => {
        conns.forEach((conn: any) => {
          conn.send({
            type: 'handRaise',
            participantId: peer.id,
            raised: !handRaised
          });
        });
      });
    }
  };

  const handleParticipantMute = (participantId: string) => {
    if (!isHost) return;
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
    ));
    // Send mute command to participant
    if (peer) {
      const connections = peer.connections;
      Object.values(connections).forEach((conns: any) => {
        conns.forEach((conn: any) => {
          conn.send({
            type: 'muteCommand',
            participantId
          });
        });
      });
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (!isHost) return;
    setParticipants(prev => prev.filter(p => p.id !== participantId));
    // Send remove command to participant
    if (peer) {
      const connections = peer.connections;
      Object.values(connections).forEach((conns: any) => {
        conns.forEach((conn: any) => {
          conn.send({
            type: 'removeCommand',
            participantId
          });
        });
      });
    }
  };

  const handleLowerHand = (participantId: string) => {
    if (!isHost) return;
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, handRaised: false } : p
    ));
    // Send lower hand command to participant
    if (peer) {
      const connections = peer.connections;
      Object.values(connections).forEach((conns: any) => {
        conns.forEach((conn: any) => {
          conn.send({
            type: 'lowerHandCommand',
            participantId
          });
        });
      });
    }
  };

  const endCall = () => {
    connectionRef.current?.close();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    showToast('Call ended', 'info');
    onBack();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(peer?.id || '');
    setCopied(true);
    showToast('Room ID copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen meeting-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={endCall}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Leave Call
          </button>
          {!isConnected && (
            <button
              onClick={copyRoomId}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Room ID'}
            </button>
          )}
        </div>

        <div className={`grid ${isScreenSharing ? 'grid-cols-[1fr_300px]' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
          <div className={`relative rounded-2xl overflow-hidden aspect-video glass-panel ${
            isScreenSharing ? 'col-span-1 row-span-2' : ''
          }`}>
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-zinc-400">
                <Camera size={48} />
                <p>Camera access denied</p>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-4 left-4 text-white text-sm backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-lg">
              {userName} {isScreenSharing ? '(Screen)' : ''}
            </div>
          </div>
          
          <div className={`relative rounded-2xl overflow-hidden ${
            isScreenSharing ? 'aspect-video h-[200px]' : 'aspect-video'
          } glass-panel`}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white text-sm backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-lg">
              Remote User
            </div>
          </div>
        </div>

        <VideoControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          isConnected={isConnected}
          isHost={isHost}
          handRaised={handRaised}
          audioDevices={availableAudioDevices}
          selectedAudioDevice={selectedAudioDevice}
          unreadMessages={unreadMessages}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onEndCall={endCall}
          onAudioDeviceChange={changeAudioDevice}
          onToggleChat={() => {
            setShowChat(!showChat);
            if (!showChat) setUnreadMessages(0);
          }}
          onToggleParticipants={() => setShowParticipants(!showParticipants)}
          onToggleHandRaise={toggleHandRaise}
        />
      </div>

      {showChat && (
        <Chat
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          userName={userName}
          onSendMessage={sendMessage}
          messages={messages}
        />
      )}

      {showParticipants && (
        <ParticipantList
          isOpen={showParticipants}
          onClose={() => setShowParticipants(false)}
          participants={participants}
          currentUserId={peer?.id || ''}
          isHost={isHost}
          onToggleMute={handleParticipantMute}
          onRemoveParticipant={handleRemoveParticipant}
          onLowerHand={handleLowerHand}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}