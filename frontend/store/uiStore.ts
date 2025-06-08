import { create } from 'zustand';
import { UserPreferences } from '../types/user';

interface UIStore {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // UI Theme/Preferences
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Modals and Dialogs
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // User Preferences
  userPreferences: UserPreferences | null;
  setUserPreferences: (preferences: UserPreferences) => void;

  // Notifications
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    isRead: boolean;
  }>;
  addNotification: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  // UI Theme
  isDarkMode:
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  // UI State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Modals
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // User Preferences
  userPreferences: null,
  setUserPreferences: (preferences) => set({ userPreferences: preferences }),

  // Notifications
  notifications: [],
  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now().toString(),
          message,
          type,
          isRead: false,
        },
      ],
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
