import prisma from '../utils/prisma.js';

export async function getStudentDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    const attempts = await prisma.attempt.findMany({
      where: { userId, status: { not: 'IN_PROGRESS' } },
    });

    const totalAttempted = attempts.length;
    const totalPassed = attempts.filter((a) => a.status === 'PASSED').length;
    const totalFailed = attempts.filter((a) => a.status === 'FAILED').length;

    const totalQuestionsAnswered = attempts.reduce(
      (sum, a) => sum + a.correctAnswers + a.incorrectAnswers,
      0
    );

    const averageScore =
      totalAttempted > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempted
        : 0;

    const highestScore =
      totalAttempted > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;

    const recentAttempts = await prisma.attempt.findMany({
      where: { userId, status: { not: 'IN_PROGRESS' } },
      include: { quiz: { select: { title: true } } },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    res.json({
      totalAttempted,
      totalPassed,
      totalFailed,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore,
      totalQuestionsAnswered,
      recentAttempts: recentAttempts.map((a) => ({
        quizTitle: a.quiz.title,
        percentage: a.percentage,
        status: a.status,
        completedAt: a.completedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
}