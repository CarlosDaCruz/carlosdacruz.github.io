import { BoardTetris, BoardNext } from "./boardTetris.js";
import { TetrominosBag } from "./tetromino.js";

export class Game {
  constructor(canvas, rows, cols, cellSize, space, canvasNext) {
    this.boardTetris = new BoardTetris(canvas, rows, cols, cellSize, space);
    this.tetrominosBag = new TetrominosBag(canvas, cellSize);
    this.currentTetromino = this.tetrominosBag.nextTetromino();
    this.keyboard();
    this.keys = { up: false, down: false };

    this.lastTime = 0;
    this.lastTime2 = 0;

    this.next = new BoardNext(
      canvasNext,
      8,
      4,
      cellSize,
      space,
      this.tetrominosBag.getThreeNextTetrominos()
    );

    this.score = 0;
    this.gameOver = false;
  }
  update() {
    let currentTime = Date.now();
    let deltaTime = currentTime - this.lastTime;
    let deltaTime2 = currentTime - this.lastTime2;

    if (deltaTime >= 1000) {
      this.autoMoveTetrominoDown();
      this.lastTime = currentTime;
    }
    if (deltaTime2 >= 50) {
      this.boardTetris.draw();
      this.drawTetrominoGhost();
      this.currentTetromino.draw(this.boardTetris);

      this.next.draw2();
      if (this.keys.down) {
        this.moveTetrominoDown();
      }

      this.lastTime2 = currentTime;
    }
  }
  autoMoveTetrominoDown() {
    this.currentTetromino.move(1, 0);
    if (this.blockedTetromino()) {
      this.currentTetromino.move(-1, 0);
      this.placeTetromino();
    }
  }
  blockedTetromino() {
    const tetrominoPositions = this.currentTetromino.currentPosition();
    for (let i = 0; i < tetrominoPositions.length; i++) {
      if (
        !this.boardTetris.isEmpty(
          tetrominoPositions[i].row,
          tetrominoPositions[i].column
        )
      ) {
        return true;
      }
    }
    return false;
  }
  moveTetrominoLeft() {
    this.currentTetromino.move(0, -1);
    if (this.blockedTetromino()) {
      this.currentTetromino.move(0, 1);
    }
  }
  moveTetrominoRight() {
    this.currentTetromino.move(0, 1);
    if (this.blockedTetromino()) {
      this.currentTetromino.move(0, -1);
    }
  }
  moveTetrominoDown() {
    this.currentTetromino.move(1, 0);
    if (this.blockedTetromino()) {
      this.currentTetromino.move(-1, 0);
    }
  }
  rotationTetrominoCW() {
    this.currentTetromino.rotation++;
    if (
      this.currentTetromino.rotation >
      this.currentTetromino.shapes.length - 1
    ) {
      this.currentTetromino.rotation = 0;
    }
    if (this.blockedTetromino()) {
      this.rotationTetrominoCCW();
    }
  }
  rotationTetrominoCCW() {
    this.currentTetromino.rotation--;
    if (this.currentTetromino.rotation < 0) {
      this.currentTetromino.rotation = this.currentTetromino.shapes.length - 1;
    }
    if (this.blockedTetromino()) {
      this.rotationTetrominoCW();
    }
  }
  placeTetromino() {
    const tetrominoPositions = this.currentTetromino.currentPosition();
    for (let i = 0; i < tetrominoPositions.length; i++) {
      this.boardTetris.matriz[tetrominoPositions[i].row][
        tetrominoPositions[i].column
      ] = this.currentTetromino.id;
    }

    this.score += this.boardTetris.clearFullRow() * 7;

    if (this.boardTetris.gameOver()) {
      setTimeout(() => {
        this.gameOver = true;
      }, 500);

      return true;
    } else {
      this.currentTetromino = this.tetrominosBag.nextTetromino();
      this.next.listTetrominos = this.tetrominosBag.getThreeNextTetrominos();
      this.next.updateMatriz();
    }
  }
  dropDistancie(position) {
    let distance = 0;
    while (
      this.boardTetris.isEmpty(position.row + distance + 1, position.column)
    ) {
      distance++;
    }
    return distance;
  }
  tetrominoDropDistance() {
    let drop = this.boardTetris.rows;
    const tetrominoPositions = this.currentTetromino.currentPosition();
    for (let i = 0; i < tetrominoPositions.length; i++) {
      drop = Math.min(drop, this.dropDistancie(tetrominoPositions[i]));
    }
    return drop;
  }

  drawTetrominoGhost() {
    const dropDistance = this.tetrominoDropDistance();
    const tetrominoPositions = this.currentTetromino.currentPosition();
    for (let i = 0; i < tetrominoPositions.length; i++) {
      let position = this.boardTetris.getCoordinates(
        tetrominoPositions[i].column,
        tetrominoPositions[i].row + dropDistance
      );
      // Bloque fantasma
      this.boardTetris.drawSquare(
        position.x,
        position.y,
        this.boardTetris.cellSize,
        "#000",
        "white",
        20
      );
    }
  }
  dropBlock() {
    this.currentTetromino.move(this.tetrominoDropDistance(), 0);
    this.placeTetromino();
  }
  reset(){
    this.gameOver = false;
    this.boardTetris.restartMatriz();
    this.score = 0;
    this.tetrominosBag.reset();
    this.currentTetromino = this.tetrominosBag.nextTetromino();
  }
  keyboard() {
    window.addEventListener("keydown", (evt) => {
      if (evt.key === "ArrowLeft") {
        this.moveTetrominoLeft();
      }
      if (evt.key === "ArrowRight") {
        this.moveTetrominoRight();
      }
      if (evt.key === "ArrowUp" && !this.keys.up) {
        this.rotationTetrominoCW();
        this.keys.up = true;
      }
      if (evt.key === "ArrowDown") {
        this.keys.down = true;
      }
    });
    window.addEventListener("keyup", (evt) => {
      if (evt.key === "ArrowUp") {
        this.keys.up = false;
      }
      if (evt.key === "ArrowDown") {
        this.keys.down = false;
      }
    });
    window.addEventListener("keydown", (evt) => {
      if(!this.gameOver){
        if (evt.code === "Space") {
          this.dropBlock();
        }
      }

      
    });
  }
}
