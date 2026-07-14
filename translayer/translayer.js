let dictionary = {
  "cards": [
  ],
  "notes": [
  ]
};

const root = document.documentElement;
let currentTargetStr = "";
let text = "";
let maxPageCharacters = 2000;
let pages = []
let currentPage = 0;


// Ссылки на внешние источники, чтобы можно было поглядеть дополнительную информацию по переводимому слову
// Предполагается вставлять их на форму редактирования словаря (edit-form), в функции openEdit
// Для компактности используем иконки вместо текстовых ссылок
const externalDictionaries = {
  forvo: (str) => `<a href="https://forvo.com/search/${str}" target="_blank"><img class="icon" src="common/images/forvo.ico"></a>`,
  wiktionary: (str, tag) => `<a href="https://wiktionary.org/wiki/${str}${tag}" target="_blank"><img class="icon" src="common/images/wictionary.ico"></a>`,
  googleTranslate: (str, sl, tl) => `<a href="https://translate.google.ru/?text=${str}&sl=${sl}&tl=${tl}" target="_blank"><img class="icon" src="common/images/google.ico"></a>`,
  yandexTranslate: (str, sl, tl) => `<a href="https://translate.yandex.ru/?text=${str}&source_lang=${sl}&target_lang=${tl}" target="_blank"><img class="icon" src="common/images/yandex.png"></a>`
};

// Функция обработки выделения текста
function handleSelection() {
    const selection = window.getSelection().toString().trim();
    // Если выделено больше одного слова (есть пробел)
    if (selection.length > 0 && (selection.includes(" ") || selection.includes("’"))) {
        openEdit(selection, true);
    }
}

function openEdit(str, isPhrase, event) {
	const form = document.getElementById('edit-form');
	const wictionaryTag = document.getElementById('wictionary-tag').value;
	const sourceLang = document.getElementById('slang').value;
	const targetLang = document.getElementById('tlang').value;
    currentTargetStr = str;
    const lowStr = str.toLowerCase();
	document.getElementById('extLinks').innerHTML = `${externalDictionaries.forvo(lowStr)} 
													${externalDictionaries.wiktionary(lowStr,wictionaryTag)} 
													${externalDictionaries.googleTranslate(lowStr, sourceLang, targetLang)} 
													${externalDictionaries.yandexTranslate(lowStr, sourceLang, targetLang)}`
    document.getElementById('edit-target').innerHTML = `${lowStr}`;
    const cardType = isPhrase ? 'phrase' : 'word';
    const existingCard = (dictionary.cards || []).find(c => c.front.toLowerCase() === lowStr && c.type === cardType);
	
	document.getElementById('editTitle').innerText = isPhrase ? "Правка фразы" : (existingCard ? "Правка слова" : "Новое слово");
    
	
    let currentVal = existingCard ? existingCard.back : "";

	document.getElementById('edit-form').style.display = 'block';
	const panelHeight = form.offsetHeight+44;
    document.getElementById('editValue').value = currentVal;
	
	const selection = window.getSelection();
	const range = selection.getRangeAt(0);
	const rect = range.getBoundingClientRect();
	const topPosition = (rect.top - panelHeight >= 0) ? rect.top - panelHeight : rect.bottom;

	// Центрируем по горизонтали
	const leftPosition = rect.left;
	document.getElementById('edit-form').style.top = topPosition+'px';
	document.getElementById('edit-form').style.left = leftPosition+'px';
	document.getElementById('editValue').focus(); 
}





function saveEntry() {
    const val = document.getElementById('editValue').value.trim();
    const lowStr = currentTargetStr.toLowerCase();
    
	const isPhrase = currentTargetStr.includes(" ") || currentTargetStr.includes("’");
    const cardType = isPhrase ? 'phrase' : 'word';
	
    if (!val) {
        dictionary.cards = dictionary.cards.filter(c => 
            !(c.front.toLowerCase() === lowStr && c.type === cardType)
        );
	}

    // Проверяем, фраза это или слово (по наличию пробелов или флагу из openEdit)
    else {
        const existingCard = dictionary.cards.find(c => 
            c.front.toLowerCase() === lowStr && c.type === cardType
        );

        if (existingCard) {
            // Если нашли — обновляем перевод
            existingCard.back = val;
        } else {
            // Если не нашли — создаем новую карточку с уникальным id
            dictionary.cards.push({
                id: Date.now(),
                type: cardType,
                front: currentTargetStr, // Сохраняем исходный регистр, как в оригинале
                back: val
            });
        }
	}
	updateDictionary();
    closeEdit();
    render();
}

