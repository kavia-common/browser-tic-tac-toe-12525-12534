import React, { useState, useEffect, useCallback } from "react";
import Board from "./components/Board";
import styles from "./styles/theme.module.css";
import * as api from "./services/api";

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
  // Use state for game and network
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [offline, setOffline] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  // If backend loaded at least once successfully, stay in online mode
  const [backendActive, setBackendActive] = useState(false);

  // Try to fetch initial state from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const state = await api.getState();
        if (!mounted) return;
        setSquares(state.squares);
        setXIsNext(state.xIsNext);
        setWinner(state.winner);
        setIsDraw(state.isDraw);
        setOffline(false);
        setBackendActive(true);
      } catch (err) {
        // Backend not reachable; use local state
        setOffline(true);
        setBackendActive(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Wrapper to update state after backend call (or fallback to local if offline)
  const updateStateFromBackend = useCallback(async (action, ...args) => {
    if (!backendActive && offline) {
      // fallback mode
      return false;
    }
    try {
      let nextState;
      if (action === "move") {
        nextState = await api.postMove(args[0]);
      } else if (action === "reset") {
        nextState = await api.reset();
      }
      if (nextState) {
        setSquares(nextState.squares);
        setXIsNext(nextState.xIsNext);
        setWinner(nextState.winner);
        setIsDraw(nextState.isDraw);
        setOffline(false);
        setBackendActive(true);
        return true;
      }
    } catch (e) {
      setOffline(true);
      setBackendActive(false);
    }
    return false;
  }, [backendActive, offline]);

  // Reset game
  const handleReset = async () => {
    // Try backend; fallback to local
    const usedBackend = await updateStateFromBackend("reset");
    if (!usedBackend) {
      setSquares(Array(9).fill(null));
      setXIsNext(true);
      setWinner(null);
      setIsDraw(false);
    }
  };

  // Handle cell click
  const handleSquareClick = async (idx) => {
    // If game over or cell already filled, ignore
    const gameStatus = calculateWinner(squares);
    const winnerVal = gameStatus ? gameStatus.winner : winner;
    if (winnerVal || squares[idx]) return;
    // Try backend; fallback to local
    const usedBackend = await updateStateFromBackend("move", idx);
    if (!usedBackend) {
      const nextSquares = squares.slice();
      nextSquares[idx] = xIsNext ? "X" : "O";
      setSquares(nextSquares);
      setXIsNext(!xIsNext);
      // Check winner/draw after move
      const winData = calculateWinner(nextSquares);
      if (winData) setWinner(winData.winner);
      else setWinner(null);
      setIsDraw(nextSquares.every(Boolean) && !winData);
    }
  };

  // Determine status
  const {status, line} = getGameStatus(squares, xIsNext);

  // Player indicator chip colors
  let statusClass = styles.statusChip;
  if (winner && winner === "X") statusClass = styles.statusChip;
  else if (winner && winner === "O") statusClass = styles.statusChip;
  else if (status === "Draw" || isDraw) statusClass = styles.statusChipDraw;

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
              ${(status === "Draw" || isDraw) ? styles.statusChipDraw : ""}
              {winner ? styles.statusChipError : ""}
            `}
            aria-live="polite"
            role="status"
            id="game-status"
          >
            {status}
          </span>
          {offline && (
            <span
              style={{
                color: "#efb622",
                background: "rgba(245, 158, 11, 0.09)",
                fontSize: "0.93rem",
                padding: "2px 12px",
                borderRadius: "12px",
                marginLeft: 8,
                fontWeight: 500,
                letterSpacing: "0.02em",
                border: "1px solid #ffeaa3",
                boxShadow: "0 1px 5px rgba(245,158,11,.10)",
                alignSelf: "center",
                transition: "opacity 0.4s",
              }}
              aria-live="polite"
              role="status"
              id="offline-notice"
            >
              Offline mode
            </span>
          )}
        </div>
        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          winningLine={line}
          disabled={Boolean(winner) || status === "Draw" || isDraw}
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
