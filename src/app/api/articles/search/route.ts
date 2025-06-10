import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string | null;
  tags: string[];
  created_at: string;
  slug: string;
}

function readArticles(): Article[] {
  try {
    if (!fs.existsSync(ARTICLES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ARTICLES_FILE, 'utf8');
    const articles = JSON.parse(data);
    
    // Ensure created_at field exists (convert createdAt if needed)
    return articles.map((article: any) => ({
      ...article,
      created_at: article.created_at || article.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error reading articles:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const articles = readArticles();
    const queryLower = query.toLowerCase();

    // Search in multiple fields
    const matchingArticles = articles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(queryLower);
      const contentMatch = article.content.toLowerCase().includes(queryLower);
      const authorMatch = article.author.toLowerCase().includes(queryLower);
      const categoryMatch = article.category && article.category.toLowerCase().includes(queryLower);
      const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(queryLower));

      return titleMatch || contentMatch || authorMatch || categoryMatch || tagMatch;
    });

    // Sort by relevance (title matches first, then content, then others)
    const sortedResults = matchingArticles.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Prioritize title matches
      if (aTitle.includes(queryLower) && !bTitle.includes(queryLower)) return -1;
      if (!aTitle.includes(queryLower) && bTitle.includes(queryLower)) return 1;
      
      // Then by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      articles: sortedResults,
      total: sortedResults.length,
      query: query
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    );
  }
} 