import prisma from '../utils/prisma.js';

export async function getOverallLeaderboard(req, res) {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        attempts: { where: { status: { not: 'IN_PROGRESS' } } },
      },
    });

    const leaderboard = students
      .filter((s) => s.attempts.length > 0)
      .map((s) => {
        const avgScore =
          s.attempts.reduce((sum, a) => sum + a.percentage, 0) / s.attempts.length;
        return {
          studentName: s.name,
          averageScore: Math.round(avgScore * 10) / 10,
          quizzesCompleted: s.attempts.length,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
}

export async function getCategoryLeaderboard(req, res) {
  try {
    const { categoryId } = req.params;

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        attempts: {
          where: {
            status: { not: 'IN_PROGRESS' },
            quiz: { categoryId: Number(categoryId) },
          },
        },
      },
    });

    const leaderboard = students
      .filter((s) => s.attempts.length > 0)
      .map((s) => {
        const avgScore =
          s.attempts.reduce((sum, a) => sum + a.percentage, 0) / s.attempts.length;
        return {
          studentName: s.name,
          averageScore: Math.round(avgScore * 10) / 10,
          quizzesCompleted: s.attempts.length,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch category leaderboard.' });
  }
}