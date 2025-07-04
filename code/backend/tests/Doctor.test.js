const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Doctor = require("../models/Doctor"); // Adjust path as needed

describe("Doctor Model", () => {
  let mongoServer;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up and close connections
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await Doctor.deleteMany({});
  });

  describe("Schema Validation", () => {
    test("should create a valid Doctor document", async () => {
      const validDoctor = new Doctor({
        name: "Dr. John Smith",
        email: "john.smith@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const savedDoctor = await validDoctor.save();
      
      expect(savedDoctor._id).toBeDefined();
      expect(savedDoctor.name).toBe("Dr. John Smith");
      expect(savedDoctor.email).toBe("john.smith@hospital.com");
      expect(savedDoctor.age).toBe(35);
      expect(savedDoctor.specialty).toBe("Cardiology");
      expect(savedDoctor.contact).toBe("+1-555-0123");
      expect(savedDoctor.assignedPatients).toEqual([]);
      expect(savedDoctor.createdAt).toBeInstanceOf(Date);
      expect(savedDoctor.updatedAt).toBeInstanceOf(Date);
    });

    test("should fail validation without required name", async () => {
      const invalidDoctor = new Doctor({
        email: "john.smith@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      await expect(invalidDoctor.save()).rejects.toThrow(/name.*required/);
    });

    test("should fail validation without required email", async () => {
      const invalidDoctor = new Doctor({
        name: "Dr. John Smith",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      await expect(invalidDoctor.save()).rejects.toThrow(/email.*required/);
    });

    test("should fail validation without required age", async () => {
      const invalidDoctor = new Doctor({
        name: "Dr. John Smith",
        email: "john.smith@hospital.com",
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      await expect(invalidDoctor.save()).rejects.toThrow(/age.*required/);
    });

    test("should fail validation without required specialty", async () => {
      const invalidDoctor = new Doctor({
        name: "Dr. John Smith",
        email: "john.smith@hospital.com",
        age: 35,
        contact: "+1-555-0123",
      });

      await expect(invalidDoctor.save()).rejects.toThrow(/specialty.*required/);
    });

    test("should fail validation without required contact", async () => {
      const invalidDoctor = new Doctor({
        name: "Dr. John Smith",
        email: "john.smith@hospital.com",
        age: 35,
        specialty: "Cardiology",
      });

      await expect(invalidDoctor.save()).rejects.toThrow(/contact.*required/);
    });

    test("should fail validation with negative age", async () => {
      const invalidDoctor = new Doctor({
        name: "Dr. John Smith",
        email: "john.smith@hospital.com",
        age: -5,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      await expect(invalidDoctor.save()).rejects.toThrow(/age.*minimum/);
    });

    test("should fail validation with non-numeric age", async () => {
      const invalidDoctor = new Doctor({
        name: "Dr. John Smith",
        email: "john.smith@hospital.com",
        age: "thirty-five",
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      await expect(invalidDoctor.save()).rejects.toThrow();
    });
  });

  describe("Unique Email Constraint", () => {
    test("should enforce unique email addresses", async () => {
      const doctor1 = new Doctor({
        name: "Dr. John Smith",
        email: "doctor@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const doctor2 = new Doctor({
        name: "Dr. Jane Doe",
        email: "doctor@hospital.com", // Same email
        age: 40,
        specialty: "Neurology",
        contact: "+1-555-0124",
      });

      await doctor1.save();
      await expect(doctor2.save()).rejects.toThrow(/duplicate key/);
    });

    test("should allow different email addresses", async () => {
      const doctor1 = new Doctor({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const doctor2 = new Doctor({
        name: "Dr. Jane Doe",
        email: "jane@hospital.com",
        age: 40,
        specialty: "Neurology",
        contact: "+1-555-0124",
      });

      const savedDoctor1 = await doctor1.save();
      const savedDoctor2 = await doctor2.save();

      expect(savedDoctor1.email).toBe("john@hospital.com");
      expect(savedDoctor2.email).toBe("jane@hospital.com");
    });
  });

  describe("Name Trimming", () => {
    test("should trim whitespace from name", async () => {
      const doctor = new Doctor({
        name: "  Dr. John Smith  ",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const savedDoctor = await doctor.save();
      expect(savedDoctor.name).toBe("Dr. John Smith");
    });

    test("should fail validation with name containing only whitespace", async () => {
      const doctor = new Doctor({
        name: "   ",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      await expect(doctor.save()).rejects.toThrow(/name.*required/);
    });
  });

  describe("Assigned Patients", () => {
    test("should create doctor with empty assignedPatients array by default", async () => {
      const doctor = new Doctor({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const savedDoctor = await doctor.save();
      expect(savedDoctor.assignedPatients).toEqual([]);
      expect(Array.isArray(savedDoctor.assignedPatients)).toBe(true);
    });

    test("should create doctor with assigned patients", async () => {
      const patientId1 = new mongoose.Types.ObjectId();
      const patientId2 = new mongoose.Types.ObjectId();

      const doctor = new Doctor({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
        assignedPatients: [patientId1, patientId2],
      });

      const savedDoctor = await doctor.save();
      expect(savedDoctor.assignedPatients).toHaveLength(2);
      expect(savedDoctor.assignedPatients[0].toString()).toBe(patientId1.toString());
      expect(savedDoctor.assignedPatients[1].toString()).toBe(patientId2.toString());
    });

    test("should fail validation with invalid patient ObjectId", async () => {
      const doctor = new Doctor({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
        assignedPatients: ["invalid-object-id"],
      });

      await expect(doctor.save()).rejects.toThrow();
    });

    test("should verify Patient reference setup", () => {
      const assignedPatientsPath = Doctor.schema.paths.assignedPatients;
      expect(assignedPatientsPath.instance).toBe("Array");
      expect(assignedPatientsPath.caster.instance).toBe("ObjectId");
      expect(assignedPatientsPath.caster.options.ref).toBe("Patient");
    });
  });

  describe("Timestamps", () => {
    test("should automatically set createdAt and updatedAt", async () => {
      const beforeSave = new Date();
      
      const doctor = new Doctor({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const savedDoctor = await doctor.save();
      const afterSave = new Date();

      expect(savedDoctor.createdAt).toBeInstanceOf(Date);
      expect(savedDoctor.updatedAt).toBeInstanceOf(Date);
      expect(savedDoctor.createdAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedDoctor.createdAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
      expect(savedDoctor.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedDoctor.updatedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    test("should update updatedAt on document modification", async () => {
      const doctor = await Doctor.create({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const originalUpdatedAt = doctor.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      doctor.age = 36;
      const updatedDoctor = await doctor.save();

      expect(updatedDoctor.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      expect(updatedDoctor.createdAt).toEqual(doctor.createdAt);
    });
  });

  describe("CRUD Operations", () => {
    test("should create multiple doctors", async () => {
      const doctors = [
        {
          name: "Dr. John Smith",
          email: "john@hospital.com",
          age: 35,
          specialty: "Cardiology",
          contact: "+1-555-0123",
        },
        {
          name: "Dr. Jane Doe",
          email: "jane@hospital.com",
          age: 40,
          specialty: "Neurology",
          contact: "+1-555-0124",
        },
      ];

      const savedDoctors = await Doctor.insertMany(doctors);
      expect(savedDoctors).toHaveLength(2);
      expect(savedDoctors[0].name).toBe("Dr. John Smith");
      expect(savedDoctors[1].name).toBe("Dr. Jane Doe");
    });

    test("should find doctor by email", async () => {
      await Doctor.create({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const foundDoctor = await Doctor.findOne({ email: "john@hospital.com" });
      expect(foundDoctor).toBeTruthy();
      expect(foundDoctor.name).toBe("Dr. John Smith");
    });

    test("should update doctor information", async () => {
      const doctor = await Doctor.create({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctor._id,
        { age: 36, specialty: "Interventional Cardiology" },
        { new: true }
      );

      expect(updatedDoctor.age).toBe(36);
      expect(updatedDoctor.specialty).toBe("Interventional Cardiology");
    });

    test("should delete doctor", async () => {
      const doctor = await Doctor.create({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      await Doctor.findByIdAndDelete(doctor._id);
      
      const deletedDoctor = await Doctor.findById(doctor._id);
      expect(deletedDoctor).toBeNull();
    });
  });

  describe("Query Operations", () => {
    beforeEach(async () => {
      await Doctor.insertMany([
        {
          name: "Dr. John Smith",
          email: "john@hospital.com",
          age: 35,
          specialty: "Cardiology",
          contact: "+1-555-0123",
        },
        {
          name: "Dr. Jane Doe",
          email: "jane@hospital.com",
          age: 40,
          specialty: "Neurology",
          contact: "+1-555-0124",
        },
        {
          name: "Dr. Bob Johnson",
          email: "bob@hospital.com",
          age: 45,
          specialty: "Cardiology",
          contact: "+1-555-0125",
        },
      ]);
    });

    test("should find doctors by specialty", async () => {
      const cardiologists = await Doctor.find({ specialty: "Cardiology" });
      expect(cardiologists).toHaveLength(2);
      cardiologists.forEach(doctor => {
        expect(doctor.specialty).toBe("Cardiology");
      });
    });

    test("should find doctors within age range", async () => {
      const doctorsInRange = await Doctor.find({
        age: { $gte: 35, $lte: 40 }
      });
      expect(doctorsInRange).toHaveLength(2);
    });

    test("should find doctors by name pattern", async () => {
      const doctorsWithDr = await Doctor.find({
        name: { $regex: /^Dr\./, $options: 'i' }
      });
      expect(doctorsWithDr).toHaveLength(3);
    });

    test("should sort doctors by age", async () => {
      const sortedDoctors = await Doctor.find().sort({ age: 1 });
      expect(sortedDoctors).toHaveLength(3);
      expect(sortedDoctors[0].age).toBe(35);
      expect(sortedDoctors[1].age).toBe(40);
      expect(sortedDoctors[2].age).toBe(45);
    });
  });

  describe("Patient Assignment Operations", () => {
    let doctorId, patientId1, patientId2;

    beforeEach(async () => {
      const doctor = await Doctor.create({
        name: "Dr. John Smith",
        email: "john@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });
      doctorId = doctor._id;
      patientId1 = new mongoose.Types.ObjectId();
      patientId2 = new mongoose.Types.ObjectId();
    });

    test("should add patient to doctor's assigned patients", async () => {
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { $push: { assignedPatients: patientId1 } },
        { new: true }
      );

      expect(updatedDoctor.assignedPatients).toHaveLength(1);
      expect(updatedDoctor.assignedPatients[0].toString()).toBe(patientId1.toString());
    });

    test("should add multiple patients to doctor", async () => {
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { $push: { assignedPatients: { $each: [patientId1, patientId2] } } },
        { new: true }
      );

      expect(updatedDoctor.assignedPatients).toHaveLength(2);
      expect(updatedDoctor.assignedPatients.map(id => id.toString())).toContain(patientId1.toString());
      expect(updatedDoctor.assignedPatients.map(id => id.toString())).toContain(patientId2.toString());
    });

    test("should remove patient from doctor's assigned patients", async () => {
      await Doctor.findByIdAndUpdate(
        doctorId,
        { $push: { assignedPatients: { $each: [patientId1, patientId2] } } }
      );

      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { $pull: { assignedPatients: patientId1 } },
        { new: true }
      );

      expect(updatedDoctor.assignedPatients).toHaveLength(1);
      expect(updatedDoctor.assignedPatients[0].toString()).toBe(patientId2.toString());
    });
  });

  describe("Edge Cases", () => {
    test("should handle very long names", async () => {
      const longName = "Dr. " + "A".repeat(500);
      
      const doctor = await Doctor.create({
        name: longName,
        email: "long@hospital.com",
        age: 35,
        specialty: "Cardiology",
        contact: "+1-555-0123",
      });

      expect(doctor.name).toBe(longName);
    });

    test("should handle minimum age (0)", async () => {
      const doctor = await Doctor.create({
        name: "Dr. Young",
        email: "young@hospital.com",
        age: 0,
        specialty: "Pediatrics",
        contact: "+1-555-0123",
      });

      expect(doctor.age).toBe(0);
    });

    test("should handle very high age", async () => {
      const doctor = await Doctor.create({
        name: "Dr. Senior",
        email: "senior@hospital.com",
        age: 100,
        specialty: "Geriatrics",
        contact: "+1-555-0123",
      });

      expect(doctor.age).toBe(100);
    });

    test("should handle special characters in contact", async () => {
      const specialContact = "+1-(555) 123-4567 ext. 890";
      
      const doctor = await Doctor.create({
        name: "Dr. Special",
        email: "special@hospital.com",
        age: 35,
        specialty: "Emergency Medicine",
        contact: specialContact,
      });

      expect(doctor.contact).toBe(specialContact);
    });

    test("should handle empty assignedPatients array operations", async () => {
      const doctor = await Doctor.create({
        name: "Dr. Empty",
        email: "empty@hospital.com",
        age: 35,
        specialty: "Internal Medicine",
        contact: "+1-555-0123",
      });

      // Try to remove from empty array
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctor._id,
        { $pull: { assignedPatients: new mongoose.Types.ObjectId() } },
        { new: true }
      );

      expect(updatedDoctor.assignedPatients).toHaveLength(0);
    });
  });
});