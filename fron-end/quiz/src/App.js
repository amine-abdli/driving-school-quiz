import { useEffect, useState } from 'react';
import './App.css';

import { Header, Icon } from './Dashboard/shared';
import HomeScreen from './Series/SeriesDashboard';
import QuizScreen from './question/question';
import ResultsScreen from './question/resultsDashboard';
import ManageScreen from './question/questionDashboard';
import { isQuestionComplete, QUESTION_COUNT } from './utils/quiz';

const STORAGE_KEY = 'conduite-quiz-v1';

function readAppData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { series: [], progress: {}, error: '' };
    }

    const parsed = JSON.parse(saved);
    if (
      !Array.isArray(parsed.series) ||
      !parsed.progress ||
      typeof parsed.progress !== 'object'
    ) {
      throw new Error('Le format des données enregistrées est invalide.');
    }

    return { series: parsed.series, progress: parsed.progress, error: '' };
  } catch (error) {
    console.error('Impossible de charger les données du quiz :', error);
    return {
      series: [],
      progress: {},
      error:
        'Les données enregistrées n’ont pas pu être chargées. Les données de démonstration sont affichées.',
    };
  }
}

function App() {
  const [initialData] = useState(readAppData);
  const [series, setSeries] = useState(initialData.series);
  const [progress, setProgress] = useState(initialData.progress);
  const [storageError, setStorageError] = useState(initialData.error);
  const [screen, setScreen] = useState('home');
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState(null);
  const selectedSeries = series.find((item) => item.id === selectedSeriesId);
  const elapsed = startedAt
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : 0;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ series, progress }),
      );
      if (storageError) setStorageError('');
    } catch (error) {
      console.error('Impossible d’enregistrer les données du quiz :', error);
      setStorageError(
        'Enregistrement impossible : libérez de l’espace dans le stockage de ce navigateur.',
      );
    }
  }, [series, progress, storageError]);

  useEffect(() => {
    if (screen !== 'quiz') return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  function startSeries(item) {
    const incomplete = item.questions.findIndex(
      (question) => !isQuestionComplete(question),
    );
    if (item.questions.length !== QUESTION_COUNT || incomplete !== -1) {
      setSelectedSeriesId(item.id);
      setScreen('manage');
      return;
    }
    const saved = progress[item.id];
    const nextAnswers =
      saved?.answers?.length === QUESTION_COUNT
        ? saved.answers
        : Array.from({ length: QUESTION_COUNT }, () => []);
    setSelectedSeriesId(item.id);
    setAnswers(nextAnswers);
    setFlagged(Array.isArray(saved?.flagged) ? saved.flagged : []);
    setCurrentIndex(
      Number.isInteger(saved?.currentIndex)
        ? Math.min(saved.currentIndex, QUESTION_COUNT - 1)
        : 0,
    );
    setStartedAt(saved?.startedAt || Date.now());
    setNow(Date.now());
    setScreen('quiz');
  }

  function saveProgress(
    nextAnswers,
    nextFlagged = flagged,
    nextIndex = currentIndex,
    nextStartedAt = startedAt,
  ) {
    if (!selectedSeriesId) return;
    setProgress((previous) => ({
      ...previous,
      [selectedSeriesId]: {
        answers: nextAnswers,
        flagged: nextFlagged,
        currentIndex: nextIndex,
        startedAt: nextStartedAt,
      },
    }));
  }

  function updateAnswer(index, selected) {
    const next = answers.map((answer) => [...(answer || [])]);
    next[index] = selected;
    setAnswers(next);
    saveProgress(next);
  }

  function navigateQuestion(index) {
    const nextIndex = Math.max(0, Math.min(index, QUESTION_COUNT - 1));
    setCurrentIndex(nextIndex);
    saveProgress(answers, flagged, nextIndex);
  }

  function toggleFlag(index) {
    const next = flagged.includes(index)
      ? flagged.filter((item) => item !== index)
      : [...flagged, index];
    setFlagged(next);
    saveProgress(answers, next);
  }

  function submitQuiz() {
    const summary = { answers, elapsed };
    setResult(summary);
    setProgress((previous) => {
      const next = { ...previous };
      delete next[selectedSeriesId];
      return next;
    });
    setScreen('results');
  }

  function backHome() {
    setScreen('home');
    setResult(null);
  }

  return (
    <div className="app">
      <Header
        onHome={backHome}
        onManage={() => setScreen('manage')}
        screen={screen}
      />
      {storageError && (
        <div className="storage-alert" role="alert">
          <span>{storageError}</span>
          <button
            type="button"
            onClick={() => setStorageError('')}
            aria-label="Fermer l’alerte"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {screen === 'home' && (
          <HomeScreen
            series={series}
            progress={progress}
            onStart={startSeries}
            onManage={() => setScreen('manage')}
          />
        )}
      {screen === 'quiz' && selectedSeries && (
        <QuizScreen
          series={selectedSeries}
          answers={answers}
          flagged={flagged}
          currentIndex={currentIndex}
          elapsed={elapsed}
          onAnswer={updateAnswer}
          onNavigate={navigateQuestion}
          onFlag={toggleFlag}
          onSubmit={submitQuiz}
          onExit={backHome}
        />
      )}
      {screen === 'results' && selectedSeries && result && (
        <ResultsScreen
          result={result}
          series={selectedSeries}
          onHome={backHome}
          onRestart={startSeries}
        />
      )}
      {screen === 'manage' && (
        <ManageScreen
          series={series}
          setSeries={setSeries}
          initialSeriesId={selectedSeriesId}
          onBack={backHome}
        />
      )}
    </div>
  );
}

export default App;
