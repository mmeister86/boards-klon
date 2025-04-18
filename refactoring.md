# Refactoring Plan: Dynamische Drop Areas zu Layoutblöcken

**Ziel:** Ersetzen der aktuellen, komplexen Logik für dynamisch teilbare, zusammenführbare und löschbare Drop-Bereiche durch ein System von vordefinierten Layoutblöcken, die als Container für Inhaltsblöcke und Medien dienen. Dies soll die Codebasis vereinfachen und die Struktur vorhersagbarer machen.

**Aktuelle Probleme:**

- Hohe Komplexität durch rekursive Splitting-Logik (`updateDropAreaById`, `findParentOfSplitAreas`).
- Spezifische und redundante Logik für verschiedene Viewports (`DesktopDropArea`, `TabletDropArea`, `MobileDropArea`).
- Komplexe Zustandsverwaltung für Merging (`useDropArea` Hook, `canMergeAreas`).
- Verschachtelte Zustände und UI-Elemente für Lösch-Buttons auf verschiedenen Ebenen.

**Neues Konzept:**

1.  **`LayoutBlock`:** Ein Element auf dem Canvas, das eine feste Layout-Struktur definiert (z.B. 1 Spalte, 2 Spalten, 1:2 Spalten, 2x2 Grid). Wird aus einer Palette ausgewählt und auf den Canvas gezogen. Ist selbst verschiebbar und löschbar.
2.  **`ContentDropZone`:** Ein definierter Bereich _innerhalb_ eines `LayoutBlock` (z.B. eine Spalte). Nimmt _nur_ `ContentBlock`s oder `MediaItem`s per Drag & Drop auf, alternativ auch direkt Medien, die der Nutzer von seinem Rechner hochlädt. Erlaubt das Reordering der Elemente innerhalb der Zone. Kann nicht selbst gesplittet oder gemerged werden.
3.  **`ContentBlock`:** Die bestehenden Inhaltselemente (Text, Bild, Überschrift etc.), die aus der linken Leiste ("Blöcke") in eine `ContentDropZone` gezogen werden.
4.  **`MediaItem`:** Die bestehenden Medienelemente (Bilder etc.), die aus der rechten Leiste ("Medien") in eine `ContentDropZone` gezogen werden (ggf. wird daraus direkt ein `ContentBlock` vom Typ "image").

**Geplante Schritte:**

1.  **Datenstruktur & State Management (`useBlocksStore`)**

    - **Typen definieren:**
      - `LayoutType`: Enum oder String-Literal für verschiedene Layouts (z.B. `'single-column'`, `'two-columns'`, `'grid-2x2'`).
      - `ContentDropZoneType`: Definiert eine ID und enthält ein Array von `ContentBlock` IDs.
      - `LayoutBlockType`: Definiert eine ID, den `LayoutType` und ein Array von `ContentDropZoneType` Instanzen. (Ersetzt die oberste Ebene der `DropAreaType`).
    - **Store anpassen:**
      - State: Array von `LayoutBlockType` als Hauptstruktur des Canvas. `blocks` bleibt evtl. als flache Liste, aber `dropAreaId` wird durch `layoutBlockId` und `contentZoneId` ersetzt.
      - Aktionen **entfernen/ersetzen**: `splitDropArea`, `splitPopulatedDropArea`, `mergeDropAreas`, `canMerge`, `canSplit`.
      - Aktionen **anpassen/hinzufügen**:
        - `addLayoutBlock(type: LayoutType, targetIndex?: number)`: Fügt neuen Layoutblock an bestimmter Stelle hinzu.
        - `deleteLayoutBlock(id: string)`: Löscht Layoutblock und alle enthaltenen Blöcke/Zonen.
        - `moveLayoutBlock(sourceIndex: number, targetIndex: number)`: Ändert Reihenfolge der Layoutblöcke.
        - `addContentBlock(blockData: Omit<Block, 'id'>, targetLayoutId: string, targetZoneId: string, targetIndex: number)`: Fügt Block in Zone ein.
        - `moveContentBlock(blockId: string, source: {layoutId: string, zoneId: string}, target: {layoutId: string, zoneId: string, index: number})`: Verschiebt Block (intern/extern).
        - `deleteContentBlock(blockId: string, sourceLayoutId: string, sourceZoneId: string)`: Löscht Block.
        - `reorderContentBlocks(layoutId: string, zoneId: string, orderedBlockIds: string[])`: Ordnet Blöcke innerhalb einer Zone neu.

