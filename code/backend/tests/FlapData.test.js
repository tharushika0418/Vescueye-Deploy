const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const FlapData = require("../models/FlapData"); // Adjust path as needed

describe("FlapData Model", () => {
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
    await FlapData.deleteMany({});
  });

  describe("Schema Validation", () => {
    test("should create a valid FlapData document", async () => {
      const validFlapData = new FlapData({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: 36.5,
      });

      const savedData = await validFlapData.save();
      
      expect(savedData._id).toBeDefined();
      expect(savedData.patient_id).toBeDefined();
      expect(savedData.image_url).toBe("https://s3.amazonaws.com/bucket/image.jpg");
      expect(savedData.temperature).toBe(36.5);
      expect(savedData.timestamp).toBeInstanceOf(Date);
    });

    test("should fail validation without required patient_id", async () => {
      const invalidFlapData = new FlapData({
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: 36.5,
      });

      await expect(invalidFlapData.save()).rejects.toThrow(/patient_id.*required/);
    });

    test("should fail validation without required image_url", async () => {
      const invalidFlapData = new FlapData({
        patient_id: new mongoose.Types.ObjectId(),
        temperature: 36.5,
      });

      await expect(invalidFlapData.save()).rejects.toThrow(/image_url.*required/);
    });

    test("should fail validation without required temperature", async () => {
      const invalidFlapData = new FlapData({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
      });

      await expect(invalidFlapData.save()).rejects.toThrow(/temperature.*required/);
    });

    test("should fail validation with invalid patient_id type", async () => {
      const invalidFlapData = new FlapData({
        patient_id: "invalid-id",
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: 36.5,
      });

      await expect(invalidFlapData.save()).rejects.toThrow();
    });

    test("should fail validation with non-numeric temperature", async () => {
      const invalidFlapData = new FlapData({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: "not-a-number",
      });

      await expect(invalidFlapData.save()).rejects.toThrow();
    });
  });

  describe("Default Values", () => {
    test("should set default timestamp when not provided", async () => {
      const beforeSave = new Date();
      
      const flapData = new FlapData({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: 36.5,
      });

      const savedData = await flapData.save();
      const afterSave = new Date();

      expect(savedData.timestamp).toBeInstanceOf(Date);
      expect(savedData.timestamp.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedData.timestamp.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    test("should use provided timestamp when specified", async () => {
      const customTimestamp = new Date("2023-01-01T00:00:00.000Z");
      
      const flapData = new FlapData({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: 36.5,
        timestamp: customTimestamp,
      });

      const savedData = await flapData.save();
      expect(savedData.timestamp).toEqual(customTimestamp);
    });
  });

  describe("Collection Name", () => {
    test("should use correct collection name", () => {
      expect(FlapData.collection.name).toBe("flapdatas");
    });
  });

  describe("CRUD Operations", () => {
    let patientId;

    beforeEach(() => {
      patientId = new mongoose.Types.ObjectId();
    });

    test("should create multiple FlapData documents", async () => {
      const flapDataArray = [
        {
          patient_id: patientId,
          image_url: "https://s3.amazonaws.com/bucket/image1.jpg",
          temperature: 36.5,
        },
        {
          patient_id: patientId,
          image_url: "https://s3.amazonaws.com/bucket/image2.jpg",
          temperature: 37.0,
        },
      ];

      const savedData = await FlapData.insertMany(flapDataArray);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].temperature).toBe(36.5);
      expect(savedData[1].temperature).toBe(37.0);
    });

    test("should find FlapData by patient_id", async () => {
      await FlapData.create({
        patient_id: patientId,
        image_url: "https://s3.amazonaws.com/bucket/image1.jpg",
        temperature: 36.5,
      });

      const foundData = await FlapData.findOne({ patient_id: patientId });
      expect(foundData).toBeTruthy();
      expect(foundData.patient_id.toString()).toBe(patientId.toString());
    });

    test("should update FlapData document", async () => {
      const flapData = await FlapData.create({
        patient_id: patientId,
        image_url: "https://s3.amazonaws.com/bucket/image1.jpg",
        temperature: 36.5,
      });

      const updatedData = await FlapData.findByIdAndUpdate(
        flapData._id,
        { temperature: 37.5 },
        { new: true }
      );

      expect(updatedData.temperature).toBe(37.5);
    });

    test("should delete FlapData document", async () => {
      const flapData = await FlapData.create({
        patient_id: patientId,
        image_url: "https://s3.amazonaws.com/bucket/image1.jpg",
        temperature: 36.5,
      });

      await FlapData.findByIdAndDelete(flapData._id);
      
      const deletedData = await FlapData.findById(flapData._id);
      expect(deletedData).toBeNull();
    });
  });

  describe("Query Operations", () => {
    let patientId1, patientId2;

    beforeEach(async () => {
      patientId1 = new mongoose.Types.ObjectId();
      patientId2 = new mongoose.Types.ObjectId();

      await FlapData.insertMany([
        {
          patient_id: patientId1,
          image_url: "https://s3.amazonaws.com/bucket/image1.jpg",
          temperature: 36.0,
          timestamp: new Date("2023-01-01"),
        },
        {
          patient_id: patientId1,
          image_url: "https://s3.amazonaws.com/bucket/image2.jpg",
          temperature: 37.0,
          timestamp: new Date("2023-01-02"),
        },
        {
          patient_id: patientId2,
          image_url: "https://s3.amazonaws.com/bucket/image3.jpg",
          temperature: 38.0,
          timestamp: new Date("2023-01-03"),
        },
      ]);
    });

    test("should find all FlapData for a specific patient", async () => {
      const patientData = await FlapData.find({ patient_id: patientId1 });
      expect(patientData).toHaveLength(2);
      patientData.forEach(data => {
        expect(data.patient_id.toString()).toBe(patientId1.toString());
      });
    });

    test("should find FlapData within temperature range", async () => {
      const dataInRange = await FlapData.find({
        temperature: { $gte: 36.5, $lte: 37.5 }
      });
      expect(dataInRange).toHaveLength(1);
      expect(dataInRange[0].temperature).toBe(37.0);
    });

    test("should find FlapData within date range", async () => {
      const dataInDateRange = await FlapData.find({
        timestamp: {
          $gte: new Date("2023-01-01"),
          $lt: new Date("2023-01-03")
        }
      });
      expect(dataInDateRange).toHaveLength(2);
    });

    test("should sort FlapData by timestamp", async () => {
      const sortedData = await FlapData.find().sort({ timestamp: -1 });
      expect(sortedData).toHaveLength(3);
      expect(sortedData[0].timestamp.getTime()).toBeGreaterThan(
        sortedData[1].timestamp.getTime()
      );
    });
  });

  describe("Population Test", () => {
    test("should have correct reference setup for patient_id", async () => {
      const flapData = new FlapData({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: 36.5,
      });

      const savedData = await flapData.save();
      
      // Check that the reference field exists and is properly typed
      expect(savedData.patient_id).toBeInstanceOf(mongoose.Types.ObjectId);
      
      // Verify the schema path configuration
      const patientIdPath = FlapData.schema.paths.patient_id;
      expect(patientIdPath.instance).toBe('ObjectId');
      expect(patientIdPath.options.ref).toBe('Patient');
    });
  });

  describe("Edge Cases", () => {
    test("should handle very high temperatures", async () => {
      const flapData = await FlapData.create({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: 999.99,
      });

      expect(flapData.temperature).toBe(999.99);
    });

    test("should handle negative temperatures", async () => {
      const flapData = await FlapData.create({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: "https://s3.amazonaws.com/bucket/image.jpg",
        temperature: -10.5,
      });

      expect(flapData.temperature).toBe(-10.5);
    });

    test("should handle long image URLs", async () => {
      const longUrl = "https://s3.amazonaws.com/very-long-bucket-name/" + "a".repeat(500) + ".jpg";
      
      const flapData = await FlapData.create({
        patient_id: new mongoose.Types.ObjectId(),
        image_url: longUrl,
        temperature: 36.5,
      });

      expect(flapData.image_url).toBe(longUrl);
    });
  });
});