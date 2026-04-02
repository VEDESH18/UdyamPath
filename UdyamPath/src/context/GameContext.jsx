import { createContext, useContext, useReducer, useEffect } from 'react';
import { getSectorInfo } from '../data/sectorData';
import { getLevelDetails } from '../data/levels';

const GameContext = createContext(null);

const MAX_TURNS_PER_LEVEL = 3;

const initialSessionState = {
  isStarted: false,
  phase: 'idle', // 'intro' | 'loading' | 'scenario' | 'consequence' | 'gameover'
  levelId: 1,
  levelDetails: null,
  turn: 1, 
  resources: {
    budget: 50000,
    budgetMax: 500000,
    morale: 60,
    trust: 60,
    impact: 10,
    mentorTokens: 1,
  },
  scores: {
    socialImpact: 0,
    financialSustainability: 0,
    teamHealth: 0,
    communityTrust: 0,
  },
  currentScenario: null,
  consequence: null,
  lesson: null,
  founderQuote: null,
  history: [],
};

const getGlobalState = () => {
  const saved = localStorage.getItem('udyampath_global_state_v2');
  if (saved) return JSON.parse(saved);
  return {
    founderDNA: {
      socialImpact: 50,
      financialSustainability: 50,
      teamHealth: 50,
      communityTrust: 50,
    },
    sessionCount: 0,
    behavioralFlags: [] // e.g., ["Consistently ignores team", "Overspends on tech"]
  };
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        active: {
          ...initialSessionState,
          isStarted: true,
          levelId: action.payload.levelId,
          levelDetails: getLevelDetails(action.payload.levelId),
          phase: 'intro',
          sectorData: getSectorInfo(action.payload?.sector),
          scores: { ...initialSessionState.scores }
        }
      };

    case 'START_SCENARIOS':
      return {
        ...state,
        active: {
          ...state.active,
          phase: 'loading'
        }
      };

    case 'SET_SCENARIO':
      return {
        ...state,
        active: {
          ...state.active,
          phase: 'scenario',
          currentScenario: action.payload
        }
      };

    case 'MAKE_DECISION':
      return {
        ...state,
        active: {
          ...state.active,
          phase: 'loading',
          history: [...state.active.history, { 
            turn: state.active.turn,
            scenario: state.active.currentScenario.context,
            decision: action.payload 
          }]
        }
      };

    case 'SET_CONSEQUENCE': {
      const { delta, consequence, lesson, founderQuote } = action.payload;
      const res = state.active.resources;
      
      const newResources = {
        ...res,
        budget: Math.min(res.budgetMax, Math.max(0, res.budget + (delta.budget || 0))),
        morale: Math.min(100, Math.max(0, res.morale + (delta.morale || 0))),
        trust: Math.min(100, Math.max(0, res.trust + (delta.trust || 0))),
        impact: Math.min(100, Math.max(0, res.impact + (delta.impact || 0))),
      };

      const newScores = { // Track cumulative positive moves out of 100 for grading
        socialImpact: Math.min(100, state.active.scores.socialImpact + Math.max(0, delta.impact || 0)),
        financialSustainability: Math.min(100, state.active.scores.financialSustainability + Math.max(0, (delta.budget/1000) || 0)),
        teamHealth: Math.min(100, state.active.scores.teamHealth + Math.max(0, delta.morale || 0)),
        communityTrust: Math.min(100, state.active.scores.communityTrust + Math.max(0, delta.trust || 0)),
      };

      return {
        ...state,
        active: {
          ...state.active,
          phase: 'consequence',
          resources: newResources,
          scores: newScores,
          consequence,
          lesson,
          founderQuote,
          lastDelta: delta
        }
      };
    }

    case 'NEXT_TURN': {
      const nextTurn = state.active.turn + 1;
      
      if (nextTurn > MAX_TURNS_PER_LEVEL) {
        // Evaluate Pass/Fail
        const thresholds = state.active.levelDetails.thresholds;
        let passed = true;
        
        if (thresholds.impact && state.active.scores.socialImpact < thresholds.impact) passed = false;
        if (thresholds.finance && state.active.scores.financialSustainability < thresholds.finance) passed = false;
        if (thresholds.trust && state.active.scores.communityTrust < thresholds.trust) passed = false;
        if (thresholds.team && state.active.scores.teamHealth < thresholds.team) passed = false;

        // Evolve DNA permanently based on performance
        const newGlobal = {
          ...state.global,
          sessionCount: state.global.sessionCount + 1,
          founderDNA: { 
            socialImpact: Math.min(100, (state.global.founderDNA.socialImpact * 0.8) + (state.active.scores.socialImpact * 0.2)),
            financialSustainability: Math.min(100, (state.global.founderDNA.financialSustainability * 0.8) + (state.active.scores.financialSustainability * 0.2)),
            teamHealth: Math.min(100, (state.global.founderDNA.teamHealth * 0.8) + (state.active.scores.teamHealth * 0.2)),
            communityTrust: Math.min(100, (state.global.founderDNA.communityTrust * 0.8) + (state.active.scores.communityTrust * 0.2)),
          }
        };

        localStorage.setItem('udyampath_global_state_v2', JSON.stringify(newGlobal));

        return {
          global: newGlobal,
          active: {
            ...state.active,
            phase: 'gameover',
            passed
          }
        };
      }

      return {
        ...state,
        active: {
          ...state.active,
          turn: nextTurn,
          phase: 'loading',
          currentScenario: null,
          consequence: null,
        }
      };
    }

    case 'RESET_SESSION':
      return {
        ...state,
        active: initialSessionState
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    global: getGlobalState(),
    active: initialSessionState
  });

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
