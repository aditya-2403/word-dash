import { useState, useEffect } from 'react';
import { Title, Progress, TextInput, Group, Stack, Text, Badge, Grid } from '@mantine/core';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { RoomState } from '../types';
import { CONSTANTS } from '../utils/constants';
import { audioEngine } from '../utils/audio';

export function GameLoop({ roomState, roomId, playerId }: { roomState: RoomState, roomId: string, playerId: string }) {
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(CONSTANTS.ROUND_TIME_MS / 1000);
  
  const question = roomState.currentQuestion;
  const isHost = roomState.hostId === playerId;
  const me = roomState.players[playerId];

  useEffect(() => {
    if (!question) return;
    
    const interval = setInterval(() => {
       const remaining = Math.max(0, question.timerEnd - Date.now());
       setTimeLeft(remaining / 1000);
       
       if (isHost && roomState.state === 'playing') {
          const allAnswered = Object.values(roomState.players).every(p => p.hasAnswered);
          if (remaining === 0 || allAnswered) {
             update(ref(db, `rooms/${roomId}`), { state: 'results' });
             clearInterval(interval);
          }
       }
    }, CONSTANTS.TICK_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [question, roomState.players, isHost, roomId, roomState.state]);

  const handleChange = async (val: string) => {
     setInputVal(val);
     
     if (me.hasAnswered || !question) return;

     if (val.trim().toLowerCase() === question.answer.toLowerCase()) {
        audioEngine.playCorrect();
        const alreadyAnsweredCount = Object.values(roomState.players).filter(p => p.hasAnswered).length;
        let points = CONSTANTS.SCORING.DEFAULT;
        if (alreadyAnsweredCount === 0) points = CONSTANTS.SCORING.FIRST_PLACE;
        else if (alreadyAnsweredCount === 1) points = CONSTANTS.SCORING.SECOND_PLACE;

        await update(ref(db, `rooms/${roomId}/players/${playerId}`), {
           score: me.score + points,
           hasAnswered: true
        });
     } else {
        // Only buzz if time isn't up
        if (timeLeft > 0) audioEngine.playPop();
     }
  };

  return (
    <Grid gutter="xl" className="animated-panel">
       <Grid.Col span={{ base: 12, md: 8 }}>
         <div className="io-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Group justify="space-between" align="center">
               <Badge size="xl" color="cyan" style={{ border: '3px solid #1f2937', boxShadow: '0 4px 0 #1f2937' }}>Round {roomState.round}</Badge>
               <Text fw={900} size="xl" c={timeLeft < 6 ? 'red' : '#1f2937'}>
                  {timeLeft.toFixed(1)}s
               </Text>
            </Group>
            
            <Progress 
               value={(timeLeft / (CONSTANTS.ROUND_TIME_MS / 1000)) * 100} 
               size="xl" 
               radius="xl" 
               color={timeLeft < 6 ? 'red' : 'green'} 
               animated 
               style={{ border: '3px solid #1f2937' }}
            />

            <Title ta="center" order={2} style={{ fontSize: '2rem', lineHeight: 1.3, fontWeight: 900, textTransform: 'uppercase' }}>
               {question?.text}
            </Title>

            {me.isSpectator ? (
               <Badge color="gray" size="xl" style={{ border: '4px solid #1f2937', padding: '24px', fontSize: '1.4rem' }}>
                  🍿 You are Spectating
               </Badge>
            ) : (
               <TextInput
                  size="xl"
                  className="io-input"
                  placeholder={me.hasAnswered ? "Correct! Waiting for others..." : "Type your answer..."}
                  value={inputVal}
                  onChange={(e) => handleChange(e.target.value)}
                  autoFocus
                  disabled={me.hasAnswered || timeLeft === 0}
                  styles={{ 
                     input: { 
                        textAlign: 'center', 
                        fontSize: '1.6rem', 
                        backgroundColor: me.hasAnswered ? '#86efac' : 'white',
                        color: '#1f2937'
                     } 
                  }}
               />
            )}
         </div>
       </Grid.Col>
       
       <Grid.Col span={{ base: 12, md: 4 }}>
         <div className="io-panel" style={{ minHeight: '350px' }}>
           <Title order={3} mb="xl" style={{ borderBottom: '3px solid #1f2937', paddingBottom: '10px', fontWeight: 900 }}>Competitors</Title>
           <Stack gap="sm">
             {Object.entries(roomState.players).map(([id, p]) => (
                <Group key={id} justify="space-between" wrap="nowrap" style={{ background: '#f3f4f6', padding: '10px 14px', borderRadius: '12px', border: '3px solid #1f2937' }}>
                  <Text fw={800} td={p.hasAnswered ? 'line-through' : 'none'} opacity={p.hasAnswered ? 0.6 : 1} size="lg">
                     {p.avatar || '🤖'} {p.name}
                  </Text>
                  <Badge size="lg" color={p.hasAnswered ? 'green' : 'gray'} style={{ border: '2px solid #1f2937' }}>{p.score} pts</Badge>
                </Group>
             ))}
           </Stack>
         </div>
       </Grid.Col>
    </Grid>
  );
}
