import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, doc, setDoc, getDoc } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const [startup, setStartup] = useState(() => {
    const saved = localStorage.getItem('udyampath_startup_v2');
    if (saved) return JSON.parse(saved);
    return {
      idea: '',
      location: '',
      budget: '',
      sector: '',
      stage: '',
      validationReport: null,
      highestLevelUnlocked: 1,
      levelScores: {},
      skillLevels: { impact: 1, finance: 1, team: 1, trust: 1 },
      assignedHomework: [],
      moduleProgress: {}
    };
  });

  // Load from Firebase when user logs in
  useEffect(() => {
    if (!auth) return; // If firebase isn't configured, skip
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch their saved progression from Firestore
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setStartup(prev => ({ ...prev, ...docSnap.data() }));
          }
        } catch (e) {
          console.error("Firestore read error", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to LocalStorage & Firebase whenever startup state changes
  useEffect(() => {
    localStorage.setItem('udyampath_startup_v2', JSON.stringify(startup));
    
    if (user && db) {
      // Background sync to Firebase
      setDoc(doc(db, 'users', user.uid), startup, { merge: true })
        .catch(e => console.error("Firestore write error", e));
    }
  }, [startup, user]);

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not configured");
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    clearData(); // Clear local state on logout
  };

  const saveStartupDetails = (details) => {
    setStartup(prev => ({ ...prev, ...details }));
  };

  const saveValidation = (report) => {
    setStartup(prev => ({ ...prev, validationReport: report }));
  };

  const passLevel = (levelId, scores) => {
    setStartup(prev => ({
      ...prev,
      highestLevelUnlocked: Math.max(prev.highestLevelUnlocked || 1, levelId + 1),
      levelScores: {
        ...prev.levelScores,
        [levelId]: scores
      },
      assignedHomework: [] 
    }));
  };

  const assignHomework = (modules) => {
    setStartup(prev => ({ ...prev, assignedHomework: modules }));
  };

  const updateModuleProgress = (moduleId, attemptData) => {
    setStartup(prev => {
      const existing = prev.moduleProgress?.[moduleId] || { attempts: [], bestScore: 0 };
      return {
        ...prev,
        moduleProgress: {
          ...prev.moduleProgress,
          [moduleId]: {
            attempts: [...existing.attempts, attemptData],
            bestScore: Math.max(existing.bestScore, attemptData.score)
          }
        }
      };
    });
  };

  const clearData = () => {
    localStorage.removeItem('udyampath_startup_v2');
    localStorage.removeItem('udyampath_global_state_v2');
    setStartup({
      idea: '',
      location: '',
      budget: '',
      sector: '',
      stage: '',
      validationReport: null,
      highestLevelUnlocked: 1,
      levelScores: {},
      skillLevels: { impact: 1, finance: 1, team: 1, trust: 1 },
      assignedHomework: [],
      moduleProgress: {}
    });
  };

  return (
    <UserContext.Provider value={{ 
      user,
      loginWithGoogle,
      logout,
      startup, 
      saveStartupDetails, 
      saveValidation, 
      passLevel,
      assignHomework,
      updateModuleProgress,
      clearData 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
