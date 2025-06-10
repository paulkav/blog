'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (articleId: string) => {
    try {
      const response = await fetch('/api/articles');
      if (response.ok) {
        const articles = await response.json();
        const foundArticle = articles.find((a: Article) => a.id === articleId);
        if (foundArticle) {
          setArticle(foundArticle);
        } else {
          setError('Article not found');
        }
      } else {
        setError('Failed to load article');
      }
    } catch (err) {
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="article-page-container">
        <div className="loading">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-page-container">
        <div className="error-message">
          {error || 'Article not found'}
        </div>
        <a href="/" className="back-button">
          ← Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="article-page-container">
      <nav className="article-nav">
        <a href="/" className="back-button">
          ← Back to Home
        </a>
      </nav>

      <article className="full-article">
        <header className="full-article-header">
          <h1 className="full-article-title">{article.title}</h1>
          
          <div className="full-article-meta">
            <div className="meta-left">
              <span className="full-article-author">By {article.author}</span>
              <span className="full-article-date">{formatDate(article.created_at)}</span>
            </div>
            {article.category && (
              <span className="full-article-category">{article.category}</span>
            )}
          </div>

          {article.tags.length > 0 && (
            <div className="full-article-tags">
              {article.tags.map((tag, index) => (
                <span key={index} className="full-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="full-article-content">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
} 