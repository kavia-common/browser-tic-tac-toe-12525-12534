import React, { useState } from "react";
import Board from "./components/Board";
import styles from "./styles/theme.module.css";

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /**
   * Determines if there's a winner. If so, returns {winner, line}, else null.
   */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6] // diagonals
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line };
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function getGameStatus(squares, xIsNext) {
  /**
   * Returns status string ("Next player: X", "Winner: O", "Draw"), winner, and winning line indices.
   */
  const winObj = calculateWinner(squares);
  if (winObj)
    return { status: `Winner: ${winObj.winner}`, winner: winObj.winner, line: winObj.line };
  if (squares.every(Boolean))
    return { status: "Draw", winner: null, line: null };
  return { status: `Next player: ${xIsNext ? "X" : "O"}`, winner: null, line: null };
}

function App() {
  // Use state for game
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Reset game
  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  // Handle cell click
  const handleSquareClick = (idx) => {
    // If game over or cell already filled, ignore
    const {winner, line} = calculateWinner(squares) || {};
    if (winner || squares[idx]) return;
    // Make move
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  // Determine status
  const {status, winner, line} = getGameStatus(squares, xIsNext);

  // Player indicator chip colors
  let statusClass = styles.statusChip;
  if (winner && winner === "X") statusClass = styles.statusChip;
  else if (winner && winner === "O") statusClass = styles.statusChip;
  else if (status === "Draw") statusClass = styles.statusChipDraw;

  return (
    <div className={styles.appBg}>
      <main className={styles.mainContainer} aria-label="Tic Tac Toe game">
        <header className={styles.header}>
          <h1 className={styles.title}>Tic Tac Toe</h1>
          <div className={styles.underlineAccent} aria-hidden="true"/>
        </header>
        <div className={styles.playerStatus}>
          <span
            className={`
              ${styles.statusChip}
              ${winner ? "" : xIsNext ? "" : ""}
              ${status === "Draw" ? styles.statusChipDraw : ""}
              ${winner ? styles.statusChipError : ""}
            `}
            aria-live="polite"
            role="status"
            id="game-status"
          >
            {status}
          </span>
        </div>
        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          winningLine={line}
          disabled={Boolean(winner) || status === "Draw"}
        />
        <button
          className={styles.resetBtn}
          onClick={handleReset}
          aria-label="Reset game"
        >
          Reset
        </button>
      </main>
    </div>
  );
}

export default App;
