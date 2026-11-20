/**
 * Safely escape regular expression special characters to prevent regex injection / ReDoS
 * @param {string} string
 * @returns {string}
 */
function escapeRegex(string) {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  escapeRegex
};
