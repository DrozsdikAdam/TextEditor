import { Source } from "../enums/source";

export class Piece {
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