// инпуты
addEvent('dictionary-filter', 'input', updateDictionary);

// кнопки
addEvent('open-text-btn', 'click', openText);
addEvent('open-dictionary-btn', 'click', openDictionary);
addEvent('save-dictionary-as-btn', 'click', saveDictionaryAs);
addEvent('split-pages-btn', 'click', splitPages);

// переключатель страниц
addEvent('first-btn', 'click', firstPage);
addEvent('prev-btn', 'click', prevPage);
addEvent('num-page', 'change', (event) => setPage(event.target.value - 1));
addEvent('next-btn', 'click', nextPage);
addEvent('last-btn', 'click', lastPage);

// форма редактирования
addEvent('edit-form', 'submit', (event) => {
  event.preventDefault();
  saveEntry();
});
addEvent('edit-form-cancel-btn', 'click', closeEdit);
addEvent('edit-target', 'click', (event) => {
	if (!event.target.innerText) return; 
    navigator.clipboard.writeText(event.target.innerText)
        .catch(err => console.error('Ошибка копирования: ', err));
});

// чекбоксы
addEvent('show-word-hint', 'change', (event) => {
  const display = event.target.checked ? 'block' : 'none';
  updateVar('hint-word-display', display, '');
});
addEvent('show-phrase-hint', 'change', (event) => {
  const display = event.target.checked ? 'block' : 'none';
  updateVar('hint-phrase-display', display, '');
});

// ползунки
addEvent('text-size', 'input', (event) => updateVar('text-size', event.target.value, 'px'));
addEvent('tag-size', 'input', (event) => updateVar('tag-size', event.target.value, 'px'));

// блок текста
addEvent('result', 'mouseup', handleSelection);



addEvent('result', 'click', (event) => {
  if (!window.getSelection()?.isCollapsed) return;

  const wordTag = event.target.closest('.tag-word, .clickable-word');
  if (wordTag) {
    const selectedWord = wordTag.textContent.trim();
    if (selectedWord.length > 0) {
		openEdit(selectedWord, false, event);
	}
    return;
  }

  const phraseTag = event.target.closest('.tag-phrase');
  if (phraseTag) {
    const m = phraseTag.getAttribute('data-value');
    openEdit(m, true, event);
    return;
  }
});

// Обработка окончания выделения текста (когда отпустили мышь)
addEvent(undefined, 'mouseup', (event) => {
  const selection = window.getSelection();
  // Проверяем, что текст действительно выделен (выделение не «захлопнуто»)
  if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
    const container = document.getElementById('result');
    
    // Проверяем, что выделение было сделано именно внутри нашего контейнера
    if (container && container.contains(selection.anchorNode)) {
      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        // Передаем event, чтобы функция могла использовать его как запасной вариант для координат
        openEdit(selectedText, false, event);
      }
    }
  }	
});

