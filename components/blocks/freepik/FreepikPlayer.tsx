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
    <div
      className={`relative ${
        isPreview ? "rounded-lg shadow-sm md:shadow-md shadow-slate-500/70" : ""
      }`}
    >
      <Image
        src={media.url}
        alt={media.title}
        width={0}
        height={0}
        className={`object-cover ${isPreview ? "rounded-lg" : ""}`}
        sizes="100vw"
        priority={isPreview}
        style={{ width: "100%", height: "auto" }}
      />
      {!isPreview && media.author && (
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-1">
          © {media.author}
        </div>
      )}
    </div>
  );
}
