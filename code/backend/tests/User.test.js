const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User'); // Adjust path to your User model

describe('User Model Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    try {
      // Start in-memory MongoDB instance
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      // Disconnect if already connected
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('Database setup failed:', error);
      throw error;
    }
  }, 30000); // Increased timeout for setup

  afterAll(async () => {
    try {
      // Clean up
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error('Database cleanup failed:', error);
    }
  }, 30000); // Increased timeout for cleanup

  afterEach(async () => {
    try {
      // Clear all collections after each test
      if (mongoose.connection.readyState === 1) {
        await User.deleteMany({});
      }
    } catch (error) {
      console.error('Collection cleanup failed:', error);
    }
  }, 10000); // Increased timeout for cleanup

  describe('Schema Validation', () => {
    test('should create a valid doctor user', async () => {
      const doctorData = {
        name: 'Dr. John Smith',
        email: 'john.smith@hospital.com',
        password: 'securePassword123',
        role: 'doctor',
        telephone: '+1234567890',
        nic: 'NIC123456789'
      };

      const doctor = new User(doctorData);
      const savedDoctor = await doctor.save();

      expect(savedDoctor._id).toBeDefined();
      expect(savedDoctor.name).toBe(doctorData.name);
      expect(savedDoctor.email).toBe(doctorData.email);
      expect(savedDoctor.role).toBe('doctor');
      expect(savedDoctor.nic).toBe(doctorData.nic);
    });

    test('should create a valid patient user', async () => {
      const patientData = {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        password: 'patientPassword123',
        role: 'patient',
        telephone: '+1987654321',
        nic: 'PAT987654321'
      };

      const patient = new User(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient._id).toBeDefined();
      expect(savedPatient.name).toBe(patientData.name);
      expect(savedPatient.email).toBe(patientData.email);
      expect(savedPatient.role).toBe('patient');
      expect(savedPatient.nic).toBe(patientData.nic);
    });

    test('should create a valid hospital user', async () => {
      const hospitalData = {
        name: 'City General Hospital',
        email: 'admin@citygeneral.com',
        password: 'hospitalPassword123',
        role: 'hospital',
        telephone: '+1555123456',
        address: '123 Medical Center Drive, City, State 12345',
        registrationNumber: 'HOSP001234'
      };

      const hospital = new User(hospitalData);
      const savedHospital = await hospital.save();

      expect(savedHospital._id).toBeDefined();
      expect(savedHospital.name).toBe(hospitalData.name);
      expect(savedHospital.email).toBe(hospitalData.email);
      expect(savedHospital.role).toBe('hospital');
      expect(savedHospital.address).toBe(hospitalData.address);
      expect(savedHospital.registrationNumber).toBe(hospitalData.registrationNumber);
    });
  });

  describe('Required Field Validations', () => {
    test('should fail validation when name is missing', async () => {
      const userData = {
        email: 'test@email.com',
        password: 'password123',
        role: 'patient',
        telephone: '+1234567890',
        nic: 'NIC123456789'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
      
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.name).toBeDefined();
        expect(error.errors.name.message).toMatch(/required/i);
      }
    });

    test('should fail validation when email is missing', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123',
        role: 'patient',
        telephone: '+1234567890',
        nic: 'NIC123456789'
      };

      const user = new User(userData);
      
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.email).toBeDefined();
        expect(error.errors.email.message).toMatch(/required/i);
      }
    });

    test('should fail validation when password is missing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@email.com',
        role: 'patient',
        telephone: '+1234567890',
        nic: 'NIC123456789'
      };

      const user = new User(userData);
      
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.password).toBeDefined();
        expect(error.errors.password.message).toMatch(/required/i);
      }
    });

    test('should fail validation when role is missing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
        telephone: '+1234567890'
      };

      const user = new User(userData);
      
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.role).toBeDefined();
        expect(error.errors.role.message).toMatch(/required/i);
      }
    });

    test('should fail validation when telephone is missing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
        role: 'patient',
        nic: 'NIC123456789'
      };

      const user = new User(userData);
      
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.telephone).toBeDefined();
        expect(error.errors.telephone.message).toMatch(/required/i);
      }
    });
  });

  describe('Role-specific Field Validations', () => {
    test('should fail validation when doctor is missing NIC', async () => {
      const doctorData = {
        name: 'Dr. Test',
        email: 'doctor@test.com',
        password: 'password123',
        role: 'doctor',
        telephone: '+1234567890'
        // nic is missing
      };

      const doctor = new User(doctorData);
      
      try {
        await doctor.validate();
      } catch (error) {
        expect(error.errors.nic).toBeDefined();
        expect(error.errors.nic.message).toMatch(/required/i);
      }
    });

    test('should fail validation when patient is missing NIC', async () => {
      const patientData = {
        name: 'Patient Test',
        email: 'patient@test.com',
        password: 'password123',
        role: 'patient',
        telephone: '+1234567890'
        // nic is missing
      };

      const patient = new User(patientData);
      
      try {
        await patient.validate();
      } catch (error) {
        expect(error.errors.nic).toBeDefined();
        expect(error.errors.nic.message).toMatch(/required/i);
      }
    });

    test('should fail validation when hospital is missing address', async () => {
      const hospitalData = {
        name: 'Test Hospital',
        email: 'hospital@test.com',
        password: 'password123',
        role: 'hospital',
        telephone: '+1234567890',
        registrationNumber: 'HOSP001'
        // address is missing
      };

      const hospital = new User(hospitalData);
      
      try {
        await hospital.validate();
      } catch (error) {
        expect(error.errors.address).toBeDefined();
        expect(error.errors.address.message).toMatch(/required/i);
      }
    });

    test('should fail validation when hospital is missing registrationNumber', async () => {
      const hospitalData = {
        name: 'Test Hospital',
        email: 'hospital@test.com',
        password: 'password123',
        role: 'hospital',
        telephone: '+1234567890',
        address: '123 Test Street'
        // registrationNumber is missing
      };

      const hospital = new User(hospitalData);
      
      try {
        await hospital.validate();
      } catch (error) {
        expect(error.errors.registrationNumber).toBeDefined();
        expect(error.errors.registrationNumber.message).toMatch(/required/i);
      }
    });

    test('should allow hospital without NIC', async () => {
      const hospitalData = {
        name: 'Test Hospital',
        email: 'hospital2@test.com',
        password: 'password123',
        role: 'hospital',
        telephone: '+1234567890',
        address: '123 Test Street',
        registrationNumber: 'HOSP001'
        // nic is not required for hospitals
      };

      const hospital = new User(hospitalData);
      const savedHospital = await hospital.save();
      
      expect(savedHospital._id).toBeDefined();
      expect(savedHospital.nic).toBeUndefined();
    });

    test('should allow doctor and patient without address and registrationNumber', async () => {
      const doctorData = {
        name: 'Dr. Test',
        email: 'doctor2@test.com',
        password: 'password123',
        role: 'doctor',
        telephone: '+1234567890',
        nic: 'DOC123456789'
        // address and registrationNumber not required
      };

      const doctor = new User(doctorData);
      const savedDoctor = await doctor.save();
      
      expect(savedDoctor._id).toBeDefined();
      expect(savedDoctor.address).toBeUndefined();
      expect(savedDoctor.registrationNumber).toBeUndefined();
    });
  });

  describe('Role Enum Validation', () => {
    test('should fail validation with invalid role', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
        role: 'invalid_role', // Invalid role
        telephone: '+1234567890'
      };

      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow();
    });

    test('should accept valid roles', async () => {
      const roles = ['doctor', 'patient', 'hospital'];
      
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        const userData = {
          name: `Test ${role}`,
          email: `${role}${i}@test.com`, // Unique email for each iteration
          password: 'password123',
          role: role,
          telephone: '+1234567890'
        };

        // Add role-specific required fields
        if (role === 'doctor' || role === 'patient') {
          userData.nic = `${role.toUpperCase()}${i}123456789`;
        } else if (role === 'hospital') {
          userData.address = '123 Test Street';
          userData.registrationNumber = `HOSP00${i}`;
        }

        const user = new User(userData);
        await expect(user.validate()).resolves.not.toThrow();
      }
    });
  });

  describe('Email Uniqueness', () => {
    test('should fail when creating users with duplicate emails', async () => {
      const userData1 = {
        name: 'User One',
        email: 'duplicate@test.com',
        password: 'password123',
        role: 'patient',
        telephone: '+1234567890',
        nic: 'NIC123456789'
      };

      const userData2 = {
        name: 'User Two',
        email: 'duplicate@test.com', // Same email
        password: 'password456',
        role: 'doctor',
        telephone: '+1987654321',
        nic: 'NIC987654321'
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Model Methods', () => {
    test('should find user by email', async () => {
      const userData = {
        name: 'Test User',
        email: 'findme@test.com',
        password: 'password123',
        role: 'patient',
        telephone: '+1234567890',
        nic: 'NIC123456789'
      };

      await new User(userData).save();
      
      const foundUser = await User.findOne({ email: 'findme@test.com' });
      expect(foundUser).toBeTruthy();
      expect(foundUser.name).toBe('Test User');
    });

    test('should find users by role', async () => {
      const doctorData = {
        name: 'Dr. Test',
        email: 'doctor3@test.com',
        password: 'password123',
        role: 'doctor',
        telephone: '+1234567890',
        nic: 'DOC123456789'
      };

      const patientData = {
        name: 'Patient Test',
        email: 'patient3@test.com',
        password: 'password123',
        role: 'patient',
        telephone: '+1987654321',
        nic: 'PAT987654321'
      };

      await new User(doctorData).save();
      await new User(patientData).save();

      const doctors = await User.find({ role: 'doctor' });
      const patients = await User.find({ role: 'patient' });

      expect(doctors.length).toBeGreaterThan(0);
      expect(patients.length).toBeGreaterThan(0);
      
      const savedDoctor = doctors.find(d => d.email === 'doctor3@test.com');
      const savedPatient = patients.find(p => p.email === 'patient3@test.com');
      
      expect(savedDoctor).toBeDefined();
      expect(savedPatient).toBeDefined();
      expect(savedDoctor.name).toBe('Dr. Test');
      expect(savedPatient.name).toBe('Patient Test');
    });
  });
});