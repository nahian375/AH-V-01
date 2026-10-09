import { MISSION_THOUGHTS, MissionThought, PresentationMode, MissionThoughtCategory } from '../data/missionThoughts';
import { spaceAudio } from '../utils/spaceAudio';

const STORAGE_KEY_LAST_ID = 'astra_last_mission_thought_id';
const STORAGE_KEY_FAVORITES = 'astra_favorite_thought_ids';
const STORAGE_KEY_MODE_PREF = 'astra_thought_presentation_mode';
const SESSION_STORAGE_KEY_CURRENT_ID = 'astra_session_thought_id';
const SESSION_STORAGE_KEY_CURRENT_MODE = 'astra_session_thought_mode';

/**
 * Module-level in-memory cache for the active application session.
 * Guarantees that across all React re-renders, component unmounts/remounts,
 * and internal navigation across all ASTRA modules, the exact same selected
 * quote and presentation mode are preserved.
 */
let activeSessionThought: MissionThought | null = null;
let activeSessionMode: PresentationMode | null = null;

// Listeners for reactive updates when user changes reflection or mode
type ThoughtChangeListener = (thought: MissionThought, mode: PresentationMode) => void;
const listeners = new Set<ThoughtChangeListener>();

export function subscribeToMissionThought(listener: ThoughtChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  if (activeSessionThought && activeSessionMode) {
    listeners.forEach(fn => fn(activeSessionThought!, activeSessionMode!));
  }
}

const ALL_MODES: PresentationMode[] = [
  'MINIMAL',
  'ORBITAL',
  'STARFIELD',
  'TELEMETRY',
  'TRANSMISSION',
  'CONSTELLATION'
];

/**
 * Get or initialize presentation mode for this session.
 */
export function getSessionPresentationMode(thought?: MissionThought): PresentationMode {
  if (activeSessionMode) {
    return activeSessionMode;
  }

  // Check user manual preference
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedPref = window.localStorage.getItem(STORAGE_KEY_MODE_PREF);
      if (savedPref && ALL_MODES.includes(savedPref as PresentationMode)) {
        activeSessionMode = savedPref as PresentationMode;
        return activeSessionMode;
      }
    }
  } catch (err) {
    console.warn('[MissionThought] localStorage error reading mode pref:', err);
  }

  // Check sessionStorage for current session
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionMode = window.sessionStorage.getItem(SESSION_STORAGE_KEY_CURRENT_MODE);
      if (sessionMode && ALL_MODES.includes(sessionMode as PresentationMode)) {
        activeSessionMode = sessionMode as PresentationMode;
        return activeSessionMode;
      }
    }
  } catch {}

  // Use thought's preferred mode or pick dynamically
  if (thought?.preferredMode) {
    activeSessionMode = thought.preferredMode;
  } else {
    const randomMode = ALL_MODES[Math.floor(Math.random() * ALL_MODES.length)];
    activeSessionMode = randomMode;
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY_CURRENT_MODE, activeSessionMode);
    }
  } catch {}

  return activeSessionMode;
}

/**
 * Set presentation mode manually.
 */
export function setPresentationMode(mode: PresentationMode | 'AUTO'): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (mode === 'AUTO') {
        window.localStorage.removeItem(STORAGE_KEY_MODE_PREF);
        activeSessionMode = activeSessionThought?.preferredMode || ALL_MODES[0];
      } else {
        window.localStorage.setItem(STORAGE_KEY_MODE_PREF, mode);
        activeSessionMode = mode;
      }
    }
    if (typeof window !== 'undefined' && window.sessionStorage && activeSessionMode) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY_CURRENT_MODE, activeSessionMode);
    }
  } catch {}

  notifyListeners();
}

/**
 * Cycle presentation mode to next style.
 */
export function cyclePresentationMode(): PresentationMode {
  const current = getSessionPresentationMode(activeSessionThought || undefined);
  const currentIndex = ALL_MODES.indexOf(current);
  const nextMode = ALL_MODES[(currentIndex + 1) % ALL_MODES.length];
  setPresentationMode(nextMode);
  spaceAudio.playClick();
  return nextMode;
}

/**
 * Retrieves the mission thought for the current application session.
 * 
 * Behavior:
 * - If a thought has already been selected for this session, returns it immediately.
 * - Checks sessionStorage to preserve across reloads within the same session.
 * - If this is a new session:
 *   1. Reads the previously displayed quote ID from local storage.
 *   2. Selects a new quote randomly from the curated 75+ library, strictly excluding
 *      the previous session's quote ID (preventing immediate repetition).
 *   3. Saves the new quote ID to local storage for the next session.
 *   4. Caches the selected quote in memory and sessionStorage.
 */
