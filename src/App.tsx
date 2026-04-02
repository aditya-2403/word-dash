import { useState, useEffect } from 'react';
import { MantineProvider, Container, Box, Text, ActionIcon } from '@mantine/core';
import { ref, onValue, onDisconnect } from 'firebase/database';
import { db } from './firebase';
import { RoomState } from './types';
import { CATEGORIES, CategoryKey } from './utils/constants';

import { HomeScreen } from './components/HomeScreen';
import { Lobby } from './components/Lobby';
import { GameLoop } from './components/GameLoop';
import { Leaderboard } from './components/Leaderboard';
import { FinalResults } from './components/FinalResults';
import { ChatBox } from './components/ChatBox';
import { isMuted, setMuted } from './utils/audio';
import { IconVolume, IconVolumeOff } from '@tabler/icons-react';

import '@mantine/core/styles.css';
import './index.css';

export default function App() {
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [soundMuted, setSoundMuted] = useState(isMuted);

  const toggleMute = () => {
     setSoundMuted(!soundMuted);
     setMuted(!soundMuted);
  };

  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      setRoomState(snapshot.val());
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !playerId) return;
    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
    const onDisconnectRef = onDisconnect(playerRef);
    onDisconnectRef.remove(); // Auto-remove player from room on tab close

    return () => {
       onDisconnectRef.cancel(); // Clean up the hook if manually leaving without tab close
    };
  }, [roomId, playerId]);

  useEffect(() => {
     // Explicit Kick / Banishment Detonator
     // If you are actively hooked to a room but your specific player node is missing -> KICK
     if (roomState && playerId && roomState.players && !roomState.players[playerId]) {
         window.alert("You were kicked from the room by the Host.");
         setRoomId('');
         setPlayerId('');
         setRoomState(null);
     }
  }, [roomState, playerId]);

  let currentView = <HomeScreen onJoin={(pId, rId) => { setPlayerId(pId); setRoomId(rId); }} />;
  let currentCategory = CATEGORIES.GENERAL;

  if (roomState) {
      if (roomState.category && CATEGORIES[roomState.category as CategoryKey]) {
         currentCategory = CATEGORIES[roomState.category as CategoryKey];
      }

      if (roomState.state === 'lobby') {
         currentView = <Lobby roomState={roomState} roomId={roomId} playerId={playerId} />;
      } else if (roomState.state === 'playing') {
         currentView = <GameLoop roomState={roomState} roomId={roomId} playerId={playerId} />;
      } else if (roomState.state === 'results') {
         currentView = <Leaderboard roomState={roomState} roomId={roomId} playerId={playerId} />;
      } else if (roomState.state === 'final-results') {
         currentView = <FinalResults roomState={roomState} roomId={roomId} playerId={playerId} />;
      }
  }

  // Inject the seamless pattern tracking to the window body
  useEffect(() => {
     document.body.style.backgroundImage = currentCategory.bgPattern;
     document.body.style.backgroundColor = currentCategory.darkOverlay; // Base color
     document.body.style.backgroundBlendMode = 'overlay';
     document.body.style.backgroundSize = '300px';
     document.body.style.transition = 'background 0.5s ease-in-out';
  }, [currentCategory]);

  return (
    <MantineProvider defaultColorScheme="light">
      <ActionIcon 
         variant="white" 
         size="xl" 
         radius="xl" 
         style={{ position: 'absolute', top: 20, right: 20, zIndex: 100, border: '3px solid #1f2937', boxShadow: '0 4px 0 #1f2937' }}
         onClick={toggleMute}
      >
         {soundMuted ? <IconVolumeOff style={{ color: '#1f2937' }} /> : <IconVolume style={{ color: '#1f2937' }} />}
      </ActionIcon>
      
      <Container size="md" p={{ base: 'md', sm: 'xl' }} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <Box mt={40} mb={60} style={{ 
            background: 'white', 
            padding: '10px 40px', 
            borderRadius: '50px', 
            border: '4px solid #1f2937', 
            boxShadow: '0 8px 0 #1f2937',
            transform: 'rotate(-2deg)'
         }}>
           <Text 
              component="h1"
              ta="center" 
              variant="gradient" 
              gradient={{ from: 'pink', to: 'yellow', deg: 90 }} 
              style={{ fontSize: '4rem', fontWeight: 900, textShadow: '3px 3px 0px #000', letterSpacing: '1px', WebkitTextStroke: '2px #1f2937' }}
           >
              WordDash
           </Text>
         </Box>
         
         <div style={{ width: '100%', maxWidth: '800px', flexGrow: 1 }}>
           {currentView}
         </div>
         
         <Box mt="xl" pt="xl">
            <Text fw={800} size="sm" style={{ color: '#1f2937', letterSpacing: '2px', textTransform: 'uppercase' }}>
               made with ♥ by Xiondrey
            </Text>
         </Box>
      </Container>
      
      {roomState && roomState.state !== 'final-results' && playerId && (
          <ChatBox roomState={roomState} roomId={roomId} playerId={playerId} />
      )}
    </MantineProvider>
  );
}
