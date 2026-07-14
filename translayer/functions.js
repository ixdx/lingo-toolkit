// Функция разбивает текст на фрагменты, затем собирает из фрагментов страницы
// Страница собирается последовательной вставкой фрагментов, до момента превышения лимита символов
// В результате выдает массив собранных страниц
function splitTextIntoPages(text, limit) {
  //const sentenceRegex = /[^.!?…]+([.!?…]+\s*)+[»"'\)»]*/g; // предложения
  const sentenceRegex = /[^\n]+(?:\r?\n(?![ \t]*\r?\n)[^\n]*)*/g; // абзацы
  
  const sentences = text.match(sentenceRegex);
  const pages = [];
  let currentPage = "";

  for (const sentence of sentences) {
    if ((currentPage).length > limit && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = sentence;
    } else {
      currentPage += sentence;
    }
  }

  if (currentPage) pages.push(currentPage.trim());
  return pages;
}

// Структура словаря
/* let dictionary = {
	  "cards": [
	  ],
	  "notes": [
	  ]	
   }; */


function wrapText(text, dict) {
    const bB = '(?<![\\p{L}\\p{N}])', bA = '(?![\\p{L}\\p{N}])';
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const phrases = (dict.cards || []).filter(c => c.type === 'phrase');
    const words = (dict.cards || []).filter(c => c.type === 'word');
    // 1. Оборачиваем фразы
    const pKeys = [...phrases].sort((a, b) => b.front.length - a.front.length);
    let html = text;
    if (pKeys.length > 0) {
        const pRegex = new RegExp(`${bB}(${pKeys.map(c => esc(c.front)).join('|')})${bA}`, 'giu');
        html = html.replace(pRegex, (m) => {
            const card = pKeys.find(c => c.front.toLowerCase() === m.toLowerCase());
			return `<span class="tag-phrase" data-id="${card.id}" data-tooltip="${card.back}" data-value="${m}">${m}</span>`;
        });
    }
    // 2. Обрабатываем всё остальное: разбиваем на токены (слова и не-слова)
    return html.replace(/(<[^>]+>|[^<]+)/g, (match) => {
        if (match.startsWith('<')) return match;
        // Регулярка находит слова (буквы Unicode)
        return match.replace(/[\p{L}\p{N}-]+/gu, (m) => {
			const lowM = m.toLowerCase();
            const card = words.find(c => c.front.toLowerCase() === lowM);
            if (card) {
				return `<span class="tag-word" data-id="${card.id}" data-tooltip="${card.back}">${m}</span>`;
            }
            // Если слова нет в словаре - делаем его просто кликабельным
            return `<span class="clickable-word">${m}</span>`;
        });
    });
}