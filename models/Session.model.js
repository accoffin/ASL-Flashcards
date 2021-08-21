const {Schema, model} = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const sessionSchema = new Schema({
    user: { type: ObjectId, ref: "User", required: true },
    expires: { type: Date, required: true },
});
sessionSchema.index({expires: 1}, { expireAfterSeconds: 0 });

const Session = model("Session", sessionSchema);

module.exports = Session;