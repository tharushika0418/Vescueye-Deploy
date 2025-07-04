// src/pages/ForgotPassword.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "./ForgotPassword";

// Mock the global fetch API
global.fetch = jest.fn();

describe("ForgotPassword", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders Forgot Password form", () => {
    render(<ForgotPassword />);
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Reset Link/i })).toBeInTheDocument();
  });

  test("allows user to input email", () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByLabelText(/Enter your email/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });

  test("shows success message when API responds with success", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    render(<ForgotPassword />);

    fireEvent.change(screen.getByLabelText(/Enter your email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() =>
      expect(screen.getByText(/Password reset link sent! Check your email./i)).toBeInTheDocument()
    );
  });

  test("shows error message when API responds with error", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, message: "User not found" }),
    });

    render(<ForgotPassword />);

    fireEvent.change(screen.getByLabelText(/Enter your email/i), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() =>
      expect(screen.getByText(/User not found/i)).toBeInTheDocument()
    );
  });

  test("shows generic error message when fetch throws error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ForgotPassword />);

    fireEvent.change(screen.getByLabelText(/Enter your email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() =>
      expect(screen.getByText(/Unable to send reset link. Please try again./i)).toBeInTheDocument()
    );
  });
});
