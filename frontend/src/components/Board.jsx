import React from "react";
import Square from "./Square";
import styles from "../styles/theme.module.css";

// PUBLIC_INTERFACE
function Board({ squares, onSquareClick, winningLine, disabled }) {
  /** 
   * Renders a 3x3 Tic Tac Toe game board.
   * @param squares array (length 9, values X/O/null)
   * @param onSquareClick function (index) => void
   * @param winningLine array of winning indices, or null
   * @param disabled disables click if true (game over)
   */
  return (
    <div
      className={styles.board}
      role="grid"
      aria-label="Tic Tac Toe board"
      style={{ gap: "12px" }}
    >
      {squares.map((value, idx) => (
        <Square
          key={idx}
          index={idx}
          value={value}
          onClick={() => onSquareClick(idx)}
          highlight={winningLine?.includes(idx)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
export default Board;
