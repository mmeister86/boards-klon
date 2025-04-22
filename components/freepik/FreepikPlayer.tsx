import Image from "next/image";

interface FreepikPlayerProps {
  media: {
    type: "photo" | "video";
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
  if (media.type === "video") {
    return (
      <div className={`relative aspect-video ${isPreview ? 'rounded-lg shadow-sm md:shadow-md shadow-slate-500/70' : ''}`}>
        <video
          src={media.url}
          controls={!isPreview}
          autoPlay={isPreview}
          loop={isPreview}
          muted={isPreview}
          className={`w-full h-full object-cover ${isPreview ? 'rounded-lg' : ''}`}
        />
        {!isPreview && media.author && (
          <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-1">
            © {media.author}
          </div>
        )}
      </div>
    );
  }

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
