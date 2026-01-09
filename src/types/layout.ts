export type LayoutStructure = 'simple' | 'tabbed';
export type ModuleType = 'heading' | 'property_group' | 'content' | 'relation_group' | 'sub_items';
export type PageOpenMode = 'side_peek' | 'center_peek' | 'full_page';

export interface PropertySection {
    id: string;
    name: string;
    propertyIds: string[];
    isCollapsed?: boolean;
}

export interface LayoutModule {
    id: string;
    type: ModuleType;
    label?: string; // Display name for the module

    // For property_group modules
    propertyIds?: string[]; // Which properties to show
    sections?: PropertySection[]; // Organize properties into sections

    // For relation_group modules
    relationPropertyId?: string; // Which relation property to show items from
    viewId?: string; // Which view of the related database to use

    // For tabbed layouts
    isTab?: boolean; // Whether this module is a tab in tabbed layout
    tabIcon?: string; // Icon for the tab
}

export interface DatabaseLayout {
    structure: LayoutStructure;
    // Modules in the main center area (for simple layout)
    mainArea: LayoutModule[];
    // Modules in the right side panel
    sidePanel: LayoutModule[];
    // Whether the side panel is collapsed
    isSidePanelOpen: boolean;
    // Which properties are pinned to the top of the heading (max 4)
    pinnedPropertyIds: string[];
    // Tabs for tabbed layout (first tab is always Content)
    tabs?: LayoutModule[]; // Each module with isTab: true
    // Default page open mode for this database
    pageOpenMode?: PageOpenMode;
}

export const DEFAULT_DATABASE_LAYOUT: DatabaseLayout = {
    structure: 'simple',
    mainArea: [
        { id: 'heading', type: 'heading' },
        { id: 'content', type: 'content' }
    ],
    sidePanel: [
        { id: 'properties', type: 'property_group', label: 'Properties' }
    ],
    isSidePanelOpen: true,
    pinnedPropertyIds: [],
    pageOpenMode: 'center_peek'
};

// Tabbed layout preset for project management
export const TABBED_PROJECT_LAYOUT: DatabaseLayout = {
    structure: 'tabbed',
    mainArea: [
        { id: 'heading', type: 'heading' }
    ],
    sidePanel: [
        { id: 'properties', type: 'property_group', label: 'Properties' }
    ],
    tabs: [
        { id: 'content-tab', type: 'content', label: 'Content', isTab: true, tabIcon: '📝' },
        { id: 'tasks-tab', type: 'relation_group', label: 'Tasks', isTab: true, tabIcon: '✓' },
        { id: 'notes-tab', type: 'relation_group', label: 'Notes', isTab: true, tabIcon: '📋' }
    ],
    isSidePanelOpen: true,
    pinnedPropertyIds: [],
    pageOpenMode: 'full_page'
};

// CRM Contact layout with sections
export const CRM_CONTACT_LAYOUT: DatabaseLayout = {
    structure: 'simple',
    mainArea: [
        { id: 'heading', type: 'heading' },
        { id: 'content', type: 'content' }
    ],
    sidePanel: [
        {
            id: 'contact-info',
            type: 'property_group',
            label: 'Contact Info',
            sections: [
                { id: 'basic', name: 'Basic Information', propertyIds: [], isCollapsed: false },
                { id: 'social', name: 'Social Media', propertyIds: [], isCollapsed: false }
            ]
        },
        { id: 'related-deals', type: 'relation_group', label: 'Deals' }
    ],
    isSidePanelOpen: true,
    pinnedPropertyIds: [],
    pageOpenMode: 'side_peek'
};

// Document layout - content-focused
export const DOCUMENT_LAYOUT: DatabaseLayout = {
    structure: 'simple',
    mainArea: [
        { id: 'heading', type: 'heading' },
        { id: 'content', type: 'content' },
        { id: 'sub-items', type: 'sub_items', label: 'Sub-pages' }
    ],
    sidePanel: [
        { id: 'properties', type: 'property_group', label: 'Metadata' }
    ],
    isSidePanelOpen: false,
    pinnedPropertyIds: [],
    pageOpenMode: 'full_page'
};

// All layout presets
export const LAYOUT_PRESETS = {
    default: { name: 'Default', layout: DEFAULT_DATABASE_LAYOUT, icon: '📄' },
    tabbed_project: { name: 'Tabbed Project', layout: TABBED_PROJECT_LAYOUT, icon: '📑' },
    crm_contact: { name: 'CRM Contact', layout: CRM_CONTACT_LAYOUT, icon: '👤' },
    document: { name: 'Document', layout: DOCUMENT_LAYOUT, icon: '📝' }
};
