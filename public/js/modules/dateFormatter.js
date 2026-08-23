  /**
   * Format published date to be human-readable
   * Handles various date formats and formats them appropriately
   * @param {string} dateString - The date string to format
   * @returns {string} Formatted date string
   */
  function formatPublishedDate(dateString) {
    if (!dateString) return "Unknown publication date";
    
    // Handle various date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's just a year, return it as is
      if (/^\d{4}$/.test(dateString)) {
        return dateString;
      }
      return dateString; // Return original if we can't parse it
    }
    
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    
    // If the date is January 1st or has no specific day/month, just show year
    if (date.getMonth() === 0 && date.getDate() === 1) {
      // Check if the original string was just a year
      if (/^\d{4}$/.test(dateString)) {
        return dateString;
      }
      return `${month} ${year}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Use DOM to format all published dates on the page
    document.addEventListener('DOMContentLoaded', () => {
        const dateElements = document.querySelectorAll('.published-date');
        dateElements.forEach((element) => {
            const dateString = element.textContent;
            element.textContent = formatPublishedDate(dateString);
        });
    });