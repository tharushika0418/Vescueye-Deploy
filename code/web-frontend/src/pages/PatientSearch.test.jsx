// PatientSearch.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientSearch from './PatientSearch';

// ✅ MOCK FETCH
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            name: 'John Doe',
            contact: '1234567890',
          },
        ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

test('displays patient results after successful search', async () => {
  render(<PatientSearch />);

  const input = screen.getByLabelText(/Search by Name or Contact/i);
  fireEvent.change(input, { target: { value: 'John' } });

  const button = screen.getByRole('button', { name: /Search/i });
  fireEvent.click(button);

  // ✅ Wait for results
  await waitFor(() => {
    expect(screen.getByText(/Results:/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });
});
