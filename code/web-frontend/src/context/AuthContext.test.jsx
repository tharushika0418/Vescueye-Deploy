import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, AuthContext } from "./AuthContext";

// Helper component to consume context for testing
const TestComponent = () => {
  const { user, hospitalEmail, login, logout, signup } = React.useContext(AuthContext);

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : "null"}</div>
      <div data-testid="hospitalEmail">{hospitalEmail ?? "null"}</div>
      <button onClick={() => login("test-token", { name: "John", email: "john@example.com", role: "hospital" })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button
        onClick={async () => {
          await signup({ name: "New", email: "new@example.com", password: "pass" });
        }}
      >
        Signup
      </button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("AuthContext", () => {
  test("initial state is null", () => {
    renderWithProvider();
    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("hospitalEmail")).toHaveTextContent("null");
  });

  test("login sets user and hospital email in localStorage and state", async () => {
    renderWithProvider();
    const loginButton = screen.getByText("Login");

    await act(async () => loginButton.click());

    const storedUser = JSON.parse(localStorage.getItem("user"));
    expect(storedUser.name).toBe("John");
    expect(localStorage.getItem("token")).toBe("test-token");
    expect(localStorage.getItem("hospitalEmail")).toBe("john@example.com");
    expect(screen.getByTestId("hospitalEmail")).toHaveTextContent("john@example.com");
    expect(screen.getByTestId("user")).toHaveTextContent("John");
  });

  test("logout clears all data", async () => {
    renderWithProvider();
    const loginButton = screen.getByText("Login");
    const logoutButton = screen.getByText("Logout");

    await act(async () => loginButton.click());
    await act(async () => logoutButton.click());

    expect(localStorage.getItem("token")).toBe(null);
    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("hospitalEmail")).toHaveTextContent("null");
  });

  test("loads data from localStorage on mount", async () => {
    localStorage.setItem("token", "token123");
    localStorage.setItem("user", JSON.stringify({ name: "Test", email: "test@example.com" }));
    localStorage.setItem("hospitalEmail", "hospital@example.com");
    localStorage.setItem("lastLogin", "Yesterday");

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Test");
      expect(screen.getByTestId("hospitalEmail")).toHaveTextContent("hospital@example.com");
    });
  });

  test("signup handles network error", async () => {
    global.fetch = jest.fn(() => Promise.reject("Network error"));

    renderWithProvider();

    const signupButton = screen.getByText("Signup");

    await act(async () => signupButton.click());

    // We expect it to fail gracefully, no login should occur
    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  test("handles malformed JSON in localStorage gracefully", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("token", "abc");
    localStorage.setItem("user", "{malformed: true"); // Invalid JSON

    expect(() => renderWithProvider()).not.toThrow();
    expect(screen.getByTestId("user")).toHaveTextContent("null");

    console.error.mockRestore();
  });
});
