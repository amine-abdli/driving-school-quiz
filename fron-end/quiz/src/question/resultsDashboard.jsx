import { useMemo, useState } from 'react';
import {
  Icon,
  QuestionImage,
  StatusPill,
  OPTION_NUMBERS,
} from '../Dashboard/shared';
import { formatDuration, QUESTION_COUNT, scoreQuiz } from '../utils/quiz';

export default function ResultsDashboard({
  result,
  series,
  onHome,
  onRestart,
}) {
  const [mistakesOnly, setMistakesOnly] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const stats = useMemo(
    () => scoreQuiz(series.questions, result.answers),
    [series.questions, result.answers],
  );

  const mistakeIndexes = useMemo(
    () =>
      series.questions.reduce((mistakes, question, index) => {
        const selected = result.answers[index] || [];
        const correct =
          selected.length === question.correctAnswers.length &&
          question.correctAnswers.every((answer) => selected.includes(answer));

        if (!correct) mistakes.push(index);
        return mistakes;
      }, []),
    [series.questions, result.answers],
  );

  const indexes = mistakesOnly
    ? mistakeIndexes
    : series.questions.map((_, index) => index);
  const safeReviewIndex = Math.min(reviewIndex, Math.max(indexes.length - 1, 0));
  const questionIndex = indexes[safeReviewIndex];
  const question = series.questions[questionIndex];
  const selected = result.answers[questionIndex] || [];
  const isCorrect =
    selected.length === question.correctAnswers.length &&
    question.correctAnswers.every((answer) => selected.includes(answer));

  function toggleReviewFilter(value) {
    setMistakesOnly(value);
    setReviewIndex(0);
  }

  return (
    <main className="results-shell">
      <div className="results-topbar">
        <button className="back-link" type="button" onClick={onHome}>
          <Icon name="arrowLeft" size={18} />
          Mes séries
        </button>
        <span>{series.title}</span>
        <button
          className="results-restart"
          type="button"
          onClick={() => onRestart(series)}
        >
          Recommencer
        </button>
      </div>

      <section className="results-hero">
        <div
          className={`score-ring ${
            stats.percentage >= 70 ? 'score-good' : 'score-low'
          }`}
          style={{
            background: `conic-gradient(${
              stats.percentage >= 70 ? '#36885f' : '#d39b45'
            } 0 ${stats.percentage}%, #e0eae2 ${stats.percentage}% 100%)`,
          }}
        >
          <div>
            <strong>
              {stats.percentage}
              <small>%</small>
            </strong>
            <span>votre score</span>
          </div>
        </div>

        <div className="results-intro">
          <div className="eyebrow section-eyebrow">SÉRIE TERMINÉE</div>
          <h1>
            Bravo, vous êtes
            <br />
            <span>allé au bout !</span>
          </h1>
          <p>
            Chaque question est une occasion de progresser. Prenez un moment
            pour revoir vos réponses.
          </p>
          <div className="result-time">
            <Icon name="clock" size={17} />
            Temps réalisé <strong>{formatDuration(result.elapsed)}</strong>
          </div>
        </div>
        <div className="result-decoration" aria-hidden="true">✳</div>
      </section>

      <section className="stats-grid" aria-label="Résumé du résultat">
        <article className="stat-card">
          <span className="stat-icon stat-total">
            <Icon name="book" size={19} />
          </span>
          <span className="stat-label">Questions au total</span>
          <strong>{stats.total}<small> / 40</small></strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-correct">
            <Icon name="check" size={19} />
          </span>
          <span className="stat-label">Bonnes réponses</span>
          <strong>{stats.correct}<small> / 40</small></strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-incorrect">×</span>
          <span className="stat-label">Réponses incorrectes</span>
          <strong>{stats.incorrect}<small> / 40</small></strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-unanswered">–</span>
          <span className="stat-label">Sans réponse</span>
          <strong>{stats.unanswered}<small> / 40</small></strong>
        </article>
      </section>

      <section className="correction-section">
        <div className="correction-heading">
          <div>
            <div className="eyebrow section-eyebrow">POUR ALLER PLUS LOIN</div>
            <h2>Vos corrections</h2>
            <p>
              Une réponse exacte doit contenir toutes les bonnes réponses,
              et aucune autre.
            </p>
          </div>
          <div className="review-filter">
            <button
              type="button"
              className={!mistakesOnly ? 'selected' : ''}
              onClick={() => toggleReviewFilter(false)}
            >
              Toutes <span>{stats.total}</span>
            </button>
            <button
              type="button"
              className={mistakesOnly ? 'selected' : ''}
              onClick={() => toggleReviewFilter(true)}
            >
              Revoir mes erreurs <span>{mistakeIndexes.length}</span>
            </button>
          </div>
        </div>

        {indexes.length === 0 ? (
          <div className="all-correct-note">
            <span><Icon name="check" size={19} /></span>
            <div>
              <strong>Un sans-faute, bravo !</strong>
              <p>Aucune erreur à revoir dans cette série.</p>
            </div>
          </div>
        ) : (
          <div className="review-card">
            <div className="review-card-head">
              <span>
                QUESTION {String(questionIndex + 1).padStart(2, '0')}
                <span className="review-total"> / {QUESTION_COUNT}</span>
              </span>
              <StatusPill tone={isCorrect ? 'green' : 'red'}>
                {isCorrect
                  ? 'Bonne réponse'
                  : selected.length
                    ? 'Réponse incorrecte'
                    : 'Sans réponse'}
              </StatusPill>
            </div>

            <h3
              dir={
                /[\u0600-\u06ff]/.test(question.statement || '') ||
                (question.source === 'image' && !question.statement)
                  ? 'rtl'
                  : 'ltr'
              }
            >
              {question.statement ||
                (question.source === 'image'
                  ? 'السؤال والاختيارات في الصورة'
                  : '')}
            </h3>
            <QuestionImage
              src={question.image}
              alt={
                question.source === 'image'
                  ? 'Question et propositions dans l’image'
                  : 'Illustration de la question'
              }
            />

            <div className="review-answers">
              {question.options.map((option, index) => {
                const isSelected = selected.includes(option.id);
                const isExpected = question.correctAnswers.includes(option.id);
                const tone = isExpected
                  ? 'review-correct'
                  : isSelected
                    ? 'review-wrong'
                    : '';

                return (
                  <div
                    className={`review-answer ${tone}`}
                    key={option.id}
                    dir={/[\u0600-\u06ff]/.test(option.text || '') ? 'rtl' : 'ltr'}
                  >
                    <span className="answer-letter">{OPTION_NUMBERS[index]}</span>
                    <span className="answer-text">
                      {option.text ||
                        (question.source === 'image'
                          ? 'Choix visible dans l’image'
                          : '')}
                    </span>
                    {isSelected && (
                      <span className="review-tag">Votre réponse</span>
                    )}
                    {isExpected && (
                      <span className="review-tag expected">Bonne réponse</span>
                    )}
                  </div>
                );
              })}
            </div>

            {question.explanation && (
              <div className="explanation-box">
                <span className="explanation-bulb">i</span>
                <div>
                  <strong>À retenir</strong>
                  <p>{question.explanation}</p>
                </div>
              </div>
            )}

            <div className="review-navigation">
              <span>{safeReviewIndex + 1} sur {indexes.length} à revoir</span>
              <div>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    setReviewIndex((index) => Math.max(index - 1, 0))
                  }
                  disabled={safeReviewIndex === 0}
                >
                  <Icon name="arrowLeft" size={16} />
                  Précédente
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    setReviewIndex((index) =>
                      Math.min(index + 1, indexes.length - 1),
                    )
                  }
                  disabled={safeReviewIndex === indexes.length - 1}
                >
                  Suivante <Icon name="arrowRight" size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="scoring-note">
          <Icon name="check" size={16} />
          <p>
            <strong>Comment le score est calculé :</strong> une question
            compte comme correcte uniquement si toutes les bonnes réponses,
            et aucune autre, ont été sélectionnées. Le score correspond au
            nombre de questions correctes divisé par 40.
          </p>
        </div>
      </section>
    </main>
  );
}
