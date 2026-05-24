type Position = {
    line: number;
    column: number;
}

const Source = {
    ORIGINAL: "original",
    ADD: "add",
} as const;

type Source = typeof Source[keyof typeof Source];

class Piece {
    Length: number;
    Offset: number;
    Source: Source;
    Next: Piece | null;

    constructor(Length: number, Offset: number, Source: Source, Next: Piece | null) {
        this.Length = Length;
        this.Offset = Offset;
        this.Source = Source;
        this.Next = Next;
    }
}

export class Storage {
    Original: string = "";
    New: string = "";

    pieceHead: Piece | null = new Piece(0, 0, Source.ORIGINAL, null);

    constructor(Content: string = "") {
        this.Original = Content;
        this.pieceHead = new Piece(Content.length, 0, Source.ORIGINAL, null);
    }

    read() {
        let head: Piece | null = this.pieceHead;
        let line: string = "";
        const lines: string[] = [];

        while (head !== null) {
            const source = head.Source === Source.ORIGINAL ? this.Original : this.New;
            const text = source.slice(head.Offset, head.Offset + head.Length);

            for (let char of text) {
                if (char == "\n") {
                    lines.push(line + "\n");
                    line = "";
                    continue;
                }
                line += char;
            }

            head = head.Next;
        }

        if (line !== "") lines.push(line);
        return lines;
    }

    insert(content: string, at: Position) {
        const { piece, previous, offset } = this.findPieceByPosition(at);

        if (!piece) {
            if (this.pieceHead === null) {
                this.pieceHead = new Piece(content.length, 0, Source.ADD, null);
                this.New += content;
                return;
            }
            return;
        }

        const currentPiece = new Piece(
            content.length,
            this.New.length,
            Source.ADD,
            null
        );

        this.New += content;

        if (offset === 0) {
            currentPiece.Next = piece;
            if (previous) {
                previous.Next = currentPiece;
            } else {
                this.pieceHead = currentPiece;
            }
        } else if (offset === piece.Length) {
            currentPiece.Next = piece.Next;
            piece.Next = currentPiece;
        } else {
            const nextPiece = new Piece(
                piece.Length - offset,
                piece.Offset + offset,
                piece.Source,
                piece.Next
            );
            currentPiece.Next = nextPiece;
            piece.Length = offset;
            piece.Next = currentPiece;
        }
    }

    delete(at: Position) {
        const { offset, piece, previous } = this.findPieceByPosition(at);
        if (piece === null) return;

        if (offset === 0 && previous) {
            this.removeLastCharacterOfPiece(previous);
            return;
        } else if (offset === 0) {
            return;
        }

        if (offset === 1) {
            if (piece.Length === 1) {
                this.removePiece(piece);
            } else {
                piece.Length--;
                piece.Offset++;
            }
            return;
        }

        if (offset === piece.Length) {
            piece.Length--;
            return;
        }

        const newPiece = new Piece(
            piece.Length - offset,
            piece.Offset + offset,
            piece.Source,
            piece.Next
        );

        piece.Length = offset - 1;
        piece.Next = newPiece;
    }

    deleteRange(start: Position, end: Position) {
        const { piece: startPiece, offset: startOffset } = this.findPieceByPosition(start);
        const { piece: endPiece, offset: endOffset } = this.findPieceByPosition(end);

        if (!startPiece || !endPiece) return;

        if (startPiece === endPiece) {
            if (startOffset === 0) {
                startPiece.Offset += endOffset;
                startPiece.Length -= endOffset;
            } else {
                const newPiece = new Piece(
                    startPiece.Length - endOffset,
                    startPiece.Offset + endOffset,
                    startPiece.Source,
                    startPiece.Next
                );
                startPiece.Length = startOffset;
                startPiece.Next = newPiece;
                if (newPiece.Length === 0) {
                    this.removePiece(newPiece);
                }
            }
            if (startPiece.Length === 0) {
                this.removePiece(startPiece);
            }
            return;
        }

        startPiece.Length = startOffset;
        endPiece.Offset += endOffset;
        endPiece.Length -= endOffset;

        let piece = startPiece.Next;
        while (piece !== endPiece && piece !== null) {
            startPiece.Next = piece.Next;
            piece = piece.Next;
        }

        if (startPiece.Length === 0) this.removePiece(startPiece);
        if (endPiece.Length === 0) this.removePiece(endPiece);
    }

    private removeLastCharacterOfPiece(piece: Piece) {
        piece.Length--;

        if (piece.Length === 0) {
            this.removePiece(piece);
        }
    }

    private removePiece(piece: Piece) {
        let head = this.pieceHead;
        let previous = null;

        while (head != null) {
            if (head === piece) {
                if (previous) {
                    previous.Next = piece.Next;
                } else {
                    this.pieceHead = piece.Next;
                }
                return;
            }
            previous = head;
            head = head.Next;
        }
    }

    private findPieceByPosition(at: Position): { offset: number, piece: Piece | null, previous: Piece | null } {
        const { line, column } = at;
        let head: Piece | null = this.pieceHead;
        let currentLine = 0;
        let currentChar = 0;
        let previous: Piece | null = null;

        while (head !== null) {
            const source = head.Source === Source.ORIGINAL ? this.Original : this.New;
            const text = source.slice(head.Offset, head.Offset + head.Length);

            for (let i = 0; i < text.length; i++) {
                const letter = text[i];

                if (currentLine === line && currentChar === column) {
                    return { offset: i, piece: head, previous: previous }
                }

                if (letter === "\n") {
                    currentLine++;
                    currentChar = 0;
                } else {
                    currentChar++;
                }
            }

            if (head.Next === null) {
                return { offset: head.Length, piece: head, previous }
            }

            previous = head;
            head = head.Next;
        }

        return { offset: 0, piece: null, previous: null }
    }
}