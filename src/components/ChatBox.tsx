import { useState, useEffect, useRef } from 'react';
import { Box, TextInput, Stack, Text, ActionIcon, ScrollArea, Group, Paper, Transition, Indicator } from '@mantine/core';
import { IconMessageCircle, IconX, IconSend } from '@tabler/icons-react';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import { RoomState } from '../types';
import { encryptText, decryptText } from '../utils/crypto';
import { audioEngine } from '../utils/audio';

interface ChatBoxProps {
  roomState: RoomState;
  roomId: string;
  playerId: string;
}

export function ChatBox({ roomState, roomId, playerId }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const viewport = useRef<HTMLDivElement>(null);
  
  const messages = roomState.messages ? Object.values(roomState.messages) : [];
  const messageCountRef = useRef(messages.length);

  useEffect(() => {
    // Scroll to bottom when messages change and panel is open
    if (isOpen && viewport.current) {
        viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        setUnreadCount(0); // clear unread when open
    }
    
    // Play sound on new message if it wasn't sent by me (or just play it)
    if (messages.length > messageCountRef.current) {
         const newMessages = messages.slice(messageCountRef.current);
         const hasOthersMessage = newMessages.some(m => m.senderId !== playerId);
         if (hasOthersMessage) {
              audioEngine.playChatTick();
              if (!isOpen) { 
                  setUnreadCount(prev => prev + newMessages.filter(m => m.senderId !== playerId).length);
              }
         }
    }
    messageCountRef.current = messages.length;
  }, [messages.length, isOpen, playerId]);

  const handleSend = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputVal.trim()) return;

      const player = roomState.players[playerId];
      if (!player) return;

      const currentText = inputVal;
      setInputVal(''); // Optimistic clear

      const newMsgRef = push(ref(db, `rooms/${roomId}/messages`));
      await set(newMsgRef, {
          id: newMsgRef.key,
          senderId: playerId,
          senderName: player.name,
          avatar: player.avatar || '🤖',
          text: encryptText(currentText),
          timestamp: Date.now()
      });
  };

  return (
      <Box style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Transition mounted={isOpen} transition="slide-up" duration={200} timingFunction="ease">
          {(styles) => (
            <Paper 
               shadow="xl" 
               p="md" 
               mb="md"
               style={{ 
                   ...styles, 
                   width: 320, 
                   height: 400, 
                   display: 'flex', 
                   flexDirection: 'column',
                   border: '3px solid #1f2937',
                   borderRadius: '16px',
                   boxShadow: '0 8px 0 #1f2937'
               }}
            >
               <Group justify="space-between" mb="sm" pb="sm" style={{ borderBottom: '2px solid #e5e7eb' }}>
                   <Text fw={800} size="lg">Live Chat</Text>
                   <ActionIcon variant="subtle" color="gray" onClick={() => setIsOpen(false)}>
                       <IconX size={20} />
                   </ActionIcon>
               </Group>

               <ScrollArea style={{ flex: 1 }} viewportRef={viewport} offsetScrollbars>
                   <Stack gap="xs" pr="sm">
                       {messages.map((msg) => {
                           const isMe = msg.senderId === playerId;
                           return (
                               <Box key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                   {!isMe && <Text size="xs" c="dimmed" ml={4} fw={700}>{msg.avatar} {msg.senderName}</Text>}
                                   <Box 
                                      style={{ 
                                          background: isMe ? '#dbeafe' : '#f3f4f6', 
                                          padding: '8px 12px', 
                                          borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                          border: '2px solid #1f2937',
                                          color: '#1f2937'
                                      }}
                                   >
                                       <Text size="sm" fw={600} style={{ wordBreak: 'break-word' }}>
                                           {decryptText(msg.text)}
                                       </Text>
                                   </Box>
                               </Box>
                           );
                       })}
                       {messages.length === 0 && (
                           <Text size="sm" c="dimmed" ta="center" mt="xl">No messages yet. Say hi!</Text>
                       )}
                   </Stack>
               </ScrollArea>

               <form onSubmit={handleSend} style={{ marginTop: '12px' }}>
                   <TextInput
                       value={inputVal}
                       onChange={(e) => setInputVal(e.currentTarget.value)}
                       placeholder="Message..."
                       rightSection={
                           <ActionIcon type="submit" variant="filled" color="blue" radius="xl" size="sm">
                               <IconSend size={14} />
                           </ActionIcon>
                       }
                       styles={{ input: { borderRadius: '24px', border: '2px solid #1f2937' } }}
                   />
               </form>
            </Paper>
          )}
        </Transition>

        {!isOpen && (
           <Indicator inline label={unreadCount} size={22} offset={7} color="red" disabled={unreadCount === 0} zIndex={1001}>
              <ActionIcon
                 color="blue"
                 variant="filled"
                 size={60}
                 radius="xl"
                 onClick={() => { setIsOpen(true); setUnreadCount(0); }}
                 style={{ 
                     boxShadow: '0 4px 0 #1f2937', 
                     border: '3px solid #1f2937',
                     position: 'relative' /* Removed absolute to work perfectly inside the fixed box without indicator breaking */
                 }}
              >
                 <IconMessageCircle size={30} />
              </ActionIcon>
           </Indicator>
        )}
      </Box>
  );
}
