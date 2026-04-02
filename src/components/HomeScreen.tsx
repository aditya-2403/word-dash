import { useState, useEffect } from 'react';
import { TextInput, Button, Title, Stack, Group, UnstyledButton } from '@mantine/core';
import { ref, set, get, remove } from 'firebase/database';
import { db } from '../firebase';

const EMOJIS = ['🦊', '🐙', '👾', '🦄', '👽', '🤖', '🦉', '👻', '😎', '🐊'];

export function HomeScreen({ onJoin }: { onJoin: (playerId: string, roomId: string) => void }) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [avatar, setAvatar] = useState('🦊');

  useEffect(() => {
     // Opportunistic Database Cleanup: run silently when home mounts.
     const cleanDb = async () => {
         try {
             const allRoomsSnap = await get(ref(db, 'rooms'));
             if (allRoomsSnap.exists()) {
                 const rooms = allRoomsSnap.val();
                 const now = Date.now();
                 for (const [rId, data] of Object.entries(rooms)) {
                     const typedData = data as any;
                     // 1-day threshold (24 hours)
                     if (typedData.createdAt && now - typedData.createdAt > 24 * 60 * 60 * 1000) {
                         await remove(ref(db, `rooms/${rId}`));
                     }
                 }
             }
         } catch (e) {
             console.error("Cleanup failed", e);
         }
     };
     cleanDb();
  }, []);

  const handleJoin = async () => {
    if (!name || !roomId) return;
    
    const lowerRoomId = roomId.toLowerCase();
    const roomRef = ref(db, `rooms/${lowerRoomId}`);
    
    const snap = await get(roomRef);
    let targetPlayerId = Date.now().toString(); 

    if (!snap.exists()) {
      await set(roomRef, {
        createdAt: Date.now(),
        hostId: targetPlayerId,
        state: 'lobby',
        category: 'GENERAL',
        players: {
          [targetPlayerId]: { name, score: 0, hasAnswered: false, avatar, isSpectator: false }
        }
      });
    } else {
      const roomData = snap.val();
      const existingPlayers = roomData.players || {};
      
      const matchedEntry = Object.entries(existingPlayers).find(
        ([_, p]: [string, any]) => p.name.toLowerCase() === name.toLowerCase()
      );

      if (matchedEntry) {
         targetPlayerId = matchedEntry[0];
         // DO NOT overwrite avatar/isSpectator to respect their previous choices cleanly!
      } else {
         const playerRef = ref(db, `rooms/${lowerRoomId}/players/${targetPlayerId}`);
         const isLate = roomData.state !== 'lobby' && roomData.state !== 'final-results';
         await set(playerRef, { name, score: 0, hasAnswered: false, avatar, isSpectator: isLate });
      }
    }
    
    onJoin(targetPlayerId, lowerRoomId);
  };

  return (
    <div className="io-panel animated-panel" style={{ maxWidth: 450, margin: '0 auto' }}>
      <Title order={2} ta="center" mb="md" style={{ fontWeight: 900, fontSize: '2.2rem', textTransform: 'uppercase' }}>Play Now</Title>
      
      <Group justify="center" gap="xs" mb="lg" style={{ background: '#f3f4f6', padding: '12px', borderRadius: '16px', border: '3px solid #1f2937', overflowX: 'auto', flexWrap: 'nowrap' }}>
         {EMOJIS.map(e => (
             <UnstyledButton 
                 key={e} 
                 onClick={() => setAvatar(e)}
                 style={{ 
                    fontSize: '2rem', 
                    padding: '8px', 
                    background: avatar === e ? '#facc15' : 'transparent',
                    border: avatar === e ? '2px solid #1f2937' : '2px solid transparent',
                    borderRadius: '12px',
                    transition: 'transform 0.1s',
                    transform: avatar === e ? 'scale(1.1)' : 'scale(1)'
                 }}
             >
                {e}
             </UnstyledButton>
         ))}
      </Group>

      <Stack gap="lg">
        <TextInput 
          size="xl"
          className="io-input"
          placeholder="Enter your alias" 
          value={name} 
          onChange={(e) => setName(e.currentTarget.value)} 
        />
        <TextInput 
          size="xl"
          className="io-input"
          placeholder="Room ID" 
          value={roomId} 
          onChange={(e) => setRoomId(e.currentTarget.value)} 
          onKeyDown={(e) => { if (e.key === 'Enter') handleJoin() }}
        />
        <Button 
          fullWidth 
          size="xl" 
          mt="md" 
          color="pink"
          className="io-button"
          onClick={handleJoin}
        >
          Enter the Dash
        </Button>
      </Stack>
    </div>
  );
}
