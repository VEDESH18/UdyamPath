export const JOURNEY_LEVELS = [
  {
    id: 1,
    title: 'Ideation & Discovery',
    description: 'Find a real problem worth solving in the Indian context.',
    thresholds: { impact: 60, trust: 50 },
    icon: '💡',
    position: { x: 50, y: 10 },
  },
  {
    id: 2,
    title: 'Prototyping (Jugaad)',
    description: 'Build a low-cost Version 1.0 using local resources.',
    thresholds: { finance: 50, team: 40 },
    icon: '🛠️',
    position: { x: 70, y: 25 },
  },
  {
    id: 3,
    title: 'Market Entry',
    description: 'Acquire your first 100 paying customers without marketing spend.',
    thresholds: { finance: 60, trust: 60 },
    icon: '🚀',
    position: { x: 30, y: 40 },
  },
  {
    id: 4,
    title: 'Unit Economics',
    description: 'Make the margins work before scaling operations.',
    thresholds: { finance: 80, impact: 60 },
    icon: '📈',
    position: { x: 50, y: 55 },
  },
  {
    id: 5,
    title: 'Scaling Impact',
    description: 'Expand to neighboring districts while maintaining quality.',
    thresholds: { team: 70, trust: 80 },
    icon: '🌍',
    position: { x: 70, y: 70 },
  },
  {
    id: 6,
    title: 'Sustainable Enterprise',
    description: 'Achieve long-term financial independence and profound social change.',
    thresholds: { impact: 90, finance: 90, team: 80, trust: 90 },
    icon: '🏆',
    position: { x: 50, y: 85 },
  }
];

export function getLevelDetails(levelId) {
  return JOURNEY_LEVELS.find(l => l.id === levelId) || JOURNEY_LEVELS[0];
}