2.  **UI Komponenten**

    - **Layout Auswahl:** Neue Komponente (z.B. in der linken Sidebar unter "Layouts"), die Buttons oder Draggable-Elemente für jeden `LayoutType` anzeigt.
    - **LayoutBlock Komponenten:**
      - Erstelle spezifische Komponenten pro `LayoutType` (z.B. `SingleColumnLayout.tsx`, `TwoColumnLayout.tsx`, `Grid2x2Layout.tsx`).
      - Jede Komponente rendert die Struktur (z.B. Flexbox, CSS Grid) und die enthaltenen `ContentDropZone`-Komponenten.
      - Implementiert `useDrag` (fürs Verschieben) und `useDrop` (um andere Layoutblöcke davor/dahinter einzufügen).
      - Zeigt einen globalen "Löschen"-Button für den gesamten Layoutblock an.
    - **`ContentDropZone.tsx` Komponente:**
      - Rendert einen visuellen Bereich.
      - Implementiert `useDrop` nur für `ItemTypes.CONTENT_BLOCK` und `ItemTypes.MEDIA_ITEM`.
      - Rendert die Liste der `ContentBlock`-Komponenten (kann `CanvasBlock` wiederverwenden).
      - Kümmert sich um das Reordering _innerhalb_ der Zone via Drag & Drop (`useDrag` auf `CanvasBlock`, `useDrop`/`hover` auf `ContentDropZone`).
    - **`Canvas.tsx` (oder äquivalent):**
      - Rendert die Liste der `LayoutBlock`-Komponenten basierend auf dem Store-State.
      - Implementiert `useDrop` für neue `LayoutBlock`s aus der Auswahlleiste.
    - **Anpassung/Entfernung bestehender Komponenten:**
      - `CanvasBlock.tsx`: `useDrag` anpassen, um `layoutId` und `zoneId` mitzugeben.
      - Sidebar Komponenten (`Blocks`, `Media`): `useDrag` anpassen, um korrekte `ItemType` und Daten zu liefern.
      - `DesktopDropArea.tsx`, `TabletDropArea.tsx`, `MobileDropArea.tsx`: Werden **obsolet** und können entfernt werden. Das responsive Verhalten wird in den LayoutBlock-Komponenten selbst mittels CSS gehandhabt.
      - `DropArea.tsx`, `DropAreaContent.tsx`: Werden **obsolet** und können entfernt werden (Funktionalität wandert in `LayoutBlock` und `ContentDropZone`).
      - `PublicDropAreaRenderer.tsx` (`export-renderer.tsx`): Muss **komplett überarbeitet** werden, um die neue `LayoutBlock`-Struktur rekursiv zu rendern.

3.  **Drag & Drop Logik (`react-dnd`)**

    - **`ItemTypes` definieren:** `LAYOUT_BLOCK`, `CONTENT_BLOCK`, `MEDIA_ITEM`.
    - **Hooks anpassen:** Die `useDrag` und `useDrop` Implementierungen in den neuen/angepassten Komponenten (Layout Auswahl, Canvas, LayoutBlock, ContentDropZone, CanvasBlock) müssen die neuen Typen und die Logik für Hinzufügen, Verschieben und Reordering implementieren (unter Verwendung der neuen Store-Aktionen).
    - `useDropArea.ts`: Wird **obsolet**, da die komplexe Merge/Split-Logik entfällt. Die D&D-Logik wird einfacher und direkt in den Komponenten implementiert.

4.  **Hilfsfunktionen (`lib/utils/drop-area-utils.ts`)**

    - Funktionen wie `canMergeAreas`, `findParentOfSplitAreas`, `updateDropAreaById` (bezogen auf Splitting) werden **obsolet**.
    - Neue Utils könnten benötigt werden, z.B. `findLayoutBlockById`, `findContentZoneById`.

5.  **Tests & Aufräumen**
    - Bestehende Tests anpassen oder neue Tests für die LayoutBlock-Struktur und die Store-Aktionen schreiben.
    - Allen obsoleten Code (Komponenten, Hooks, Utils, Typen) sicher entfernen.
    - Code-Dokumentation aktualisieren.

**Reihenfolge der Implementierung:**

1.  Datenstruktur & Store-Änderungen (Grundlage schaffen).
2.  Basis-Komponenten für Layout-Auswahl, LayoutBlock und ContentDropZone erstellen.
3.  Drag & Drop für das Hinzufügen von LayoutBlöcken zum Canvas implementieren.
4.  Drag & Drop für das Hinzufügen von ContentBlocks/MediaItems in ContentDropZones implementieren.
5.  Drag & Drop für das Reordering von ContentBlocks innerhalb einer Zone implementieren.
6.  Drag & Drop für das Verschieben von ContentBlocks zwischen Zonen/LayoutBlöcken implementieren.
7.  Drag & Drop für das Verschieben/Reordering von LayoutBlöcken implementieren.
8.  Lösch-Funktionalität implementieren (ContentBlocks und LayoutBlöcke).
9.  Anpassung des `PublicDropAreaRenderer` für die Export/Vorschau-Ansicht.
10. Alte Code-Teile entfernen und Tests schreiben/anpassen.

**Offene Fragen/Risiken:**

- **Migration:** Müssen bestehende Canvas-Layouts migriert werden? (Wahrscheinlich nicht praktikabel, Start mit leerem Canvas nach Refactoring).
- **Responsiveness:** Das responsive Verhalten muss sorgfältig in den CSS-Stilen der einzelnen LayoutBlock-Komponenten implementiert werden.
- **Undo/Redo:** Falls eine Undo/Redo-Funktion existiert, muss diese an die neuen Store-Aktionen angepasst werden.
- **Komplexität der D&D-Interaktionen:** Sicherstellen, dass die verschiedenen D&D-Aktionen (Reorder vs. Move) klar und intuitiv für den Benutzer sind.

Dieser Plan sollte eine gute Grundlage für das Refactoring bieten.