function closeEdit() {
	document.getElementById('edit-form').style.display = 'none';
}

document.getElementById('page-size').addEventListener('input', (e) => {
	let pageLimit = document.getElementById('page-limit');
	pageLimit.innerHTML = e.target.value;
    maxPageCharacters = e.target.value;
});


async function openText() {
	[text, fileName] = await openTXT();
	pages = splitTextIntoPages(text, maxPageCharacters);
	setPageInput()
	setPage(0);
	updateFileName('text-file-name', fileName);
	render();
}

function splitPages(){
	pages = splitTextIntoPages(text, maxPageCharacters);
	setPageInput()
	setPage(0);
	render();
}

function updateFileName(tagID, name) {
  const tag = document.getElementById(tagID);
  if (tagID && name) {
    tag.textContent = name;
  } else {
    tag.textContent = "Файл не выбран";
  }
}


function updateDictionary() {
	const dictionaryList = document.getElementById('dictionary');
	const dictionaryFilter = document.getElementById('dictionary-filter').value;
    const filtered = dictionary.cards
        .filter(card => 
            card.front.toLowerCase().includes(dictionaryFilter) || 
            card.back.toLowerCase().includes(dictionaryFilter)
        )
        .sort((a, b) => a.front.localeCompare(b.front));
    dictionaryList.innerHTML = filtered
        .map(card => `<p><b>${card.front}:</b> ${card.back}</p>`)
        .join('');
}

// 1. ОТКРЫТЬ
async function openDictionary() {
    [dictionary, fileName] = await openJSON();
    updateFileName('dictionary-file-name', fileName);
	updateDictionary();
	document.getElementById('footnotes').value = dictionary.notes[0];
	document.getElementById('wictionary-tag').value = dictionary?.attributes?.wictionary || '';
	document.getElementById('slang').value = dictionary?.attributes?.slang || '';
	document.getElementById('tlang').value = dictionary?.attributes?.tlang || '';
	render();
}

/*
Откройте Настройки Firefox (нажмите Ctrl + , или три полоски в правом верхнем углу → Настройки).
На вкладке Основные прокрутите вниз до раздела «Файлы и приложения».
В строке «Загрузки» переключите точку на пункт:🔘 Всегда выдавать запрос на сохранение файлов
*/

async function saveDictionaryAs() {
	dictionary.attributes ??= {};
	dictionary.attributes.wictionary = document.getElementById('wictionary-tag').value;
	dictionary.attributes.slang = document.getElementById('slang').value;
	dictionary.attributes.tlang = document.getElementById('tlang').value;
	const notes = document.getElementById('footnotes').value;
    dictionary.notes = [];
    dictionary.notes[0] = notes;
    const jsonString = JSON.stringify(dictionary, null, 2);
    if ('showSaveFilePicker' in window) {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'dictionary.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            const writable = await fileHandle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            alert("Файл сохранен через File System API!");
        } catch (err) {
            console.log("Сохранение отменено пользователем в Chrome/Edge");
        }
    } else {
        // 3. Запасной вариант для Firefox и Safari
        try {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'dictionary.json';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(link.href);
            alert("Файл отправлен в загрузки (Firefox/Safari)!");
        } catch (err) {
            console.error("Ошибка скачивания в Firefox:", err);
        }
    }
}

function setPageInput(){
	const tag = document.getElementById("num-page");
	tag.setAttribute("max", pages.length);
}

function setPage(num){
	if (num >= 0 && num <= pages.length-1){ 
		currentPage = num;
	}
	const tag = document.getElementById("num-page");
	tag.value = currentPage+1;
	document.getElementById('result').scrollTo(0, 0);
	render();
}

function prevPage(){
	setPage(currentPage-1);
}

function nextPage(){
	setPage(currentPage+1);
}

function firstPage(){
	setPage(0);
}
function lastPage(){
	setPage(pages.length-1);
}

const panel = document.getElementById('dictionary-panel');
const btn = document.getElementById('toggle-dictionary-btn');

btn.addEventListener('click', () => {
  panel.classList.toggle('open');
});

function render() {
	//document.getElementById('result').innerHTML = wrapText(pages[currentPage], dictionary);  
	// Firefox не успевает обновлять элемент и иногда теряет положение прокрутки
	const resultEl = document.getElementById('result');
    const currentScrollTop = resultEl.scrollTop;
    resultEl.innerHTML = wrapText(pages[currentPage], dictionary);    
    resultEl.scrollTop = currentScrollTop;
}
