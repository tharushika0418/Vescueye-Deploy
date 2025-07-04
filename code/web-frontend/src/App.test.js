import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { AuthContext } from "./context/AuthContext"; // make sure this path is correct

// Helper to wrap App with AuthContext only (no MemoryRouter)
const renderWithAuth = (authValue) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <App />
    </AuthContext.Provider>
  );
};

describe("App Routing", () => {
  test("renders Home component for / route", () => {
    window.history.pushState({}, "Home page", "/");
    renderWithAuth({ user: { name: "Test User" } });
    expect(screen.getByText(/home/i)).toBeInTheDocument();
  });

  test("renders SignIn component for /signin route", () => {
    window.history.pushState({}, "Sign In page", "/signin");
    renderWithAuth(null);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  test("renders SignUp component for /signup route", () => {
    window.history.pushState({}, "Sign Up page", "/signup");
    renderWithAuth(null);
    expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
  });

  test("renders ForgotPassword component for /forgot-password route", () => {
    window.history.pushState({}, "Forgot Password page", "/forgot-password");
    renderWithAuth(null);
    expect(screen.getByRole("heading", { name: /forgot password/i })).toBeInTheDocument();
  });

  test("renders 404 page for unknown route", () => {
    window.history.pushState({}, "Not Found page", "/non-existent-page");
    renderWithAuth(null);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});
