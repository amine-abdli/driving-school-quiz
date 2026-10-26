import {
  formatDuration,
  getQuestionStatus,
  isMultipleChoice,
  isQuestionComplete,
  scoreQuiz,
  validateQuestion,
} from './quiz';

const question = (correctAnswers) => ({
  statement: 'Question de test',
  options: [
    { id: 'a', text: 'Proposition A' },
    { id: 'b', text: 'Proposition B' },
    { id: 'c', text: 'Proposition C' },
    { id: 'd', text: 'Proposition D' },
  ],
  correctAnswers,
});

test('scores only exact answer sets and applies the fixed 40-question denominator', () => {
  const questions = [question(['a']), question(['b', 'c']), question(['d'])];
  const result = scoreQuiz(questions, [['a'], ['b', 'c', 'd'], []]);

  expect(result).toEqual({
    total: 3,
    correct: 1,
    incorrect: 1,
    unanswered: 1,
    percentage: 2.5,
  });
});

test('recognizes complete questions and flagged navigation state', () => {
  expect(isQuestionComplete(question(['a']))).toBe(true);
  expect(isQuestionComplete({ ...question([]), statement: '' })).toBe(false);
  expect(isMultipleChoice({ ...question(['a']), type: 'multiple' })).toBe(true);
  expect(isMultipleChoice({ ...question(['a', 'b']), type: 'single' })).toBe(false);
  expect(getQuestionStatus(3, [['a'], [], [], []], [3])).toBe('flagged');
  expect(getQuestionStatus(0, [['a']], [])).toBe('answered');
  expect(getQuestionStatus(1, [['a']], [])).toBe('unanswered');
});

test('validates image-only questions without OCR and keeps manual questions independent', () => {
  const imageQuestion = {
    ...question(['a']),
    source: 'image',
    type: 'single',
    statement: '',
    image: 'data:image/png;base64,example',
    options: question(['a']).options.map((option) => ({ ...option, text: '' })),
  };
  expect(validateQuestion(imageQuestion)).toBe('');
  expect(isQuestionComplete(imageQuestion)).toBe(true);
  expect(validateQuestion({ ...imageQuestion, image: '' })).toMatch(/image/i);
  expect(validateQuestion({ ...question(['a', 'b']), type: 'single' })).toMatch(/réponse unique/i);
  expect(isQuestionComplete({ ...question(['a', 'b']), type: 'single' })).toBe(false);
});

test('formats quiz time as minutes and seconds', () => {
  expect(formatDuration(65)).toBe('01:05');
});
