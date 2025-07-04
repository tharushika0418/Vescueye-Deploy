import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { AuthContext } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Dashboard Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to /signin if no user", () => {
    render(
      <AuthContext.Provider value={{ user: null, logout: jest.fn() }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // useEffect should trigger navigate('/signin')
    expect(mockNavigate).toHaveBeenCalledWith("/signin");

    // Nothing should be rendered
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
  });

  test("displays user info and logout button", () => {
    const fakeUser = { name: "Alice", email: "alice@example.com", role: "admin" };
    const mockLogout = jest.fn();

    render(
      <AuthContext.Provider value={{ user: fakeUser, logout: mockLogout }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
    expect(screen.getByText(/your role: admin/i)).toBeInTheDocument();

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  test("displays email if name is not present", () => {
    const fakeUser = { email: "bob@example.com", role: "user" };
    render(
      <AuthContext.Provider value={{ user: fakeUser, logout: jest.fn() }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/welcome, bob@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/your role: user/i)).toBeInTheDocument();
  });
});
