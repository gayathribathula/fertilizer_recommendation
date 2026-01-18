import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

export default mongoose.models.Recommendation ||
  mongoose.model('Recommendation', recommendationSchema);
