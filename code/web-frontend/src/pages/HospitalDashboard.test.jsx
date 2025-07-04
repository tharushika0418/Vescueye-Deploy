import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // import router for test
import HospitalDashboard from "./HospitalDashboard";
import { AuthContext } from "../context/AuthContext"; // adjust path accordingly

test("HospitalDashboard › renders doctor management buttons with correct links", () => {
  const mockUser = { name: "Test User", role: "admin" };

  render(
    <AuthContext.Provider value={{ user: mockUser }}>
      <MemoryRouter>
        <HospitalDashboard />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  // Your test assertions go here
  // For example:
  expect(screen.getByText(/doctor management/i)).toBeInTheDocument();
});
