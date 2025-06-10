import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Search in multiple fields using Supabase's full-text search and ILIKE for partial matches
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase search error:', error);
      return NextResponse.json(
        { error: 'Failed to search articles' },
        { status: 500 }
      );
    }

    // Also search in tags (array field requires different approach)
    const { data: tagArticles, error: tagError } = await supabase
      .from('articles')
      .select('*')
      .contains('tags', [query])
      .order('created_at', { ascending: false });

    if (tagError) {
      console.error('Supabase tag search error:', tagError);
    }

    // Combine results and remove duplicates
    const allResults = [...(articles || [])];
    if (tagArticles) {
      tagArticles.forEach(tagArticle => {
        if (!allResults.some(article => article.id === tagArticle.id)) {
          allResults.push(tagArticle);
        }
      });
    }

    // Sort by relevance (title matches first, then content, then others)
    const sortedResults = allResults.sort((a, b) => {
      const queryLower = query.toLowerCase();
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