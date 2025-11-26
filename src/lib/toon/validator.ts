import { ASTNode, ToonResult } from './types';

/**
 * TOON Validator
 * Validates AST structure and ensures semantic correctness
 */
export class ToonValidator {
  validate(ast: ASTNode): ToonResult<void> {
    try {
      this.validateNode(ast, []);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Validation error',
          line: 0,
          column: 0,
        },
      };
    }
  }

  private validateNode(node: ASTNode, path: string[]): void {
    if (node.type === 'object' && node.children) {
      for (const [key, child] of Object.entries(node.children)) {
        this.validateNode(child, [...path, key]);
      }
    } else if (node.type === 'array' && node.items) {
      for (let i = 0; i < node.items.length; i++) {
        this.validateNode(node.items[i], [...path, `[${i}]`]);
      }
    } else if (node.type === 'value') {
      // Validate value types
      if (node.value === undefined || node.value === null) {
        throw new Error(`Invalid value at ${path.join('.')}`);
      }
    }
  }
}

export function validate(ast: ASTNode): ToonResult<void> {
  const validator = new ToonValidator();
  return validator.validate(ast);
}
