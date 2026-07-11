const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      required: true,
    },

    skillsDetected: {
      type: [String],
      required: true,
    },

    atsScore: {
      type: Number,
      required: true,
    },

    predictedRole: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    aiInsights: {
      summary: {
        type: String,
        default: "",
      },

      strengths: {
        type: [String],
        default: [],
      },

      improvements: {
        type: [String],
        default: [],
      },

      questions: [
        {
          question: {
            type: String,
            default: "",
          },

          answer: {
            type: String,
            default: "",
          },

          explanation: {
            type: String,
            default: "",
          },
        },
      ],

      explanation: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Resume ||
  mongoose.model("Resume", resumeSchema);