import { useEffect, useState } from 'react';
import { Icon, QuestionImage, LETTERS } from '../Dashboard/shared';
import { createBlankQuestion } from '../fack-data/data';
import {
  isMultipleChoice,
  isQuestionComplete,
  QUESTION_COUNT,
  validateQuestion,
} from '../utils/quiz';

export default function QuestionDashboard({
  series,
  setSeries,
  initialSeriesId,
  onBack,
}) {
  const [selectedId, setSelectedId] = useState(
    initialSeriesId || series[0]?.id || '',
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [message, setMessage] = useState('');
  const [seriesDialog, setSeriesDialog] = useState(false);
  const [questionPreview, setQuestionPreview] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const currentSeries = series.find((item) => item.id === selectedId);
  const currentQuestion = currentSeries?.questions.find(
    (question) => question.id === selectedQuestionId,
  );
  const completeCount =
    currentSeries?.questions.filter(isQuestionComplete).length || 0;

  useEffect(() => {
    if (!series.some((item) => item.id === selectedId)) {
      setSelectedId(series[0]?.id || '');
      setSelectedQuestionId('');
    }
  }, [series, selectedId]);

  function updateSeries(patch) {
    setSeries((items) =>
      items.map((item) =>
        item.id === selectedId ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateQuestion(updated) {
    updateSeries({
      questions: currentSeries.questions.map((question) =>
        question.id === updated.id ? updated : question,
      ),
    });
  }

  function addSeries(event) {
    event.preventDefault();
    if (!newTitle.trim()) {
      setMessage('Donnez un titre à votre série.');
      return;
    }

    const id = `serie-${Date.now()}`;
    const created = {
      id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: 'Code de la route',
      questions: Array.from({ length: QUESTION_COUNT }, (_, index) =>
        createBlankQuestion(`${id}-question-${index + 1}`),
      ),
    };

    setSeries((items) => [...items, created]);
    setSelectedId(id);
    setSelectedQuestionId(created.questions[0].id);
    setNewTitle('');
    setNewDescription('');
    setMessage('Série créée avec 40 emplacements à compléter.');
    setSeriesDialog(false);
  }

  function deleteSeries() {
    if (!currentSeries) return;

    const confirmed = window.confirm(
      `Supprimer la série « ${currentSeries.title} » et ses questions ?`,
    );
    if (!confirmed) return;

    setSeries((items) => items.filter((item) => item.id !== selectedId));
    setSelectedQuestionId('');
    setMessage('La série a été supprimée.');
  }

  function startAddQuestion() {
    if (!currentSeries) return;

    const emptySlot = currentSeries.questions.find(
      (question) => !isQuestionComplete(question),
    );
    if (emptySlot) {
      setSelectedQuestionId(emptySlot.id);
      setMessage(
        'Complétez cet emplacement pour ajouter votre question à la série.',
      );
      return;
    }

    setMessage(
      'Les 40 emplacements sont occupés. Supprimez une question pour libérer un emplacement avant d’en ajouter une nouvelle.',
    );
  }

  function deleteQuestion(question) {
    const questionNumber =
      currentSeries.questions.indexOf(question) + 1;
    const confirmed = window.confirm(
      `Effacer la question ${questionNumber} ? Son emplacement restera disponible pour une nouvelle question.`,
    );
    if (!confirmed) return;

    updateQuestion(createBlankQuestion(question.id));
    setMessage(
      'Question effacée. Son emplacement peut accueillir une nouvelle question.',
    );
  }

  function toggleCorrectAnswer(optionId) {
    const answers = currentQuestion.correctAnswers || [];
    const updatedAnswers = isMultipleChoice(currentQuestion)
      ? answers.includes(optionId)
        ? answers.filter((answer) => answer !== optionId)
        : [...answers, optionId]
      : [optionId];

    updateQuestion({
      ...currentQuestion,
      correctAnswers: updatedAnswers,
    });
  }

  function saveQuestion(event) {
    event.preventDefault();
    const error = validateQuestion(currentQuestion);
    if (error) {
      setMessage(error);
      return;
    }

    setMessage('Question enregistrée.');
  }

  function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      setMessage('Choisissez une image PNG, JPG ou WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 350 * 1024) {
      setMessage(
        'L’image doit faire 350 Ko ou moins pour être conservée dans ce navigateur.',
      );
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      updateQuestion({ ...currentQuestion, image: reader.result });
      setMessage('Image ajoutée à cette question.');
    };
    reader.onerror = () => {
      console.error('La lecture de l’image a échoué :', reader.error);
      setMessage(
        'Impossible de lire cette image. Veuillez réessayer avec un autre fichier.',
      );
    };
    reader.readAsDataURL(file);
  }

  function closePreview() {
    setQuestionPreview(false);
  }

  function confirmPreview() {
    setQuestionPreview(false);
    setMessage(validateQuestion(currentQuestion) || 'Question enregistrée.');
  }

  return (
    <main className="manage-shell">
      <div className="manage-heading">
        <button className="back-link" type="button" onClick={onBack}>
          <Icon name="arrowLeft" size={18} />
          Retour aux séries
        </button>
        <div className="manage-title-row">
          <div>
            <div className="eyebrow section-eyebrow">
              VOTRE ESPACE, VOS RÈGLES
            </div>
            <h1>Gestion des séries</h1>
            <p>
              Créez vos parcours et préparez chaque question à votre rythme.
            </p>
          </div>
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setMessage('');
              setSeriesDialog(true);
            }}
          >
            <Icon name="plus" size={17} />
            Créer une série
          </button>
        </div>
      </div>

      {message && (
        <div className="inline-message" role="status">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage('')}
            aria-label="Fermer le message"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <div className="manage-layout">
        <aside className="manage-sidebar">
          <div className="manage-sidebar-head">
            <span>MES SÉRIES</span>
            <span>{series.length}</span>
          </div>
          {series.length === 0 ? (
            <p className="manage-empty">Aucune série pour le moment.</p>
          ) : (
            series.map((item, index) => (
              <button
                className={`manage-series-link ${
                  item.id === selectedId ? 'active' : ''
                }`}
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setSelectedQuestionId('');
                  setMessage('');
                }}
              >
                <span className="series-icon small">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.questions.filter(isQuestionComplete).length} /{' '}
                    {item.questions.length} questions prêtes
                  </small>
                </span>
              </button>
            ))
          )}
        </aside>

        {currentSeries ? (
          <section className="manage-content">
            <div className="manage-series-info">
              <div className="manage-series-progress">
                <strong>{completeCount}</strong>
                <span>/ 40 questions prêtes</span>
                <div className="progress-track">
                  <span
                    style={{
                      width: `${(completeCount / QUESTION_COUNT) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <button
                className="icon-button danger"
                type="button"
                onClick={deleteSeries}
                aria-label={`Supprimer la série ${currentSeries.title}`}
              >
                <Icon name="trash" size={18} />
              </button>
            </div>

            <div className="series-edit-fields">
              <label>
                Titre de la série
                <input
                  value={currentSeries.title}
                  onChange={(event) =>
                    updateSeries({ title: event.target.value })
                  }
                  maxLength={80}
                />
              </label>
              <label>
                Description
                <textarea
                  value={currentSeries.description}
                  onChange={(event) =>
                    updateSeries({ description: event.target.value })
                  }
                  rows="2"
                  maxLength={220}
                />
              </label>
            </div>

            <div className="question-editor-layout">
              <aside className="question-list">
                <div className="question-list-heading">
                  <div>
                    <strong>Questions</strong>
                    <span>Les séries contiennent 40 emplacements.</span>
                  </div>
                  <button
                    className="small-add-button"
                    type="button"
                    onClick={startAddQuestion}
                    aria-label="Ajouter une question"
                  >
                    <Icon name="plus" size={18} />
                  </button>
                </div>
                <div className="question-list-items">
                  {currentSeries.questions.map((question, index) => (
                    <button
                      key={question.id}
                      className={`question-list-item ${
                        question.id === selectedQuestionId ? 'active' : ''
                      } ${isQuestionComplete(question) ? 'complete' : ''}`}
                      type="button"
                      onClick={() => {
                        setSelectedQuestionId(question.id);
                        setMessage('');
                      }}
                    >
                      <span className="question-list-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>
                        {question.statement || 'Question à compléter'}
                      </span>
                      {isQuestionComplete(question) && (
                        <Icon name="check" size={15} />
                      )}
                    </button>
                  ))}
                </div>
              </aside>

              <section className="question-editor">
                {currentQuestion ? (
                  <QuestionForm
                    question={currentQuestion}
                    questionNumber={
                      currentSeries.questions.indexOf(currentQuestion) + 1
                    }
                    onUpdate={updateQuestion}
                    onDelete={() => deleteQuestion(currentQuestion)}
                    onToggleAnswer={toggleCorrectAnswer}
                    onSave={saveQuestion}
                    onUploadImage={uploadImage}
                    onPreview={() => setQuestionPreview(true)}
                  />
                ) : (
                  <div className="editor-empty">
                    <span className="empty-icon">
                      <Icon name="book" size={22} />
                    </span>
                    <h2>Choisissez une question</h2>
                    <p>
                      Sélectionnez un emplacement ou créez une série pour
                      commencer à renseigner vos questions.
                    </p>
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={startAddQuestion}
                    >
                      <Icon name="plus" size={17} />
                      Ajouter une question
                    </button>
                  </div>
                )}
              </section>
            </div>
          </section>
        ) : (
          <section className="manage-content manage-no-series">
            <span className="empty-icon">
              <Icon name="book" size={23} />
            </span>
            <h2>Aucune série disponible</h2>
            <p>Créez une série pour commencer à préparer vos questions.</p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => setSeriesDialog(true)}
            >
              <Icon name="plus" size={17} />
              Créer une série
            </button>
          </section>
        )}
      </div>

      {questionPreview && currentQuestion && (
        <QuestionPreview
          question={currentQuestion}
          onClose={closePreview}
          onConfirm={confirmPreview}
        />
      )}
      {seriesDialog && (
        <SeriesDialog
          title={newTitle}
          description={newDescription}
          onTitleChange={setNewTitle}
          onDescriptionChange={setNewDescription}
          onClose={() => setSeriesDialog(false)}
          onSubmit={addSeries}
        />
      )}
    </main>
  );
}

function QuestionForm({
  question,
  questionNumber,
  onUpdate,
  onDelete,
  onToggleAnswer,
  onSave,
  onUploadImage,
  onPreview,
}) {
  const source = question.source || 'manual';
  const multipleChoice = isMultipleChoice(question);

  return (
    <form onSubmit={onSave} noValidate>
      <div className="editor-heading">
        <div>
          <div className="eyebrow section-eyebrow">
            QUESTION {String(questionNumber).padStart(2, '0')}
          </div>
          <h2>Modifier la question</h2>
        </div>
        <div className="editor-heading-actions">
          <button
            className="button button-secondary preview-question-button"
            type="button"
            onClick={onPreview}
          >
            Aperçu
          </button>
          <button
            className="icon-button danger"
            type="button"
            onClick={onDelete}
            aria-label="Effacer cette question"
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>

      <div
        className="question-source-picker"
        role="group"
        aria-label="Méthode de création de la question"
      >
        <button
          className={`source-choice ${source === 'image' ? 'active' : ''}`}
          type="button"
          aria-pressed={source === 'image'}
          onClick={() => onUpdate({ ...question, source: 'image' })}
        >
          <Icon name="image" size={18} />
          <span>
            <strong>À partir d’une image</strong>
            <small>La question et les choix sont dans l’image.</small>
          </span>
        </button>
        <button
          className={`source-choice ${source === 'manual' ? 'active' : ''}`}
          type="button"
          aria-pressed={source === 'manual'}
          onClick={() => onUpdate({ ...question, source: 'manual' })}
        >
          <Icon name="book" size={18} />
          <span>
            <strong>Créer manuellement</strong>
            <small>Saisissez l’énoncé et les quatre choix.</small>
          </span>
        </button>
      </div>

      <div className="editor-two-fields">
        <label className="field-label">
          Thème
          <input
            value={question.category}
            onChange={(event) =>
              onUpdate({ ...question, category: event.target.value })
            }
            placeholder="Ex. Signalisation"
            maxLength={50}
          />
        </label>
        <label className="field-label">
          Type de question
          <select
            value={question.type || 'single'}
            onChange={(event) =>
              onUpdate({
                ...question,
                type: event.target.value,
                correctAnswers:
                  event.target.value === 'single'
                    ? question.correctAnswers.slice(0, 1)
                    : question.correctAnswers,
              })
            }
          >
            <option value="single">Une seule bonne réponse</option>
            <option value="multiple">Plusieurs bonnes réponses</option>
          </select>
        </label>
      </div>

      {source === 'manual' ? (
        <label className="field-label">
          Énoncé de la question
          <textarea
            required
            value={question.statement}
            onChange={(event) =>
              onUpdate({ ...question, statement: event.target.value })
            }
            placeholder="Rédigez la question…"
            rows="3"
            maxLength={500}
          />
        </label>
      ) : (
        <p className="image-question-note">
          Aucune lecture automatique n’est effectuée. Vous sélectionnerez
          manuellement la ou les réponses correctes sous l’image.
        </p>
      )}

      <div className="options-editor">
        <div className="field-label">
          Propositions
          <span>
            {source === 'image'
              ? 'Les choix A, B, C et D figurent dans l’image.'
              : 'Choisissez la ou les bonnes réponses.'}
          </span>
        </div>
        {question.options.map((option, index) => (
          <div className="option-editor-row" key={option.id}>
            <span className="answer-letter">{LETTERS[index]}</span>
            {source === 'manual' && (
              <input
                aria-label={`Proposition ${LETTERS[index]}`}
                required
                value={option.text}
                onChange={(event) =>
                  onUpdate({
                    ...question,
                    options: question.options.map((item) =>
                      item.id === option.id
                        ? { ...item, text: event.target.value }
                        : item,
                    ),
                  })
                }
                placeholder={`Proposition ${LETTERS[index]}`}
                maxLength={220}
              />
            )}
            <label className="correct-toggle">
              <input
                type={multipleChoice ? 'checkbox' : 'radio'}
                name={`correct-${question.id}`}
                checked={question.correctAnswers.includes(option.id)}
                onChange={() => onToggleAnswer(option.id)}
              />
              <span>Bonne réponse</span>
            </label>
          </div>
        ))}
      </div>

      {source === 'manual' && (
        <label className="field-label">
          Explication <span>Facultatif</span>
          <textarea
            value={question.explanation || ''}
            onChange={(event) =>
              onUpdate({ ...question, explanation: event.target.value })
            }
            placeholder="Expliquez la règle à retenir…"
            rows="3"
            maxLength={600}
          />
        </label>
      )}

      <div className="field-label image-label">
        {source === 'image' ? 'Image de la question' : 'Illustration'}
        <span>
          {source === 'image' ? 'Obligatoire' : 'Facultatif'} · PNG, JPG ou
          WEBP · 350 Ko max.
        </span>
      </div>
      <label className="upload-area">
        <Icon name="image" size={19} />
        <span>
          {question.image
            ? 'Remplacer l’image'
            : source === 'image'
              ? 'Importer une image contenant la question'
              : 'Ajouter une illustration'}
          <small>PNG, JPG ou WEBP. Aucun OCR ni correction automatique.</small>
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onUploadImage}
        />
      </label>

      {question.image && (
        <div className="editor-image-wrap">
          <QuestionImage src={question.image} alt="Aperçu de l’illustration" />
          <button
            className="remove-image"
            type="button"
            onClick={() => onUpdate({ ...question, image: '' })}
          >
            Retirer l’image
          </button>
        </div>
      )}

      <button className="button button-primary save-question" type="submit">
        <Icon name="check" size={17} />
        Enregistrer la question
      </button>
    </form>
  );
}

function QuestionPreview({ question, onClose, onConfirm }) {
  const isArabic =
    /[\u0600-\u06ff]/.test(question.statement || '') ||
    question.source === 'image';

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="confirm-modal question-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-preview-title"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Fermer l’aperçu"
        >
          <Icon name="close" size={19} />
        </button>
        <div className="eyebrow section-eyebrow">APERÇU ADMINISTRATEUR</div>
        <h2 id="question-preview-title">Vérifier la question</h2>
        {question.image && (
          <QuestionImage src={question.image} alt="Aperçu de la question" />
        )}
        <h3 dir={isArabic ? 'rtl' : 'ltr'}>
          {question.statement ||
            (question.source === 'image'
              ? 'السؤال والاختيارات في الصورة'
              : 'Énoncé à renseigner')}
        </h3>
        <div className="preview-options">
          {question.options.map((option, index) => {
            const isCorrect = question.correctAnswers.includes(option.id);

            return (
              <div
                className={`preview-option ${isCorrect ? 'correct' : ''}`}
                key={option.id}
              >
                <span className="answer-letter">{LETTERS[index]}</span>
                <span>
                  {option.text ||
                    (question.source === 'image'
                      ? 'Choix dans l’image'
                      : 'Proposition à renseigner')}
                </span>
                {isCorrect && <strong>Bonne réponse</strong>}
              </div>
            );
          })}
        </div>
        {question.explanation && (
          <p className="preview-explanation">{question.explanation}</p>
        )}
        <div className="modal-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onClose}
          >
            Continuer la modification
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={onConfirm}
          >
            Confirmer
          </button>
        </div>
      </section>
    </div>
  );
}

function SeriesDialog({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="confirm-modal series-modal"
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="series-dialog-title"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Fermer"
        >
          <Icon name="close" size={19} />
        </button>
        <div className="modal-icon">
          <Icon name="plus" size={22} />
        </div>
        <h2 id="series-dialog-title">Créer une série</h2>
        <p>Chaque série contient exactement 40 emplacements de questions.</p>
        <label className="field-label">
          Titre de la série
          <input
            required
            autoFocus
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ex. Priorités et intersections"
            maxLength={80}
          />
        </label>
        <label className="field-label">
          Description
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Présentez ce parcours…"
            rows="3"
            maxLength={220}
          />
        </label>
        <div className="modal-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onClose}
          >
            Annuler
          </button>
          <button className="button button-primary" type="submit">
            Créer la série <Icon name="arrowRight" size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
