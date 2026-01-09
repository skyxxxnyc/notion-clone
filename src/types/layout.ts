export type LayoutStructure = 'simple' | 'tabbed';
export type ModuleType = 'heading' | 'properties' | 'content' | 'related_tabs';

export interface LayoutModule {
    id: string;
    type: ModuleType;
    // For property modules, which properties to show?
    // If undefined, show all unpinned/unhidden properties
    propertyIds?: string[];
}

export interface DatabaseLayout {
    structure: LayoutStructure;
    // Modules in the main center area
    mainArea: LayoutModule[];
    // Modules in the right side panel
    sidePanel: LayoutModule[];
    // Whether the side panel is collapsed
    isSidePanelOpen: boolean;
    // Which properties are pinned to the top of the heading
    pinnedPropertyIds: string[];
}

export const DEFAULT_DATABASE_LAYOUT: DatabaseLayout = {
    structure: 'simple',
    mainArea: [
        { id: 'heading', type: 'heading' },
        { id: 'content', type: 'content' }
    ],
    sidePanel: [
        { id: 'properties', type: 'properties' }
    ],
    isSidePanelOpen: true,
    pinnedPropertyIds: []
};
