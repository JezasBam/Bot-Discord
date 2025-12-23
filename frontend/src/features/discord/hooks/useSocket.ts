import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

interface ChannelUpdateEvent {
  type: 'create' | 'delete' | 'update';
  guildId: string;
}

interface MessageUpdateEvent {
  type: 'create' | 'delete' | 'update';
  channelId: string;
}

export function useSocket(
  isConnected: boolean,
  selectedGuildId: string | null,
  selectedChannelId: string | null,
  onChannelUpdate: () => void,
  onMessageUpdate: () => void
) {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef({ onChannelUpdate, onMessageUpdate, selectedGuildId, selectedChannelId });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onChannelUpdate, onMessageUpdate, selectedGuildId, selectedChannelId };
  }, [onChannelUpdate, onMessageUpdate, selectedGuildId, selectedChannelId]);

  useEffect(() => {
    if (!isConnected) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('channelUpdate', (data: ChannelUpdateEvent) => {
      console.log('Channel update received:', data);
      // Always refresh - the guild check was causing issues
      callbacksRef.current.onChannelUpdate();
    });

    socket.on('messageUpdate', (data: MessageUpdateEvent) => {
      console.log('Message update received:', data);
      if (callbacksRef.current.selectedChannelId === data.channelId) {
        callbacksRef.current.onMessageUpdate();
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isConnected]);
}
