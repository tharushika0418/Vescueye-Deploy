import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Home from './Home';

// Helper function to render Home component with context
const renderWithContext = (user) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user }}>
        <Home />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  test('renders welcome message', () => {
    renderWithContext(null);
    
    expect(screen.getByText('Welcome to Vescueye (Under Development)')).toBeInTheDocument();
    expect(screen.getByText('Revolutionizing free flap surgery monitoring')).toBeInTheDocument();
  });

  test('renders login and signup links when user is not logged in', () => {
    renderWithContext(null);
    
    expect(screen.getByText(/Please/)).toBeInTheDocument();
    
    const signInLink = screen.getByText('Sign In');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.getAttribute('href')).toBe('/signin');
    
    const signUpLink = screen.getByText('Sign Up');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.getAttribute('href')).toBe('/signup');
  });

  test('renders personalized greeting with name when user is logged in', () => {
    const user = { name: 'Dr. Smith', email: 'smith@example.com', role: 'doctor' };
    renderWithContext(user);
    
    expect(screen.getByText(`Hello, ${user.name}!`)).toBeInTheDocument();
    expect(screen.queryByText(/Please Sign In/)).not.toBeInTheDocument();
  });

  test('renders personalized greeting with email when user has no name', () => {
    const user = { email: 'smith@example.com', role: 'doctor' };
    renderWithContext(user);
    
    expect(screen.getByText(`Hello, ${user.email}!`)).toBeInTheDocument();
  });

  test('renders dashboard link with correct role when user is logged in', () => {
    const user = { name: 'Dr. Smith', email: 'smith@example.com', role: 'doctor' };
    renderWithContext(user);
    
    const dashboardLink = screen.getByText('Go to Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.getAttribute('href')).toBe('/doctor-dashboard');
  });

  test('renders dashboard link with nurse role', () => {
    const user = { name: 'Nurse Johnson', email: 'johnson@example.com', role: 'nurse' };
    renderWithContext(user);
    
    const dashboardLink = screen.getByText('Go to Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.getAttribute('href')).toBe('/nurse-dashboard');
  });

  test('renders dashboard link with admin role', () => {
    const user = { name: 'Admin User', email: 'admin@example.com', role: 'admin' };
    renderWithContext(user);
    
    const dashboardLink = screen.getByText('Go to Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.getAttribute('href')).toBe('/admin-dashboard');
  });
});