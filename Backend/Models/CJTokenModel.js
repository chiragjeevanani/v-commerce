import mongoose from "mongoose";

const cjTokenSchema = new mongoose.Schema(
    {
        openId: { type: String, required: true },
        accessToken: { type: String, required: true },
        accessTokenExpiryDate: { type: Date, required: true },
        refreshToken: { type: String, required: true },
        refreshTokenExpiryDate: { type: Date, required: true },
    },
    { timestamps: true }
);

const CJToken = mongoose.model("CJToken", cjTokenSchema);
export default CJToken;
