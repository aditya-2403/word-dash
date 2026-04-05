import { useState, useEffect } from 'react';
import { Table, Stack, Center, Text, Group, Badge, Loader } from '@mantine/core';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { RoomState } from '../types';
import { CONSTANTS } from '../utils/constants';
import { audioEngine } from '../utils/audio';

interface LeaderboardProps {
  roomState: RoomState;
  roomId: string;
  playerId: string;
}

export function Leaderboard({ roomState, roomId, playerId }: LeaderboardProps) {
  const isHost = roomState.hostId === playerId;
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Hide spectators naturally
  const sortedPlayers = Object.entries(roomState.players)
     .filter(([_, p]) => !p.isSpectator)
     .sort((a, b) => b[1].score - a[1].score);

  useEffect(() => {
    // Both Host and Players see the 5 second countdown ticking natively on their UI
    const timer = setInterval(() => {
       setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
     // Trigger tick sound on pulse
     if (secondsLeft > 0 && secondsLeft <= 3) {
         audioEngine.playTick();
     }
     
     if (secondsLeft === 0 && isHost && !isGenerating) {
        if ((roomState.round || 0) >= 10) {
           // Proceed to absolute final-results and wipe the chat messages for privacy
           update(ref(db, `rooms/${roomId}`), { 
               state: 'final-results',
               messages: null 
           });
        } else {
           // Seamlessly trigger AI again and push state back into 'playing'
           handleNextRoundAuto();
        }
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isHost]);

  const handleNextRoundAuto = async () => {
    setIsGenerating(true);
    try {
        const nextQData = roomState.questionsData?.[roomState.round || 1];
        
        if (!nextQData) {
            throw new Error("Batch data explicitly starved - aborting to fallback");
        }

        const updates: Record<string, any> = {};
        Object.keys(roomState.players).forEach(pId => {
           updates[`players/${pId}/hasAnswered`] = false;
        });

        updates['state'] = 'playing';
        updates['currentQuestion'] = {
           text: nextQData.text,
           answer: nextQData.answer,
           timerEnd: Date.now() + CONSTANTS.ROUND_TIME_MS
        };
        updates['round'] = (roomState.round || 0) + 1;

        await update(ref(db, `rooms/${roomId}`), updates);
    } catch {
        setIsGenerating(false);
        setSecondsLeft(5);
    }
  };

  return (
    <div className="io-panel animated-panel" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Stack gap="xl">
        <Text component="h2" ta="center" style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
          Round {roomState.round} / 10 Report
        </Text>
        
        {roomState.currentQuestion && (
            <div style={{ background: '#f3f4f6', border: '3px solid #1f2937', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
               <Text fw={800} size="lg" mb={8}>{roomState.currentQuestion.text}</Text>
               <Badge color="green" size="xl" style={{ border: '3px solid #1f2937', fontSize: '1.2rem', padding: '12px', height: 'auto' }}>
                  {roomState.currentQuestion.answer}
               </Badge>
            </div>
        )}

        <Table verticalSpacing="md" mt="md" styles={{ tr: { borderBottom: '3px solid #e5e7eb' }, td: { color: '#1f2937' }, th: { color: '#1f2937', borderBottom: '4px solid #1f2937', fontWeight: 900 } }}>
          <Table.Thead>
             <Table.Tr>
                <Table.Th><Text size="lg" fw={900}>Rank</Text></Table.Th>
                <Table.Th><Text size="lg" fw={900}>Operative</Text></Table.Th>
                <Table.Th><Text size="lg" fw={900}>Score</Text></Table.Th>
             </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
             {sortedPlayers.map(([id, p], index) => {
               const isWinner = index === 0 && p.score > 0;
               return (
                 <Table.Tr key={id} style={{ backgroundColor: isWinner ? '#fef08a' : 'transparent', fontWeight: 800 }}>
                   <Table.Td>
                      <Badge size="xl" circle color={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'} style={{ border: '2px solid #1f2937' }}>
                         {index + 1}
                      </Badge>
                   </Table.Td>
                   <Table.Td>
                      <Text fw={isWinner ? 900 : 800} size="xl">
                         <span className="avatar-breath" style={{ display: 'inline-block' }}>{p.avatar || '🤖'}</span> {p.name} {id === playerId && <Text span c="pink">(You)</Text>}
                      </Text>
                   </Table.Td>
                   <Table.Td><Text fw={900} size="xl">{p.score}</Text></Table.Td>
                 </Table.Tr>
               )
             })}
          </Table.Tbody>
        </Table>

        <Center mt="lg">
           {isGenerating ? (
              <Group>
                 <Loader color="blue" size="sm" />
                 <Text size="xl" fw={800} className="pulse-text">AI generating next round...</Text>
              </Group>
           ) : (
              <Text size="xl" fw={800} color={secondsLeft <= 2 ? 'red' : '#1f2937'}>
                 Next round begins in: {secondsLeft}s
              </Text>
           )}
        </Center>
      </Stack>
    </div>
  );
}
