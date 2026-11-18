import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate.js';
import ArticleCover from './ArticleCover.jsx';

export default function ArticleCard({ article, titleAs = 'h3' }) {
  const Heading = titleAs;
  const titleId = `article-title-${article.id}`;

  return (
    <Link
      className="article-card"
      to={`/artikel/${article.slug}`}
      aria-labelledby={titleId}
    >
      <ArticleCover
        src={article.cover_image_url}
        title={article.title}
        className="article-card__cover"
      />

      <div className="article-card__body">
        <p className="article-card__meta">
          {article.published_at ? (
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          ) : (
            <span>Artikel</span>
          )}
        </p>

        <Heading className="article-card__title" id={titleId}>
          {article.title}
        </Heading>

        {article.excerpt ? (
          <p className="article-card__excerpt">{article.excerpt}</p>
        ) : (
          <p className="article-card__excerpt article-card__excerpt--muted">
            Buka artikel untuk membaca selengkapnya.
          </p>
        )}

        <span className="article-card__link" aria-hidden="true">
          Baca artikel <span>→</span>
        </span>
      </div>
    </Link>
  );
}
