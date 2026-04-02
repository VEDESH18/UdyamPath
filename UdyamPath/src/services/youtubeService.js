const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

export async function getRecommendedVideos(searchTerms = [], language = 'en') {
  if (!YOUTUBE_API_KEY) {
    return getMockVideos();
  }

  const langMap = { en: 'en', hi: 'hi', te: 'te', ta: 'ta' };
  const hl = langMap[language] || 'en';

  try {
    const query = [...searchTerms, 'India startup'].join(' ');
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(query)}&type=video&relevanceLanguage=${hl}&regionCode=IN&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) return getMockVideos();

    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (err) {
    console.error('YouTube API error:', err);
    return getMockVideos();
  }
}

function getMockVideos() {
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: 'How to Start a Social Startup in India — Complete Guide 2024',
      channel: 'Startup India Official',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      description: 'Step-by-step guide to building a registered social enterprise in India.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      id: 'BHACKCNDMW8',
      title: 'Fundraising for NGOs in India — PM YUVA, CSR Funds & More',
      channel: 'Social Entrepreneur India',
      thumbnail: 'https://img.youtube.com/vi/BHACKCNDMW8/mqdefault.jpg',
      description: 'Every fundraising option available to Indian social startups in 2024.',
      url: 'https://www.youtube.com/watch?v=BHACKCNDMW8',
    },
    {
      id: 'mEsrXw5wEMc',
      title: 'Team Building for Early Stage Startups — Indian Context',
      channel: 'THub Learning',
      thumbnail: 'https://img.youtube.com/vi/mEsrXw5wEMc/mqdefault.jpg',
      description: 'How to recruit, retain, and motivate volunteers and early team members.',
      url: 'https://www.youtube.com/watch?v=mEsrXw5wEMc',
    },
    {
      id: 'vN4U5FqrOdQ',
      title: 'Community Engagement Strategies for Social Impact Startups',
      channel: 'Impact Investors Network',
      thumbnail: 'https://img.youtube.com/vi/vN4U5FqrOdQ/mqdefault.jpg',
      description: 'How to build genuine community trust and long-lasting engagement.',
      url: 'https://www.youtube.com/watch?v=vN4U5FqrOdQ',
    },
    {
      id: 'oHg5SJYRHA0',
      title: 'Registering Your NGO or Section 8 Company in India',
      channel: 'Enactus India',
      thumbnail: 'https://img.youtube.com/vi/oHg5SJYRHA0/mqdefault.jpg',
      description: 'Legal structures for your social enterprise explained simply.',
      url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Pitch Your Social Startup to Impact Investors',
      channel: 'Villgro Innovation',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
      description: 'What impact investors look for and how to build your pitch.',
      url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    },
  ];
}
