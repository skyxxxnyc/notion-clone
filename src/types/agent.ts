// AgentOS Types

export interface AgentMode {
    id: string;
    name: string;
    icon: string;
    description: string;
    systemPrompt: string;
    personality?: string;
    expertise: string[];
    isBuiltIn: boolean;
    createdAt?: string;
}

export interface AgentMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    modeId?: string;
}

export interface AgentConversation {
    id: string;
    modeId: string;
    pageId?: string;
    messages: AgentMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface AgentState {
    isOpen: boolean;
    isLoading: boolean;
    activeMode: AgentMode | null;
    modes: AgentMode[];
    conversations: AgentConversation[];
    currentConversationId: string | null;
}

export type AgentAction =
    | "summarize"
    | "explain"
    | "translate"
    | "rewrite"
    | "expand"
    | "shorten"
    | "brainstorm"
    | "action_items"
    | "improve"
    | "continue";
