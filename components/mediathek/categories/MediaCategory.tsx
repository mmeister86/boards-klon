import Image from "next/image";
import { FileText } from "lucide-react";
import type { MediaItem } from "@/hooks/useMediaLibrary";

type CategoryType = "image" | "video" | "audio" | "document";

interface CategoryProps {
  type: CategoryType;
  items: MediaItem[];
  onDelete: (item: MediaItem) => void;
  deletingItemId?: string | null;
}

export default function MediaCategory({
  type,
  items,
  onDelete,
  deletingItemId,
}: CategoryProps) {
  // Filter items by type - DIESE ZEILE ENTFERNEN/ANPASSEN
  // const filteredItems = items.filter((item) => item.file_type.startsWith(type));
  // Direkt die übergebenen 'items' verwenden, da sie bereits gefiltert sind.
  const filteredItems = items; // Einfach die übergebene Liste verwenden

  if (filteredItems.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {type.charAt(0).toUpperCase() + type.slice(1)}s
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="aspect-square rounded-xl hover:bg-muted/80 cursor-pointer group relative"
          >
            <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
              {type === "video" && (
                <div className="relative w-full h-full">
                  {item.preview_url_512 || item.preview_url_128 ? (
                    <Image
                      src={item.preview_url_512 ?? item.preview_url_128!}
                      alt={item.file_name}
                      width={512}
                      height={512}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <svg
                        className="w-12 h-12 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-black"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {type === "image" && (
                <Image
                  src={item.url}
                  alt={item.file_name}
                  width={512}
                  height={512}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}

              {type === "audio" && (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
                    ></path>
                  </svg>
                </div>
              )}

              {type === "document" &&
                (item.preview_url ? (
                  <Image
                    src={item.preview_url}
                    alt={`${item.file_name} Vorschau`}
                    width={512}
                    height={512}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="w-12 h-12" />
                  </div>
                ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm text-white truncate">{item.file_name}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              disabled={deletingItemId === item.id}
              className={`absolute top-1 right-1 p-1.5 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/90 ${
                deletingItemId === item.id
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              {deletingItemId === item.id ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
