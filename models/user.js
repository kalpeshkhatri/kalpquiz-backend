import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  amount: Number,
  credits: Number,
  status: { type: String, default: "success" },  // success, failed, pending
  date: { type: Date, default: Date.now }
});
const RoomHistorySchema = new mongoose.Schema({
  RoomId: String,
  DeductedCredit: Number,
  status: { type: String, default: "success" },  // success, failed, pending
  date: { type: Date, default: Date.now }
});


const userSchema = new mongoose.Schema({
  username:{type:String,required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: {type:String},
  resetPasswordExpires: {type:Number},
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSpecial:{type: Boolean,
    default: false,},
  creditQuiz:{type:Number,default:100},
  paymentHistory: [paymentSchema],  // <-- new array field
  roomHistory:[RoomHistorySchema]
});

const User = mongoose.model('User', userSchema);
export default User;
