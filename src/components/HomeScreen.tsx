import { useState, useEffect } from 'react';
import { TextInput, Button, Title, Stack, Group, UnstyledButton, Select, Loader, Text, Divider } from '@mantine/core';
import { ref, set, get, remove } from 'firebase/database';
import { db } from '../firebase';
import { Alerts } from '../utils/alerts';

const EMOJIS = ['🦊', '🐙', '👾', '🦄', '👽', '🤖', '🦉', '👻', '😎', '🐊'];

export function HomeScreen({ onJoin }: { onJoin: (playerId: string, roomId: string) => void }) {
  const [step, setStep] = useState(0); // 0: loading, 1: profile, 2: join/create
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  
  const [joinRoomId, setJoinRoomId] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');

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
                     // Delete room if no active players OR if it's over 24 hours old
                     if (!typedData.players || Object.keys(typedData.players).length === 0) {
                         await remove(ref(db, `rooms/${rId}`));
                     } else if (typedData.createdAt && now - typedData.createdAt > 24 * 60 * 60 * 1000) {
                         await remove(ref(db, `rooms/${rId}`));
                     }
                 }
             }
         } catch (e) {
             console.error("Cleanup failed", e);
         }
     };
     cleanDb();
     
     // Simulated short load animation
     setTimeout(() => setStep(1), 1500);
  }, []);

  const handleCreateRoom = async () => {
    if (!name) return;
    
    // Generate a random 4 letter room code
    const newRoomId = Math.random().toString(36).substring(2, 6).toLowerCase();
    const roomRef = ref(db, `rooms/${newRoomId}`);
    
    const targetPlayerId = Date.now().toString(); 
    await set(roomRef, {
      createdAt: Date.now(),
      hostId: targetPlayerId,
      state: 'lobby',
      category: 'GENERAL',
      difficulty: difficulty,
      players: {
        [targetPlayerId]: { name, score: 0, hasAnswered: false, avatar, isSpectator: false }
      }
    });
    
    onJoin(targetPlayerId, newRoomId);
  };

  const handleJoinExisting = async () => {
    if (!name || !joinRoomId) return;
    
    const lowerRoomId = joinRoomId.toLowerCase();
    const roomRef = ref(db, `rooms/${lowerRoomId}`);
    
    const snap = await get(roomRef);
    let targetPlayerId = Date.now().toString(); 

    if (!snap.exists()) {
       Alerts.warning("Room Not Found", "The room code you entered does not exist. Try creating a new one instead.");
       return;
    } else {
      const roomData = snap.val();
      const existingPlayers = roomData.players || {};
      
      const matchedEntry = Object.entries(existingPlayers).find(
        ([_, p]: [string, any]) => p.name.toLowerCase() === name.toLowerCase()
      );

      if (matchedEntry) {
         targetPlayerId = matchedEntry[0];
      } else {
         const playerRef = ref(db, `rooms/${lowerRoomId}/players/${targetPlayerId}`);
         const isLate = roomData.state !== 'lobby' && roomData.state !== 'final-results';
         await set(playerRef, { name, score: 0, hasAnswered: false, avatar, isSpectator: isLate });
      }
    }
    
    onJoin(targetPlayerId, lowerRoomId);
  };

  if (step === 0) {
     return (
        <div className="io-panel animated-panel" style={{ maxWidth: 450, margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
           <Loader color="pink" size="xl" type="bars" />
           <Title mt="xl" order={3}>Connecting to WordDash network...</Title>
        </div>
     );
  }

  if (step === 1) {
    return (
      <div className="io-panel animated-panel" style={{ maxWidth: 450, margin: '0 auto' }}>
        <Title order={2} ta="center" mb="md" style={{ fontWeight: 900, fontSize: '2.2rem', textTransform: 'uppercase' }}>Build Profile</Title>
        
        <Group justify="center" gap="xs" mb="lg" style={{ background: '#f3f4f6', padding: '12px', borderRadius: '16px', border: '3px solid #1f2937', overflowX: 'auto', flexWrap: 'nowrap' }}>
           {EMOJIS.map(e => (
               <UnstyledButton 
                   key={e} 
                   className="avatar-selector-btn"
                   onClick={() => setAvatar(e)}
                   data-selected={avatar === e}
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
          <Button 
            fullWidth 
            size="xl" 
            mt="md" 
            color="pink"
            className="io-button"
            disabled={!name}
            onClick={() => setStep(2)}
          >
            Next
          </Button>
        </Stack>
      </div>
    );
  }

  return (
    <div className="io-panel animated-panel" style={{ maxWidth: 450, margin: '0 auto' }}>
      <Title order={2} ta="center" mb="md" style={{ fontWeight: 900, fontSize: '2.2rem', textTransform: 'uppercase' }}>Play Now</Title>
      
      <Stack gap="lg">
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '3px solid #1f2937' }}>
           <Text fw={800} mb="sm" size="lg">Join Existing Game</Text>
           <Group align="flex-end" wrap="nowrap">
              <TextInput 
                 style={{ flex: 1 }}
                 size="lg"
                 className="io-input"
                 placeholder="Room Code" 
                 value={joinRoomId} 
                 onChange={(e) => setJoinRoomId(e.currentTarget.value)} 
                 onKeyDown={(e) => { if (e.key === 'Enter') handleJoinExisting() }}
              />
              <Button size="lg" color="cyan" className="io-button" onClick={handleJoinExisting} disabled={!joinRoomId}>
                 Join
              </Button>
           </Group>
        </div>

        <Divider my="sm" label={<Text fw={900} size="sm">OR</Text>} labelPosition="center" color="#1f2937" style={{ borderTopWidth: '2px' }} />

        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '3px solid #1f2937' }}>
           <Text fw={800} mb="sm" size="lg">Host New Game</Text>
           <Text fw={600} size="sm" mb="xs">Select Difficulty</Text>
           <Select 
              size="lg"
              className="io-input"
              mb="md"
              data={['Easy', 'Medium', 'Hard']} 
              value={difficulty} 
              onChange={(val) => setDifficulty(val || 'Easy')} 
           />
           <Button fullWidth size="lg" color="yellow" className="io-button" onClick={handleCreateRoom}>
              Create Room
           </Button>
        </div>
      </Stack>
    </div>
  );
}
