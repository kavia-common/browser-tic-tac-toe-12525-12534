import { render, screen } from '@testing-library/react';
import App from './App';

test("renders Tic Tac Toe game header", () => {
  render(<App />);
  const header = screen.getByText(/Tic Tac Toe/i);
  expect(header).toBeInTheDocument();
});

test("renders Reset button", () => {
  render(<App />);
  const button = screen.getByRole("button", { name: /reset/i });
  expect(button).toBeInTheDocument();
});
