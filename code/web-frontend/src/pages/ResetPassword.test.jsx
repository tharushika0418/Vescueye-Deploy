// src/pages/ResetPassword.test.jsx

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ResetPassword from "./ResetPassword";

describe("ResetPassword Component", () => {
  test("renders reset password form", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password/test-token"]}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    // Check the heading
    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
    // Check the password input label
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    // Check the submit button
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  test("allows typing into password input", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password/test-token"]}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/new password/i);
    fireEvent.change(input, { target: { value: "newpassword123" } });
    expect(input.value).toBe("newpassword123");
  });

  // Optional: add a test that mocks fetch for the form submission
});
