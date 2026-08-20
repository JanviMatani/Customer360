import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  mobileOpen: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobileOpen: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      mobileOpen: false,
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
      toggleMobileOpen: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
      setMobileOpen: (open: boolean) => set({ mobileOpen: open }),
    }),
    {
      name: 'c360.sidebarCollapsed',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
