import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPreviewProps } from "@/types/mediathek";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import AudioPreview from "./AudioPreview";
import DocumentPreview from "./DocumentPreview";

export default function MediaPreview({
  item,
  onDelete,
  isDeleting,
}: MediaPreviewProps) {
  // Bestimme den Medientyp
  const type = item.file_type.startsWith("image/")
    ? "image"
    : item.file_type.startsWith("video/")
    ? "video"
    : item.file_type.startsWith("audio/")
    ? "audio"
    : "document";

  // Gemeinsamer Delete-Button für alle Medientypen
  const DeleteButton = () => (
    <Button
      variant="destructive"
      size="icon"
      className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => onDelete(item)}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );

  // Render entsprechende Vorschau basierend auf dem Medientyp
  const renderPreview = () => {
    switch (type) {
      case "image":
        return <ImagePreview item={item} />;
      case "video":
        return <VideoPreview item={item} />;
      case "audio":
        return <AudioPreview item={item} />;
      case "document":
        return <DocumentPreview item={item} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative group">
      {renderPreview()}
      <DeleteButton />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b-[30px]">
        <p className="pl-4 text-sm truncate">{item.file_name}</p>
      </div>
    </div>
  );
}
