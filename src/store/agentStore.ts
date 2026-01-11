import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentMode, AgentMessage, AgentConversation } from "@/types/agent";
import { defaultAgentModes } from "@/config/agentModes";
import { nanoid } from "nanoid";

interface AgentStore {
    // State
    isOpen: boolean;
    isLoading: boolean;
    activeMode: AgentMode | null;
    modes: AgentMode[];
    conversations: AgentConversation[];
    currentConversationId: string | null;

    // Panel controls
    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;

    // Mode management
    setActiveMode: (mode: AgentMode) => void;
    addCustomMode: (mode: Omit<AgentMode, "id" | "isBuiltIn" | "createdAt">) => AgentMode;
    updateMode: (id: string, updates: Partial<AgentMode>) => void;
    deleteMode: (id: string) => void;

    // Conversation management
    startConversation: (modeId: string, pageId?: string) => string;
    addMessage: (conversationId: string, message: Omit<AgentMessage, "id" | "timestamp">) => void;
    clearConversation: (conversationId: string) => void;
    getConversation: (modeId: string, pageId?: string) => AgentConversation | undefined;

    // Loading state
    setLoading: (loading: boolean) => void;
}

export const useAgentStore = create<AgentStore>()(
    persist(
        (set, get) => ({
            // Initial state
            isOpen: false,
            isLoading: false,
            activeMode: defaultAgentModes[0],
            modes: defaultAgentModes,
            conversations: [],
            currentConversationId: null,

            // Panel controls
            openPanel: () => set({ isOpen: true }),
            closePanel: () => set({ isOpen: false }),
            togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

            // Mode management
            setActiveMode: (mode) => set({ activeMode: mode }),

            addCustomMode: (modeData) => {
                const newMode: AgentMode = {
                    ...modeData,
                    id: nanoid(),
                    isBuiltIn: false,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    modes: [...state.modes, newMode],
                }));
                return newMode;
            },

            updateMode: (id, updates) => {
                set((state) => {
                    const modes = state.modes.map((mode) =>
                        mode.id === id && !mode.isBuiltIn
                            ? { ...mode, ...updates }
                            : mode
                    );
                    return { modes };
                });
            },

            deleteMode: (id) => {
                const { modes, activeMode } = get();
                const mode = modes.find((m) => m.id === id);
                if (mode && !mode.isBuiltIn) {
                    const newModes = modes.filter((m) => m.id !== id);
                    set({
                        modes: newModes,
                        activeMode: activeMode?.id === id ? newModes[0] || null : activeMode,
                    });
                }
            },

            // Conversation management
            startConversation: (modeId, pageId) => {
                const conversationId = nanoid();
                const now = new Date().toISOString();

                set((state) => ({
                    conversations: [
                        ...state.conversations,
                        {
                            id: conversationId,
                            modeId,
                            pageId,
                            messages: [],
                            createdAt: now,
                            updatedAt: now,
                        },
                    ],
                    currentConversationId: conversationId,
                }));

                return conversationId;
            },

            addMessage: (conversationId, message) => {
                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        conv.id === conversationId
                            ? {
                                ...conv,
                                messages: [
                                    ...conv.messages,
                                    {
                                        ...message,
                                        id: nanoid(),
                                        timestamp: new Date().toISOString(),
                                    },
                                ],
                                updatedAt: new Date().toISOString(),
                            }
                            : conv
                    ),
                }));
            },

            clearConversation: (conversationId) => {
                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        conv.id === conversationId
                            ? { ...conv, messages: [], updatedAt: new Date().toISOString() }
                            : conv
                    ),
                }));
            },

            getConversation: (modeId, pageId) => {
                const { conversations } = get();
                return conversations.find(
                    (c) => c.modeId === modeId && c.pageId === pageId
                );
            },

            // Loading state
            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: "agent-store",
            partialize: (state) => ({
                modes: state.modes,
                conversations: state.conversations.slice(-50), // Keep last 50 conversations
                activeMode: state.activeMode,
            }),
        }
    )
);
