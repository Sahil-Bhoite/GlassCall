import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSendMessage: (message: string) => void;
  messages: Message[];
}

export default function Chat({ isOpen, onClose, userName, onSendMessage, messages }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 chat-panel flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chat</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-xl glass-button text-blue-300"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message p-3 rounded-xl glass-panel ${
              message.sender === userName ? 'ml-8' : 'mr-8'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-blue-300">
                {message.sender === userName ? 'You' : message.sender}
              </span>
              <span className="text-xs text-zinc-500">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-white">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl glass-panel text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />
          <button
            type="submit"
            className="p-2 rounded-xl glass-button text-blue-300"
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}