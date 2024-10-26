document.getElementById('generate-password').addEventListener('click', generatePassword);

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
*/

function generatePassword() {
    const length = document.getElementById('length').value;

    if(length <= 3){
        document.getElementById('password').value = `Գաղտնաբառը պետք է լինի ավելի մեծ քան ${length} (մինիմում: 4)`           
    }
    else{
        const includeUppercase = document.getElementById('uppercase').checked;
        const includeNumbers = document.getElementById('numbers').checked;
        const includeSpecialChars = document.getElementById('specialChars').checked;

        let chars = 'abcdefghijklmnopqrstuvwxyz';
        let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let numbers = '0123456789';
        let specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (includeUppercase) chars += uppercaseChars;
        if (includeNumbers) chars += numbers;
        if (includeSpecialChars) chars += specialChars;

        const passwordArray = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);
        const password = passwordArray.join('');

        document.getElementById('password').value = password;
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomNumber() {
    const minInput = document.getElementById('minInput');
    const maxInput = document.getElementById('maxInput');
    const resultElement = document.getElementById('result');

    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);

    if (isNaN(min) || isNaN(max)) {
        resultElement.textContent = 'Մուտքագրեք վավեր արժեքներ միջակայքի համար:';
    } else if (min >= max) {
        resultElement.textContent = 'Նվազագույն արժեքը պետք է լինի առավելագույնից պակաս:';
    } else {
        const randomNum = getRandomNumber(min, max);
        resultElement.textContent = `Ստեղծված թիվը ${randomNum}`;
    }
}

function getCurrencyRates() {
    return fetch('data/currency_rates.json')
        .then(response => response.json());
}

function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    if (fromRate && toRate) {
        const convertedAmount = (amount / fromRate) * toRate;
        return convertedAmount.toFixed(2);
    } else {
        return 'Հնարավոր չէ փոխարկել: Խնդրում ենք ստուգել մուտքագրված տվյալները։';
    }
}

function updateCurrencyOptions() {
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    getCurrencyRates()
        .then(rates => {
            for (const currency in rates) {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                fromCurrencySelect.appendChild(option.cloneNode(true));
                toCurrencySelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Փոխարժեքներ ստանալիս սխալ.', error);
        });
}

function updateResult() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    getCurrencyRates()
        .then(rates => {
            const result = convertCurrency(amount, fromCurrency, toCurrency, rates);
            document.getElementById('result_converter').innerText = `${amount} ${fromCurrency} = ${result} ${toCurrency}`;
        })
        .catch(error => {
            console.error('Փոխարժեքներ ստանալիս սխալ.', error);
        });
}

document.getElementById('converterForm').addEventListener('submit', function (event) {
    event.preventDefault();
    updateResult();
});

let timerInterval;
let timeElapsed = 0;

document.getElementById('start-timer').addEventListener('click', startTimer);
document.getElementById('pause-timer').addEventListener('click', pauseTimer);
document.getElementById('stop-timer').addEventListener('click', stopTimer);
document.getElementById('save-timer').addEventListener('click', saveTime);

