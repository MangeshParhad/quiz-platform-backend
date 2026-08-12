import prisma from '../utils/prisma.js';

export async function getDashboardStats(req, res) {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalQuizzes = await prisma.quiz.count();
    const publishedQuizzes = await prisma.quiz.count({ where: { status: 'PUBLISHED' } });
    const draftQuizzes = await prisma.quiz.count({ where: { status: 'DRAFT' } });
    const totalQuestions = await prisma.question.count();
    const totalAttempts = await prisma.attempt.count();
    const passedAttempts = await prisma.attempt.count({ where: { status: 'PASSED' } });
    const failedAttempts = await prisma.attempt.count({ where: { status: 'FAILED' } });

    const avgScoreResult = await prisma.attempt.aggregate({
      _avg: { percentage: true },
    });

    res.json({
      totalStudents,
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes,
      totalQuestions,
      totalAttempts,
      averageScore: avgScoreResult._avg.percentage || 0,
      passedAttempts,
      failedAttempts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load dashboard statistics.' });
  }
}

export async function getAllStudents(req, res) {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
}

export async function updateStudentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ error: 'Status must be ACTIVE or INACTIVE.' });
    }

    const student = await prisma.user.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      status: student.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update student status.' });
  }
}

export async function getAnalytics(req, res) {
  try {
    // Pass/fail ratio
    const passedCount = await prisma.attempt.count({ where: { status: 'PASSED' } });
    const failedCount = await prisma.attempt.count({ where: { status: 'FAILED' } });

    // Most popular quizzes (by attempt count)
    const popularQuizzesRaw = await prisma.attempt.groupBy({
      by: ['quizId'],
      _count: { quizId: true },
      orderBy: { _count: { quizId: 'desc' } },
      take: 5,
    });

    const popularQuizzes = await Promise.all(
      popularQuizzesRaw.map(async (row) => {
        const quiz = await prisma.quiz.findUnique({ where: { id: row.quizId } });
        return { quizTitle: quiz?.title || 'Unknown', attemptCount: row._count.quizId };
      })
    );

    // Most popular categories (by quiz count)
    const categories = await prisma.category.findMany({
      include: { _count: { select: { quizzes: true } } },
      orderBy: { quizzes: { _count: 'desc' } },
      take: 5,
    });

    const popularCategories = categories.map((c) => ({
      categoryName: c.name,
      quizCount: c._count.quizzes,
    }));

    // Student registrations over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStudents = await prisma.user.findMany({
      where: { role: 'STUDENT', createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    const registrationsByDay = groupByDay(recentStudents.map((s) => s.createdAt));

    // Quiz attempts over time (last 30 days, grouped by day)
    const recentAttempts = await prisma.attempt.findMany({
      where: { startedAt: { gte: thirtyDaysAgo } },
      select: { startedAt: true },
    });

    const attemptsByDay = groupByDay(recentAttempts.map((a) => a.startedAt));

    // Average quiz scores (per quiz)
    const quizzes = await prisma.quiz.findMany({
      include: { attempts: { where: { status: { not: 'IN_PROGRESS' } } } },
    });

    const averageScoresByQuiz = quizzes
      .filter((q) => q.attempts.length > 0)
      .map((q) => ({
        quizTitle: q.title,
        averageScore:
          Math.round(
            (q.attempts.reduce((sum, a) => sum + a.percentage, 0) / q.attempts.length) * 10
          ) / 10,
      }));

    res.json({
      passFailRatio: { passed: passedCount, failed: failedCount },
      popularQuizzes,
      popularCategories,
      registrationsByDay,
      attemptsByDay,
      averageScoresByQuiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
}

function groupByDay(dates) {
  const counts = {};
  for (const date of dates) {
    const day = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    counts[day] = (counts[day] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}