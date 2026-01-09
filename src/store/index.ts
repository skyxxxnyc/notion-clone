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
import * as pageActions from "@/actions/pages";
import * as blockActions from "@/actions/blocks";
import * as workspaceActions from "@/actions/workspaces";

interface AppState {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  initialize: () => Promise<void>;

  // Workspace state
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setCurrentWorkspace: (id: string) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;

  // Page state
  pages: Record<string, Page>;
  currentPageId: string | null;
  expandedPageIds: Set<string>;
  setCurrentPage: (id: string | null) => void;
  togglePageExpanded: (id: string) => void;
  createPage: (parentId: string | null, title?: string) => Promise<Page>;
  createDatabase: (parentId: string | null, title?: string) => Promise<Page>;
  updatePage: (id: string, updates: Partial<Page>) => Promise<void>;
  addPages: (pages: Page[]) => void;
  deletePage: (id: string) => Promise<void>;
  movePage: (id: string, newParentId: string | null, index?: number) => Promise<void>;
  duplicatePage: (id: string) => Promise<Page>;
  toggleFavourite: (id: string) => Promise<void>;
  archivePage: (id: string) => Promise<void>;
  restorePage: (id: string) => Promise<void>;

  // Block operations
  createBlock: (
    pageId: string,
    type: BlockType,
    content?: string,
    parentId?: string | null,
    index?: number
  ) => Promise<Block>;
  updateBlock: (
    pageId: string,
    blockId: string,
    updates: Partial<Block>
  ) => Promise<void>;
  deleteBlock: (pageId: string, blockId: string) => Promise<void>;
  moveBlock: (
    pageId: string,
    blockId: string,
    newParentId: string | null,
    index?: number
  ) => void;
  duplicateBlock: (pageId: string, blockId: string) => Promise<Block>;
  fetchBlocks: (pageId: string) => Promise<void>;
  savePageContent: (pageId: string, blocks: Partial<Block>[]) => Promise<void>;

  // Database rows
  databaseRows: Record<string, DatabaseRow[]>;
  createDatabaseRow: (databaseId: string) => Promise<DatabaseRow>;
  updateDatabaseRow: (
    databaseId: string,
    rowId: string,
    updates: Partial<DatabaseRow>
  ) => void;
  deleteDatabaseRow: (databaseId: string, rowId: string) => Promise<void>;
  bulkDeleteDatabaseRows: (databaseId: string, rowIds: string[]) => Promise<void>;

  // UI State
  sidebarOpen: boolean;
  sidebarWidth: number;
  searchOpen: boolean;
  settingsOpen: boolean;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  saveStatus: "unsaved" | "saving" | "saved";
  setSaveStatus: (status: "unsaved" | "saving" | "saved") => void;

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

