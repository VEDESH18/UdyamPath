import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, getUserDoc, syncUserState } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContext = createContext();

const initialModuleProgressEntry = {
  attempts: 0,
  lastScore: 0,
  lastDifficulty: 'beginner',
  scenariosUsed: [],
  completedAt: [],
  answerHistory: [],
  masteryLevel: 0
};

const defaultInitialState = {
  user: null, // this is the profile user details { name, age... } (NOT the firebase auth obj)
  idea: '',
  language: 'en',
  validationReport: null,
  moduleProgress: {},
  currentModule: null,
  currentAnswers: [],
  report: null,
  learningPath: [],
  continuousInsights: [],
  streak: 0,
  lastActiveDate: null
};

export const AppProvider = ({ children }) => {
  // 1. Firebase Auth State
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 2. Application State (hydrated from localStorage OR Firebase)
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('udyampath_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Date diff for streak checking
        if (parsed.lastActiveDate) {
          const lastActive = new Date(parsed.lastActiveDate).setHours(0, 0, 0, 0);
          const today = new Date().setHours(0, 0, 0, 0);
          const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
             parsed.streak = 0; // Lost streak
          }
          parsed.lastActiveDate = new Date().toISOString();
        } else {
          parsed.lastActiveDate = new Date().toISOString();
          parsed.streak = 1;
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing state", e);
      }
    }
    return {
      ...defaultInitialState,
      lastActiveDate: new Date().toISOString(),
      streak: 1
    };
  });

  // Track if initial load is done to prevent overwriting cloud data immediately with empty local data
  const [initialHydrationDone, setInitialHydrationDone] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true); // Always block routing while checking/hydrating
      setAuthUser(user);
      if (user) {
        // User logged in, fetch their state from Firestore to overwrite local cache
        try {
          const cloudData = await getUserDoc(user.uid);
          if (cloudData) {
            setState(prev => ({ ...prev, ...cloudData }));
          }
        } catch (dbError) {
          console.error("Firestore DB missing or blocked. Falling back to default:", dbError);
        }
      } else {
        // Logged out, clear state
        setState(prev => ({
          ...defaultInitialState,
          lastActiveDate: new Date().toISOString(),
          streak: 1
        }));
        localStorage.removeItem('udyampath_state');
      }
      setInitialHydrationDone(true);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync to local storage & Firebase on state change
  useEffect(() => {
    // Only save if we have finished evaluating the initial cloud load!
    if (!initialHydrationDone) return;
    
    // Always save to fast local cache
    localStorage.setItem('udyampath_state', JSON.stringify(state));

    // If logged in, sync core persistence fields to Firebase
    if (authUser) {
      // Throttle/debounce could be implemented here, but we'll run it async for now
      syncUserState(authUser.uid, state).catch(e => console.error("Cloud sync failed:", e));
    }
  }, [state, authUser, initialHydrationDone]);

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateUser = (userData) => {
    updateState({ user: { ...state.user, ...userData } });
  };

  const updateModuleProgress = (moduleName, updates) => {
    setState((prev) => {
      const currentProgress = prev.moduleProgress[moduleName] || { ...initialModuleProgressEntry };
      return {
        ...prev,
        moduleProgress: {
          ...prev.moduleProgress,
          [moduleName]: { ...currentProgress, ...updates }
        }
      };
    });
  };

  const resetState = () => {
    setState({
      ...defaultInitialState,
      lastActiveDate: new Date().toISOString(),
      streak: 1
    });
    localStorage.removeItem('udyampath_state');
  };

  return (
    <AppContext.Provider value={{ state, authUser, authLoading, updateState, updateUser, updateModuleProgress, resetState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
