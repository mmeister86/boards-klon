"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  listPublishedBoards,
  deletePublishedBoard,
} from "@/lib/supabase/database";
import {
  Loader2,
  Globe2,
  Copy,
  MoreVertical,
  Calendar,
  Pencil,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { FeatureErrorBoundary } from "@/lib/errors/boundaries/FeatureErrorBoundary";

interface PublishedBoard {
  id: string;
  project_id: string;
  title: string;
  author_name: string;
  published_at: string;
  updated_at: string;
  is_published: boolean;
}

function PublishedBoardsContent() {
  const { user } = useSupabase();
  const [boards, setBoards] = useState<PublishedBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<PublishedBoard | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadBoards() {
      if (!user) return;

      try {
        const publishedBoards = await listPublishedBoards(user.id);
        setBoards(publishedBoards);
      } catch (error) {
        console.error("Error loading published boards:", error);
        toast.error("Fehler beim Laden der veröffentlichten Boards");
      } finally {
        setIsLoading(false);
      }
    }

    loadBoards();
  }, [user]);

  const copyUrl = (projectId: string) => {
    const url = `${window.location.origin}/boards/${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success("URL in die Zwischenablage kopiert");
  };

  const handleDelete = async (board: PublishedBoard) => {
    setBoardToDelete(board);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!boardToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deletePublishedBoard(boardToDelete.id);

      if (success) {
        setBoards((prevBoards) =>
          prevBoards.filter((b) => b.id !== boardToDelete.id)
        );
        toast.success("Board wurde erfolgreich gelöscht");
        setShowDeleteDialog(false);
      } else {
        throw new Error("Fehler beim Löschen des Boards");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Fehler beim Löschen des Boards");
    } finally {
      setIsDeleting(false);
      setBoardToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-300px)] xl:pr-[250px]">
        <div className="text-center">
          <Globe2 className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-lg font-medium mb-2">
            Keine veröffentlichten Boards
          </h3>
          <p className="text-muted-foreground mb-6">
            Veröffentliche dein erstes Board über den
            &quot;Veröffentlichen&quot; Button im Editor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <h1 className="text-3xl font-bold mr-auto">Veröffentlichte Boards</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {boards.map((board) => (
          <a
            key={board.id}
            href={`/boards/${board.project_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className="relative">
                <div className="aspect-video bg-muted overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                    <span className="text-muted-foreground">
                      Keine Vorschau verfügbar
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          copyUrl(board.project_id);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        URL kopieren
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={`/editor?projectId=${board.project_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(board);
                        }}
                        className="text-destructive"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 truncate">{board.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {board.author_name}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(board.published_at)}
              </CardFooter>
            </Card>
          </a>
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Board löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du dieses Board wirklich löschen? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PublishedBoardsView() {
  return (
    <FeatureErrorBoundary feature="Veröffentlichte Boards">
      <PublishedBoardsContent />
    </FeatureErrorBoundary>
  );
}
