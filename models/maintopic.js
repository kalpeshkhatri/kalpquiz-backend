import mongoose from 'mongoose';

// const maintopicSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   symbol: { type: String, required: true }
// });

// const Maintopic1=mongoose.model('Maintopic', maintopicSchema);
// export default Maintopic1

const subtopicSchema = new mongoose.Schema({
  name: String,
  symbol: String
});

const mainTopicSchema = new mongoose.Schema({
  name: String,
  symbol:String,
  subtopics: [subtopicSchema]
});

const Maintopic2 = mongoose.model('MainTopic2', mainTopicSchema);
export default Maintopic2