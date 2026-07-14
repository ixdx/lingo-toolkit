async function openJSON_old() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] }
            }],
            multiple: false
        });

        const file = await fileHandle.getFile();
        const content = await file.text();
        data = JSON.parse(content);
		fileName = file.name;

		return [data, fileName]
	} catch (err) {
		console.error("Полная ошибка:", err.name, err.message);
	}
}

async function openTXT_old() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'TZT Files',
                accept: { 'application/txt': ['.txt'] }
            }],
            multiple: false
        });

        const file = await fileHandle.getFile();
        data = await file.text();
		fileName = file.name;
		return [data, fileName];
	} catch (err) {
		console.error("Полная ошибка:", err.name, err.message);
	}
}




async function openJSON() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return resolve(null); 
            }

            try {
                const content = await file.text();
                const data = JSON.parse(content);
                const fileName = file.name;
                resolve([data, fileName]);
            } catch (err) {
                console.error("Ошибка чтения JSON:", err.name, err.message);
                reject(err);
            }
        };
        input.oncancel = () => resolve(null);
        input.click();
    });
}

async function openTXT() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return resolve(null);
            }
            try {
                const data = await file.text();
                const fileName = file.name;
                resolve([data, fileName]);
            } catch (err) {
                console.error("Ошибка чтения TXT:", err.name, err.message);
                reject(err);
            }
        };
        input.oncancel = () => resolve(null);
        input.click();
    });
}


