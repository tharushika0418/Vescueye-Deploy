import { render, screen, fireEvent } from "@testing-library/react";
import FlapDetailModal from "./FlapDetailModal";

describe("FlapDetailModal", () => {
  it("calls setSelectedFlap(null) when close button is clicked", () => {
    const setSelectedFlap = jest.fn();

    render(
      <FlapDetailModal
        selectedFlap={{ temperature: 36.5, timestamp: "2025-05-21T17:30:00Z", image: "https://example.com/image1.jpg" }}
        flaps={[{ temperature: 36.5, timestamp: "2025-05-21T17:30:00Z", image: "https://example.com/image1.jpg" }]} // ✅ Add this
        setSelectedFlap={setSelectedFlap}
      />
    );

    const closeButton = screen.getByTestId("close-button"); // ✅ based on your component
    fireEvent.click(closeButton);

    expect(setSelectedFlap).toHaveBeenCalledWith(null);
  });
});
