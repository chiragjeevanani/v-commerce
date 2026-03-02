/**
 * Send OTP via SMS - SMS India Hub
 * Uses api/mt/SendSMS with DLT template
 * IMPORTANT: Message must exactly match your DLT-approved template
 */

export const sendOTPSMS = async (phoneNumber, otp) => {
  const fullNumber = phoneNumber.length === 10 ? `91${phoneNumber}` : phoneNumber;

  const username = "VAHANCAB";
  const password = "Vahancab!@#123";
  const senderId = "SMSHUB";
  const templateId = "1007801291964877107";
  const brandName = "VAHANCAB";

  // Message MUST match your DLT template exactly:
  // TemplateText: Welcome to the ##var## powered by SMSINDIAHUB. Your OTP for registration is ##var##
  const msg =
    process.env.SMS_OTP_MESSAGE ||
    `Welcome to the ${brandName} powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;

  const fallbackLog = () => {
    console.log(`\n========== OTP (Mobile: ${fullNumber}) ==========`);
    console.log(`OTP: ${otp}`);
    console.log(`==========================================\n`);
  };

  try {
    if (!username || !password) {
      console.warn("[SMS] Missing SMS_INDIA_HUB_USERNAME or SMS_INDIA_HUB_API_KEY in .env");
      fallbackLog();
      return true;
    }

    // SMS India Hub api/mt/SendSMS - transactional (OTP)
    const params = new URLSearchParams({
      user: username,
      password: password,
      senderid: senderId,
      channel: "Trans", // Transactional for OTP
      DCS: "0",
      flashsms: "0",
      number: fullNumber,
      text: msg,
    });

    if (templateId) params.append("templateid", templateId);

    const url = `http://cloud.smsindiahub.in/api/mt/SendSMS?${params.toString()}`;

    const response = await fetch(url);
    const text = await response.text();

    // Parse JSON response - ErrorCode "0" = success, "7" etc = failure
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = {};
    }

    const errorCode = json?.ErrorCode?.toString() || "";
    const isSuccess = errorCode === "0" && (json?.JobId || json?.MessageData);

    if (isSuccess) {
      console.log(`[SMS] OTP sent to ${fullNumber}`);
      return true;
    }

    // API error - log and fallback
    console.warn("[SMS] Send failed:", json?.ErrorMessage || text);
    fallbackLog();
    return true;
  } catch (error) {
    console.error("[SMS] Error:", error.message);
    fallbackLog();
    return true;
  }
};
