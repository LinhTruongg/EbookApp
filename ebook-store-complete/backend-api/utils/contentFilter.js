const sensitiveWords = ['chó', 'khốn', 'má', 'vl', 'cc'];

const containsSensitiveWords = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const normalizedText = text.toLowerCase().trim();
  
  return sensitiveWords.some(word => {
    const normalizedWord = word.toLowerCase();
    const escapedWord = normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|[^\\w])${escapedWord}(\\s|[^\\w]|$)`, 'i');
    return regex.test(normalizedText);
  });
};

module.exports = {
  containsSensitiveWords,
  sensitiveWords
};

