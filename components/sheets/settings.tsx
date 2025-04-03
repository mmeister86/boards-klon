import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Einstellungen</SheetTitle>
          <SheetDescription>
            Passe deine Benutzereinstellungen an
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Benachrichtigungen */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Benachrichtigungen</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif">E-Mail Benachrichtigungen</Label>
                <Switch id="email-notif" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="collab-notif">Zusammenarbeits-Updates</Label>
                <Switch id="collab-notif" />
              </div>
            </div>
          </div>

          {/* Erscheinungsbild */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Erscheinungsbild</h4>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Wähle ein Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Hell</SelectItem>
                    <SelectItem value="dark">Dunkel</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animationen reduzieren</Label>
                <Switch id="animations" />
              </div>
            </div>
          </div>

          {/* Privatsphäre */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Privatsphäre</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visible">Öffentliches Profil</Label>
                <Switch id="profile-visible" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="activity-visible">Aktivitäten sichtbar</Label>
                <Switch id="activity-visible" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button>Speichern</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
