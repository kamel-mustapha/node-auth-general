import Twilio from "twilio";
const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const TWILIO_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
};

export const sendPhoneCode = async (phone: string) => {
  const response = await client.verify
    .services(process.env.TWILIO_SERVICE_SID!)
    .verifications.create({ to: phone, channel: "sms" });

  return response.status;
};

export const verifyPhoneCode = async (phone: string, code: string) => {
  const response = await client.verify
    .services(process.env.TWILIO_SERVICE_SID!)
    .verificationChecks.create({ to: phone, code: code });

  return response.status;
};
