import Image from "next/image";
import { MediaItem } from "@/types/mediathek";

interface ImagePreviewProps {
  item: MediaItem;
}

export default function ImagePreview({ item }: ImagePreviewProps) {
  return (
    <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
      <Image
        src={item.preview_url_512 ?? item.url}
        alt={item.file_name}
        className="object-cover"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
