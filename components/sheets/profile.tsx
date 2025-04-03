import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSupabase } from "@/components/providers/supabase-provider";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSheet({ isOpen, onClose }: ProfileSheetProps) {
  const { user } = useSupabase();

  // Mock Benutzerdaten
  const mockUserData = {
    joinDate: "Januar 2024",
    projectsCount: 12,
    lastActive: "Heute, 14:30",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Profil</SheetTitle>
          <SheetDescription>
            Verwalte deine persönlichen Informationen
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profilbild und Basis-Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">
                {user?.email?.split("@")[0]}
              </h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Button variant="outline" size="sm" className="mt-2">
                Bild ändern
              </Button>
            </div>
          </div>

          {/* Statistiken */}
          <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Mitglied seit</p>
              <p className="text-2xl font-bold">{mockUserData.joinDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Projekte</p>
              <p className="text-2xl font-bold">{mockUserData.projectsCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Zuletzt aktiv</p>
              <p className="text-2xl font-bold">{mockUserData.lastActive}</p>
            </div>
          </div>

          {/* Weitere Informationen */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Aktivitäten</h4>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Keine aktuellen Aktivitäten
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
