export type BlockType = {
  id: string;
  type: string;
  content: string;
  dropAreaId: string;
  // Additional properties for specific block types
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  // Add more properties for other block types as needed
};

export type DropAreaType = {
  id: string;
  blocks: BlockType[];
  isSplit: boolean;
  splitAreas: DropAreaType[];
  splitLevel: number; // Track the split level
  parentId?: string; // Track the parent for grid layout
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  blocks: number;
};
