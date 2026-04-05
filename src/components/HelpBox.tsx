import { useState } from 'react';
import { Box, Stack, Text, ActionIcon, Group, Paper, Transition, List, ThemeIcon } from '@mantine/core';
import { IconHelp, IconX, IconCheck } from '@tabler/icons-react';

export function HelpBox() {
  const [isOpen, setIsOpen] = useState(false);

  return (
      <Box style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 1000 }}>
        <Transition mounted={isOpen} transition="slide-up" duration={200} timingFunction="ease">
          {(styles) => (
            <Paper 
               shadow="xl" 
               p="md" 
               mb="md"
               style={{ 
                   ...styles, 
                   width: 320, 
                   height: 'auto', 
                   display: 'flex', 
                   flexDirection: 'column',
                   border: '3px solid #1f2937',
                   borderRadius: '16px',
                   boxShadow: '0 8px 0 #1f2937'
               }}
            >
               <Group justify="space-between" mb="sm" pb="sm" style={{ borderBottom: '2px solid #e5e7eb' }}>
                   <Text fw={800} size="lg">How to Play</Text>
                   <ActionIcon variant="subtle" color="gray" onClick={() => setIsOpen(false)}>
                       <IconX size={20} />
                   </ActionIcon>
               </Group>

               <Stack gap="xs" pr="sm">
                   <Text fw={600} size="sm">Welcome to WordDash!</Text>
                   <List
                     spacing="xs"
                     size="sm"
                     center
                     icon={
                       <ThemeIcon color="pink" size={20} radius="xl">
                         <IconCheck size="1rem" />
                       </ThemeIcon>
                     }
                   >
                     <List.Item>The host chooses a theme and starts.</List.Item>
                     <List.Item>You have 20 seconds to answer the trivia.</List.Item>
                     <List.Item>Watch the dashes! Random letters will reveal over time to help you.</List.Item>
                     <List.Item>Answers are exactly ONE word.</List.Item>
                     <List.Item>First one to answer gets 100 points, second gets 75, everyone else gets 50.</List.Item>
                   </List>
                   <Text mt="xs" fw={800} c="dimmed" size="xs">Good luck and dash to the finish!</Text>
               </Stack>
            </Paper>
          )}
        </Transition>

        {!isOpen && (
              <ActionIcon
                 color="pink"
                 variant="filled"
                 size={60}
                 radius="xl"
                 onClick={() => setIsOpen(true)}
                 style={{ 
                     boxShadow: '0 4px 0 #1f2937', 
                     border: '3px solid #1f2937',
                     position: 'relative'
                 }}
              >
                 <IconHelp size={30} />
              </ActionIcon>
        )}
      </Box>
  );
}
