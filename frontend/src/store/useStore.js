import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useStore = create((set, get) => ({
  user: null, // Holds the logged-in admin
  setUser: (user) => set({ user }),
  
  activeGameId: sessionStorage.getItem('lumina_activeGameId') || 'GOW',
  setActiveGameId: (id) => {
    sessionStorage.setItem('lumina_activeGameId', id);
    set({ activeGameId: id });
  },

  // The dynamic game data
  gamesData: {}, 
  
  // Custom Toast Notifications
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type, isExiting: false } });
    setTimeout(() => {
      set((state) => {
        if (state.toast?.message === message) {
          return { toast: { ...state.toast, isExiting: true } };
        }
        return state;
      });
      
      // Remove from DOM after exit animation completes
      setTimeout(() => {
        set((state) => {
          if (state.toast?.message === message && state.toast?.isExiting) {
            return { toast: null };
          }
          return state;
        });
      }, 400);
    }, 3000); // Wait 3 seconds before starting exit animation
  },
  hideToast: () => {
    set((state) => (state.toast ? { toast: { ...state.toast, isExiting: true } } : state));
    setTimeout(() => set({ toast: null }), 400);
  },
  
  // Load data from Firebase
  fetchGameData: async (gameId) => {
    const docRef = doc(db, "games", gameId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      set((state) => ({
        gamesData: { ...state.gamesData, [gameId]: docSnap.data() }
      }));
    } else {
      set((state) => {
        const newData = { ...state.gamesData };
        delete newData[gameId];
        return { gamesData: newData };
      });
    }
  },

  // Instant UI update for inputs
  updateGameField: (gameId, field, value) => {
    set((state) => ({
      gamesData: {
        ...state.gamesData,
        [gameId]: {
          ...state.gamesData[gameId],
          [field]: value
        }
      }
    }));
  },

  // Push changes to Firebase
  saveGameToCloud: async (gameId) => {
    const game = get().gamesData[gameId];
    console.log("Attempting to save game:", gameId, "Data:", game);
    if (!game) {
      console.warn("No local changes to save for", gameId);
      return;
    }
    try {
      const docRef = doc(db, "games", gameId);
      await setDoc(docRef, game, { merge: true });
      get().showToast("Draft Saved Successfully!", "success");
    } catch (error) {
      console.error("Error saving to cloud:", error);
      get().showToast("Failed to save draft", "error");
    }
  }
}));