export default function ArticleCardSkeleton() {
  return (
    <div className="article-card article-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--cover" />
      <div className="article-card__body">
        <div className="skeleton skeleton--line skeleton--date" />
        <div className="skeleton skeleton--line skeleton--title" />
        <div className="skeleton skeleton--line skeleton--title skeleton--title-short" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--line-short" />
      </div>
    </div>
  );
}
