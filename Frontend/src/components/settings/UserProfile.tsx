
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const UserProfile: React.FC = () => {
  const { toast } = useToast();
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };
  
  return (
    <form onSubmit={handleSave}>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" defaultValue="Alex" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" defaultValue="Johnson" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="alex.johnson@example.com" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input id="company" defaultValue="Acme Inc." />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end border-t pt-6">
        <Button type="submit">
          Save Changes
        </Button>
      </CardFooter>
    </form>
  );
};

export default UserProfile;
