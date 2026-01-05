import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Page,
  Block,
  Workspace,
  User,
  DatabaseRow,
  BlockType,
  BlockProperties,
} from "@/types";
import { generateId } from "@/lib/utils";

interface AppState {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Workspace state
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setCurrentWorkspace: (id: string) => void;
  createWorkspace: (name: string) => Workspace;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;

  // Page state
  pages: Record<string, Page>;
  currentPageId: string | null;
  expandedPageIds: Set<string>;
  setCurrentPage: (id: string | null) => void;
  togglePageExpanded: (id: string) => void;
  createPage: (parentId: string | null, title?: string) => Page;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  movePage: (id: string, newParentId: string | null, index?: number) => void;
  duplicatePage: (id: string) => Page;
  toggleFavourite: (id: string) => void;
  archivePage: (id: string) => void;
  restorePage: (id: string) => void;

  // Block operations
  createBlock: (
    pageId: string,
    type: BlockType,
    content?: string,
    parentId?: string | null,
    index?: number
  ) => Block;
  updateBlock: (
    pageId: string,
    blockId: string,
    updates: Partial<Block>
  ) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  moveBlock: (
    pageId: string,
    blockId: string,
    newParentId: string | null,
    index?: number
  ) => void;
  duplicateBlock: (pageId: string, blockId: string) => Block;

  // Database rows
  databaseRows: Record<string, DatabaseRow[]>;
  createDatabaseRow: (databaseId: string) => DatabaseRow;
  updateDatabaseRow: (
    databaseId: string,
    rowId: string,
    updates: Partial<DatabaseRow>
  ) => void;
  deleteDatabaseRow: (databaseId: string, rowId: string) => void;

  // UI State
  sidebarOpen: boolean;
  sidebarWidth: number;
  searchOpen: boolean;
  settingsOpen: boolean;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;
  pushHistory: (entry: HistoryEntry) => void;
  undo: () => void;
  redo: () => void;
}

interface HistoryEntry {
  type: "page" | "block";
  action: "create" | "update" | "delete" | "move";
  data: unknown;
  previousData: unknown;
  timestamp: number;
}

const createDefaultPage = (
  parentId: string | null,
  workspaceId: string,
  userId: string,
  title: string = "Untitled"
): Page => {
  const now = new Date().toISOString();
  const id = generateId();

  return {
    id,
    title,
    icon: "",
    coverImage: undefined,
    coverPosition: 50,
    parentId,
    workspaceId,
    createdBy: userId,
    lastEditedBy: userId,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    isFavourite: false,
    isTemplate: false,
    isDatabase: false,
    children: [],
    blocks: [],
    path: parentId ? [] : [], // Will be computed
  };
};

