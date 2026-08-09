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