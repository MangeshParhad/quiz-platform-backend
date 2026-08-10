import prisma from '../utils/prisma.js';

export async function startQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({ where: { id: Number(quizId) } });

    if (!quiz || quiz.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Check max attempts
    const attemptCount = await prisma.attempt.count({
      where: { quizId: Number(quizId), userId, status: { not: 'IN_PROGRESS' } },
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(403).json({ error: `You have reached the maximum of ${quiz.maxAttempts} attempts for this quiz.` });
    }

    // Check for an already in-progress attempt (resume instead of duplicating)
    const existingAttempt = await prisma.attempt.findFirst({
      where: { quizId: Number(quizId), userId, status: 'IN_PROGRESS' },
    });

    if (existingAttempt) {
      return res.json(buildAttemptResponse(existingAttempt, quiz));
    }

    const attempt = await prisma.attempt.create({
      data: {
        quizId: Number(quizId),
        userId,
        status: 'IN_PROGRESS',
      },
    });

    res.status(201).json(buildAttemptResponse(attempt, quiz));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start quiz.' });
  }
}

function buildAttemptResponse(attempt, quiz) {
  const expiresAt = new Date(attempt.startedAt.getTime() + quiz.duration * 60 * 1000);
  return {
    attemptId: attempt.id,
    quizId: quiz.id,
    startedAt: attempt.startedAt,
    expiresAt,
    durationMinutes: quiz.duration,
  };
}

export async function getQuizQuestionsForAttempt(req, res) {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await prisma.attempt.findUnique({ where: { id: Number(attemptId) } });

    if (!attempt || attempt.userId !== userId) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'This attempt has already been submitted.' });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: attempt.quizId } });
    const expiresAt = new Date(attempt.startedAt.getTime() + quiz.duration * 60 * 1000);

    if (new Date() > expiresAt) {
      return res.status(400).json({ error: 'This attempt has expired.' });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: attempt.quizId },
      select: {
        id: true,
        questionText: true,
        marks: true,
        options: {
          select: { id: true, optionText: true }, // isCorrect deliberately excluded
        },
      },
      orderBy: { id: 'asc' },
    });

    res.json({
      attemptId: attempt.id,
      expiresAt,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
}