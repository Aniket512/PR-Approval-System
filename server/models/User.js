const bcrypt = require("bcrypt");
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: [true, "Username already exists"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already exists"],
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Roles",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = model("User", userSchema);
