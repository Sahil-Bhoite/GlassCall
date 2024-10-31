import React from 'react';
import { Users, X, Mic, MicOff, Hand, Crown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  handRaised: boolean;
}

interface ParticipantListProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  currentUserId: string;
  isHost: boolean;
  onToggleMute: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onLowerHand: (participantId: string) => void;
}

export default function ParticipantList({
  isOpen,
  onClose,
  participants,
  currentUserId,
  isHost,
  onToggleMute,
  onRemoveParticipant,
  onLowerHand,
}: ParticipantListProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-80 participant-list flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-300" />
          <h3 className="text-lg font-semibold">Participants ({participants.length})</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl glass-button text-blue-300"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="p-3 rounded-xl glass-panel flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                  {participant.name[0].toUpperCase()}
                </div>
                {participant.isHost && (
                  <Crown
                    size={16}
                    className="absolute -top-1 -right-1 text-yellow-400"
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {participant.id === currentUserId ? `${participant.name} (You)` : participant.name}
                  </span>
                  {participant.handRaised && (
                    <Hand size={16} className="text-yellow-400 raised-hand" />
                  )}
                </div>
                {participant.isMuted && (
                  <span className="text-xs text-red-400">Muted</span>
                )}
              </div>
            </div>

            {isHost && participant.id !== currentUserId && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleMute(participant.id)}
                  className="p-2 rounded-xl glass-button text-blue-300"
                  title={participant.isMuted ? 'Unmute' : 'Mute'}
                >
                  {participant.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                {participant.handRaised && (
                  <button
                    onClick={() => onLowerHand(participant.id)}
                    className="p-2 rounded-xl glass-button text-yellow-400"
                    title="Lower hand"
                  >
                    <Hand size={16} />
                  </button>
                )}
                <button
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="p-2 rounded-xl glass-button text-red-400"
                  title="Remove participant"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}