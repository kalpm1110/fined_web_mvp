import axios from 'axios';

let newsCache = {
  data: null,
  timestamp: null
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const getTopIndiaFinanceNews = async (req, res) => {
  try {
    const now = Date.now();
    if (newsCache.data && newsCache.timestamp && (now - newsCache.timestamp < CACHE_DURATION)) {
      console.log('Serving news from cache');
      return res.status(200).json(newsCache.data);
    }

    const apiKey = process.env.NEWS_API_KEY;
    console.log('News API Key detected:', apiKey ? `${apiKey.substring(0, 5)}...` : 'NONE');

    if (!apiKey || apiKey === 'your_key_here') {
      return res.status(500).json({ error: 'News API key is not configured.' });
    }

    let articles = [];

    // Support for NewsData.io (keys starting with pub_)
    if (apiKey.startsWith('pub_')) {
      console.log('Fetching from NewsData.io...');
      const response = await axios.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: apiKey,
          country: 'in',
          category: 'business',
          language: 'en'
        }
      });

      console.log('NewsData.io Response Status:', response.status);
      console.log('NewsData.io Full Response Data:', JSON.stringify(response.data, null, 2));

      if (!response.data || !response.data.results) {
        console.error('Unexpected response format from NewsData.io');
        return res.status(500).json({ error: 'Invalid response from NewsData.io' });
      }

      articles = response.data.results.slice(0, 8).map(article => ({
        title: article.title,
        description: article.description || article.content?.substring(0, 200) + '...',
        url: article.link,
        urlToImage: article.image_url,
        publishedAt: article.pubDate,
        source: {
          name: article.source_id || 'Financial News'
        }
      }));
    } else {
      // Support for NewsAPI.org
      console.log('Fetching from NewsAPI.org...');
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'in',
          category: 'business',
          pageSize: 8,
          apiKey: apiKey
        }
      });

      console.log('NewsAPI.org Response Status:', response.status);
      console.log('NewsAPI.org Full Response Data:', JSON.stringify(response.data, null, 2));

      articles = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name
        }
      }));
    }

    // Update Cache
    newsCache = {
      data: articles,
      timestamp: now
    };

    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching news:', error.response?.data || error.message);

    if (newsCache.data) {
      console.log('Serving stale news due to error');
      return res.status(200).json(newsCache.data);
    }

    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch news',
      details: error.response?.data?.message || error.message
    });
  }
};
