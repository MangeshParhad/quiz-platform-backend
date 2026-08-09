import prisma from '../utils/prisma.js';

export async function getQuestionsForQuiz(req, res) {
  try {
    const { quizId } = req.params;

    const questions = await prisma.question.findMany({
      where: { quizId: Number(quizId) },
      include: { options: true },
      orderBy: { id: 'asc' },
    });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
}

export async function createQuestion(req, res) {
  try {
    const { quizId } = req.params;
    const { questionText, marks, explanation, difficulty, options } = req.body;

    if (!questionText || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question text and at least 2 options are required.' });
    }

    const correctCount = options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      return res.status(400).json({ error: 'Exactly one option must be marked correct.' });
    }

    const question = await prisma.question.create({
      data: {
        quizId: Number(quizId),
        questionText,
        marks: marks ? Number(marks) : 1,
        explanation,
        difficulty: difficulty || 'MEDIUM',
        options: {
          create: options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect || false,
          })),
        },
      },
      include: { options: true },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create question.' });
  }
}

export async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const { questionText, marks, explanation, difficulty } = req.body;

    const question = await prisma.question.update({
      where: { id: Number(id) },
      data: { questionText, marks: marks ? Number(marks) : undefined, explanation, difficulty },
    });

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update question.' });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    await prisma.option.deleteMany({ where: { questionId: Number(id) } });
    await prisma.question.delete({ where: { id: Number(id) } });
    res.json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete question.' });
  }
}