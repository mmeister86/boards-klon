import { Video } from "lucide-react";


export default function VideoPreview() {
  return (
    <div className="relative aspect-video bg-muted rounded-[30px] overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        <Video className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