export function getSessionMissionThought(): MissionThought {
  if (activeSessionThought) {
    return activeSessionThought;
  }

  // Check sessionStorage for current session
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionThoughtId = window.sessionStorage.getItem(SESSION_STORAGE_KEY_CURRENT_ID);
      if (sessionThoughtId) {
        const found = MISSION_THOUGHTS.find(t => t.id === sessionThoughtId);
        if (found) {
          activeSessionThought = found;
          getSessionPresentationMode(found);
          return found;
        }
      }
    }
  } catch {}

  // Fallback safe-guard
  if (!MISSION_THOUGHTS || MISSION_THOUGHTS.length === 0) {
    activeSessionThought = {
      id: 'thought-fallback',
      category: 'PURPOSE',
      transmissionCode: 'TR-000',
      quote: 'Far from Earth. Close to purpose.',
      supportingLine: 'Every heartbeat moves humanity forward.',
      preferredMode: 'MINIMAL'
    };
    return activeSessionThought;
  }

  let previousId: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      previousId = window.localStorage.getItem(STORAGE_KEY_LAST_ID);
    }
  } catch (err) {
    console.warn('[MissionThoughtService] Could not read localStorage:', err);
  }

  // Filter out the immediately previous quote ID to prevent consecutive repetition
  const eligible = MISSION_THOUGHTS.filter(item => item.id !== previousId);
  const candidatePool = eligible.length > 0 ? eligible : MISSION_THOUGHTS;

  const selectedIndex = Math.floor(Math.random() * candidatePool.length);
  const selectedThought = candidatePool[selectedIndex];

  activeSessionThought = selectedThought;
  getSessionPresentationMode(selectedThought);

  // Save the new ID to localStorage and sessionStorage
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY_LAST_ID, selectedThought.id);
      window.sessionStorage?.setItem(SESSION_STORAGE_KEY_CURRENT_ID, selectedThought.id);
    }
  } catch (err) {
    console.warn('[MissionThoughtService] Could not write to storage:', err);
  }

  return selectedThought;
}

/**
 * Manually or automatically request a new reflection.
 * Selects another random thought excluding the current one.
 */
export function cycleMissionThought(playSound: boolean = false): MissionThought {
  const currentId = activeSessionThought?.id;
  const eligible = MISSION_THOUGHTS.filter(item => item.id !== currentId);
  const nextThought = eligible[Math.floor(Math.random() * eligible.length)] || MISSION_THOUGHTS[0];

  activeSessionThought = nextThought;
  if (!activeSessionMode || activeSessionMode === 'MINIMAL') {
    activeSessionMode = nextThought.preferredMode || 'TELEMETRY';
  }

  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY_LAST_ID, nextThought.id);
      window.sessionStorage?.setItem(SESSION_STORAGE_KEY_CURRENT_ID, nextThought.id);
      window.sessionStorage?.setItem(SESSION_STORAGE_KEY_CURRENT_MODE, activeSessionMode);
    }
  } catch {}

  if (playSound) {
    spaceAudio.playQuindar();
  }
  notifyListeners();
  return nextThought;
}

/**
 * Directly set an active thought (e.g., selected from archive log modal).
 */
export function setActiveThought(thought: MissionThought): void {
  activeSessionThought = thought;
  activeSessionMode = thought.preferredMode || activeSessionMode || 'MINIMAL';

  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY_LAST_ID, thought.id);
      window.sessionStorage?.setItem(SESSION_STORAGE_KEY_CURRENT_ID, thought.id);
      window.sessionStorage?.setItem(SESSION_STORAGE_KEY_CURRENT_MODE, activeSessionMode);
    }
  } catch {}

  spaceAudio.playSyncPing();
  notifyListeners();
}

/**
 * Deterministic "Thought of the Sol" (anchored to current mission Sol number).
 */
export function getThoughtForSol(sol: number): MissionThought {
  if (MISSION_THOUGHTS.length === 0) {
    return getSessionMissionThought();
  }
  const index = Math.abs(sol * 7 + 13) % MISSION_THOUGHTS.length;
  return MISSION_THOUGHTS[index];
}

// ============================================================================
// FAVORITES / BOOKMARKS MANAGEMENT
// ============================================================================

export function getFavoriteThoughtIds(): string[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {}
  return [];
}

export function isFavoriteThought(id: string): boolean {
  const favs = getFavoriteThoughtIds();
  return favs.includes(id);
}

export function toggleFavoriteThought(id: string): boolean {
  const favs = getFavoriteThoughtIds();
  let updated: string[];
  const wasFav = favs.includes(id);

  if (wasFav) {
    updated = favs.filter(item => item !== id);
  } else {
    updated = [...favs, id];
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    }
  } catch {}

  spaceAudio.playExecute();
  return !wasFav;
}

export function getAllMissionThoughts(): MissionThought[] {
  return MISSION_THOUGHTS;
}

export function getThoughtsByCategory(category: MissionThoughtCategory): MissionThought[] {
  return MISSION_THOUGHTS.filter(t => t.category === category);
}
