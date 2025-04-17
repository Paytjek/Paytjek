import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/api/users';
import { useProfile, Profile } from '@/contexts/ProfileContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileSelector: React.FC = () => {
  const { selectedProfile, setSelectedProfile } = useProfile();
  
  // Brug React Query til at hente brugere
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  // Vælg automatisk den første bruger, hvis ingen er valgt og data er indlæst
  useEffect(() => {
    if (!selectedProfile && users && users.length > 0) {
      setSelectedProfile(users[0]);
    }
  }, [users, selectedProfile, setSelectedProfile]);

  // Håndter ændring af valgt profil
  const handleProfileChange = (userId: string) => {
    if (users) {
      const selected = users.find(user => user.user_id === userId);
      if (selected) {
        setSelectedProfile(selected);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Bruger</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Kunne ikke indlæse brugerprofiler</div>;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="profile-selector">Bruger</Label>
      <Select
        value={selectedProfile?.user_id}
        onValueChange={handleProfileChange}
      >
        <SelectTrigger id="profile-selector" className="w-full">
          <SelectValue placeholder="Vælg bruger" />
        </SelectTrigger>
        <SelectContent>
          {users?.map((profile: Profile) => (
            <SelectItem key={profile.user_id} value={profile.user_id}>
              {profile.name} - {profile.workplace}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 