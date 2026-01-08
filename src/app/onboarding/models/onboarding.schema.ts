import { Schema } from 'mongoose';

export const ClientOnboardingSchema = new Schema(
  {
    // PERSONAL INFO
    name: String,
    location: String,
    gender: String,
    dob: Date,
    age: Number,
    occupation: String,
    income: String,
    company: String,
    designation: String,
    pan: String,
    aadhaar: String,

    contactPersonName: String,
    contactPersonNo: String,

    relationship: String,
    relationshipOther: String,
    clientSource: String,
    clientSourceOther: String,

    // ADDRESS
    commAddress: String,
    permAddress: String,

    // CONTACT
    mobile: String,
    whatsapp: String,
    email: String,

    // DEMAT
    dpId: String,
    clientCode: String,
    schemeName: String,
    brokerName: String,

    // BILLING
    billName: String,
    gst: String,
    billingAddress: String,

    // BANK
    holderName: String,
    bankName: String,
    accNumber: String,
    ifsc: String,
    micr: String,
  },
  { timestamps: true }
);
