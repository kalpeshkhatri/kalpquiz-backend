import mongoose from 'mongoose';

const LoggedRoommateSchema = new mongoose.Schema({
  UserId: String,
  Username: String,
});

const SubmittedRoommateSchema = new mongoose.Schema({
  UserId: String,
  Username: String,
  Marks: String
});
const QuestionSchema = new mongoose.Schema({
  Question: String,
  option1: String,
  option2: String,
  option3: String,
  option4: String,
  answer:String,
  
});




const RoomownerSchema = new mongoose.Schema({
  RoomOwnername:{type:String,required:true},
  RoomOwnerId:{type:String,required:true},
  PrivatePassword:{type:String,required:true},
  PublicPassword: { type: String, required: true},
  Studentnos:{ type: Number, required: true},
  RemainingStudentNos:{type:Number,required:true},
  Questionnos:{ type: Number, required: true},
  RoomcreatedDate:{type:Number,required:true},
  DurationofQuiz:{type:Number},//in seconds
  LoggedUserHistory: [LoggedRoommateSchema],
  SubmittedUserHistory: [SubmittedRoommateSchema],
  Testtiming:{type:Number},//time when test is live
  AllQuestions:[QuestionSchema],
  resetPasswordToken: {type:String},
  resetPasswordExpires: {type:Number},
  isOwner: {
    type: Boolean,
    default: true,
  }
});

const Room = mongoose.model('Room', RoomownerSchema);
export default Room;