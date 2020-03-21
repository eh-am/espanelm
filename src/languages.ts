export enum Languages {
  SPANISH = 'es',
  PORTUGUESE = 'ptbr'
}

export type SupportedLanguages =
  | { origin: Languages.PORTUGUESE; target: Languages.SPANISH }
  | { origin: Languages.SPANISH; target: Languages.PORTUGUESE };

export const ptbrToEs: SupportedLanguages = {
  origin: Languages.PORTUGUESE,
  target: Languages.SPANISH
} as const;
type k = keyof typeof ptbrToEs;
export type PtBrToEsValues = typeof ptbrToEs[k];

export const esToPtBr: SupportedLanguages = {
  origin: Languages.SPANISH,
  target: Languages.PORTUGUESE
} as const;
