// JavaScript υλοποίηση του αλγορίθμου LRU

let pages = [];
let frames = [];
let maxFrames;
let step = 0;
let table;
let resultText = document.getElementById('resultText');

let pageFrames = [];
let pageFaults = 0;
let hits = 0; // Μετατροπή σε καθολικές μεταβλητές

function initializeSimulation() {
    const pageInput = document.getElementById("pages").value.trim();
    maxFrames = parseInt(document.getElementById("frame-number").value);

    if (!isValidInput(pageInput, maxFrames)) {
        return;
    }

    pages = pageInput.split(',').map(Number);
    pageFrames = Array(maxFrames).fill(null); // Επαναφορά frames
    pageFaults = 0;
    hits = 0;
    lastUsed = new Map(); // Επαναφορά του χάρτη τελευταίας χρήσης
    step = 0;

    createTable();
}


function isValidInput(pageInput, maxFrames) {
    const pageArray = pageInput.split(',').map(num => num.trim());
    for (let page of pageArray) {
        if (isNaN(page) || page === "") {
            alert("Η ακολουθία σελίδων πρέπει να περιέχει μόνο έγκυρους αριθμούς διαχωρισμένους με κόμμα.");
            return false;
        }
    }
    if (isNaN(maxFrames) || maxFrames <= 0) {
        alert("Παρακαλώ εισάγετε έναν έγκυρο αριθμό πλαισίων.");
        return false;
    }
    return true; // Αν όλα είναι σωστά
}

