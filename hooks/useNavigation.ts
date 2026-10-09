/**
 * ASTRA Health - Mission Navigation Architecture & History Hook
 * 
 * Solves the navigation & Back button problems:
 * 1. Returns to previous logical page with state preservation.
 * 2. Synchronizes with browser history & URL hash (#landing, #physical, #mental, #overview, etc.)
 * 3. Works after browser refresh (restores route from hash).
 * 4. Supports browser Back/Forward (popstate & hashchange).
 * 5. Prevents navigation loops and stale history state.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { NavTab } from '../components/layout/Navigation';

const VALID_TABS: NavTab[] = [
  'landing',
  'physical',
  'mental',
  'overview',
  'health',
  'trends',
  'astra-ai',
  'check-in',
  'alerts',
  'mission',
  'timeline',
  'crew',
  'settings',
  'what-changed',
  'profile',
];

function getTabFromHash(): NavTab {
  if (typeof window === 'undefined') return 'landing';
  const raw = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (VALID_TABS.includes(raw as NavTab)) {
    return raw as NavTab;
  }
  // Alias mapping
  if (raw === 'dashboard') return 'overview';
  if (raw === 'ai') return 'astra-ai';
  return 'landing';
}

export function useNavigation() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => getTabFromHash());
  const historyRef = useRef<NavTab[]>(['landing']);
  const isInternalNavRef = useRef(false);

  // Sync hash on activeTab change
  const navigateTo = useCallback((tab: NavTab, replace = false) => {
    if (tab === activeTab) return;

    if (!replace) {
      // Don't push duplicate if top of stack is same as current active tab
      const currentStack = historyRef.current;
      if (currentStack[currentStack.length - 1] !== activeTab) {
        currentStack.push(activeTab);
      }
      // Cap history to 25 items to prevent unbounded growth
      if (currentStack.length > 25) {
        currentStack.shift();
      }
    }

    isInternalNavRef.current = true;
    setActiveTab(tab);
    window.location.hash = tab === 'landing' ? '#landing' : `#${tab}`;
    
    // Reset flag after microtask
    setTimeout(() => {
      isInternalNavRef.current = false;
    }, 50);
  }, [activeTab]);

  // Logical Back Navigation
  const goBack = useCallback(() => {
    const stack = historyRef.current;
    if (stack.length > 0) {
      const prevTab = stack.pop();
      if (prevTab && prevTab !== activeTab) {
        isInternalNavRef.current = true;
        setActiveTab(prevTab);
        window.location.hash = prevTab === 'landing' ? '#landing' : `#${prevTab}`;
        setTimeout(() => {
          isInternalNavRef.current = false;
        }, 50);
        return;
      }
    }

    // Fallback if history is empty
    if (activeTab !== 'landing') {
      isInternalNavRef.current = true;
      setActiveTab('landing');
      window.location.hash = '#landing';
      setTimeout(() => {
        isInternalNavRef.current = false;
      }, 50);
    }
  }, [activeTab]);

  // Handle browser Back / Forward (hashchange)
  useEffect(() => {
    const handleHashChange = () => {
      if (isInternalNavRef.current) return;
      const targetTab = getTabFromHash();
      if (targetTab !== activeTab) {
        setActiveTab(targetTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [activeTab]);

  const canGoBack = activeTab !== 'landing' || historyRef.current.length > 1;

  return {
    activeTab,
    navigateTo,
    goBack,
    canGoBack,
    historyStack: historyRef.current,
  };
}
