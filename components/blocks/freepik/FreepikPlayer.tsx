import Image from "next/image";

interface FreepikPlayerProps {
  media: {
    type: "photo";
    url: string;
    title: string;
    author?: string;
  };
  isPreview?: boolean;
}

export function FreepikPlayer({
  media,
  isPreview = false,
}: FreepikPlayerProps) {

  return (
    <div className={`relative aspect-video ${isPreview ? 'rounded-lg shadow-sm md:shadow-md shadow-slate-500/70' : ''}`}>
      <Image
        src={media.url}
        alt={media.title}
        fill
        className={`object-cover ${isPreview ? 'rounded-lg' : ''}`}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={isPreview}
      />
      {!isPreview && media.author && (
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-1">
          © {media.author}
        </div>
      )}
    </div>
  );
}
