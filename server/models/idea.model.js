import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Idea title is required"],
      maxlength: [100, "Title cannot be more than 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Idea description is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Technology", "Science", "Art", "Business", "Other"],
        message: "{VALUE} is not a valid category", 
      },
      default: "Other",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: [true, "Comment text cannot be empty"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const Idea = mongoose.model("Idea", ideaSchema);
export default Idea;