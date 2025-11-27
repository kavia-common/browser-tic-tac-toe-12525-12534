import React from "react";
import styles from "../styles/theme.module.css";

// PUBLIC_INTERFACE
function Square({ value, onClick, highlight, index, disabled }) {
  /** 
   * Square cell for the Tic Tac Toe board.
   * @param value 'X' | 'O' | null
   * @param onClick function (when cell is clicked)
   * @param highlight boolean (whether to visually highlight the square)
   * @param index number (cell index for accessibility)
   * @param disabled boolean (whether the square can be clicked)
   */
  return (
    <button
      className={`${styles.square} ${highlight ? styles.squareHighlight : ""}`}
      onClick={onClick}
      aria-label={value ? `Cell ${index+1} taken by ${value}` : `Cell ${index+1} empty`}
      disabled={disabled || value}
      tabIndex={0}
      type="button"
    >
      {value}
    </button>
  );
}

export default Square;
