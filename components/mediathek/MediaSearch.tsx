import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MediaSearchProps } from "@/types/mediathek";

export default function MediaSearch({
  query,
  onQueryChange,
}: MediaSearchProps) {
  return (
    <div className="relative w-full max-w-md ml-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Medien durchsuchen..."
        className="pl-10"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  );
}
