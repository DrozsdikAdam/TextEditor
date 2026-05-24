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

    constructor(Lenght: number, Offset: number, Source: Source, Next: Piece | null) {
        this.Length = Lenght;
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
                this.New += content;
                this.pieceHead = new Piece(content.length, 0, Source.ADD, null);
                return;
            }
            return;
        }

        const nextPiece = new Piece(
            piece.Offset + offset,
            piece.Length - offset,
            piece.Source,
            piece.Next
        );

        const currentPiece = new Piece(
            this.New.length,
            content.length,
            Source.ADD,
            nextPiece
        );

        this.New += content;
        piece.Length = offset;

        if (previous && piece.Length === 0) previous.Next = currentPiece;
        else if (piece.Length === 0) this.pieceHead = currentPiece;
        else piece.Next = currentPiece;
    }

    delete(at: Position) {

        const { offset, piece, previous } = this.findPieceByPosition(at);
        if (piece === null) return;

        if (offset === 0 && previous) {
            this.removeLastCharacterOfPiece(previous);
            return;
        }
        else if (offset == 0) {
            return;
        }

        if (piece.Length === 1 && offset === 1) {
            this.removePiece(piece);
            return;
        }

        if (offset === 1 && piece.Length > 0) {
            piece.Length--;
            piece.Offset++;
            return;
        }

        if (offset === piece.Length - 1) {
            piece.Length--;
            return;
        }

        const newPiece = new Piece(
            piece.Length - offset,
            piece.Offset + offset,
            piece.Source,
            piece.Next
        );

        piece.Next = newPiece;
        piece.Length = offset - 1;

    }

    deleteRange(start: Position, end: Position) {

        const { previous: StartPrevious, piece: StartPiece, offset: StartOffset } = this.findPieceByPosition(start);
        const { previous: EndPrevious, piece: EndPiece, offset: EndOffset } = this.findPieceByPosition(end);

        if (!StartPiece || !EndPiece) return;

        if (StartPiece === EndPiece) {

            if (StartOffset === 0) {
                EndPiece.Offset += EndOffset;
                EndPiece.Length -= EndOffset;
                return;
            }

        }

        StartPiece.Length = StartOffset;
        EndPiece.Offset += EndOffset;
        EndPiece.Length -= EndOffset;

        let piece = StartPiece.Next;

        while (piece !== EndPiece && piece != null) {
            StartPiece.Next = piece.Next;
            piece = piece.Next;
        }

        if (StartPiece.Length === 0) this.removePiece(StartPiece);
        if (EndPiece.Length === 0) this.removePiece(EndPiece);

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
                    return { offset: head.Offset + i, piece: head, previous: previous }
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