function createTable() {
    const seekSequence = document.getElementById("seek-sequence");
    seekSequence.innerHTML = ''; // Καθαρισμός του πίνακα
    table = document.createElement("table");
    table.classList.add("visual-table");

    const headerRow = document.createElement("tr");
    const emptyHeader = document.createElement("th");
    headerRow.appendChild(emptyHeader);

    for (let i = 0; i < pages.length; i++) {
        const th = document.createElement("th");
        th.innerText = `T${i + 1}`;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    for (let i = 0; i < maxFrames; i++) {
        const frameRow = document.createElement("tr");
        const frameHeader = document.createElement("th");
        frameHeader.innerText = `Πλαίσιο ${i + 1}`;
        frameRow.appendChild(frameHeader);

        for (let j = 0; j < pages.length; j++) {
            const td = document.createElement("td");
            td.setAttribute("data-frame", i);
            td.setAttribute("data-step", j);
            frameRow.appendChild(td);
        }
        table.appendChild(frameRow);
    }

    seekSequence.appendChild(table);

  

    enableResetButton();
}

// Προβολή ενός βήματος της προσομοίωσης
function nextStep() {
    if (step === 0 && table) {
        initializeSimulation();
    }

    if (step < pages.length) {
        const page = pages[step];
        const pageTable = Array.from(table.getElementsByTagName("td"));

        if (!pageFrames.includes(page)) { // Page fault
            pageFaults++;
            if (pageFrames.includes(null)) {
                const index = pageFrames.indexOf(null); // Βρες την πρώτη κενή θέση
                pageFrames[index] = page; // Προσθήκη στη θέση
            } else {
                const lruPage = getLRUPage(pageFrames, lastUsed);
                const index = pageFrames.indexOf(lruPage);
                pageFrames[index] = page; // Αντικατάσταση LRU
            }
        } else {
            hits++; // Αύξηση hits
        }

        lastUsed.set(page, step); // Ενημέρωση της τελευταίας χρήσης

        // Ενημέρωση πίνακα
        pageTable.forEach(cell => {
            if (cell.getAttribute("data-step") == step) {
                const frameIndex = cell.getAttribute("data-frame");
                cell.innerText = pageFrames[frameIndex] ?? ''; // Ενημέρωση κελιού
                if (pageFrames[frameIndex] == page) {
                    cell.style.backgroundColor = '#d4edda'; // Πράσινο για hit
                } else {
                    cell.style.backgroundColor = '#f8d7da'; // Κόκκινο για fault
                }
            }
        });

        step++;
    } else {
         // Ενημέρωση αποτελεσμάτων
    resultText.innerHTML = `
    <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${pageFaults}</span><br>
    <span class="hits">Συνολικός αριθμός hits: ${hits}</span>
`;
    }

   
}

function updateTable() {
    const pageTable = Array.from(table.getElementsByTagName("td"));
    pages.forEach((page, i) => {
        if (!pageFrames.includes(page)) { // Page fault
            pageFaults++;
            if (pageFrames.includes(null)) {
                const index = pageFrames.indexOf(null);
                pageFrames[index] = page;
            } else {
                const lruPage = getLRUPage(pageFrames, lastUsed);
                const index = pageFrames.indexOf(lruPage);
                pageFrames[index] = page;
            }
        } else {
            hits++; // Αύξηση hits
        }
        lastUsed.set(page, i);

        // Ενημέρωση πίνακα
        pageTable.forEach(cell => {
            if (cell.getAttribute("data-step") == i) {
                const frameIndex = cell.getAttribute("data-frame");
                cell.innerText = pageFrames[frameIndex] ?? '';
                if (pageFrames[frameIndex] == page) {
                    cell.style.backgroundColor = '#d4edda'; // Πράσινο για hit
                } else {
                    cell.style.backgroundColor = '#f8d7da'; // Κόκκινο για fault
                }
            }
        });
    });

    // Ενημέρωση αποτελεσμάτων
    resultText.innerHTML = `
        <span class="faults">Συνολικός αριθμός σφαλμάτων σελίδας: ${pageFaults}</span><br>
        <span class="hits">Συνολικός αριθμός hits: ${hits}</span>
    `;
}





// Συνάρτηση για την εύρεση της σελίδας που έχει χρησιμοποιηθεί λιγότερο πρόσφατα
function getLRUPage(pageFrames, lastUsed) {
    let lruPage = null;
    let lruTime = Infinity;

    pageFrames.forEach(page => {
        if (page !== null && lastUsed.has(page) && lastUsed.get(page) < lruTime) {
            lruTime = lastUsed.get(page);
            lruPage = page;
        }
    });

    return lruPage;
}



// Συνάρτηση για την έναρξη της προσομοίωσης
function runLRU() {
    initializeSimulation();
    updateTable();
    enableResetButton();
}

// Λειτουργία για την τυχαία δημιουργία ακολουθίας σελίδων
function generateSequence() {
    const length = 10; // Μήκος της ακολουθίας
    const maxPageNumber = 100; // Μέγιστη τιμή σελίδας
    const sequence = Array.from({ length }, () => Math.floor(Math.random() * maxPageNumber) + 1);
    document.getElementById("pages").value = sequence.join(',');
}

// Κώδικας για το resetButton
const resetButton = document.getElementById('resetButton');

// Προσθέτουμε λειτουργικότητα επαναφοράς
resetButton.addEventListener('click', () => {
    // Επαναφορά των πεδίων εισόδου
    document.getElementById('pages').value = '';
    document.getElementById('frame-number').value = '';

    // Επαναφορά των αποτελεσμάτων
    document.getElementById('seek-count').innerText = '';
    document.getElementById('seek-sequence').innerHTML = '';
    resultText.innerHTML = ''; // Καθαρισμός αποτελεσμάτων

    // Μηδενισμός μεταβλητών
    pages = [];
    frames = [];
    maxFrames = 0;
    step = 0;
    faultCount = 0;
    hitCount = 0;
    pageFrames = [];

    // Απόκρυψη του κουμπιού επαναφοράς
    resetButton.style.display = 'none';

    // Καταγραφή στο console για επαλήθευση
    console.log('Η εφαρμογή επαναφέρθηκε στην αρχική κατάσταση.');
});

// Ενεργοποίηση του κουμπιού όταν χρειάζεται
function enableResetButton() {
    resetButton.style.display = 'block';
}
