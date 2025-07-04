const requireRole = require("../middleware/accessControl"); // Adjust path as needed

describe("requireRole Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request object
    req = {
      user: {
        role: "user"
      }
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock next function
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Single Role Authorization", () => {
    test("should allow access when user has the required role", () => {
      req.user.role = "admin";
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test("should deny access when user does not have the required role", () => {
      req.user.role = "user";
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle case-sensitive role comparison", () => {
      req.user.role = "Admin";
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Multiple Role Authorization", () => {
    test("should allow access when user has one of the allowed roles", () => {
      req.user.role = "moderator";
      const middleware = requireRole("admin", "moderator", "editor");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test("should allow access when user has the first allowed role", () => {
      req.user.role = "admin";
      const middleware = requireRole("admin", "moderator", "editor");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test("should allow access when user has the last allowed role", () => {
      req.user.role = "editor";
      const middleware = requireRole("admin", "moderator", "editor");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test("should deny access when user role is not in allowed roles", () => {
      req.user.role = "guest";
      const middleware = requireRole("admin", "moderator", "editor");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle empty allowed roles array", () => {
      req.user.role = "admin";
      const middleware = requireRole();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle undefined user role", () => {
      req.user.role = undefined;
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle null user role", () => {
      req.user.role = null;
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle empty string user role", () => {
      req.user.role = "";
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle missing user object", () => {
      req.user = undefined;
      const middleware = requireRole("admin");

      expect(() => middleware(req, res, next)).toThrow();
    });

    test("should handle missing user.role property", () => {
      req.user = {};
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle numeric roles", () => {
      req.user.role = 1;
      const middleware = requireRole(1, 2, 3);

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test("should handle mixed type roles", () => {
      req.user.role = "admin";
      const middleware = requireRole("admin", 1, true);

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("Response Format", () => {
    test("should return correct response format on access denied", () => {
      req.user.role = "user";
      const middleware = requireRole("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. You do not have permission."
      });

      // Verify the response structure
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall).toHaveProperty("success", false);
      expect(responseCall).toHaveProperty("message", "Access denied. You do not have permission.");
      expect(Object.keys(responseCall)).toHaveLength(2);
    });

    test("should ensure response methods are called in correct order", () => {
      req.user.role = "user";
      const middleware = requireRole("admin");

      middleware(req, res, next);

      // Verify both methods were called
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      // Check that status was called before json by comparing call order
      const statusCallOrder = res.status.mock.invocationCallOrder[0];
      const jsonCallOrder = res.json.mock.invocationCallOrder[0];
      expect(statusCallOrder).toBeLessThan(jsonCallOrder);
    });

    test("should return response object for method chaining", () => {
      req.user.role = "user";
      const middleware = requireRole("admin");

      const result = middleware(req, res, next);

      // The function should return the result of res.json() due to the return statement
      expect(result).toBe(res.json.mock.results[0].value);
    });
  });

  describe("Function Signature and Behavior", () => {
    test("should return a middleware function", () => {
      const middleware = requireRole("admin");
      expect(typeof middleware).toBe("function");
      expect(middleware.length).toBe(3); // Should accept 3 parameters: req, res, next
    });

    test("should accept variable number of role arguments", () => {
      // Should not throw errors with different numbers of arguments
      expect(() => requireRole()).not.toThrow();
      expect(() => requireRole("admin")).not.toThrow();
      expect(() => requireRole("admin", "user")).not.toThrow();
      expect(() => requireRole("admin", "user", "moderator", "editor")).not.toThrow();
    });

    test("should handle spread operator correctly", () => {
      const roles = ["admin", "moderator", "editor"];
      const middleware = requireRole(...roles);
      
      req.user.role = "moderator";
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("Integration Scenarios", () => {
    test("should work in a typical Express route scenario", () => {
      const mockRoute = jest.fn();
      
      // Simulate successful authorization followed by route handler
      req.user.role = "admin";
      const middleware = requireRole("admin", "moderator");
      
      middleware(req, res, next);
      
      // Verify middleware passed control to next
      expect(next).toHaveBeenCalled();
      
      // Simulate next() calling the actual route handler
      if (next.mock.calls.length > 0 && next.mock.calls[0].length === 0) {
        mockRoute(req, res);
      }
      
      expect(mockRoute).toHaveBeenCalledWith(req, res);
    });

    test("should work with hierarchical role systems", () => {
      // Test common role hierarchy: admin > moderator > user
      const testCases = [
        { userRole: "admin", allowedRoles: ["admin"], shouldPass: true },
        { userRole: "admin", allowedRoles: ["moderator"], shouldPass: false },
        { userRole: "moderator", allowedRoles: ["admin", "moderator"], shouldPass: true },
        { userRole: "user", allowedRoles: ["admin", "moderator"], shouldPass: false },
      ];

      testCases.forEach(({ userRole, allowedRoles, shouldPass }, index) => {
        // Reset mocks for each test case
        jest.clearAllMocks();
        
        req.user.role = userRole;
        const middleware = requireRole(...allowedRoles);
        
        middleware(req, res, next);
        
        if (shouldPass) {
          expect(next).toHaveBeenCalledTimes(1);
          expect(res.status).not.toHaveBeenCalled();
        } else {
          expect(res.status).toHaveBeenCalledWith(403);
          expect(next).not.toHaveBeenCalled();
        }
      });
    });
  });
});