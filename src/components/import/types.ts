import { PropertyType } from "@/types";

export type ImportType = 'csv' | 'json' | 'md';

export interface ImportField {
    key: string;
    sample: any;
}

export interface ImportData {
    fileName: string;
    fileType: ImportType;
    fields: ImportField[];
    rows: any[]; // The structured data
    content?: string; // For markdown body
    originalFile: File;
}

export interface FieldMapping {
    sourceKey: string;
    targetName: string;
    targetType: PropertyType;
    enabled: boolean;
}

export interface ImportConfig {
    targetName: string; // New page/db name
    mappings: FieldMapping[];
}
