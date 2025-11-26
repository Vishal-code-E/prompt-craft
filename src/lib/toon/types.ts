// TOON DSL Type Definitions

export enum TokenType {
  KEYWORD = 'KEYWORD',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  COLON = 'COLON',
  COMMA = 'COMMA',
  DASH = 'DASH',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface ToonError {
  message: string;
  line: number;
  column: number;
}

export interface ToonResult<T> {
  success: boolean;
  data?: T;
  error?: ToonError;
}

export interface ASTNode {
  type: 'object' | 'array' | 'value';
  value?: string | number | boolean;
  children?: Record<string, ASTNode>;
  items?: ASTNode[];
}

// Valid TOON keywords
export const TOON_KEYWORDS = [
  'STORY',
  'GENRE',
  'LENGTH',
  'STRICTNESS',
  'RULES',
  'PLOT',
  'CHARACTERS',
  'SETTING',
  'TONE',
  'STYLE',
  'TEMPERATURE',
  'MAX_TOKENS',
  'TOP_P',
  'FREQUENCY_PENALTY',
  'PRESENCE_PENALTY',
  'MODERATION',
  'FILTER_PROFANITY',
  'FILTER_VIOLENCE',
  'FILTER_ADULT',
  'TRUE',
  'FALSE',
  'HIGH',
  'MEDIUM',
  'LOW',
  'SCI_FI',
  'FANTASY',
  'MYSTERY',
  'ROMANCE',
  'HORROR',
  'THRILLER',
  'ADVENTURE',
  'DRAMA',
  'COMEDY',
] as const;

export type ToonKeyword = typeof TOON_KEYWORDS[number];
