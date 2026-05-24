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
            const source = head.Source == Source.ORIGINAL ? this.Original : this.New;
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

    insert(content: string, at: Position) { }
    delete(at: Position) { }
    deleteRange(start: Position, end: Position) { }
}