const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || '';

export async function fetchNews(query) {
  if (!GNEWS_API_KEY) {
    return getMockNews();
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=5&apikey=${GNEWS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.articles) return getMockNews();
    return data.articles;
  } catch (err) {
    console.error('GNews API error:', err);
    return getMockNews();
  }
}

function getMockNews() {
  return [
    {
      title: 'Indian Social Startups See 40% Increase in Funding',
      description: 'Impact investors are doubling down on sustainable agriculture and rural tech solutions.',
      url: 'https://news.google.com',
      source: { name: 'Economic Times' }
    },
    {
       title: 'Government Launches New Grants for Tier-2 Founders',
       description: 'Founders outside top metros can now access collateral-free loans up to 50 Lakhs.',
       url: 'https://news.google.com',
       source: { name: 'Startup India' }
    }
  ];
}
