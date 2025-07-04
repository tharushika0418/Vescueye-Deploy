// tests/iotController.test.js

const { getLatestData, getFlapData } = require("../controllers/iotController");
const FlapData = require("../models/FlapData");
const mqttClient = require("../mqttClient");

// Mock the mqttClient latestData value
jest.mock("../mqttClient", () => ({
  latestData: { some: "latest data" },
}));

// Mock the FlapData model
jest.mock("../models/FlapData");

describe("getLatestData", () => {
  it("should return the latest data successfully", () => {
    const req = {};
    const res = {
      json: jest.fn(),
    };

    getLatestData(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mqttClient.latestData,
    });
  });
});

describe("getFlapData", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { patient_id: "patient123" } };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return flap data if found", async () => {
    const mockFlapData = [{ patient_id: "patient123", value: 1 }];

    // Mock find().lean() to resolve with data
    FlapData.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockFlapData),
    });

    await getFlapData(req, res);

    expect(FlapData.find).toHaveBeenCalledWith({ patient_id: "patient123" });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockFlapData });
  });

  it("should return 404 if no flap data found", async () => {
    // Mock find().lean() to resolve with empty array
    FlapData.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    await getFlapData(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No flap data found for this patient.",
    });
  });

  it("should return 500 on error", async () => {
    const error = new Error("Database failure");
    FlapData.find.mockReturnValue({
      lean: jest.fn().mockRejectedValue(error),
    });

    // Suppress console.error during test
    jest.spyOn(console, "error").mockImplementation(() => {});

    await getFlapData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });

    console.error.mockRestore();
  });
});
