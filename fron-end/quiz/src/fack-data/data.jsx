

const options = (values) =>
  values.map((text, index) => ({ id: String.fromCharCode(97 + index), text }));

export const createBlankQuestion = (id) => ({
  id,
  source: 'manual',
  type: 'single',
  category: '',
  statement: '',
  options: options(['', '', '', '']),
  correctAnswers: [],
  explanation: '',
  image: '',
});


