import prisma from '../utils/prisma.js';

export async function browseQuizzes(req, res) {
  try {
    const { search, category, difficulty } = req.query;

    const where = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.categoryId = Number(category);
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        category: true,
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
}

export async function getQuizDetails(req, res) {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        _count: { select: { questions: true } },
      },
    });

    if (!quiz || quiz.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quiz details.' });
  }
}