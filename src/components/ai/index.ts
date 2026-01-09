// AI Components - Centralized Exports
// Import all AI components from this single file

export { default as AIToolbar } from './AIToolbar';
export { default as GeneratePageModal } from './GeneratePageModal';
export { default as GenerateTableModal } from './GenerateTableModal';
export { default as SmartSuggestions } from './SmartSuggestions';

// Import the CSS
import './ai-components.css';

// Re-export types from actions
export type {
    PropertySuggestion,
    SmartSuggestion,
    WritingAction,
    GeneratedTable,
    GeneratedPage,
} from '@/actions/ai';
