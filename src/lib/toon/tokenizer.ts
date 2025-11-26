import { Token, TokenType, ToonResult, TOON_KEYWORDS } from './types';

/**
 * TOON Tokenizer
 * Converts raw TOON string into a list of tokens
 */
export class ToonTokenizer {
  private input: string;
  private position: number;
  private line: number;
  private column: number;
  private tokens: Token[];

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  tokenize(): ToonResult<Token[]> {
    try {
      while (this.position < this.input.length) {
        const char = this.input[this.position];

        // Skip whitespace (except newlines)
        if (char === ' ' || char === '\t' || char === '\r') {
          this.advance();
          continue;
        }

        // Handle newlines
        if (char === '\n') {
          this.tokens.push(this.createToken(TokenType.NEWLINE, '\n'));
          this.advance();
          this.line++;
          this.column = 1;
          continue;
        }

        // Skip comments
        if (char === '#' || (char === '/' && this.peek() === '/')) {
          this.skipComment();
          continue;
        }

        // Handle special characters
        if (char === '{') {
          this.tokens.push(this.createToken(TokenType.LBRACE, char));
          this.advance();
          continue;
        }

        if (char === '}') {
          this.tokens.push(this.createToken(TokenType.RBRACE, char));
          this.advance();
          continue;
        }

        if (char === ':') {
          this.tokens.push(this.createToken(TokenType.COLON, char));
          this.advance();
          continue;
        }

        if (char === ',') {
          this.tokens.push(this.createToken(TokenType.COMMA, char));
          this.advance();
          continue;
        }

        if (char === '-') {
          this.tokens.push(this.createToken(TokenType.DASH, char));
          this.advance();
          continue;
        }

        // Handle strings
        if (char === '"' || char === "'") {
          const str = this.readString(char);
          if (!str.success) return str as ToonResult<Token[]>;
          continue;
        }

        // Handle numbers
        if (this.isDigit(char) || (char === '-' && this.isDigit(this.peek()))) {
          this.readNumber();
          continue;
        }

        // Handle identifiers and keywords
        if (this.isAlpha(char) || char === '_') {
          this.readIdentifier();
          continue;
        }

        return {
          success: false,
          error: {
            message: `Unexpected character: '${char}'`,
            line: this.line,
            column: this.column,
          },
        };
      }

      this.tokens.push(this.createToken(TokenType.EOF, ''));
      return { success: true, data: this.tokens };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown tokenization error',
          line: this.line,
          column: this.column,
        },
      };
    }
  }

  private advance(): void {
    this.position++;
    this.column++;
  }

  private peek(offset: number = 1): string {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : '';
  }

  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column - value.length,
    };
  }

  private skipComment(): void {
    while (this.position < this.input.length && this.input[this.position] !== '\n') {
      this.advance();
    }
  }

  private readString(quote: string): ToonResult<void> {
    const startLine = this.line;
    const startColumn = this.column;
    this.advance(); // Skip opening quote

    let value = '';
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === quote) {
        this.advance(); // Skip closing quote
        this.tokens.push({
          type: TokenType.STRING,
          value,
          line: startLine,
          column: startColumn,
        });
        return { success: true };
      }

      if (char === '\\' && this.peek() === quote) {
        this.advance(); // Skip backslash
        value += this.input[this.position];
        this.advance();
        continue;
      }

      if (char === '\n') {
        this.line++;
        this.column = 0;
      }

      value += char;
      this.advance();
    }

    return {
      success: false,
      error: {
        message: `Unterminated string starting at line ${startLine}`,
        line: startLine,
        column: startColumn,
      },
    };
  }

  private readNumber(): void {
    const startColumn = this.column;
    let value = '';

    if (this.input[this.position] === '-') {
      value += this.input[this.position];
      this.advance();
    }

    while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
      value += this.input[this.position];
      this.advance();
    }

    if (this.input[this.position] === '.') {
      value += this.input[this.position];
      this.advance();

      while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
        value += this.input[this.position];
        this.advance();
      }
    }

    this.tokens.push({
      type: TokenType.NUMBER,
      value,
      line: this.line,
      column: startColumn,
    });
  }

  private readIdentifier(): void {
    const startColumn = this.column;
    let value = '';

    while (
      this.position < this.input.length &&
      (this.isAlphaNumeric(this.input[this.position]) || this.input[this.position] === '_')
    ) {
      value += this.input[this.position];
      this.advance();
    }

    // Check if it's a boolean
    if (value === 'TRUE' || value === 'FALSE') {
      this.tokens.push({
        type: TokenType.BOOLEAN,
        value,
        line: this.line,
        column: startColumn,
      });
      return;
    }

    // Check if it's a keyword
    const type = TOON_KEYWORDS.includes(value as never) ? TokenType.KEYWORD : TokenType.IDENTIFIER;

    this.tokens.push({
      type,
      value,
      line: this.line,
      column: startColumn,
    });
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}

export function tokenize(input: string): ToonResult<Token[]> {
  const tokenizer = new ToonTokenizer(input);
  return tokenizer.tokenize();
}
