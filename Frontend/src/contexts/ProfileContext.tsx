import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

export interface Profile {
  user_id: string;
  name: string;
  workplace: string;
  language: string;
  ics_url?: string;
}

interface ProfileContextType {
  selectedProfile: Profile | null;
  setSelectedProfile: (profile: Profile | null) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

// Storage key for localStorage
const PROFILE_STORAGE_KEY = "paytjek_selected_profile";

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  // Initialize state from localStorage if available
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (error) {
      console.error("Error reading profile from localStorage:", error);
      return null;
    }
  });

  // Save to localStorage when selectedProfile changes
  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(selectedProfile));
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, [selectedProfile]);

  const value = {
    selectedProfile,
    setSelectedProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 