import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface ShiftEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ShiftEvent | null;
  onSave: (updatedShift: ShiftEvent) => Promise<void>;
}

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  onClose,
  shift,
  onSave,
}) => {
  const [title, setTitle] = React.useState(shift?.title || "");
  const [startTime, setStartTime] = React.useState(
    shift ? format(shift.start, "HH:mm") : ""
  );
  const [endTime, setEndTime] = React.useState(
    shift ? format(shift.end, "HH:mm") : ""
  );
  const [date, setDate] = React.useState(
    shift ? format(shift.start, "yyyy-MM-dd") : ""
  );
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (shift) {
      setTitle(shift.title);
      setStartTime(format(shift.start, "HH:mm"));
      setEndTime(format(shift.end, "HH:mm"));
      setDate(format(shift.start, "yyyy-MM-dd"));
    }
  }, [shift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift) return;

    setIsSaving(true);
    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      const updatedShift: ShiftEvent = {
        ...shift,
        title,
        start: startDateTime,
        end: endDateTime,
      };

      await onSave(updatedShift);
      onClose();
    } catch (error) {
      console.error("Error saving shift:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rediger vagt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vagtens titel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Dato</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Starttidspunkt</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Sluttidspunkt</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Annuller
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Gemmer..." : "Gem ændringer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 