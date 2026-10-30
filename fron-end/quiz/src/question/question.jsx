import { useState } from 'react';
import {
  Icon,
  QuestionImage,
  StatusPill,
  OPTION_NUMBERS,
} from '../Dashboard/shared';
import {
  formatDuration,
  isMultipleChoice,
  QUESTION_COUNT,
} from '../utils/quiz';

export default function QuizScreen({
  series,
  answers,
  currentIndex,
  elapsed,
  onAnswer,
  onNavigate,
  onSubmit,
  onExit,
}) {
  const question = series.questions[currentIndex];
  const selected = answers[currentIndex] || [];
  const answeredCount = answers.filter((answer) => answer?.length).length;
  const multipleChoice = isMultipleChoice(question);
  const imageQuestion = question.source === 'image';
  const isArabic = (value) => /[\u0600-\u06ff]/.test(value || '');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);

  function toggleAnswer(optionId) {
    const updated = !multipleChoice
      ? [optionId]
      : selected.includes(optionId)
        ? selected.filter((answer) => answer !== optionId)
        : [...selected, optionId];

    onAnswer(currentIndex, updated);
  }

  function validateCurrentAnswer() {
    if (currentIndex === QUESTION_COUNT - 1) {
      setConfirmSubmit(true);
      return;
    }

    onNavigate(currentIndex + 1);
  }

  return (
    <main className="quiz-shell">
      <div className="quiz-topbar">
        <button className="back-link" type="button" onClick={onExit}>
          <Icon name="arrowLeft" size={18} />
          Quitter la série
        </button>
        <div className="quiz-topbar-title">{series.title}</div>
        <div className="quiz-timer">
          <Icon name="clock" size={17} />
          {formatDuration(elapsed)}
        </div>
      </div>

      <div className="quiz-progress-row">
        <div className="progress-track quiz-progress">
          <span
            style={{
              width: `${((currentIndex + 1) / QUESTION_COUNT) * 100}%`,
            }}
          />
        </div>
        <span>
          Question <strong>{currentIndex + 1}</strong> sur {QUESTION_COUNT}
        </span>
      </div>

      <div className="quiz-layout">
        <section className="question-panel">
          <div className="quiz-image-stage">
            {question.image ? (
              <button
                className="image-zoom-trigger"
                type="button"
                onClick={() => setImageZoom(true)}
                aria-label="Agrandir l’image de la question"
              >
                <QuestionImage
                  src={question.image}
                  alt={
                    imageQuestion
                      ? 'Question et propositions dans l’image'
                      : 'Illustration de la question'
                  }
                />
            
              </button>
            ) : (
              <div className="quiz-image-placeholder">
                <Icon name="image" size={26} />
                <span>Aucune image pour cette question</span>
              </div>
            )}
          </div>

          

        </section>

        <aside className="question-map answer-selection-panel" aria-label="Choix de la réponse">
          <div className="map-heading">
            <div>
              <h2>Choisissez votre réponse</h2>
              <p>
                {multipleChoice
                  ? 'Plusieurs choix possibles'
                  : 'Une seule réponse possible'}
              </p>
            </div>
            <StatusPill tone={multipleChoice ? 'violet' : 'blue'}>
              {currentIndex + 1}/{QUESTION_COUNT}
            </StatusPill>
          </div>

          <button
            className="answer-cancel-button"
            type="button"
            onClick={() => onAnswer(currentIndex, [])}
            disabled={!selected.length}
          >
            <Icon name="close" size={16} />
            Annuler
          </button>

          <div
            className="answer-list answer-list-panel"
            role="group"
            aria-label="Propositions de réponse"
          >
            {question.options.map((option, index) => (
              <label
                className={`answer-option ${
                  selected.includes(option.id) ? 'selected' : ''
                }`}
                key={option.id}
                dir={isArabic(option.text) ? 'rtl' : 'ltr'}
              >
                <input
                  type={multipleChoice ? 'checkbox' : 'radio'}
                  name={`answer-${question.id}`}
                  checked={selected.includes(option.id)}
                  onChange={() => toggleAnswer(option.id)}
                  aria-label={`Réponse ${OPTION_NUMBERS[index]}${
                    option.text ? ` : ${option.text}` : ''
                  }`}
                />
                <span className="answer-letter">{OPTION_NUMBERS[index]}</span>
                <span className="answer-text">
                  {option.text ||
                    (imageQuestion ? 'Choix visible dans l’image' : '')}
                </span>
                {selected.includes(option.id) && (
                  <span className="answer-check">
                    <Icon name="check" size={15} />
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="map-footer">
            <strong>{formatDuration(elapsed)}</strong>
          </div>

          <div className="answer-panel-actions">
            <button
              className="button answer-previous-button"
              type="button"
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <Icon name="arrowLeft" size={16} />
              Précédente
            </button>
            <button
              className="button answer-validate-button"
              type="button"
              onClick={validateCurrentAnswer}
            >
              {currentIndex === QUESTION_COUNT - 1 ? 'Terminer' : 'Valider'}
              <Icon name="check" size={16} />
            </button>
          </div>
        </aside>
      </div>

      {confirmSubmit && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmSubmit(false);
            }
          }}
        >
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-title"
          >
            <div className="modal-icon">
              <Icon name="flag" size={23} />
            </div>
            <button
              className="modal-close"
              type="button"
              onClick={() => setConfirmSubmit(false)}
              aria-label="Fermer"
            >
              <Icon name="close" size={19} />
            </button>
            <h2 id="submit-title">Prêt à terminer ?</h2>
            <p>
              Vous avez répondu à <strong>{answeredCount} questions sur 40</strong>.
              Après la soumission, vous pourrez consulter toutes les corrections.
            </p>
            {answeredCount < QUESTION_COUNT && (
              <div className="unanswered-warning">
                {QUESTION_COUNT - answeredCount} question
                {QUESTION_COUNT - answeredCount > 1
                  ? 's restent'
                  : ' reste'} sans réponse.
              </div>
            )}
            <div className="modal-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setConfirmSubmit(false)}
              >
                Continuer le quiz
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={onSubmit}
              >
                Soumettre mes réponses
              </button>
            </div>
          </section>
        </div>
      )}

      {imageZoom && question.image && (
        <div
          className="image-lightbox"
          role="presentation"
          onClick={() => setImageZoom(false)}
        >
          <button
            type="button"
            aria-label="Fermer l’image"
            onClick={() => setImageZoom(false)}
          >
            <Icon name="close" size={22} />
          </button>
          <QuestionImage
            src={question.image}
            alt="Image agrandie de la question"
          />
        </div>
      )}
    </main>
  );
}
