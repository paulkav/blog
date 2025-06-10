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

function writeArticles(articles: Article[]): void {
  try {
    const dir = path.dirname(ARTICLES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
  } catch (error) {
    console.error('Error writing articles:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const article = await request.json();
    
    // Validate required fields
    if (!article.title || !article.content || !article.author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }

    // Read existing articles
    const articles = readArticles();

    // Prepare new article data
    const newArticle: Article = {
      id: Date.now().toString(),
      title: article.title.trim(),
      content: article.content.trim(),
      author: article.author.trim(),
      category: article.category || null,
      tags: article.tags ? article.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
      created_at: new Date().toISOString(),
      slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };

    // Add new article to the beginning of the array
    articles.unshift(newArticle);

    // Write back to file
    writeArticles(articles);

    return NextResponse.json({ 
      message: 'Article created successfully',
      article: newArticle 
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const articles = readArticles();
    
    // Sort by created_at descending (newest first)
    articles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
} 