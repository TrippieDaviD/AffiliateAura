


export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
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