function startTimer() {
    if (!timerInterval) {
        const startTime = Date.now() - timeElapsed;
        timerInterval = setInterval(() => {
            timeElapsed = Date.now() - startTime;
            updateTimerDisplay();
        }, 1);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function stopTimer() {
    pauseTimer();
    timeElapsed = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const milliseconds = timeElapsed % 1000;
    const seconds = Math.floor(timeElapsed / 1000) % 60;
    const minutes = Math.floor(timeElapsed / (1000 * 60)) % 60;
    const hours = Math.floor(timeElapsed / (1000 * 60 * 60));
    document.getElementById('timer-display').innerText = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${padMilliseconds(milliseconds)}`;
}

function pad(number) {
    return number < 10 ? '0' + number : number;
}

function padMilliseconds(number) {
    if (number < 10) {
        return '00' + number;
    } else if (number < 100) {
        return '0' + number;
    } else {
        return number;
    }
}

let savedTimes = JSON.parse(localStorage.getItem('savedTimes')) || [];

function saveTime() {
    const currentTimer = document.getElementById('timer-display').innerText;
    savedTimes.push(currentTimer);
    localStorage.setItem('savedTimes', JSON.stringify(savedTimes));
    displaySavedTimes();
}

function displaySavedTimes() {
    const savedTimesList = document.getElementById('saved-times-list');
    savedTimesList.innerHTML = 'Ժամաչափի պատմություն.<br>';

    savedTimes.forEach((time, index) => {
        savedTimesList.innerHTML += `
            <div id="time-${index}">
                ${index + 1}. ${time}
                <button onclick="deleteTime(${index})">Ջնջել</button>
            </div>
        `;
    });
}

function deleteTime(index) {
    savedTimes.splice(index, 1);
    localStorage.setItem('savedTimes', JSON.stringify(savedTimes));
    displaySavedTimes();
}

window.onload = () => {
    displaySavedTimes();
    updateTimerDisplay();
    updateCurrencyOptions()
};

const notesContainer = document.getElementById('_notes-container');
const createNoteButton = document.getElementById('create-note');
const modal = document.getElementById('note-modal');
const saveNoteButton = document.getElementById('save-note');
const cancelNoteButton = document.getElementById('cancel-note');
const noteTextarea = document.getElementById('note-text');
let currentEditingId = null;

function showModal(editing = false) {
    modal.style.display = 'block';
    noteTextarea.value = '';
    noteTitleInput.value = '';
    document.getElementById('delete-note').style.display = editing ? 'inline-block' : 'none';
}

function hideModal() {
    modal.style.display = 'none';
}

createNoteButton.onclick = () => showModal();
saveNoteButton.onclick = saveNote;
cancelNoteButton.onclick = hideModal;

const noteTitleInput = document.getElementById('note-title-input');



function saveNote() {
    const noteText = noteTextarea.value.trim();
    const noteTitle = noteTitleInput.value.trim();
    if (noteText && noteTitle) {
        let notes = getNotesFromStorage();
        const noteData = { id: Date.now(), title: noteTitle, text: noteText };
        
        if (currentEditingId !== null) {
            const index = notes.findIndex(note => note.id === currentEditingId);
            if (index !== -1) {
                notes[index] = { ...noteData, id: currentEditingId };
            }
        } else {
            notes.push(noteData);
        }
        
        try {
            localStorage.setItem('notes', JSON.stringify(notes));
            updateNotesUI();
        } catch (error) {
            console.error('Նշումները պահելու սխալ.', error);
        }
    }
    hideModal();
    currentEditingId = null;
}

function createNoteElement(noteData) {
    const noteElement = document.createElement('div');
    noteElement.dataset.id = noteData.id; 

    const noteIcon = document.createElement('div');
    noteIcon.classList.add('note-icon');
    noteElement.appendChild(noteIcon);

    const noteTitle = document.createElement('div');
    noteTitle.classList.add('note-title');
    noteTitle.textContent = noteData.title || `Գրառում ${noteData.id}`;
    noteElement.appendChild(noteTitle);

    noteElement.onclick = () => openNote(noteData.id);

    return noteElement;
}

function openNote(id) {
    currentEditingId = id;
    showModal(true);
    let notes = getNotesFromStorage();
    const noteData = notes.find(note => note.id === id);
    if (noteData) {
        noteTitleInput.value = noteData.title;
        noteTextarea.value = noteData.text;
    }
    document.getElementById('delete-note').onclick = () => deleteNote(id);
}

function deleteNote(id) {
    let notes = getNotesFromStorage();
    const index = notes.findIndex(note => note.id === id);
    if (index !== -1) {
        const elementToDelete = document.querySelector(`[data-id="${id}"]`);
        if (elementToDelete) {
            elementToDelete.remove();
        }
        notes.splice(index, 1);
        try {
            localStorage.setItem('notes', JSON.stringify(notes));
        } catch (error) {
            console.error('Սխալ՝ գրառումը ջնջելիս.', error);
        }
    }
    hideModal();
}

document.addEventListener('DOMContentLoaded', () => {
    const notes = getNotesFromStorage();
    notes.forEach(noteData => {
        const noteElement = createNoteElement(noteData); 
        notesContainer.appendChild(noteElement);
    });
});

function updateNotesUI() {
    notesContainer.innerHTML = '';
    let notes = getNotesFromStorage();
    notes.forEach(noteData => {
        addNoteToUI(noteData);
    });
}

function addNoteToUI(noteData) {
    const noteElement = createNoteElement(noteData);
    notesContainer.appendChild(noteElement);
}

function getNotesFromStorage() {
    try {
        const notes = JSON.parse(localStorage.getItem('notes'));
        return notes || [];
    } catch (error) {
        console.error('Նշումներ կարդալիս սխալ.', error);
        return [];
    }
}