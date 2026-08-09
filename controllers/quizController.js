import prisma from '../utils/prisma.js';

export async function createQuiz(req, res) {
  try {
    const { title, description, categoryId, difficulty, duration, passingScore, maxAttempts } = req.body;

    if (!title || !categoryId || !difficulty || !duration || !passingScore) {
      return res.status(400).json({ error: 'Title, category, difficulty, duration, and passing score are required.' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        categoryId: Number(categoryId),
        difficulty,
        duration: Number(duration),
        passingScore: Number(passingScore),
        maxAttempts: maxAttempts ? Number(maxAttempts) : 1,
        status: 'DRAFT',
      },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
}

export async function getAllQuizzesAdmin(req, res) {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        category: true,
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
}

export async function updateQuiz(req, res) {
  try {
    const { id } = req.params;
    const { title, description, categoryId, difficulty, duration, passingScore, maxAttempts } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        categoryId: categoryId ? Number(categoryId) : undefined,
        difficulty,
        duration: duration ? Number(duration) : undefined,
        passingScore: passingScore ? Number(passingScore) : undefined,
        maxAttempts: maxAttempts ? Number(maxAttempts) : undefined,
      },
    });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update quiz.' });
  }
}

export async function deleteQuiz(req, res) {
  try {
    const { id } = req.params;
    await prisma.quiz.delete({ where: { id: Number(id) } });
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete quiz. It may have related questions or attempts.' });
  }
}

export async function updateQuizStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['DRAFT', 'PUBLISHED', 'UNPUBLISHED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be DRAFT, PUBLISHED, or UNPUBLISHED.' });
    }

    const quiz = await prisma.quiz.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update quiz status.' });
  }
}