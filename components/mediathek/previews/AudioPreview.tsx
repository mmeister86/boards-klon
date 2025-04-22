import { Music } from "lucide-react";

export default function AudioPreview() {
  return (
    <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        <Music className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
