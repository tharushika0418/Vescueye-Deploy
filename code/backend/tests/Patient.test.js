const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Patient = require('../models/Patient'); // Adjust path to your Patient model

describe('Patient Model Tests', () => {
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
  }, 30000);

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
  }, 30000);

  afterEach(async () => {
    try {
      // Clear all collections after each test
      if (mongoose.connection.readyState === 1) {
        await Patient.deleteMany({});
      }
    } catch (error) {
      console.error('Collection cleanup failed:', error);
    }
  }, 10000);

  describe('Schema Validation', () => {
    test('should create a valid patient with all required fields', async () => {
      const patientData = {
        name: 'John Doe',
        age: 35,
        contact: '+1234567890',
        address: '123 Main Street, City, State 12345',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient._id).toBeDefined();
      expect(savedPatient.name).toBe(patientData.name);
      expect(savedPatient.age).toBe(patientData.age);
      expect(savedPatient.contact).toBe(patientData.contact);
      expect(savedPatient.address).toBe(patientData.address);
      expect(savedPatient.gender).toBe(patientData.gender);
      expect(savedPatient.medicalHistory).toBe('No medical history provided');
      expect(savedPatient.assignedDoctor).toBeNull();
      expect(savedPatient.createdAt).toBeDefined();
      expect(savedPatient.updatedAt).toBeDefined();
    });

    test('should create a patient with custom medical history', async () => {
      const patientData = {
        name: 'Jane Smith',
        age: 28,
        contact: '+1987654321',
        address: '456 Oak Avenue, Town, State 67890',
        gender: 'Female',
        medicalHistory: 'Diabetes, Hypertension'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.medicalHistory).toBe('Diabetes, Hypertension');
    });

    test('should create a patient with assigned doctor', async () => {
      const doctorId = new mongoose.Types.ObjectId();
      const patientData = {
        name: 'Bob Johnson',
        age: 45,
        contact: '+1555123456',
        address: '789 Pine Street, Village, State 54321',
        gender: 'Male',
        assignedDoctor: doctorId
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.assignedDoctor).toEqual(doctorId);
    });

    test('should trim whitespace from name', async () => {
      const patientData = {
        name: '  John Doe  ',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.name).toBe('John Doe');
    });
  });

  describe('Required Field Validations', () => {
    test('should fail validation when name is missing', async () => {
      const patientData = {
        age: 25,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.name).toBeDefined();
        expect(error.errors.name.message).toMatch(/required/i);
      }
    });

    test('should fail validation when age is missing', async () => {
      const patientData = {
        name: 'John Doe',
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.age).toBeDefined();
        expect(error.errors.age.message).toMatch(/required/i);
      }
    });

    test('should fail validation when contact is missing', async () => {
      const patientData = {
        name: 'John Doe',
        age: 25,
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.contact).toBeDefined();
        expect(error.errors.contact.message).toMatch(/required/i);
      }
    });

    test('should fail validation when address is missing', async () => {
      const patientData = {
        name: 'John Doe',
        age: 25,
        contact: '+1234567890',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.address).toBeDefined();
        expect(error.errors.address.message).toMatch(/required/i);
      }
    });

    test('should fail validation when gender is missing', async () => {
      const patientData = {
        name: 'John Doe',
        age: 25,
        contact: '+1234567890',
        address: '123 Test Street'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.gender).toBeDefined();
        expect(error.errors.gender.message).toMatch(/required/i);
      }
    });
  });

  describe('Age Validation', () => {
    test('should fail validation when age is negative', async () => {
      const patientData = {
        name: 'John Doe',
        age: -5,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.age).toBeDefined();
        expect(error.errors.age.message).toMatch(/minimum/i);
      }
    });

    test('should accept age of 0', async () => {
      const patientData = {
        name: 'Baby Doe',
        age: 0,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.age).toBe(0);
    });

    test('should accept valid positive age', async () => {
      const patientData = {
        name: 'John Doe',
        age: 100,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.age).toBe(100);
    });

    test('should fail validation when age is not a number', async () => {
      const patientData = {
        name: 'John Doe',
        age: 'twenty-five',
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.age).toBeDefined();
      }
    });
  });

  describe('Default Values', () => {
    test('should set default medical history when not provided', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.medicalHistory).toBe('No medical history provided');
    });

    test('should set assignedDoctor to null when not provided', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.assignedDoctor).toBeNull();
    });
  });

  describe('ObjectId Reference Validation', () => {
    test('should accept valid ObjectId for assignedDoctor', async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male',
        assignedDoctor: validObjectId
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.assignedDoctor).toEqual(validObjectId);
    });

    test('should fail validation with invalid ObjectId for assignedDoctor', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male',
        assignedDoctor: 'invalid-object-id'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.assignedDoctor).toBeDefined();
      }
    });

    test('should accept null for assignedDoctor', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male',
        assignedDoctor: null
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.assignedDoctor).toBeNull();
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.createdAt).toBeDefined();
      expect(savedPatient.updatedAt).toBeDefined();
      expect(savedPatient.createdAt).toBeInstanceOf(Date);
      expect(savedPatient.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt when patient is modified', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();
      const originalUpdatedAt = savedPatient.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedPatient.age = 31;
      const updatedPatient = await savedPatient.save();

      expect(updatedPatient.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Model Methods', () => {
    test('should find patient by name', async () => {
      const patientData = {
        name: 'Unique Patient Name',
        age: 40,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Female'
      };

      await new Patient(patientData).save();
      
      const foundPatient = await Patient.findOne({ name: 'Unique Patient Name' });
      expect(foundPatient).toBeTruthy();
      expect(foundPatient.name).toBe('Unique Patient Name');
      expect(foundPatient.age).toBe(40);
    });

    test('should find patients by age range', async () => {
      const patients = [
        { name: 'Young Patient', age: 25, contact: '+1111111111', address: '111 Test St', gender: 'Male' },
        { name: 'Middle Patient', age: 45, contact: '+2222222222', address: '222 Test St', gender: 'Female' },
        { name: 'Senior Patient', age: 70, contact: '+3333333333', address: '333 Test St', gender: 'Male' }
      ];

      for (const patientData of patients) {
        await new Patient(patientData).save();
      }

      const middleAgedPatients = await Patient.find({ age: { $gte: 40, $lte: 60 } });
      expect(middleAgedPatients).toHaveLength(1);
      expect(middleAgedPatients[0].name).toBe('Middle Patient');
    });

    test('should find patients by gender', async () => {
      const patients = [
        { name: 'Male Patient 1', age: 30, contact: '+1111111111', address: '111 Test St', gender: 'Male' },
        { name: 'Female Patient 1', age: 35, contact: '+2222222222', address: '222 Test St', gender: 'Female' },
        { name: 'Male Patient 2', age: 40, contact: '+3333333333', address: '333 Test St', gender: 'Male' }
      ];

      for (const patientData of patients) {
        await new Patient(patientData).save();
      }

      const malePatients = await Patient.find({ gender: 'Male' });
      const femalePatients = await Patient.find({ gender: 'Female' });

      expect(malePatients).toHaveLength(2);
      expect(femalePatients).toHaveLength(1);
      
      const maleNames = malePatients.map(p => p.name).sort();
      expect(maleNames).toEqual(['Male Patient 1', 'Male Patient 2']);
    });

    test('should find patients with assigned doctors', async () => {
      const doctorId = new mongoose.Types.ObjectId();
      const patients = [
        { name: 'Assigned Patient', age: 30, contact: '+1111111111', address: '111 Test St', gender: 'Male', assignedDoctor: doctorId },
        { name: 'Unassigned Patient', age: 35, contact: '+2222222222', address: '222 Test St', gender: 'Female' }
      ];

      for (const patientData of patients) {
        await new Patient(patientData).save();
      }

      const assignedPatients = await Patient.find({ assignedDoctor: { $ne: null } });
      const unassignedPatients = await Patient.find({ assignedDoctor: null });

      expect(assignedPatients).toHaveLength(1);
      expect(unassignedPatients).toHaveLength(1);
      expect(assignedPatients[0].name).toBe('Assigned Patient');
      expect(unassignedPatients[0].name).toBe('Unassigned Patient');
    });

    test('should update patient information', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        contact: '+1234567890',
        address: '123 Old Street',
        gender: 'Male'
      };

      const patient = await new Patient(patientData).save();
      
      const updatedPatient = await Patient.findByIdAndUpdate(
        patient._id,
        { address: '456 New Avenue', medicalHistory: 'Updated medical history' },
        { new: true }
      );

      expect(updatedPatient.address).toBe('456 New Avenue');
      expect(updatedPatient.medicalHistory).toBe('Updated medical history');
      expect(updatedPatient.name).toBe('John Doe'); // Unchanged fields should remain
    });

    test('should delete patient', async () => {
      const patientData = {
        name: 'To Be Deleted',
        age: 25,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = await new Patient(patientData).save();
      const patientId = patient._id;

      await Patient.findByIdAndDelete(patientId);
      
      const deletedPatient = await Patient.findById(patientId);
      expect(deletedPatient).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string values appropriately', async () => {
      const patientData = {
        name: '',
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      
      try {
        await patient.validate();
        fail('Should have thrown validation error for empty name');
      } catch (error) {
        expect(error.errors.name).toBeDefined();
      }
    });

    test('should handle very long strings', async () => {
      const longString = 'A'.repeat(1000);
      const patientData = {
        name: longString,
        age: 30,
        contact: '+1234567890',
        address: '123 Test Street',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.name).toBe(longString);
    });

    test('should handle special characters in strings', async () => {
      const patientData = {
        name: 'José María Ñoño',
        age: 30,
        contact: '+1-234-567-890 ext. 123',
        address: '123 Main St., Apt. #4B',
        gender: 'Male'
      };

      const patient = new Patient(patientData);
      const savedPatient = await patient.save();

      expect(savedPatient.name).toBe('José María Ñoño');
      expect(savedPatient.contact).toBe('+1-234-567-890 ext. 123');
      expect(savedPatient.address).toBe('123 Main St., Apt. #4B');
    });
  });
});