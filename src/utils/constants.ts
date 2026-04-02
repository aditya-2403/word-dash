import { DefaultMantineColor } from '@mantine/core';

export const CONSTANTS = {
  ROUND_TIME_MS: 20000,
  TICK_INTERVAL_MS: 100,
  SCORING: {
    FIRST_PLACE: 100,
    SECOND_PLACE: 75,
    DEFAULT: 50,
  }
};

export type CategoryKey = 'GENERAL' | 'SCIENCE' | 'HISTORY' | 'SPACE' | 'MOVIE' | 'BOLLYWOOD';

export interface CategoryData {
  id: CategoryKey;
  label: string;
  promptTheme: string;
  bgPattern: string;
  colorRef: DefaultMantineColor;
  darkOverlay: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryData> = {
  GENERAL: {
    id: "GENERAL",
    label: "General Knowledge",
    promptTheme: "general everyday knowledge",
    bgPattern: "none",
    colorRef: "blue",
    darkOverlay: "rgba(30, 60, 100, 0.85)"
  },
  SCIENCE: {
    id: "SCIENCE",
    label: "Mad Science",
    promptTheme: "chemistry, lab experiments, basic physics, or famous scientists",
    bgPattern: "url('/images/science_bg_1774986478785.png')",
    colorRef: "lime",
    darkOverlay: "rgba(20, 80, 40, 0.85)"
  },
  HISTORY: {
    id: "HISTORY",
    label: "Ancient History",
    promptTheme: "ancient civilizations, world wars, medieval times, or historical figures",
    bgPattern: "url('/images/history_bg_1774986498684.png')",
    colorRef: "orange",
    darkOverlay: "rgba(100, 50, 10, 0.85)"
  },
  SPACE: {
    id: "SPACE",
    label: "Deep Space",
    promptTheme: "planets, galaxies, astronomy, NASA, or space exploration",
    bgPattern: "url('/images/space_bg_1774986515863.png')",
    colorRef: "grape",
    darkOverlay: "rgba(40, 20, 80, 0.85)"
  },
  MOVIE: {
    id: "MOVIE",
    label: "Hollywood Cinema",
    promptTheme: "famous hollywood movies, oscar winners, famous actors or directors",
    bgPattern: "url('/images/movie_bg_1774986531184.png')",
    colorRef: "pink",
    darkOverlay: "rgba(100, 20, 60, 0.85)"
  },
  BOLLYWOOD: {
    id: "BOLLYWOOD",
    label: "Bollywood Magic",
    promptTheme: "famous bollywood movies, indian actors, iconic hindi songs or directors",
    bgPattern: "url('/images/bollywood_bg_1774986551257.png')",
    colorRef: "yellow",
    darkOverlay: "rgba(100, 80, 10, 0.85)"
  }
};
