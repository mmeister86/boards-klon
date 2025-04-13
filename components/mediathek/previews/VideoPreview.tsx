import { Video } from "lucide-react";
import { MediaItem } from "@/types/mediathek";

interface VideoPreviewProps {
  item: MediaItem;
}

export default function VideoPreview({ item }: VideoPreviewProps) {
  return (
    <div className="relative aspect-video bg-muted rounded-[30px] overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        <Video className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
