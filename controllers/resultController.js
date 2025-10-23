const QuestionSet = require("../models/Question");
const Result = require("../models/Result");// For quiz title and level

// // GET /api/results - Fetch all results for logged-in user
// exports.getUserResults = async (req, res) => {
//   try {
//     const userId = req.user.id; // JWT verified user ID

//     // Fetch results for the user
//     const results = await Result.find({ userId }).sort({ date: -1 });

//     // Optionally populate quiz title, level, marks to pass, etc.
//     const detailedResults = await Promise.all(
//       results.map(async (r) => {
//         const quiz = await QuestionSet.findOne({ quizId: r.quizId });
//         return {
//           resultId: r._id,
//           quizId: r.quizId,
//           quizTitle: quiz?.title || "Unknown Quiz",
//           level: quiz?.level || "Unknown",
//           score: r.score,
//           pass: r.pass,
//           totalQuestions: quiz?.questions?.length || 0,
//           date: r.date,
//         };
//       })
//     );

//     return res.status(200).json({ success: true, results: detailedResults });
//   } catch (error) {
//     console.error("Error fetching user results:", error.message);
//     return res.status(500).json({ message: "Server error" });
//   }
// };



exports.getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // -----------------------------
    // 🧩 Build dynamic query filters
    // -----------------------------
    const filters = { userId };

    const {
      pass,
      quizId,
      level,
      startDate,
      endDate,
      minScore,
      maxScore,
      page = 1,
      limit = 10,
    } = req.query;

    if (pass === "true") filters.pass = true;
    else if (pass === "false") filters.pass = false;
    if (quizId) filters.quizId = quizId;
    if (level) filters.level = level;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    if (minScore || maxScore) {
      filters.score = {};
      if (minScore) filters.score.$gte = Number(minScore);
      if (maxScore) filters.score.$lte = Number(maxScore);
    }

    // -----------------------------
    // 📊 Global Stats (not paginated)
    // -----------------------------
    const totalAttempts = await Result.countDocuments({ userId });
    const passedCount = await Result.countDocuments({ userId, pass: true });
    const failedCount = totalAttempts - passedCount;

    // -----------------------------
    // 📄 Pagination setup
    // -----------------------------
    const pageNumber = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageLimit;

    // -----------------------------
    // 🧠 Fetch total count (for current filters)
    // -----------------------------
    const totalResults = await Result.countDocuments(filters);

    // -----------------------------
    // 🧠 Fetch paginated filtered results
    // -----------------------------
    const results = await Result.find(filters)
      .sort({ date: -1, score: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    if (!results.length) {
  return res.status(200).json({
    success: true,
    message: "No results found for given filters.",
    stats: {
      totalAttempts,
      passedCount,
      failedCount,
    },
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageLimit),
      totalResults,
    },
    filtersApplied: filters,
    results: [], // 👈 empty array, not an error
  });
}


    // -----------------------------
    // 🏷️ Enrich with quiz metadata
    // -----------------------------
    const enrichedResults = await Promise.all(
      results.map(async (r) => {
        const quiz = await QuestionSet.findOne({ quizId: r.quizId }).lean();
        return {
          resultId: r._id,
          userName: r.userName,
          quizId: r.quizId,
          quizTitle: quiz?.title || r.quizTitle || "N/A",
          level: quiz?.level || r.level || "N/A",
          score: r.score,
          pass: r.pass,
          correctCount: r.correctCount,
          wrongCount: r.wrongCount,
          totalQuestions: r.totalQuestions,
          date: r.date,
        };
      })
    );

    // -----------------------------
    // ✅ Response
    // -----------------------------
    return res.status(200).json({
      success: true,
      stats: {
        totalAttempts,
        passedCount,
        failedCount,
      },
      pagination: {
        totalResults,
        totalPages: Math.ceil(totalResults / pageLimit),
        currentPage: pageNumber,
        limit: pageLimit,
      },
      filtersApplied: filters,
      results: enrichedResults
    });
  } catch (error) {
    console.error("❌ Error fetching user results:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
