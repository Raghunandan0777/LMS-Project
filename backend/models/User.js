const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "instructor", "student"], default: "student" },
    avatar: { type: String, default: "" },
    isApproved: { type: Boolean, default: true }, // instructors need admin approval
    bio: { type: String, default: "" },
    enrolledBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto set isApproved=false for instructors on register
userSchema.pre("save", function (next) {
  if (this.isNew && this.role === "instructor") {
    this.isApproved = true; // Set to false if you want admin approval for instructors
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
