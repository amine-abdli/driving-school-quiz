import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

const answerOptions = [
  { id: 'a', text: 'Ralentir et passer si la route est libre' },
  { id: 'b', text: 'Vous arrêter avant la ligne d’effet' },
  { id: 'c', text: 'Klaxonner avant de passer' },
  { id: 'd', text: 'Céder le passage uniquement aux piétons' },
];

function createTestSeries() {
  const questions = Array.from({ length: 40 }, (_, index) => ({
    id: `test-question-${index + 1}`,
    source: 'manual',
    type: 'single',
    category: 'Code de la route',
    statement: `Question de test ${index + 1}`,
    options: answerOptions,
    correctAnswers: ['a'],
    explanation: '',
    image: '',
  }));

  questions[0] = {
    ...questions[0],
    statement: 'À un feu rouge fixe, que devez-vous faire ?',
    correctAnswers: ['b'],
  };
  questions[1] = {
    ...questions[1],
    statement: 'Que signifie un panneau STOP ?',
  };
  questions[28] = {
    ...questions[28],
    type: 'multiple',
    statement: 'Si vous êtes impliqué dans un accident, quelles actions sont appropriées ?',
    options: [
      { id: 'a', text: 'Protéger les lieux sans vous mettre en danger' },
      { id: 'b', text: 'Alerter les secours si nécessaire' },
      { id: 'c', text: 'Quitter les lieux sans vérifier la situation' },
      { id: 'd', text: 'Mettre en danger les autres usagers pour déplacer un véhicule' },
    ],
    correctAnswers: ['a', 'b'],
  };

  return {
    id: 'test-series',
    title: 'Les essentiels du code',
    description: 'Série utilisée pour les tests.',
    category: 'Code de la route',
    questions,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem(
    'conduite-quiz-v1',
    JSON.stringify({
      series: [createTestSeries()],
      progress: {},
    }),
  );
});

test('shows the available series and its 40-question count', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Les essentiels du code' })).toBeInTheDocument();
  expect(within(screen.getByRole('article')).getByText(/40\s*questions/)).toBeInTheDocument();
});

test('displays saved series and progress as JSON', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Données JSON' }));

  expect(
    screen.getByRole('heading', { name: 'Données enregistrées en JSON' }),
  ).toBeInTheDocument();
  expect(screen.getByText(/"title": "Les essentiels du code"/)).toBeInTheDocument();
  expect(screen.getByText(/"progress": \{\}/)).toBeInTheDocument();
});

test('keeps a selected answer when navigating and confirms before showing corrections', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /commencer la série/i }));

  expect(screen.getByRole('heading', { name: 'À un feu rouge fixe, que devez-vous faire ?' })).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Réponse 2 : Vous arrêter avant la ligne d’effet'));
  fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
  expect(screen.getByLabelText('Réponse 2 : Vous arrêter avant la ligne d’effet')).not.toBeChecked();
  fireEvent.click(screen.getByLabelText('Réponse 2 : Vous arrêter avant la ligne d’effet'));
  fireEvent.click(screen.getByLabelText('Réponse 3 : Klaxonner avant de passer'));
  expect(screen.getByLabelText('Réponse 2 : Vous arrêter avant la ligne d’effet')).not.toBeChecked();
  fireEvent.click(screen.getByLabelText('Réponse 2 : Vous arrêter avant la ligne d’effet'));
  fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
  expect(screen.getByRole('heading', { name: 'Que signifie un panneau STOP ?' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /précédente/i }));
  expect(screen.getByLabelText('Réponse 2 : Vous arrêter avant la ligne d’effet')).toBeChecked();

  for (let question = 0; question < 39; question += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
  }

  fireEvent.click(screen.getByRole('button', { name: 'Terminer' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText(/39 questions restent sans réponse/i)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Soumettre mes réponses' }));

  expect(screen.getByRole('heading', { name: /bravo, vous êtes allé au bout/i })).toBeInTheDocument();
  expect(screen.getByText('2.5')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'À un feu rouge fixe, que devez-vous faire ?' })).toBeInTheDocument();
});

test('provides a multiple-answer question and its navigation state', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /commencer la série/i }));
  expect(screen.queryByLabelText('Navigation des questions')).not.toBeInTheDocument();

  for (let question = 0; question < 28; question += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
  }

  expect(screen.getByText(/plusieurs réponses/i)).toBeInTheDocument();
  expect(screen.queryByText('Sélectionnez toutes les bonnes réponses.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Réponse 1 : Protéger les lieux sans vous mettre en danger'));
  fireEvent.click(screen.getByLabelText('Réponse 2 : Alerter les secours si nécessaire'));
  expect(screen.getByLabelText('Réponse 1 : Protéger les lieux sans vous mettre en danger')).toBeChecked();
  expect(screen.getByLabelText('Réponse 2 : Alerter les secours si nécessaire')).toBeChecked();
});

test('keeps images optional and supports uploading an image to a question', async () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /commencer la série/i }));
  expect(screen.queryByRole('button', { name: 'Agrandir l’image de la question' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Gestion' }));
  fireEvent.click(screen.getByRole('button', { name: /À un feu rouge fixe/ }));
  const imageInput = container.querySelector('input[type="file"]');
  const image = new File(['image-content'], 'signalisation.png', { type: 'image/png' });
  fireEvent.change(imageInput, { target: { files: [image] } });

  await waitFor(() => {
    expect(screen.getByAltText('Aperçu de l’illustration')).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/png;base64,'),
    );
  });

  fireEvent.click(screen.getByRole('button', { name: /retour aux séries/i }));
  fireEvent.click(screen.getByRole('button', { name: /commencer la série/i }));
  expect(screen.getByRole('button', { name: 'Agrandir l’image de la question' })).toBeInTheDocument();
});

test('creates an image-only question and requires the author to mark its answers manually', async () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Gestion' }));
  fireEvent.click(screen.getByRole('button', { name: /créer une série/i }));
  const seriesDialog = screen.getByRole('dialog');
  fireEvent.change(within(seriesDialog).getByLabelText('Titre de la série'), { target: { value: 'Série illustrée' } });
  fireEvent.click(within(seriesDialog).getByRole('button', { name: /créer la série/i }));
  fireEvent.click(screen.getByRole('button', { name: /à partir d’une image/i }));
  fireEvent.change(screen.getByLabelText('Type de question'), { target: { value: 'multiple' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aperçu' }));
  expect(screen.getByText(/la question et les choix/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /continuer la modification/i }));

  const image = new File(['question-image'], 'question.webp', { type: 'image/webp' });
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [image] } });
  await waitFor(() => expect(screen.getByAltText('Aperçu de l’illustration')).toBeInTheDocument());

  const correctAnswerCheckboxes = screen.getAllByRole('checkbox', { name: 'Bonne réponse' });
  fireEvent.click(correctAnswerCheckboxes[0]);
  fireEvent.click(correctAnswerCheckboxes[2]);
  fireEvent.click(screen.getByRole('button', { name: /enregistrer la question/i }));
  expect(screen.getByText('Question enregistrée.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^01 Question à compléter/i })).toBeInTheDocument();
}, 30000);
