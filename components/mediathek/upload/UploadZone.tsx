import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZoneProps } from "@/types/mediathek";
import UpLoader from "@/components/uploading";

export default function UploadZone({
  onUpload,
  isUploading,
  progress,
  processingProgress,
  showTimeoutMessage,
  isEmpty,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Event Handler für Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onUpload(e.dataTransfer.files);
  };

  // Handler für File Input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files);
  };

  // Gemeinsame Komponenten
  const UploadIconContent = () => (
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
      <Upload className="h-6 w-6 text-primary" />
    </div>
  );

  const UploadingIndicator = () => (
    <>
      {isUploading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
          <div className="text-center">
            <div className="flex justify-center">
              <UpLoader />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mt-4">
                {progress}% hochgeladen
              </p>
              {showTimeoutMessage && (
                <p className="text-sm text-muted-foreground">
                  {processingProgress > 0
                    ? `Optimiere Video... ${processingProgress}%`
                    : "Das Optimieren deiner Videodatei kann etwas dauern."}
                </p>
              )}
              {processingProgress > 0 && (
                <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Verstecktes File Input
  const HiddenFileInput = () => (
    <input
      id="file-upload"
      type="file"
      multiple
      className="hidden"
      onChange={handleFileInputChange}
      accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt"
    />
  );

  // Render große oder kleine Dropzone basierend auf isEmpty
  if (isEmpty) {
    return (
      <div className="mt-12 w-full">
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center gap-4
            transition-colors duration-200 h-[75vH] bg-gray-50/80
            ${isDragging ? "border-primary bg-primary/5" : "border-border"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIconContent />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Dateien hierher ziehen oder
            </p>
            <label htmlFor="file-upload">
              <Button variant="link" className="mt-1" asChild>
                <span>Dateien auswählen</span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Maximale Dateigröße: 100MB
          </p>
          <UploadingIndicator />
          <HiddenFileInput />
        </div>
      </div>
    );
  }

  // Kleine, fixierte Dropzone
  return (
    <label htmlFor="file-upload">
      <div
        className={`
          fixed bottom-8 right-8 z-50
          w-48 h-48 border-2 border-dashed rounded-xl
          flex items-center justify-center
          cursor-pointer transition-all duration-200
          hover:scale-105 hover:border-primary hover:bg-primary/10
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-105"
              : "border-border bg-background/80 backdrop-blur-sm"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        title="Dateien hochladen"
      >
        <Upload
          className={`h-8 w-8 transition-colors ${
            isDragging ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <UploadingIndicator />
        <HiddenFileInput />
      </div>
    </label>
  );
}
