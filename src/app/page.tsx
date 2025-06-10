'use client';

import { useState, useEffect } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  created_at: string;
  slug: string;
}

type SortOption = 'date-newest' | 'date-oldest' | 'title-asc' | 'title-desc' | 'author-asc' | 'tags-asc';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        setError('Failed to load articles');
      }
    } catch (err) {
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const sortArticles = (articles: Article[], sortOption: SortOption): Article[] => {
    const sorted = [...articles].sort((a, b) => {
      switch (sortOption) {
        case 'date-newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author-asc':
          return a.author.localeCompare(b.author);
        case 'tags-asc':
          const aFirstTag = a.tags.length > 0 ? a.tags[0].toLowerCase() : '';
          const bFirstTag = b.tags.length > 0 ? b.tags[0].toLowerCase() : '';
          return aFirstTag.localeCompare(bFirstTag);
        default:
          return 0;
      }
    });
    return sorted;
  };

  const sortedArticles = sortArticles(articles, sortBy);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to BlogNetwork</h1>
        <p>Discover amazing articles from our community of writers</p>
      </div>

      {articles.length > 0 && (
        <div className="sort-controls">
          <label htmlFor="sort-select" className="sort-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="sort-select"
          >
            <option value="date-newest">Date (Newest First)</option>
            <option value="date-oldest">Date (Oldest First)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="author-asc">Author (A-Z)</option>
            <option value="tags-asc">Tags (A-Z)</option>
          </select>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {articles.length === 0 && !error ? (
        <div className="no-articles">
          <h2>No articles yet</h2>
          <p>Be the first to create an article!</p>
          <a href="/create" className="create-first-article">
            Create Your First Article
          </a>
        </div>
      ) : (
        <div className="articles-grid">
          {sortedArticles.map((article) => (
            <article key={article.id} className="article-card">
              <div className="article-header">
                <h2 className="article-title">
                  <a href={`/article/${article.id}`} className="article-title-link">
                    {article.title}
                  </a>
                </h2>
                <div className="article-meta">
                  <span className="article-author">By {article.author}</span>
                  <span className="article-date">{formatDate(article.created_at)}</span>
                </div>
              </div>
              
              <div className="article-content">
                <p>{truncateContent(article.content)}</p>
              </div>
              
              <div className="article-footer">
                <div className="article-info">
                  {article.category && (
                    <span className="article-category">{article.category}</span>
                  )}
                  {article.tags.length > 0 && (
                    <div className="article-tags">
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 2 && (
                        <span className="tag-more">+{article.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <a href={`/article/${article.id}`} className="read-more">
                  Read More →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
