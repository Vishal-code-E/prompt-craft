import { tokenize } from './tokenizer';
import { parse } from './parser';
import { validate } from './validator';
import { compile } from './compiler';
import { ToonResult, ASTNode } from './types';

/**
 * Main TOON DSL Interface
 * Provides high-level API for TOON operations
 */

/**
 * Parse TOON string to JSON object
 */
export function toonToJSON(toonString: string): ToonResult<unknown> {
  // Step 1: Tokenize
  const tokenResult = tokenize(toonString);
  if (!tokenResult.success) {
    return tokenResult;
  }

  // Step 2: Parse
  const parseResult = parse(tokenResult.data!);
  if (!parseResult.success) {
    return parseResult;
  }

  // Step 3: Validate
  const validateResult = validate(parseResult.data!);
  if (!validateResult.success) {
    return validateResult;
  }

  // Step 4: Convert AST to JSON
  const json = astToJSON(parseResult.data!);
  return { success: true, data: json };
}

/**
 * Convert JSON object to TOON string
 */
export function jsonToTOON(json: unknown): string {
  return compile(json);
}

/**
 * Format TOON string (parse and recompile)
 */
export function formatTOON(toonString: string): ToonResult<string> {
  const jsonResult = toonToJSON(toonString);
  if (!jsonResult.success) {
    return jsonResult as ToonResult<string>;
  }

  const formatted = jsonToTOON(jsonResult.data);
  return { success: true, data: formatted };
}

/**
 * Convert AST to plain JSON object
 */
function astToJSON(node: ASTNode): unknown {
  if (node.type === 'value') {
    return node.value;
  }

  if (node.type === 'array' && node.items) {
    return node.items.map(item => astToJSON(item));
  }

  if (node.type === 'object' && node.children) {
    const obj: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(node.children)) {
      obj[key] = astToJSON(child);
    }
    return obj;
  }

  return null;
}

// Re-export types
export * from './types';