      initialize: async () => {
        const state = get();
        // Skip if already initialized or no user
        if (!state.currentUser) return;

        try {
          // Fetch workspaces from database
          const workspaces = await workspaceActions.getWorkspaces();

          // Convert to app format
          const appWorkspaces: Workspace[] = workspaces.map((w: any) => ({
            id: w.id,
            name: w.name,
            icon: w.icon,
            ownerId: w.owner_id,
            members: [], // Will be populated if needed
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          }));

          set((s) => {
            s.workspaces = appWorkspaces;
            // If no current workspace, set to first one
            if (!s.currentWorkspaceId && appWorkspaces.length > 0) {
              s.currentWorkspaceId = appWorkspaces[0].id;
            }
          });

          // If user has no workspaces, create a default one
          if (appWorkspaces.length === 0) {
            console.log("No workspaces found. Creating default workspace...");
            const newWorkspace = await workspaceActions.createWorkspace(
              `${state.currentUser.name}'s Workspace` || "My Workspace"
            );

            const workspace: Workspace = {
              id: newWorkspace.id,
              name: newWorkspace.name,
              icon: newWorkspace.icon,
              ownerId: newWorkspace.owner_id,
              members: [],
              createdAt: newWorkspace.created_at,
              updatedAt: newWorkspace.updated_at,
            };

            set((s) => {
              s.workspaces = [workspace];
              s.currentWorkspaceId = workspace.id;
            });
            return;
          }

          // Validate workspace ID format (should be a valid UUID)
          const isValidUUID = (uuid: string) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(uuid);
          };

          const currentWorkspaceId = get().currentWorkspaceId;

          // Only try to fetch pages if we have a valid workspace ID
          if (currentWorkspaceId && isValidUUID(currentWorkspaceId)) {
            const pages = await pageActions.getPages(currentWorkspaceId);
            const pagesMap: Record<string, Page> = {};

            pages.forEach((p: any) => {
              pagesMap[p.id] = {
                ...p,
                blocks: [], // Blocks will be fetched when page is opened
                children: [], // Children need to be computed or fetched
              };
            });

            set((s) => {
              s.pages = pagesMap;

              const dbRows: Record<string, DatabaseRow[]> = {};

              // Recompute children relationships and populate database rows
              Object.values(s.pages).forEach(p => {
                if (p.parentId && s.pages[p.parentId]) {
                  s.pages[p.parentId].children.push(p.id);

                  // If parent is database, add to databaseRows
                  if (s.pages[p.parentId].isDatabase) {
                    if (!dbRows[p.parentId]) dbRows[p.parentId] = [];
                    dbRows[p.parentId].push({
                      id: p.id,
                      pageId: p.id,
                      databaseId: p.parentId,
                      properties: p.properties ? { ...p.properties, title: p.title } : { title: p.title },
                      createdAt: p.createdAt,
                      updatedAt: p.updatedAt,
                      createdBy: p.createdBy,
                      lastEditedBy: p.lastEditedBy
                    });
                  }
                }
              });

              s.databaseRows = dbRows;
            });
          } else if (currentWorkspaceId && !isValidUUID(currentWorkspaceId)) {
            // Clear invalid workspace ID
            console.log("Invalid workspace ID format detected. Clearing...");
            set((s) => {
              s.currentWorkspaceId = appWorkspaces.length > 0 ? appWorkspaces[0].id : null;
            });
          }
        } catch (error: any) {
          // Silently handle "table doesn't exist" errors - DB may not be set up yet
          if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
            console.error("❌ DATABASE ERROR: Tables not set up yet.");
            console.error("📋 SOLUTION: Run FINAL_FIX.sql in Supabase SQL Editor");
            console.error("📖 Read FIX_DATABASE.md for step-by-step instructions");
            return;
          }
          // Handle undefined column errors (schema mismatch)
          if (error?.code === "42P17") {
            console.error("❌ DATABASE ERROR: Column name mismatch (42P17)");
            console.error("📋 SOLUTION: Run DIAGNOSTIC.sql to see actual column names");
            console.error("📖 Read FIX_DATABASE.md for detailed instructions");
            console.error("🔧 Full error:", error);
            return;
          }
          // Also handle invalid UUID format errors
          if (error?.code === "22P02") {
            console.log("Invalid workspace ID format. Clearing...");
            set((s) => {
              s.currentWorkspaceId = null;
              s.workspaces = [];
            });
            return;
          }
          // Handle permission errors (RLS policies)
          if (error?.code === "42501") {
            console.error("❌ DATABASE ERROR: Permission denied (42501)");
            console.error("📋 SOLUTION: RLS policies are blocking access or profile is missing");
            console.error("📖 Read FIX_DATABASE.md for step-by-step instructions");
            return;
          }
          console.error("❌ Initialization failed:", error);
          console.error("📖 Read FIX_DATABASE.md for troubleshooting help");
        }
      },

      // Workspace state
      workspaces: [],
      currentWorkspaceId: null,

      setCurrentWorkspace: (id) =>
        set((state) => {
          state.currentWorkspaceId = id;
        }),

      createWorkspace: async (name) => {
        try {
          const newWorkspace = await workspaceActions.createWorkspace(name);

          const workspace: Workspace = {
            id: newWorkspace.id,
            name: newWorkspace.name,
            icon: newWorkspace.icon,
            ownerId: newWorkspace.owner_id,
            members: [],
            createdAt: newWorkspace.created_at,
            updatedAt: newWorkspace.updated_at,
          };

          set((state) => {
            state.workspaces.push(workspace);
            if (!state.currentWorkspaceId) {
              state.currentWorkspaceId = workspace.id;
            }
          });

          return workspace;
        } catch (error) {
          console.error("Failed to create workspace:", error);
          throw error;
        }
      },

      updateWorkspace: async (id, updates) => {
        // Optimistic update
        set((state) => {
          const index = state.workspaces.findIndex((w) => w.id === id);
          if (index !== -1) {
            state.workspaces[index] = {
              ...state.workspaces[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        });

        try {
          await workspaceActions.updateWorkspace(id, updates);
        } catch (error) {
          console.error("Failed to update workspace:", error);
          throw error;
        }
      },

      deleteWorkspace: async (id) => {
        const snapshot = get().workspaces;

        // Optimistic update
        set((state) => {
          state.workspaces = state.workspaces.filter((w) => w.id !== id);
          if (state.currentWorkspaceId === id) {
            state.currentWorkspaceId = state.workspaces[0]?.id || null;
          }
        });

        try {
          await workspaceActions.deleteWorkspace(id);
        } catch (error) {
          console.error("Failed to delete workspace:", error);
          // Rollback
          set((state) => {
            state.workspaces = snapshot;
          });
          throw error;
        }
      },

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

      createPage: async (parentId, title = "Untitled") => {
        const state = get();
        const workspaceId = state.currentWorkspaceId || "";
        const userId = state.currentUser?.id || "anonymous";

        // Optimistic UI update
        const page = createDefaultPage(parentId, workspaceId, userId, title);
        const initialBlock = createDefaultBlock(page.id, "text", "", null, userId);
        page.blocks = [initialBlock];

        set((s) => {
          s.pages[page.id] = page;
          if (parentId && s.pages[parentId]) {
            s.pages[parentId].children.push(page.id);
          }
        });

        try {
          // Call Supabase
          const newPage = await pageActions.createPage(workspaceId, parentId, title);

          // Update the local page with the real ID from Supabase if different
          // Actually, our createPage action doesn't take an ID, it lets Supabase generate one.
          // This means we might need to update the local ID or use the Supabase ID from the start.
          // For now, let's assume we update the local store with the returned page.

          set((s) => {
            delete s.pages[page.id]; // Remove the optimistic one
            s.pages[newPage.id] = {
              ...newPage,
              blocks: [initialBlock], // Re-add the blocks which aren't in the partial return
              children: [],
            };
            if (parentId && s.pages[parentId]) {
              s.pages[parentId].children = s.pages[parentId].children.map(cid => cid === page.id ? newPage.id : cid);
            }
          });

          return newPage;
        } catch (error) {
          console.error("Failed to create page:", error);
          // Rollback
          set((s) => {
            delete s.pages[page.id];
            if (parentId && s.pages[parentId]) {
              s.pages[parentId].children = s.pages[parentId].children.filter(cid => cid !== page.id);
            }
          });
          throw error;
        }
      },

      createDatabase: async (parentId, title = "Untitled Database") => {
        const state = get();
        const workspaceId = state.currentWorkspaceId || "";
        const userId = state.currentUser?.id || "anonymous";

        // Create a database page with default config
        const page = createDefaultPage(parentId, workspaceId, userId, title);
        page.isDatabase = true;
        page.databaseConfig = {
          properties: [
            { id: "title", name: "Name", type: "title", isVisible: true, width: 250 },
            {
              id: "status",
              name: "Status",
              type: "select",
              isVisible: true,
              width: 120,
              options: [
                { id: "1", name: "Not started", color: "#e5e5e5" },
                { id: "2", name: "In progress", color: "#fef3c7" },
                { id: "3", name: "Done", color: "#dcfce7" },
              ]
            },
            { id: "date", name: "Date", type: "date", isVisible: true, width: 120 },
          ],
          views: [
            {
              id: "1",
              name: "Table",
              type: "table" as const,
              filters: [],
              sorts: [],
              visibleProperties: [],
              config: {}
            },
          ],
          defaultViewId: "1"
        };

        set((s) => {
          s.pages[page.id] = page;
          if (parentId && s.pages[parentId]) {
            s.pages[parentId].children.push(page.id);
          }
        });

        try {
          // Call Supabase
          const newPage = await pageActions.createPage(workspaceId, parentId, title);

          // Update with database config
          await pageActions.updatePage(newPage.id, {
            is_database: true,
            database_config: page.databaseConfig
          });

          set((s) => {
            delete s.pages[page.id];
            s.pages[newPage.id] = {
              ...newPage,
              isDatabase: true,
              databaseConfig: page.databaseConfig,
              blocks: [],
              children: [],
            };
            if (parentId && s.pages[parentId]) {
              s.pages[parentId].children = s.pages[parentId].children.map(cid => cid === page.id ? newPage.id : cid);
            }
          });

          return newPage as Page;
        } catch (error) {
          console.error("Failed to create database:", error);
          set((s) => {
            delete s.pages[page.id];
            if (parentId && s.pages[parentId]) {
              s.pages[parentId].children = s.pages[parentId].children.filter(cid => cid !== page.id);
            }
          });
          throw error;
        }
      },

      addPages: (pages: Page[]) => {
        set((s) => {
          pages.forEach(p => {
            s.pages[p.id] = p;

            if (p.parentId && s.pages[p.parentId]) {
              if (!s.pages[p.parentId].children.includes(p.id)) {
                s.pages[p.parentId].children.push(p.id);
              }

              if (s.pages[p.parentId].isDatabase) {
                if (!s.databaseRows[p.parentId]) s.databaseRows[p.parentId] = [];
                s.databaseRows[p.parentId].push({
                  id: p.id,
                  pageId: p.id,
                  databaseId: p.parentId,
                  properties: { ...(p.properties || {}), title: p.title },
                  createdAt: p.createdAt,
                  updatedAt: p.updatedAt,
                  createdBy: p.createdBy,
                  lastEditedBy: p.lastEditedBy
                });
              }
            }
          });
        });
      },

      updatePage: async (id, updates) => {
        // Optimistic update
        set((state) => {
          if (state.pages[id]) {
            state.pages[id] = {
              ...state.pages[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        });

        try {
          await pageActions.updatePage(id, updates);
        } catch (error) {
          console.error("Failed to update page:", error);
          // Simple rollback is hard without previous data, ideally we'd fetch or store snapshot
          throw error;
        }
      },

      deletePage: async (id) => {
        const state = get();
        const page = state.pages[id];
        if (!page) return;

        // Snapshot for rollback
        const snapshot = JSON.parse(JSON.stringify(state.pages));

        // Optimistic update
        set((state) => {
          if (page.parentId && state.pages[page.parentId]) {
            state.pages[page.parentId].children = state.pages[
              page.parentId
            ].children.filter((childId) => childId !== id);
          }

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
        });

        try {
          await pageActions.deletePage(id);
        } catch (error) {
          console.error("Failed to delete page:", error);
          set((s) => {
            s.pages = snapshot;
          });
          throw error;
        }
      },

      movePage: async (id, newParentId, index) => {
        // Snapshot for rollback
        const state = get();
        const oldPages = JSON.parse(JSON.stringify(state.pages));

        // Optimistic update
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
        });

        try {
          await pageActions.updatePage(id, { parent_id: newParentId });
        } catch (error) {
          console.error("Failed to move page:", error);
          set((s) => { s.pages = oldPages; });
          throw error;
        }
      },

      duplicatePage: async (id) => {
        const state = get();
        const original = state.pages[id];
        if (!original) throw new Error("Page not found");

        const userId = state.currentUser?.id || "anonymous";

        try {
          // Call backend to duplicate
          const newPage = await pageActions.createPage(
            original.workspaceId,
            original.parentId,
            `${original.title} (copy)`
          );

          // Copy metadata
          await pageActions.updatePage(newPage.id, {
            icon: original.icon,
            cover_image: original.coverImage,
          });

          // In a real implementation, we'd also duplicate all blocks recursively on the server
          // For now, let's just create the page

          set((s) => {
            s.pages[newPage.id] = {
              ...newPage,
              icon: original.icon,
              coverImage: original.coverImage,
              blocks: [], // Should fetch or copy blocks
              children: [],
            };
            if (original.parentId && s.pages[original.parentId]) {
              s.pages[original.parentId].children.push(newPage.id);
            }
          });

          return newPage;
        } catch (error) {
          console.error("Failed to duplicate page:", error);
          throw error;
        }
      },

      toggleFavourite: async (id) => {
        const state = get();
        const page = state.pages[id];
        if (!page) return;
        const newValue = !page.isFavourite;

        // Optimistic
        set((state) => {
          if (state.pages[id]) {
            state.pages[id].isFavourite = newValue;
          }
        });

        try {
          await pageActions.updatePage(id, { is_favourite: newValue });
        } catch (error) {
          set((state) => { if (state.pages[id]) state.pages[id].isFavourite = !newValue; });
        }
      },

      archivePage: async (id) => {
        set((state) => {
          if (state.pages[id]) {
            state.pages[id].isArchived = true;
            state.pages[id].updatedAt = new Date().toISOString();
          }
        });
        try {
          await pageActions.updatePage(id, { is_archived: true });
        } catch (error) {
          set((state) => { if (state.pages[id]) state.pages[id].isArchived = false; });
        }
      },

      restorePage: async (id) => {
        set((state) => {
          if (state.pages[id]) {
            state.pages[id].isArchived = false;
            state.pages[id].updatedAt = new Date().toISOString();
          }
        });
        try {
          await pageActions.updatePage(id, { is_archived: false });
        } catch (error) {
          set((state) => { if (state.pages[id]) state.pages[id].isArchived = true; });
        }
      },

      // Block operations
      createBlock: async (pageId, type, content = "", parentId = null, index) => {
        const state = get();
        const userId = state.currentUser?.id || "anonymous";
        const block = createDefaultBlock(pageId, type, content, parentId, userId);

        set((s) => {
          const page = s.pages[pageId];
          if (!page) return;

          if (parentId) {
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

        try {
          const newBlock = await blockActions.createBlock(pageId, type, content, parentId, index || 0);

          // Reconcile ID if needed (optimistic ID vs real ID)
          set((s) => {
            const page = s.pages[pageId];
            if (!page) return;

            const findAndReplace = (blocks: Block[]): boolean => {
              for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].id === block.id) {
                  blocks[i] = { ...newBlock, children: blocks[i].children };
                  return true;
                }
                if (findAndReplace(blocks[i].children)) return true;
              }
              return false;
            };
            findAndReplace(page.blocks);
          });

          return newBlock;
        } catch (error) {
          console.error("Failed to create block:", error);
          // Rollback
          set((s) => {
            const page = s.pages[pageId];
            if (!page) return;
            const findAndRemove = (blocks: Block[]): boolean => {
              for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].id === block.id) {
                  blocks.splice(i, 1);
                  return true;
                }
                if (findAndRemove(blocks[i].children)) return true;
              }
              return false;
            };
            findAndRemove(page.blocks);
          });
          throw error;
        }
      },

      updateBlock: async (pageId, blockId, updates) => {
        // Optimistic update
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
        });

        try {
          await blockActions.updateBlock(blockId, updates);
        } catch (error) {
          console.error("Failed to update block:", error);
          // Rollback would require complex snapshotting
          throw error;
        }
      },

      deleteBlock: async (pageId, blockId) => {
        // Snapshot for rollback
        const state = get();
        const pageSnapshot = JSON.parse(JSON.stringify(state.pages[pageId]?.blocks || []));

        // Optimistic update
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
        });

        try {
          await blockActions.deleteBlock(blockId);
        } catch (error) {
          console.error("Failed to delete block:", error);
          set((s) => {
            if (s.pages[pageId]) {
              s.pages[pageId].blocks = pageSnapshot;
            }
          });
          throw error;
        }
      },

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

      fetchBlocks: async (pageId) => {
        try {
          const blocks = await blockActions.getBlocks(pageId);

          set((s) => {
            if (s.pages[pageId]) {
              // Convert nested children if needed or assume flat from DB and rebuild
              // Our schema has parent_id, so we can nest them
              const nestBlocks = (allBlocks: any[], parentId: string | null = null): Block[] => {
                return allBlocks
                  .filter(b => b.parent_id === parentId)
                  .map(b => ({
                    ...b,
                    pageId: b.page_id,
                    parentId: b.parent_id,
                    children: nestBlocks(allBlocks, b.id)
                  }))
                  .sort((a, b) => (a.index || 0) - (b.index || 0));
              };

              s.pages[pageId].blocks = nestBlocks(blocks);
            }
          });
        } catch (error) {
          console.error("Failed to fetch blocks:", error);
        }
      },

      duplicateBlock: async (pageId, blockId) => {
        const state = get();
        const page = state.pages[pageId];
        if (!page) throw new Error("Page not found");

        let originalBlock: Block | null = null;

        const findBlock = (blocks: Block[]): Block | null => {
          for (const b of blocks) {
            if (b.id === blockId) return b;
            const found = findBlock(b.children);
            if (found) return found;
          }
          return null;
        };

        originalBlock = findBlock(page.blocks);
        if (!originalBlock) throw new Error("Block not found");

        try {
          const newBlock = await blockActions.createBlock(
            pageId,
            originalBlock.type,
            originalBlock.content,
            originalBlock.parentId,
            0 // Will be placed at the top for now
          );

          set((s) => {
            if (s.pages[pageId]) {
              s.pages[pageId].blocks.push({ ...newBlock, children: [] });
            }
          });

          return newBlock;
        } catch (error) {
          console.error("Failed to duplicate block:", error);
          throw error;
        }
      },

      savePageContent: async (pageId, blocks) => {
        set((s) => {
          s.saveStatus = "saving";
        });
        try {
          await blockActions.syncBlocks(pageId, blocks);
          set((s) => {
            if (s.pages[pageId]) {
              s.pages[pageId].blocks = blocks as Block[];
            }
            s.saveStatus = "saved";
          });
        } catch (error) {
          console.error("Failed to save page content:", error);
          set((s) => {
            s.saveStatus = "unsaved";
          });
          throw error;
        }
      },

      // Database rows
      databaseRows: {},

      createDatabaseRow: async (databaseId) => {
        const state = get();
        const userId = state.currentUser?.id;
        if (!userId) throw new Error("Unauthorized");

        const databasePage = state.pages[databaseId];
        const workspaceId = databasePage?.workspaceId || state.currentWorkspaceId;

        if (!workspaceId) {
          console.error("Missing workspace ID for createDatabaseRow");
          throw new Error("Missing workspace ID");
        }

        const newId = generateId();
        const now = new Date().toISOString();

        const newPage: Page = {
          id: newId,
          title: "Untitled",
          icon: undefined,
          coverImage: undefined,
          coverPosition: 0.5,
          parentId: databaseId,
          workspaceId: workspaceId,
          createdBy: userId,
          lastEditedBy: userId,
          createdAt: now,
          updatedAt: now,
          isArchived: false,
          isFavourite: false,
          isTemplate: false,
          isDatabase: false,
          databaseConfig: undefined,
          blocks: [],
          children: [],
          path: [],
        };

        const row: DatabaseRow = {
          id: newId,
          pageId: newId,
          databaseId,
          properties: { title: "Untitled" },
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          lastEditedBy: userId,
        };

        // Optimistic update
        set((s) => {
          s.pages[newId] = newPage;
          // Add to parent children
          if (s.pages[databaseId]) {
            s.pages[databaseId].children = [...(s.pages[databaseId].children || []), newId];
          }

          if (!s.databaseRows[databaseId]) {
            s.databaseRows[databaseId] = [];
          }
          s.databaseRows[databaseId].push(row);
        });

        // Server Sync
        try {
          await pageActions.createPage(workspaceId, databaseId, "Untitled", newId);
        } catch (error) {
          console.error("Failed to create database row:", error);
          // Rollback
          set((s) => {
            delete s.pages[newId];
            if (s.pages[databaseId]) {
              s.pages[databaseId].children = s.pages[databaseId].children.filter(id => id !== newId);
            }
            if (s.databaseRows[databaseId]) {
              s.databaseRows[databaseId] = s.databaseRows[databaseId].filter(r => r.id !== newId);
            }
          });
          throw error;
        }

        return row;
      },

      updateDatabaseRow: async (databaseId, rowId, updates) => {
        // Optimistic update
        set((state) => {
          const rows = state.databaseRows[databaseId];
          if (rows) {
            const index = rows.findIndex((r) => r.id === rowId);
            if (index !== -1) {
              rows[index] = {
                ...rows[index],
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
          }

          // Also update the page in cache if it exists
          if (state.pages[rowId] && updates.properties) {
            state.pages[rowId].properties = updates.properties;
          }
        });

        // Server Sync
        try {
          if (updates.properties) {
            await pageActions.updatePage(rowId, { properties: updates.properties });
          }
        } catch (error) {
          console.error("Failed to update database row:", error);
          // No easy rollback for granular property updates without full snapshot
        }
      },

      deleteDatabaseRow: async (databaseId, rowId) => {
        set((state) => {
          if (state.databaseRows[databaseId]) {
            state.databaseRows[databaseId] = state.databaseRows[databaseId].filter((r) => r.id !== rowId);
          }
          if (state.pages[rowId]) {
            delete state.pages[rowId];
          }
          if (state.pages[databaseId]) {
            state.pages[databaseId].children = state.pages[databaseId].children.filter(id => id !== rowId);
          }
        });
        await pageActions.deletePage(rowId);
      },

      bulkDeleteDatabaseRows: async (databaseId, rowIds) => {
        const idsSet = new Set(rowIds);
        set((state) => {
          if (state.databaseRows[databaseId]) {
            state.databaseRows[databaseId] = state.databaseRows[databaseId].filter(r => !idsSet.has(r.id));
          }
          if (state.pages[databaseId]) {
            state.pages[databaseId].children = state.pages[databaseId].children.filter(id => !idsSet.has(id));
          }
          rowIds.forEach(id => {
            delete state.pages[id];
          });
        });
        await pageActions.bulkDeletePages(rowIds);
      },

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

      saveStatus: "saved",
      setSaveStatus: (status) =>
        set((state) => {
          state.saveStatus = status;
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
