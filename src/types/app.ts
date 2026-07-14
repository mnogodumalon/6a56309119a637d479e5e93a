// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface HalloWeltEintrag {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    nummer?: number;
    titel?: string;
    beschreibung?: string;
  };
}

export const APP_IDS = {
  HALLO_WELT_EINTRAG: '6a5630785191ed8631f8582b',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'hallo_welt_eintrag': {
    'nummer': 'number',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateHalloWeltEintrag = StripLookup<HalloWeltEintrag['fields']>;