import { FileText } from "lucide-react";
import Image from "next/image";
import { MediaItem } from "@/types/mediathek";

interface DocumentPreviewProps {
  item: MediaItem;
}

export default function DocumentPreview({ item }: DocumentPreviewProps) {
  return (
    <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
      {item.preview_url ? (
        <Image
          src={item.preview_url}
          alt={`Vorschau von ${item.file_name}`}
          className="object-contain w-full h-full"
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
