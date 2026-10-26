import { Icon, StatusPill } from '../Dashboard/shared';
import { isQuestionComplete, QUESTION_COUNT } from '../utils/quiz';

export default function SeriesDashboard({
  series,
  progress,
  onStart,
  onManage,
}) {
 
  return (
    <main className="page-shell">

      

      <section className="series-section">
        <div className="section-heading">
          
          <button
            className="button button-secondary"
            type="button"
            onClick={onManage}
          >
            <Icon name="plus" size={17} />
            Gérer les séries
          </button>
        </div>

        {series.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="book" size={24} />
            </div>
            <h3>Votre prochaine réussite commence ici</h3>
            <p>Créez une série de 40 questions pour lancer votre entraînement.</p>
            <button
              className="button button-primary"
              type="button"
              onClick={onManage}
            >
              <Icon name="plus" size={17} />
              Créer ma première série
            </button>
          </div>
        ) : (
          <div className="series-grid">
            {series.map((item, index) => {
              const saved = progress[item.id];
              const answered =
                saved?.answers?.filter((answers) => answers?.length).length || 0;
              const percent = Math.round((answered / QUESTION_COUNT) * 100);
              const complete =
                item.questions.length === QUESTION_COUNT &&
                item.questions.every(isQuestionComplete);

              return (
                <article className="series-card" key={item.id}>
                  <div className="card-topline">
                    <span className="series-icon">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <StatusPill tone={complete ? 'green' : 'amber'}>
                      {complete ? 'Prête à jouer' : 'En préparation'}
                    </StatusPill>
                  </div>

                  <div className="series-category">
                    {item.category || 'Code de la route'}
                  </div>
                  <h3>{item.title}</h3>
                  <p className="series-description">
                    {item.description ||
                      'Votre parcours de révision personnalisé.'}
                  </p>

                  <div className="series-meta">
                    <span>
                      <Icon name="book" size={16} />
                      {item.questions.length} questions
                    </span>
                    <span>
                      <Icon name="clock" size={16} />
                      ~ 20 min
                    </span>
                  </div>

                  <div className="series-progress">
                    <div className="progress-label">
                      <span>Votre progression</span>
                      <strong>{percent}%</strong>
                    </div>
                    <div className="progress-track">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <button
                    className="button button-card"
                    type="button"
                    onClick={() => onStart(item)}
                    disabled={!complete}
                    title={
                      complete
                        ? undefined
                        : 'Complétez les 40 questions dans la gestion pour démarrer.'
                    }
                  >
                    {saved && answered
                      ? 'Reprendre la série'
                      : 'Commencer la série'}
                    <Icon name="arrowRight" size={17} />
                  </button>
                  {!complete && (
                    <div className="card-hint">
                      Complétez les questions dans la gestion pour commencer.
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="page-footer">
        <span>amine06abdli@gmail.com</span>
        <span>$ amine abdli $</span>
      </footer>
    </main>
  );
}
