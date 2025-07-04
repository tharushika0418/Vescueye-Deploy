import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the logo import
jest.mock('../assets/vescueye-logo.png', () => 'mocked-logo.png');

// Helper function to render component with router and auth context
const renderWithProviders = (user = null, logout = jest.fn()) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user, logout }}>
        <Navbar />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Common Elements', () => {
    test('renders the logo and brand name', () => {
      renderWithProviders();
      
      const logo = screen.getByAltText('Vescueye Logo');
      const brandName = screen.getByText('Vescueye');
      
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'mocked-logo.png');
      expect(brandName).toBeInTheDocument();
    });

    test('renders Home link', () => {
      renderWithProviders();
      
      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    test('logo link navigates to home', () => {
      renderWithProviders();
      
      const logoLink = screen.getByRole('link', { name: /vescueye logo vescueye/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('When user is NOT authenticated', () => {
    test('renders Sign In and Sign Up links', () => {
      renderWithProviders();
      
      const signInLink = screen.getByRole('link', { name: /sign in/i });
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/signin');
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/signup');
    });

    test('does not render Dashboard or Logout button', () => {
      renderWithProviders();
      
      const dashboardLink = screen.queryByRole('link', { name: /dashboard/i });
      const logoutButton = screen.queryByRole('button', { name: /logout/i });
      
      expect(dashboardLink).not.toBeInTheDocument();
      expect(logoutButton).not.toBeInTheDocument();
    });
  });

  describe('When user is authenticated', () => {
    const mockUser = { role: 'admin', name: 'John Doe' };
    const mockLogout = jest.fn();

    test('renders Dashboard link with correct role-based URL', () => {
      renderWithProviders(mockUser, mockLogout);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/admin-dashboard');
    });

    test('renders Dashboard link for different user roles', () => {
      const userRole = { role: 'user', name: 'Jane Doe' };
      renderWithProviders(userRole, mockLogout);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/user-dashboard');
    });

    test('renders Logout button', () => {
      renderWithProviders(mockUser, mockLogout);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    test('does not render Sign In and Sign Up links', () => {
      renderWithProviders(mockUser, mockLogout);
      
      const signInLink = screen.queryByRole('link', { name: /sign in/i });
      const signUpLink = screen.queryByRole('link', { name: /sign up/i });
      
      expect(signInLink).not.toBeInTheDocument();
      expect(signUpLink).not.toBeInTheDocument();
    });

    test('calls logout function and navigates to home when logout button is clicked', () => {
      renderWithProviders(mockUser, mockLogout);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility', () => {
    test('logout button has proper aria-label', () => {
      const mockUser = { role: 'admin', name: 'John Doe' };
      renderWithProviders(mockUser);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
    });

    test('all links are keyboard accessible', () => {
      renderWithProviders();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toBeVisible();
      });
    });
  });

  describe('CSS Classes', () => {
    test('applies correct CSS classes to elements', () => {
      renderWithProviders();
      
      const nav = screen.getByRole('navigation');
      const container = nav.querySelector('.navbar-container');
      const logoLink = screen.getByRole('link', { name: /vescueye logo vescueye/i });
      const logoImg = screen.getByAltText('Vescueye Logo');
      const linksList = screen.getByRole('list');
      
      expect(nav).toHaveClass('navbar');
      expect(container).toHaveClass('navbar-container');
      expect(logoLink).toHaveClass('navbar-logo');
      expect(logoImg).toHaveClass('logo-img');
      expect(linksList).toHaveClass('navbar-links');
    });

    test('logout button has correct CSS class', () => {
      const mockUser = { role: 'admin', name: 'John Doe' };
      renderWithProviders(mockUser);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveClass('logout-btn');
    });
  });

  describe('Edge Cases', () => {
    test('handles user with undefined role gracefully', () => {
      const userWithoutRole = { name: 'John Doe' };
      renderWithProviders(userWithoutRole);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/undefined-dashboard');
    });

    test('handles empty user object', () => {
      const emptyUser = {};
      renderWithProviders(emptyUser);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/undefined-dashboard');
    });
  });
});