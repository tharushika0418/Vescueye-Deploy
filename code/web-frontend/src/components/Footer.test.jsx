import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";

describe("Footer component", () => {
  it("renders the footer text", () => {
    render(<Footer />);
    
    const footerText = screen.getByText(/© 2025 Vescueye. All rights reserved./i);
    expect(footerText).toBeInTheDocument();
  });

  it("has the correct class name for styling", () => {
    render(<Footer />);
    
    const footerElement = screen.getByRole("contentinfo");
    expect(footerElement).toHaveClass("footer");
  });
});
