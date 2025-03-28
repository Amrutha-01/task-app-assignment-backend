const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tasks:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);
