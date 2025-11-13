import mongoose from 'mongoose';

const quizPlanSchema = new mongoose.Schema({
  price: {type:Number,required:true},         // e.g. 100
  credits: {type:Number,required:true},      // e.g. 20
  title: {type:String,required:true},       // e.g. "20 Quiz Credits"
});





const QuizPlan = mongoose.model('QuizPlan', quizPlanSchema);
export default QuizPlan