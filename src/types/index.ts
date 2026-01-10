// Core Types for Notion Clone

import { DatabaseLayout } from "./layout";

export type BlockType =
  | "text"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "todoList"
  | "toggle"
  | "quote"
  | "callout"
  | "divider"
  | "code"
  | "image"
  | "video"
  | "embed"
  | "bookmark"
  | "file"
  | "table"
  | "tableOfContents"
  | "breadcrumb"
  | "linkToPage"
  | "syncedBlock"
  | "template"
  | "column"
  | "columnList";

export type PropertyType =
  | "title"
  | "text"
  | "number"
  | "select"
  | "multiSelect"
  | "tags"
  | "date"
  | "person"
  | "files"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "formula"
  | "relation"
  | "rollup"
  | "createdTime"
  | "createdBy"
  | "lastEditedTime"
  | "lastEditedBy"
  | "status";

export type DatabaseViewType = "table" | "board" | "calendar" | "gallery" | "list" | "timeline";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  role: "owner" | "admin" | "member" | "guest";
  joinedAt: string;
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  coverPosition?: number;
  parentId: string | null;
  workspaceId: string;
  createdBy: string;
  lastEditedBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isFavourite: boolean;
  isTemplate: boolean;
  isDatabase: boolean;
  databaseConfig?: DatabaseConfig;
  properties?: Record<string, PropertyValue>;
  children: string[]; // Page IDs
  blocks: Block[];
  path: string[]; // Breadcrumb path of page IDs
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties: BlockProperties;
  children: Block[];
  parentId: string | null;
  pageId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BlockProperties {
  checked?: boolean;
  language?: string;
  caption?: string;
  url?: string;
  width?: number;
  height?: number;
  alignment?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
  icon?: string;
  isOpen?: boolean; // For toggles
  level?: number; // For headings
  columns?: number; // For column layouts
}



export interface DatabaseConfig {
  properties: DatabaseProperty[];
  views: DatabaseView[];
  defaultViewId: string;
  layout?: DatabaseLayout;
  values?: Record<string, PropertyValue>; // Store row properties here as fallback
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: SelectOption[];
  config?: PropertyConfig;
  isRequired?: boolean;
  isVisible?: boolean;
  width?: number;
}

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface PropertyConfig {
  format?: string;
  formula?: string;
  relationDatabaseId?: string;
  rollupConfig?: RollupConfig;
}

export interface RollupConfig {
  relationPropertyId: string;
  targetPropertyId: string;
  function: "count" | "sum" | "average" | "min" | "max" | "showOriginal";
}

export interface DatabaseView {
  id: string;
  name: string;
  type: DatabaseViewType;
  filters: Filter[];
  sorts: Sort[];
  groupBy?: string;
  visibleProperties: string[];
  config: ViewConfig;
}

export interface ViewConfig {
  // Table view
  frozenColumns?: number;
  wrapCells?: boolean;

  // Board/Gallery view (shared)
  groupProperty?: string;
  hideEmptyGroups?: boolean;
  cardSize?: "small" | "medium" | "large";
  cardCoverProperty?: string;
  cardPreviewProperties?: string[];
  cardCover?: "none" | "pageContent" | "pageCover" | string;

  // Calendar view
  dateProperty?: string;
  showWeekends?: boolean;

  // Timeline view
  startDateProperty?: string;
  endDateProperty?: string;
  showTable?: boolean;
}

export interface Filter {
  id: string;
  propertyId: string;
  operator: FilterOperator;
  value: unknown;
  conjunction?: "and" | "or";
}

export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "before"
  | "after"
  | "onOrBefore"
  | "onOrAfter"
  | "pastWeek"
  | "pastMonth"
  | "pastYear"
  | "nextWeek"
  | "nextMonth"
  | "nextYear";

export interface Sort {
  id: string;
  propertyId: string;
  direction: "ascending" | "descending";
}

export interface DatabaseRow {
  id: string;
  pageId: string;
  databaseId: string;
  properties: Record<string, PropertyValue>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastEditedBy: string;
}

export type PropertyValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | SelectOption
  | SelectOption[]
  | User
  | User[]
  | FileAttachment[]
  | null;

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Comment {
  id: string;
  content: string;
  pageId: string;
  blockId?: string;
  parentId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface SearchResult {
  type: "page" | "block" | "database";
  id: string;
  title: string;
  content?: string;
  path: string[];
  highlight?: string;
  score: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  page: Partial<Page>;
  isBuiltIn: boolean;
}

// Event types for real-time collaboration
export interface CollaborationEvent {
  type: "cursor" | "selection" | "edit" | "presence";
  userId: string;
  pageId: string;
  data: unknown;
  timestamp: number;
}

export interface UserPresence {
  userId: string;
  pageId: string;
  cursor?: { x: number; y: number };
  selection?: { blockId: string; start: number; end: number };
  lastSeen: number;
}

export interface NewsFeed {
  id: string;
  userId: string;
  name: string;
  type: "rss" | "reddit" | "topic";
  url: string;
  icon?: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  contentSnippet?: string;
  author?: string;
  thumbnail?: string;
  feedId: string;
  feedName: string;
  feedIcon?: string;
  read?: boolean;
  saved?: boolean;
}
