import { useState } from 'react';
import { Button, Title, List, ThemeIcon, Stack, Text, Group, Badge, Loader, Select, ActionIcon } from '@mantine/core';
import { IconUser, IconUserX } from '@tabler/icons-react';
import { ref, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { RoomState } from '../types';
import { CONSTANTS, CATEGORIES } from '../utils/constants';
import { generateQuestion } from '../services/gemini';
import { Alerts } from '../utils/alerts';

interface LobbyProps {
  roomState: RoomState;
  roomId: string;
  playerId: string;
}

export function Lobby({ roomState, roomId, playerId }: LobbyProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isHost = roomState.hostId === playerId;
  const currentCategory = roomState.category || 'GENERAL';

  const handleStartGame = async () => {
    setIsGenerating(true);
    
    // Play sound FX
    import('../utils/audio').then(a => a.audioEngine.playPop());

    const themeTarget = CATEGORIES[currentCategory]?.promptTheme || CATEGORIES.GENERAL.promptTheme;
    const questionsArray = await generateQuestion(themeTarget, roomState.difficulty || 'Easy');
    
    const updates: Record<string, any> = {};
    Object.keys(roomState.players).forEach(pId => {
       updates[`players/${pId}/hasAnswered`] = false;
    });
    
    updates['state'] = 'playing';
    updates['questionsData'] = questionsArray;
    
    // Mount first question explicitly
    updates['currentQuestion'] = {
       text: questionsArray[0].text,
       answer: questionsArray[0].answer,
       timerEnd: Date.now() + CONSTANTS.ROUND_TIME_MS
    };
    updates['round'] = 1;
    
    await update(ref(db, `rooms/${roomId}`), updates);
    setIsGenerating(false);
  };

  const handleCategoryChange = async (val: string | null) => {
    if (!val || !isHost) return;
    await update(ref(db, `rooms/${roomId}`), { category: val });
  };

  // Convert categories object to Mantine Select format
  const selectData = Object.entries(CATEGORIES).map(([key, data]) => ({
    value: key,
    label: data.label
  }));

  const handleKick = async (idToKick: string, pName: string) => {
     const result = await Alerts.confirmKick(pName);
     if (result.isConfirmed) {
        await remove(ref(db, `rooms/${roomId}/players/${idToKick}`));
     }
  };

  return (
    <div className="io-panel animated-panel" style={{ maxWidth: 500, margin: '0 auto' }}>
      <Stack align="center" ta="center" gap="xl">
        <Title order={2} style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Mission Briefing</Title>
        <Group justify="center">
          <Badge color="violet" size="xl" radius="sm" style={{ border: '3px solid #1f2937', boxShadow: '0 4px 0 #1f2937', fontWeight: 800 }}>
            Room: {roomId.toUpperCase()}
          </Badge>
        </Group>

        <div style={{ width: '100%', textAlign: 'left' }}>
           <Text fw={800} mb={5}>Trivia Theme</Text>
           <Select
              data={selectData}
              value={currentCategory}
              onChange={handleCategoryChange}
              disabled={!isHost}
              className="io-input"
              size="lg"
           />
        </div>
        
        <div style={{ width: '100%', background: '#f9f9f9', borderRadius: 16, border: '3px solid #1f2937', padding: 16 }}>
          <List
            spacing="md"
            size="lg"
            center
            w="100%"
            icon={
              <ThemeIcon color="cyan" size={32} radius="xl" style={{ border: '2px solid #1f2937' }}>
                <IconUser size="1.2rem" />
              </ThemeIcon>
            }
          >
            {Object.entries(roomState.players).map(([id, p]) => (
              <List.Item key={id} style={{ color: '#1f2937' }}>
                 <Group justify="space-between" w="100%" pl="xs">
                    <Text fw={800} size="xl"><span className="avatar-breath" style={{ display: 'inline-block' }}>{p.avatar || '🤖'}</span> {p.name}</Text>
                    <Group>
                       {roomState.hostId === id && <Badge color="pink" variant="filled" style={{ border: '2px solid #1f2937' }}>Host</Badge>}
                       {isHost && id !== playerId && (
                          <ActionIcon color="red" variant="filled" onClick={() => handleKick(id, p.name)} style={{ border: '2px solid #1f2937' }}>
                             <IconUserX size={16} />
                          </ActionIcon>
                       )}
                    </Group>
                 </Group>
              </List.Item>
            ))}
          </List>
        </div>
        
        {isHost ? (
          <Button 
            fullWidth 
            size="xl" 
            mt="md" 
            color="yellow"
            className="io-button"
            onClick={handleStartGame}
            disabled={isGenerating}
            leftSection={isGenerating ? <Loader color="dark" size="xs" /> : undefined}
          >
            {isGenerating ? 'AI Generating...' : 'Engage'}
          </Button>
        ) : (
          <Text mt="xl" fw={800} c="dimmed" fs="italic" className="pulse-text">Awaiting Host Command...</Text>
        )}
      </Stack>
    </div>
  );
}
