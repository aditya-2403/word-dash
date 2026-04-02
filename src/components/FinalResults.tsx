import { useEffect } from 'react';
import { Button, Title, Table, Stack, Text, Badge } from '@mantine/core';
import confetti from 'canvas-confetti';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { RoomState } from '../types';
import { audioEngine } from '../utils/audio';

interface FinalResultsProps {
  roomState: RoomState;
  roomId: string;
  playerId: string;
}

export function FinalResults({ roomState, roomId, playerId }: FinalResultsProps) {
  const isHost = roomState.hostId === playerId;
  
  useEffect(() => {
     audioEngine.playFanfare();
     confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#facc15', '#f472b6', '#a78bfa']
     });
  }, []);

  const sortedPlayers = Object.entries(roomState.players)
     .filter(([_, p]) => !p.isSpectator)
     .sort((a, b) => b[1].score - a[1].score);
  const totalRounds = roomState.round || 10;
  
  const handleReturnToLobby = async () => {
    // Return to Lobby and explicitly zero out all player scores
    const updates: Record<string, any> = {};
     Object.keys(roomState.players).forEach(pId => {
        updates[`players/${pId}/score`] = 0;
        updates[`players/${pId}/hasAnswered`] = false;
        updates[`players/${pId}/isSpectator`] = false; // Mass upgrade spectators!
     });

    updates['state'] = 'lobby';
    updates['round'] = 0; // Wipe the absolute limit cleanly
    updates['currentQuestion'] = null; // Flush visually

    await update(ref(db, `rooms/${roomId}`), updates);
  };

  return (
    <div className="io-panel animated-panel" style={{ maxWidth: 650, margin: '0 auto', background: '#fdfbfb' }}>
      <Stack gap="xl" align="center">
        <Title order={1} style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', WebkitTextStroke: '2px #1f2937', color: '#facc15' }}>
          Game Overlay Complete!
        </Title>
        <Text fw={800} size="xl" c="dimmed">All {totalRounds} rounds have concluded.</Text>
        
        <Table verticalSpacing="xl" mt="md" w="100%" styles={{ tr: { borderBottom: '3px solid #e5e7eb' }, td: { color: '#1f2937' }, th: { color: '#1f2937', borderBottom: '4px solid #1f2937', fontWeight: 900 } }}>
          <Table.Tbody>
             {sortedPlayers.map(([id, p], index) => {
               const isWinner = index === 0;
               return (
                 <Table.Tr key={id} style={{ backgroundColor: isWinner ? '#fef08a' : 'transparent', fontWeight: 800 }}>
                   <Table.Td style={{ width: '60px', textAlign: 'center' }}>
                      <Badge size="xl" circle color={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'} style={{ border: '3px solid #1f2937', transform: isWinner ? 'scale(1.2)' : 'none' }}>
                         {index + 1}
                      </Badge>
                   </Table.Td>
                   <Table.Td><Text fw={isWinner ? 900 : 800} size="1.8rem">{p.avatar || '🤖'} {p.name} {isWinner && '👑'}</Text></Table.Td>
                   <Table.Td ta="right"><Text fw={900} size="2rem" c={isWinner ? 'green' : '#1f2937'}>{p.score}</Text></Table.Td>
                 </Table.Tr>
               )
             })}
          </Table.Tbody>
        </Table>

        {isHost ? (
          <Button 
            fullWidth 
            size="xl" 
            mt="lg" 
            color="red"
            className="io-button"
            style={{ fontSize: '1.4rem' }}
            onClick={handleReturnToLobby}
          >
            Reset Scores & Return to Lobby
          </Button>
        ) : (
          <Text mt="lg" size="xl" fw={800} className="pulse-text" c="dimmed">Waiting for host to cycle the room...</Text>
        )}
      </Stack>
    </div>
  );
}
