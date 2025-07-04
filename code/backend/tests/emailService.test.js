const nodemailer = require("nodemailer");
const { sendEmail } = require("../emailService");

jest.mock("nodemailer");

describe("sendEmail", () => {
  const mockSendMail = jest.fn();

  beforeEach(() => {
    mockSendMail.mockClear();
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  it("sends an email successfully", async () => {
    mockSendMail.mockResolvedValue({ response: "250 OK" });

    const result = await sendEmail("test@example.com", "Test Subject", "Hello world");

    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.OUTLOOK_EMAIL,
      to: "test@example.com",
      subject: "Test Subject",
      text: "Hello world",
    });

    expect(result).toEqual({
      success: true,
      message: "Email sent successfully",
    });
  });

  it("handles failure in sending email", async () => {
    const error = new Error("SMTP Error");
    mockSendMail.mockRejectedValue(error);

    const result = await sendEmail("fail@example.com", "Fail Subject", "Fail body");

    expect(mockSendMail).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: "Email sending failed",
      error,
    });
  });
});
