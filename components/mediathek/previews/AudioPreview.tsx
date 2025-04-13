import { Music } from "lucide-react";
import { MediaItem } from "@/types/mediathek";

interface AudioPreviewProps {
  item: MediaItem;
}

export default function AudioPreview({ item }: AudioPreviewProps) {
  return (
    <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        <Music className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
