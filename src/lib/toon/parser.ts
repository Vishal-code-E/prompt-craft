import { Token, TokenType, ASTNode, ToonResult } from './types';

/**
 * TOON Parser
 * Converts tokens into an Abstract Syntax Tree (AST)
 */
export class ToonParser {
  private tokens: Token[];
  private position: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter(t => t.type !== TokenType.NEWLINE); // Skip newlines for parsing
    this.position = 0;
  }

  parse(): ToonResult<ASTNode> {
    try {
      const ast = this.parseObject();
      return { success: true, data: ast };
    } catch (error) {
      const token = this.currentToken();
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          line: token?.line || 0,
          column: token?.column || 0,
        },
      };
    }
  }

  private currentToken(): Token | null {
    return this.position < this.tokens.length ? this.tokens[this.position] : null;
  }

  private advance(): Token | null {
    const token = this.currentToken();
    this.position++;
    return token;
  }

  private expect(type: TokenType): Token {
    const token = this.currentToken();
    if (!token || token.type !== type) {
      throw new Error(
        `Expected ${type} but got ${token?.type || 'EOF'} at line ${token?.line || 0}`
      );
    }
    this.advance();
    return token;
  }

  private parseObject(): ASTNode {
    const children: Record<string, ASTNode> = {};

    // Check if it starts with a root keyword like STORY
    const token = this.currentToken();
    if (token?.type === TokenType.KEYWORD) {
      const rootKey = token.value;
      this.advance();
      this.expect(TokenType.LBRACE);

      while (this.currentToken()?.type !== TokenType.RBRACE && this.currentToken()?.type !== TokenType.EOF) {
        const key = this.parseKey();
        this.expect(TokenType.COLON);
        const value = this.parseValue();
        children[key] = value;

        // Optional comma
        if (this.currentToken()?.type === TokenType.COMMA) {
          this.advance();
        }
      }

      this.expect(TokenType.RBRACE);

      // Wrap in root key
      return {
        type: 'object',
        children: {
          [rootKey]: {
            type: 'object',
            children,
          },
        },
      };
    }

    // Parse regular object
    if (token?.type === TokenType.LBRACE) {
      this.advance();

      while (this.currentToken()?.type !== TokenType.RBRACE && this.currentToken()?.type !== TokenType.EOF) {
        const key = this.parseKey();
        this.expect(TokenType.COLON);
        const value = this.parseValue();
        children[key] = value;

        if (this.currentToken()?.type === TokenType.COMMA) {
          this.advance();
        }
      }

      this.expect(TokenType.RBRACE);
      return { type: 'object', children };
    }

    throw new Error(`Expected object or keyword at line ${token?.line || 0}`);
  }

  private parseKey(): string {
    const token = this.currentToken();
    if (!token || (token.type !== TokenType.KEYWORD && token.type !== TokenType.IDENTIFIER)) {
      throw new Error(`Expected key at line ${token?.line || 0}`);
    }
    this.advance();
    return token.value;
  }

  private parseValue(): ASTNode {
    const token = this.currentToken();
    if (!token) {
      throw new Error('Unexpected end of input');
    }

    // String value
    if (token.type === TokenType.STRING) {
      this.advance();
      return { type: 'value', value: token.value };
    }

    // Number value
    if (token.type === TokenType.NUMBER) {
      this.advance();
      return { type: 'value', value: parseFloat(token.value) };
    }

    // Boolean value
    if (token.type === TokenType.BOOLEAN) {
      this.advance();
      return { type: 'value', value: token.value === 'TRUE' };
    }

    // Keyword as value (like SCI_FI, HIGH, etc.)
    if (token.type === TokenType.KEYWORD || token.type === TokenType.IDENTIFIER) {
      this.advance();
      return { type: 'value', value: token.value };
    }

    // Array value
    if (token.type === TokenType.DASH) {
      return this.parseArray();
    }

    // Object value
    if (token.type === TokenType.LBRACE) {
      return this.parseObject();
    }

    throw new Error(`Unexpected token ${token.type} at line ${token.line}`);
  }

  private parseArray(): ASTNode {
    const items: ASTNode[] = [];

    while (this.currentToken()?.type === TokenType.DASH) {
      this.advance(); // Skip dash
      const value = this.parseValue();
      items.push(value);

      if (this.currentToken()?.type === TokenType.COMMA) {
        this.advance();
      }
    }

    return { type: 'array', items };
  }
}

export function parse(tokens: Token[]): ToonResult<ASTNode> {
  const parser = new ToonParser(tokens);
  return parser.parse();
}
