// src/setupTests.js
// This file is run before executing each test file

import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks globally for all tests
fetchMock.enableMocks();
