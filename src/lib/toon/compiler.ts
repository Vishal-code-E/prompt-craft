import { ASTNode } from './types';

/**
 * TOON Compiler
 * Converts JSON/AST to formatted TOON DSL string
 */
export class ToonCompiler {
  private indentLevel: number = 0;
  private indentSize: number = 2;

  compile(data: unknown): string {
    this.indentLevel = 0;
    return this.compileValue(data);
  }

  private indent(): string {
    return ' '.repeat(this.indentLevel * this.indentSize);
  }

  private compileValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '""';
    }

    if (typeof value === 'string') {
      // Check if it's a keyword-style value (uppercase with underscores)
      if (/^[A-Z_]+$/.test(value)) {
        return value;
      }
      return `"${value.replace(/"/g, '\\"')}"`;
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }

    if (Array.isArray(value)) {
      return this.compileArray(value);
    }

    if (typeof value === 'object') {
      return this.compileObject(value as Record<string, unknown>);
    }

    return '""';
  }

  private compileArray(arr: unknown[]): string {
    if (arr.length === 0) return '';

    const lines: string[] = [];
    for (const item of arr) {
      lines.push(`${this.indent()}- ${this.compileValue(item)}`);
    }
    return lines.join('\n');
  }

  private compileObject(obj: Record<string, unknown>): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    // Check if this is the root STORY object
    if (entries.length === 1 && entries[0][0].toUpperCase() === entries[0][0]) {
      const [key, value] = entries[0];
      if (typeof value === 'object' && !Array.isArray(value)) {
        let result = `${key.toUpperCase()} {\n`;
        this.indentLevel++;
        result += this.compileObjectContent(value as Record<string, unknown>);
        this.indentLevel--;
        result += '}';
        return result;
      }
    }

    let result = '{\n';
    this.indentLevel++;
    result += this.compileObjectContent(obj);
    this.indentLevel--;
    result += `${this.indent()}}`;
    return result;
  }

  private compileObjectContent(obj: Record<string, unknown>): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const toonKey = key.toUpperCase().replace(/([a-z])([A-Z])/g, '$1_$2');

      if (Array.isArray(value)) {
        if (value.length > 0) {
          lines.push(`${this.indent()}${toonKey}:`);
          this.indentLevel++;
          lines.push(this.compileArray(value));
          this.indentLevel--;
        }
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`${this.indent()}${toonKey}: ${this.compileValue(value)}`);
      } else {
        lines.push(`${this.indent()}${toonKey}: ${this.compileValue(value)}`);
      }
    }

    return lines.join('\n') + '\n';
  }

  compileFromAST(ast: ASTNode): string {
    return this.compileASTNode(ast);
  }

  private compileASTNode(node: ASTNode): string {
    if (node.type === 'value') {
      return this.compileValue(node.value);
    }

    if (node.type === 'array' && node.items) {
      return this.compileArray(node.items.map(item => this.astToValue(item)));
    }

    if (node.type === 'object' && node.children) {
      const obj: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(node.children)) {
        obj[key] = this.astToValue(child);
      }
      return this.compileObject(obj);
    }

    return '';
  }

  private astToValue(node: ASTNode): unknown {
    if (node.type === 'value') {
      return node.value;
    }

    if (node.type === 'array' && node.items) {
      return node.items.map(item => this.astToValue(item));
    }

    if (node.type === 'object' && node.children) {
      const obj: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(node.children)) {
        obj[key] = this.astToValue(child);
      }
      return obj;
    }

    return null;
  }
}

export function compile(data: unknown): string {
  const compiler = new ToonCompiler();
  return compiler.compile(data);
}

export function compileFromAST(ast: ASTNode): string {
  const compiler = new ToonCompiler();
  return compiler.compileFromAST(ast);
}