const createDefaultBlock = (
  pageId: string,
  type: BlockType,
  content: string = "",
  parentId: string | null = null,
  userId: string = "anonymous"
): Block => {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    type,
    content,
    properties: {},
    children: [],
    parentId,
    pageId,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  };
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // User state
      currentUser: null,
      setCurrentUser: (user) =>
        set((state) => {
          state.currentUser = user;
        }),

      // Workspace state
      workspaces: [],
      currentWorkspaceId: null,

      setCurrentWorkspace: (id) =>
        set((state) => {
          state.currentWorkspaceId = id;
        }),

      createWorkspace: (name) => {
        const now = new Date().toISOString();
        const userId = get().currentUser?.id || "anonymous";
        const workspace: Workspace = {
          id: generateId(),
          name,
          ownerId: userId,
          members: [{ userId, role: "owner", joinedAt: now }],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          state.workspaces.push(workspace);
          if (!state.currentWorkspaceId) {
            state.currentWorkspaceId = workspace.id;
          }
        });

        return workspace;
      },

      updateWorkspace: (id, updates) =>
        set((state) => {
          const index = state.workspaces.findIndex((w) => w.id === id);
          if (index !== -1) {
            state.workspaces[index] = {
              ...state.workspaces[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        }),

      deleteWorkspace: (id) =>
        set((state) => {
          state.workspaces = state.workspaces.filter((w) => w.id !== id);
          if (state.currentWorkspaceId === id) {
            state.currentWorkspaceId = state.workspaces[0]?.id || null;
          }
        }),

      // Page state
      pages: {},
      currentPageId: null,
      expandedPageIds: new Set(),

      setCurrentPage: (id) =>
        set((state) => {
          state.currentPageId = id;
        }),

      togglePageExpanded: (id) =>
        set((state) => {
          const expanded = new Set(state.expandedPageIds);
          if (expanded.has(id)) {
            expanded.delete(id);
          } else {
            expanded.add(id);
          }
          state.expandedPageIds = expanded;
        }),

      createPage: (parentId, title = "Untitled") => {
        const state = get();
        const workspaceId = state.currentWorkspaceId || "";
        const userId = state.currentUser?.id || "anonymous";

        const page = createDefaultPage(parentId, workspaceId, userId, title);

        // Add initial empty text block
        const initialBlock = createDefaultBlock(page.id, "text", "", null, userId);
        page.blocks = [initialBlock];

        set((s) => {
          s.pages[page.id] = page;

          // Add to parent's children
          if (parentId && s.pages[parentId]) {
            s.pages[parentId].children.push(page.id);
          }
        });

        return page;
      },

      updatePage: (id, updates) =>
        set((state) => {
          if (state.pages[id]) {
            state.pages[id] = {
              ...state.pages[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        }),

      deletePage: (id) =>
        set((state) => {
          const page = state.pages[id];
          if (!page) return;

          // Remove from parent's children
          if (page.parentId && state.pages[page.parentId]) {
            state.pages[page.parentId].children = state.pages[
              page.parentId
            ].children.filter((childId) => childId !== id);
          }

          // Recursively delete children
          const deleteChildren = (pageId: string) => {
            const p = state.pages[pageId];
            if (p) {
              p.children.forEach(deleteChildren);
              delete state.pages[pageId];
            }
          };

          deleteChildren(id);

          if (state.currentPageId === id) {
            state.currentPageId = null;
          }
        }),

      movePage: (id, newParentId, index) =>
        set((state) => {
          const page = state.pages[id];
          if (!page) return;

          // Remove from old parent
          if (page.parentId && state.pages[page.parentId]) {
            state.pages[page.parentId].children = state.pages[
              page.parentId
            ].children.filter((childId) => childId !== id);
          }

          // Add to new parent
          if (newParentId && state.pages[newParentId]) {
            if (index !== undefined) {
              state.pages[newParentId].children.splice(index, 0, id);
            } else {
              state.pages[newParentId].children.push(id);
            }
          }

          state.pages[id].parentId = newParentId;
          state.pages[id].updatedAt = new Date().toISOString();
        }),

      duplicatePage: (id) => {
        const state = get();
        const original = state.pages[id];
        if (!original) throw new Error("Page not found");

        const userId = state.currentUser?.id || "anonymous";
        const newPage = createDefaultPage(
          original.parentId,
          original.workspaceId,
          userId,
          `${original.title} (copy)`
        );

        newPage.icon = original.icon;
        newPage.coverImage = original.coverImage;
        newPage.blocks = JSON.parse(JSON.stringify(original.blocks));

        // Generate new IDs for blocks
        const generateNewIds = (blocks: Block[]): Block[] => {
          return blocks.map((block) => ({
            ...block,
            id: generateId(),
            pageId: newPage.id,
            children: generateNewIds(block.children),
          }));
        };

        newPage.blocks = generateNewIds(newPage.blocks);

        set((s) => {
          s.pages[newPage.id] = newPage;
          if (original.parentId && s.pages[original.parentId]) {
            s.pages[original.parentId].children.push(newPage.id);
          }
        });

        return newPage;
      },

      toggleFavourite: (id) =>
        set((state) => {
          if (state.pages[id]) {
            state.pages[id].isFavourite = !state.pages[id].isFavourite;
          }
        }),

      archivePage: (id) =>
        set((state) => {
          if (state.pages[id]) {
            state.pages[id].isArchived = true;
            state.pages[id].updatedAt = new Date().toISOString();
          }
        }),

      restorePage: (id) =>
        set((state) => {
          if (state.pages[id]) {
            state.pages[id].isArchived = false;
            state.pages[id].updatedAt = new Date().toISOString();
          }
        }),

      // Block operations
      createBlock: (pageId, type, content = "", parentId = null, index) => {
        const state = get();
        const userId = state.currentUser?.id || "anonymous";
        const block = createDefaultBlock(pageId, type, content, parentId, userId);

        set((s) => {
          const page = s.pages[pageId];
          if (!page) return;

          if (parentId) {
            // Find parent block and add to its children
            const findAndAddToParent = (blocks: Block[]): boolean => {
              for (const b of blocks) {
                if (b.id === parentId) {
                  if (index !== undefined) {
                    b.children.splice(index, 0, block);
                  } else {
                    b.children.push(block);
                  }
                  return true;
                }
                if (findAndAddToParent(b.children)) return true;
              }
              return false;
            };
            findAndAddToParent(page.blocks);
          } else {
            if (index !== undefined) {
              page.blocks.splice(index, 0, block);
            } else {
              page.blocks.push(block);
            }
          }

          page.updatedAt = new Date().toISOString();
        });

        return block;
      },

      updateBlock: (pageId, blockId, updates) =>
        set((state) => {
          const page = state.pages[pageId];
          if (!page) return;

          const findAndUpdate = (blocks: Block[]): boolean => {
            for (let i = 0; i < blocks.length; i++) {
              if (blocks[i].id === blockId) {
                blocks[i] = {
                  ...blocks[i],
                  ...updates,
                  updatedAt: new Date().toISOString(),
                };
                return true;
              }
              if (findAndUpdate(blocks[i].children)) return true;
            }
            return false;
          };

          findAndUpdate(page.blocks);
          page.updatedAt = new Date().toISOString();
        }),

      deleteBlock: (pageId, blockId) =>
        set((state) => {
          const page = state.pages[pageId];
          if (!page) return;

          const findAndDelete = (blocks: Block[]): boolean => {
            for (let i = 0; i < blocks.length; i++) {
              if (blocks[i].id === blockId) {
                blocks.splice(i, 1);
                return true;
              }
              if (findAndDelete(blocks[i].children)) return true;
            }
            return false;
          };

          findAndDelete(page.blocks);
          page.updatedAt = new Date().toISOString();
        }),

      moveBlock: (pageId, blockId, newParentId, index) =>
        set((state) => {
          const page = state.pages[pageId];
          if (!page) return;

          let removedBlock: Block | null = null;

          // Find and remove block
          const findAndRemove = (blocks: Block[]): boolean => {
            for (let i = 0; i < blocks.length; i++) {
              if (blocks[i].id === blockId) {
                removedBlock = blocks.splice(i, 1)[0];
                return true;
              }
              if (findAndRemove(blocks[i].children)) return true;
            }
            return false;
          };

          findAndRemove(page.blocks);
          if (!removedBlock) return;

          const block = removedBlock as Block;
          block.parentId = newParentId;

          // Add to new location
          if (newParentId) {
            const findAndAdd = (blocks: Block[]): boolean => {
              for (const b of blocks) {
                if (b.id === newParentId) {
                  if (index !== undefined) {
                    b.children.splice(index, 0, block!);
                  } else {
                    b.children.push(block!);
                  }
                  return true;
                }
                if (findAndAdd(b.children)) return true;
              }
              return false;
            };
            findAndAdd(page.blocks);
          } else {
            if (index !== undefined) {
              page.blocks.splice(index, 0, block);
            } else {
              page.blocks.push(block);
            }
          }

          page.updatedAt = new Date().toISOString();
        }),

      duplicateBlock: (pageId, blockId) => {
        const state = get();
        const page = state.pages[pageId];
        if (!page) throw new Error("Page not found");

        let originalBlock: Block | null = null;
        let parentBlocks: Block[] | null = null;
        let blockIndex = -1;

        const findBlock = (blocks: Block[], parent: Block[] | null): boolean => {
          for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].id === blockId) {
              originalBlock = blocks[i];
              parentBlocks = blocks;
              blockIndex = i;
              return true;
            }
            if (findBlock(blocks[i].children, blocks[i].children)) return true;
          }
          return false;
        };

        findBlock(page.blocks, null);
        if (!originalBlock || !parentBlocks) throw new Error("Block not found");

        const duplicateWithNewIds = (block: Block): Block => {
          return {
            ...block,
            id: generateId(),
            children: block.children.map(duplicateWithNewIds),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        };

        const newBlock = duplicateWithNewIds(originalBlock);

        set((s) => {
          const p = s.pages[pageId];
          if (!p) return;

          const findAndInsert = (blocks: Block[]): boolean => {
            for (let i = 0; i < blocks.length; i++) {
              if (blocks[i].id === blockId) {
                blocks.splice(i + 1, 0, newBlock);
                return true;
              }
              if (findAndInsert(blocks[i].children)) return true;
            }
            return false;
          };

          findAndInsert(p.blocks);
          p.updatedAt = new Date().toISOString();
        });

        return newBlock;
      },

      // Database rows
      databaseRows: {},

      createDatabaseRow: (databaseId) => {
        const state = get();
        const userId = state.currentUser?.id || "anonymous";
        const now = new Date().toISOString();

        const row: DatabaseRow = {
          id: generateId(),
          pageId: generateId(),
          databaseId,
          properties: {},
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          lastEditedBy: userId,
        };

        set((s) => {
          if (!s.databaseRows[databaseId]) {
            s.databaseRows[databaseId] = [];
          }
          s.databaseRows[databaseId].push(row);
        });

        return row;
      },

      updateDatabaseRow: (databaseId, rowId, updates) =>
        set((state) => {
          const rows = state.databaseRows[databaseId];
          if (!rows) return;

          const index = rows.findIndex((r) => r.id === rowId);
          if (index !== -1) {
            rows[index] = {
              ...rows[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        }),

      deleteDatabaseRow: (databaseId, rowId) =>
        set((state) => {
          if (state.databaseRows[databaseId]) {
            state.databaseRows[databaseId] = state.databaseRows[
              databaseId
            ].filter((r) => r.id !== rowId);
          }
        }),

      // UI State
      sidebarOpen: true,
      sidebarWidth: 280,
      searchOpen: false,
      settingsOpen: false,

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      setSidebarWidth: (width) =>
        set((state) => {
          state.sidebarWidth = Math.max(200, Math.min(480, width));
        }),

      setSearchOpen: (open) =>
        set((state) => {
          state.searchOpen = open;
        }),

      setSettingsOpen: (open) =>
        set((state) => {
          state.settingsOpen = open;
        }),

      // History
      history: [],
      historyIndex: -1,

      pushHistory: (entry) =>
        set((state) => {
          // Remove any redo history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push(entry);
          state.historyIndex = state.history.length - 1;

          // Keep history to a reasonable size
          if (state.history.length > 100) {
            state.history = state.history.slice(-100);
            state.historyIndex = state.history.length - 1;
          }
        }),

      undo: () =>
        set((state) => {
          if (state.historyIndex < 0) return;
          // Implementation would apply previousData
          state.historyIndex--;
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return;
          state.historyIndex++;
          // Implementation would apply data
        }),
    })),
    {
      name: "notion-clone-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
        pages: state.pages,
        databaseRows: state.databaseRows,
        sidebarWidth: state.sidebarWidth,
        expandedPageIds: Array.from(state.expandedPageIds),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert expandedPageIds back to Set
          if (Array.isArray(state.expandedPageIds)) {
            state.expandedPageIds = new Set(state.expandedPageIds);
          }
        }
      },
    }
  )
);
