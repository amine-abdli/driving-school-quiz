export const QUESTION_COUNT = 40;

export function isMultipleChoice(question) {
  if (question.type === 'multiple') return true;
  if (question.type === 'single') return false;
  return question.correctAnswers?.length > 1;
}

export function isQuestionComplete(question) {
  if (!question?.options || question.options.length !== 4) return false;
  if (question.source === 'image' ? !question.image : !question.statement?.trim()) {
    return false;
  }
  if (
    question.source !== 'image' &&
    question.options.some((option) => !option.text.trim())
  ) {
    return false;
  }
  if (
    !question.correctAnswers?.length ||
    !question.correctAnswers.every((answer) =>
      question.options.some((option) => option.id === answer)
    )
  ) {
    return false;
  }
  return isMultipleChoice(question) || question.correctAnswers.length === 1;
}

export function validateQuestion(question) {
  if (question.source === 'image' && !question.image) {
    return 'Ajoutez une image contenant la question et ses propositions.';
  }
  if (question.source !== 'image' && !question.statement.trim()) {
    return 'Ajoutez un énoncé à cette question.';
  }
  if (
    question.options.length !== 4 ||
    (question.source !== 'image' && question.options.some((option) => !option.text.trim()))
  ) {
    return 'Renseignez les quatre propositions de réponse.';
  }
  if (!question.correctAnswers.length) return 'Sélectionnez au moins une bonne réponse.';
  if (!isMultipleChoice(question) && question.correctAnswers.length > 1) {
    return 'Une question à réponse unique ne peut avoir qu’une bonne réponse.';
  }
  return '';
}

export function scoreQuiz(questions, answers) {
  const correctCount = questions.reduce((count, question, index) => {
    const selected = answers[index] || [];
    const expected = question.correctAnswers;
    const exactMatch =
      selected.length === expected.length &&
      expected.every((answer) => selected.includes(answer));
    return count + (exactMatch ? 1 : 0);
  }, 0);
  const unansweredCount = questions.reduce(
    (count, _, index) => count + (!answers[index]?.length ? 1 : 0),
    0,
  );
  const incorrectCount = questions.length - correctCount - unansweredCount;

  return {
    total: questions.length,
    correct: correctCount,
    incorrect: incorrectCount,
    unanswered: unansweredCount,
    percentage: questions.length
      ? Math.round((correctCount / QUESTION_COUNT) * 1000) / 10
      : 0,
  };
}

export function getQuestionStatus(index, answers, flagged) {
  if (flagged.includes(index)) return 'flagged';
  return answers[index]?.length ? 'answered' : 'unanswered';
}

export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
