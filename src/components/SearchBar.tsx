'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

interface SearchResult {
  articles: Article[];
  total: number;
  query: string;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle clicks outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(query.trim())}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setShowResults(true);
      } else {
        console.error('Search failed');
        setSearchResults(null);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search - wait 300ms after typing stops
    timeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      performSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSearchQuery('');
      setSearchResults(null);
    }
  };

  const handleArticleClick = (articleId: string) => {
    setShowResults(false);
    setSearchQuery('');
    setSearchResults(null);
    router.push(`/article/${articleId}`);
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-container" ref={searchRef}>
      <input 
        type="text" 
        placeholder="Search articles..." 
        className="search-input"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => searchResults && setShowResults(true)}
      />
      <button 
        className="search-button"
        onClick={() => performSearch(searchQuery)}
        disabled={isSearching}
      >
        {isSearching ? (
          <div className="search-spinner"></div>
        ) : (
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        )}
      </button>

      {showResults && (
        <div className="search-results">
          {searchResults ? (
            <>
              <div className="search-results-header">
                <span className="search-results-count">
                  {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for &quot;{searchResults.query}&quot;
                </span>
              </div>
              
              {searchResults.articles.length > 0 ? (
                <div className="search-results-list">
                  {searchResults.articles.slice(0, 5).map((article) => (
                    <div 
                      key={article.id} 
                      className="search-result-item"
                      onClick={() => handleArticleClick(article.id)}
                    >
                      <h4 className="search-result-title">
                        {highlightText(article.title, searchResults.query)}
                      </h4>
                      <p className="search-result-content">
                        {highlightText(truncateContent(article.content), searchResults.query)}
                      </p>
                      <div className="search-result-meta">
                        <span className="search-result-author">
                          by {highlightText(article.author, searchResults.query)}
                        </span>
                        {article.category && (
                          <span className="search-result-category">
                            {highlightText(article.category, searchResults.query)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {searchResults.articles.length > 5 && (
                    <div className="search-results-more">
                      +{searchResults.articles.length - 5} more results
                    </div>
                  )}
                </div>
              ) : (
                <div className="search-no-results">
                  <p>No articles found for &quot;{searchResults.query}&quot;</p>
                  <p>Try searching with different keywords.</p>
                </div>
              )}
            </>
          ) : (
            <div className="search-loading">
              Searching...
            </div>
          )}
        </div>
      )}
    </div>
  );
} 