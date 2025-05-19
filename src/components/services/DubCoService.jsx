const DubCoService = {
  createLink: async function(destinationUrl, { customKey, title, description, tags = [] } = {}) {
    try {
      // Normalize the URL
      let normalizedUrl = destinationUrl;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // Generate key if not provided
      const key = customKey || Math.random().toString(36).substring(2, 8);

      // Make request to our backend function
      const response = await fetch('/api/dubcoCreateLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: normalizedUrl,
          key: key,
          title: title,
          description: description
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link');
      }

      // Return formatted response
      return {
        success: true,
        shortUrl: `https://go.affiliateaura.co/${key}`,
        linkId: key,
        sourceName: "Dub.co",
        originalUrl: normalizedUrl
      };
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  },

  getLinkStats: async function(linkId) {
    try {
      const response = await fetch('/api/dubcoGetStats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          key: linkId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      return {
        success: true,
        stats: {
          totalClicks: data.totalClicks || 0,
          locations: data.locations || [],
          devices: data.devices || [],
          browsers: data.browsers || [],
          referrers: data.referrers || []
        }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};

export default DubCoService;