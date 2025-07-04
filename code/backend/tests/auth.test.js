const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const authRoutes = require('../routes/auth'); // Adjust path as needed

// Mock dependencies
jest.mock('../models/User');
jest.mock('nodemailer');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.EMAIL_USER = 'test@gmail.com';
process.env.EMAIL_PASS = 'testpass';
process.env.OUTLOOK_EMAIL = 'test@outlook.com';

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================== FORGOT PASSWORD TESTS ==========================
  describe('POST /auth/forgot-password', () => {
    it('should send reset email for valid user', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockTransporter = {
        sendMail: jest.fn().mockImplementation((options, callback) => {
          callback(null, { messageId: 'test-message-id' });
        })
      };

      User.findOne.mockResolvedValue(mockUser);
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email sent successfully!');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should return 404 for non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle email sending error', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockTransporter = {
        sendMail: jest.fn().mockImplementation((options, callback) => {
          callback(new Error('Email service error'), null);
        })
      };

      User.findOne.mockResolvedValue(mockUser);
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email sending failed');
    });
  });

  // ========================== RESET PASSWORD TESTS ==========================
  describe('POST /auth/reset-password/:token', () => {
    it('should reset password with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        resetToken: 'valid-token',
        resetTokenExpires: Date.now() + 3600000,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');

      const response = await request(app)
        .post('/auth/reset-password/valid-token')
        .send({ newPassword: 'NewPassword123!' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset successful');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.resetToken).toBeUndefined();
      expect(mockUser.resetTokenExpires).toBeUndefined();
    });

    it('should return 400 for invalid token', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/reset-password/invalid-token')
        .send({ newPassword: 'NewPassword123!' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should handle server error during password reset', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/reset-password/valid-token')
        .send({ newPassword: 'NewPassword123!' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Server error');
    });
  });

  // ========================== SIGNUP TESTS ==========================
  describe('POST /auth/signup', () => {
    const validPatientData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      role: 'patient',
      telephone: '1234567890',
      nic: '123456789V',
      dateOfBirth: '1990-01-01'
    };

    const validDoctorData = {
      firstName: 'Dr',
      lastName: 'Smith',
      email: 'dr.smith@example.com',
      password: 'Password123!',
      role: 'doctor',
      telephone: '0987654321',
      nic: '987654321V',
      title: 'Dr.',
      speciality: 'Cardiology'
    };

    const validHospitalData = {
      name: 'City Hospital',
      email: 'contact@cityhospital.com',
      password: 'Password123!',
      role: 'hospital',
      telephone: '1122334455',
      address: '123 Hospital St',
      registrationNumber: 'REG123456'
    };

    it('should register a new patient successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'patient',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.mockImplementation(() => mockUser);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/signup')
        .send(validPatientData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user.email).toBe('john.doe@example.com');
    });

    it('should register a new doctor successfully', async () => {
      const mockUser = {
        _id: 'doctor123',
        name: 'Dr Smith',
        email: 'dr.smith@example.com',
        role: 'doctor',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/signup')
        .send(validDoctorData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should register a new hospital successfully', async () => {
      const mockUser = {
        _id: 'hospital123',
        name: 'City Hospital',
        email: 'contact@cityhospital.com',
        role: 'hospital',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/signup')
        .send(validHospitalData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'john.doe@example.com' });

      const response = await request(app)
        .post('/auth/signup')
        .send(validPatientData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 400 for invalid email', async () => {
      const invalidData = { ...validPatientData, email: 'invalid-email' };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Enter a valid email'
          })
        ])
      );
    });

    it('should return 400 for weak password', async () => {
      const invalidData = { ...validPatientData, password: 'weak' };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid telephone format', async () => {
      const invalidData = { ...validPatientData, telephone: '123' };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Telephone must be 10 digits'
          })
        ])
      );
    });

    it('should return 400 for invalid role', async () => {
      const invalidData = { ...validPatientData, role: 'invalid-role' };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Invalid role'
          })
        ])
      );
    });

    it('should return 400 if NIC is missing for doctor/patient', async () => {
      const invalidData = { ...validPatientData };
      delete invalidData.nic;

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('NIC is required for this role');
    });

    it('should handle server error during signup', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/signup')
        .send(validPatientData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Server Error');
    });
  });

  // ========================== SIGNIN TESTS ==========================
  describe('POST /auth/signin', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should sign in user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'patient'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/signin')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid email', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/signin')
        .send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/signin')
        .send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidCredentials = {
        email: 'invalid-email',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/auth/signin')
        .send(invalidCredentials);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Enter a valid email'
          })
        ])
      );
    });

    it('should return 400 for missing password', async () => {
      const invalidCredentials = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/auth/signin')
        .send(invalidCredentials);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password is required'
          })
        ])
      );
    });

    it('should handle server error during signin', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/signin')
        .send(validCredentials);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Server Error');
    });

    it('should handle case-insensitive email', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'patient'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });
});

// ========================== INTEGRATION TESTS ==========================
describe('Authentication Integration Tests', () => {
  it('should complete full password reset flow', async () => {
    // Mock user for forgot password
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      save: jest.fn().mockResolvedValue(true)
    };

    const mockTransporter = {
      sendMail: jest.fn().mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-message-id' });
      })
    };

    User.findOne.mockResolvedValue(mockUser);
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    // Step 1: Request password reset
    const forgotResponse = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(forgotResponse.status).toBe(200);

    // Step 2: Reset password with token
    const resetUser = {
      ...mockUser,
      resetToken: 'valid-token',
      resetTokenExpires: Date.now() + 3600000
    };

    User.findOne.mockResolvedValue(resetUser);
    bcrypt.genSalt.mockResolvedValue('salt123');
    bcrypt.hash.mockResolvedValue('hashedNewPassword');

    const resetResponse = await request(app)
      .post('/auth/reset-password/valid-token')
      .send({ newPassword: 'NewPassword123!' });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.message).toBe('Password reset successful');
  });

  it('should complete full signup and signin flow', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      role: 'patient',
      telephone: '1234567890',
      nic: '123456789V',
      dateOfBirth: '1990-01-01'
    };

    // Step 1: Signup
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'patient',
      save: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockResolvedValue(null); // User doesn't exist
    User.mockImplementation(() => mockUser);
    bcrypt.genSalt.mockResolvedValue('salt123');
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    jwt.sign.mockReturnValue('signup-token');

    const signupResponse = await request(app)
      .post('/auth/signup')
      .send(userData);

    expect(signupResponse.status).toBe(201);

    // Step 2: Signin
    User.findOne.mockResolvedValue({
      ...mockUser,
      password: 'hashedPassword123'
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('signin-token');

    const signinResponse = await request(app)
      .post('/auth/signin')
      .send({
        email: 'john.doe@example.com',
        password: 'Password123!'
      });

    expect(signinResponse.status).toBe(200);
    expect(signinResponse.body.token).toBe('signin-token');
  });
});