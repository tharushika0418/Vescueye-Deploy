import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PatientRegister from "./PatientRegister";

// Mock fetch
global.fetch = jest.fn();

describe("PatientRegister", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem("token", "test-token");
  });

  it("renders form inputs", () => {
    render(
      <MemoryRouter>
        <PatientRegister />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/medical history/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // Gender select
  });

  it("shows validation error for invalid contact number", () => {
    render(
      <MemoryRouter>
        <PatientRegister />
      </MemoryRouter>
    );

    const contactInput = screen.getByLabelText(/contact/i);
    fireEvent.change(contactInput, { target: { value: "12345" } });

    expect(screen.getByText(/contact must be 10 digits/i)).toBeInTheDocument();
  });

  it("handles API failure", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    render(
      <MemoryRouter>
        <PatientRegister />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: 40 },
    });

    fireEvent.mouseDown(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    fireEvent.click(within(listbox).getAllByText(/male/i)[0]);

    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "Test St" },
    });
    fireEvent.change(screen.getByLabelText(/contact/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/medical history/i), {
      target: { value: "None" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register patient/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/users/patient/register",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
  });

  it("submits form successfully", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <MemoryRouter>
        <PatientRegister />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: 40 },
    });

    fireEvent.mouseDown(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    fireEvent.click(within(listbox).getAllByText(/male/i)[0]);

    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "Test St" },
    });
    fireEvent.change(screen.getByLabelText(/contact/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/medical history/i), {
      target: { value: "None" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register patient/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
