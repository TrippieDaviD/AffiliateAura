// Helper functions for the application

// Create page URL based on page name
export function createPageUrl(pageName) {
  const pageUrlMap = {
    "Dashboard": "/dashboard",
    "CreateLink": "/create-link",
    "Partnerships": "/partnerships",
    "BusinessPartnership": "/business-partnership",
    "BusinessDirectory": "/business-directory",
    "AdminPanel": "/admin-panel",
    "Settings": "/settings",
    "About": "/about"
  };
  
  return pageUrlMap[pageName] || "/";
}

// Extract business information from notes
export function extractBusinessInfo(notes) {
  try {
    if (!notes) return {};
    const info = {};
    const lines = notes ? notes.split('\n') : [];
    lines.forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    });
    return info;
  } catch (error) {
    console.error("Error parsing business info:", error);
    return {};
  }
}