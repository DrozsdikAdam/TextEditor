import { PieceTable } from "./entities/pieceTable";

const pieceTable: PieceTable = new PieceTable("Hello World\n How are you?");

var canvas = document.getElementById("canvas") as HTMLCanvasElement;
var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

pieceTable.insert({ content: "I am fine", at: { line: 0, column: 0 } })

ctx.font = "16px Arial";
ctx.fillText(pieceTable.read().join("\n"), 0, 20);