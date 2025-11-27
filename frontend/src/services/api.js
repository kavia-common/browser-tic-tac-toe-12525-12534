const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3010";

/**
 * Utility for checking if a fetch response is ok and parsing JSON,
 * or throwing an error.
 */
async function safeFetchJson(url, options = {}) {
  const resp = await fetch(url, options);
  if (!resp.ok) throw new Error("Request failed: " + resp.status);
  return resp.json();
}

// PUBLIC_INTERFACE
export async function getState() {
  /**
   * Fetch current game state from backend API.
   * Returns: {squares: Array(9), xIsNext: bool, winner: string|null, isDraw: bool }
   * Throws on network error or if backend isn't available.
   */
  const data = await safeFetchJson(`${BACKEND_URL}/state`);
  // Flatten 3x3 board to 1D array for compatibility
  return {
    squares: data.board.flat(),
    xIsNext: data.nextPlayer === "X",
    winner: data.winner,
    isDraw: data.isDraw,
  };
}

// PUBLIC_INTERFACE
export async function postMove(index) {
  /**
   * Make a move at board index using backend API.
   * Returns new state. Throws if move invalid or backend unavailable.
   */
  const row = Math.floor(index / 3);
  const col = index % 3;
  const data = await safeFetchJson(`${BACKEND_URL}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row, col }),
  });
  return {
    squares: data.board.flat(),
    xIsNext: data.nextPlayer === "X",
    winner: data.winner,
    isDraw: data.isDraw,
  };
}

// PUBLIC_INTERFACE
export async function reset() {
  /**
   * Resets the game state via backend API.
   * Returns new state. Throws if backend unavailable.
   */
  const data = await safeFetchJson(`${BACKEND_URL}/reset`, {
    method: "POST",
  });
  return {
    squares: data.board.flat(),
    xIsNext: data.nextPlayer === "X",
    winner: data.winner,
    isDraw: data.isDraw,
  };
}
