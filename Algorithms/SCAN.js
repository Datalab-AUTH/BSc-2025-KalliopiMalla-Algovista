let showNumbersOnArrows = true; // Αρχική κατάσταση για εμφάνιση αριθμών
const disk_size = 199; // Μέγεθος δίσκου

/**
 * Εκτελεί τον αλγόριθμο SCAN και σχεδιάζει την αναπαράσταση.
 */
function executeSCAN() {
    const tracksInput = document.getElementById("process-queue").value;
    const head = parseInt(document.getElementById("head-position").value);
    const direction = document.getElementById("direction").value;

    if (!tracksInput || isNaN(head) || (direction !== "left" && direction !== "right")) {
        alert("Παρακαλώ εισάγετε έγκυρα δεδομένα!");
        return;
    }

    const tracks = tracksInput.split(",").map(Number).filter(num => !isNaN(num));
    if (tracks.length === 0) {
        alert("Παρακαλώ εισάγετε τουλάχιστον μία θέση στο queue!");
        return;
    }

    // Προσθήκη της κεφαλής στη λίστα για ταξινόμηση
    tracks.push(head);

    // Προσθήκη ακραίων τιμών μόνο αν χρειάζεται
    if (direction === "left" && !tracks.includes(0)) {
        tracks.push(0);
    }
    if (direction === "right" && !tracks.includes(disk_size)) {
        tracks.push(disk_size);
    }

    tracks.sort((a, b) => a - b);

    let left = [];
    let right = [];
    let seekSequence = [];
    let seekCount = 0;

    // Χωρισμός αιτημάτων σε αριστερά και δεξιά της κεφαλής
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i] < head) left.push(tracks[i]);
        else if (tracks[i] > head) right.push(tracks[i]);
    }

    // Διαχείριση κατεύθυνσης
    if (direction === "left") {
        left.reverse(); // Αντιστρέφουμε την αριστερή λίστα
        seekSequence = [...left, ...right]; // Κίνηση προς τα αριστερά και μετά προς τα δεξιά
    } else {
        seekSequence = [...right, ...left.reverse()]; // Κίνηση προς τα δεξιά και μετά προς τα αριστερά
    }

    // Αφαίρεση της κεφαλής (προστέθηκε μόνο για ταξινόμηση)
    seekSequence = seekSequence.filter(position => position !== head);

// Υπολογισμός των συνολικών κινήσεων κεφαλής με σταδιακή αύξηση
let currentPos = head;
for (let i = 0; i < seekSequence.length; i++) {
    seekCount += Math.abs(seekSequence[i] - currentPos);
    currentPos = seekSequence[i];
}

// Εμφάνιση του συνολικού αριθμού κινήσεων με σταδιακή αύξηση
const seekCountDisplay = document.getElementById("seek-count-display");
seekCountDisplay.innerHTML = ""; // Καθαρισμός παλαιού περιεχομένου
let currentCount = 0;
const incrementValue = Math.ceil(seekCount / 20); // Βήμα αύξησης
const interval = setInterval(() => {
    if (currentCount + incrementValue >= seekCount) {
        currentCount = seekCount;
        seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
        clearInterval(interval); // Τερματισμός του interval
    } else {
        currentCount += incrementValue;
        seekCountDisplay.innerText = `Συνολική μετακίνηση κεφαλής: ${currentCount}`;
    }
}, 50); // Χρονικό διάστημα ενημέρωσης (50ms)


    // Δημιουργία κουτιών για τη σειρά εξυπηρέτησης
    const seekSequenceBoxes = document.getElementById("seek-sequence-boxes");
    seekSequenceBoxes.innerHTML = "";
    seekSequence.forEach((position, index) => {
        const box = document.createElement("div");
        box.className = "sequence-box";
        box.textContent = position;

        seekSequenceBoxes.appendChild(box);
        if (index < seekSequence.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "arrow";
            arrow.textContent = "→";
            seekSequenceBoxes.appendChild(arrow);
        }
    });

    // Σχεδίαση της πορείας στον καμβά
    drawScan(seekSequence);
    document.getElementById("resetButton").style.display = "inline-block";
}






/**
 * Σχεδιάζει την αναπαράσταση του SCAN σε καμβά.
 */
function drawScan(sequence) {
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 20;
    const lineLength = canvas.width - 2 * padding;
    const trackHeight = canvas.height - 2 * padding;

    // Υπολογισμός τιμών για την κλίμακα
    const minInput = Math.min(...sequence, 0);
    const maxInput = Math.max(...sequence, disk_size);
    const startScale = Math.floor(minInput / 20) * 20;
    const endScale = Math.ceil(maxInput / 20) * 20;
    const scaleStep = 20;
    const numMarks = Math.floor((endScale - startScale) / scaleStep) + 1;
    const trackWidth = lineLength / (endScale - startScale);

    // Σχεδιασμός Grid (Κάθετες και Οριζόντιες γραμμές)
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 1;

    // Κάθετες γραμμές
    for (let i = 0; i < numMarks; i++) {
        const xPosition = padding + (i / (numMarks - 1)) * lineLength;
        ctx.beginPath();
        ctx.moveTo(xPosition, padding);
        ctx.lineTo(xPosition, canvas.height - padding);
        ctx.stroke();
    }

    // Οριζόντιες γραμμές
    const numHorizontalLines = sequence.length;
    for (let i = 0; i < numHorizontalLines; i++) {
        const yPosition = padding + (i / (numHorizontalLines - 1)) * trackHeight;
        ctx.beginPath();
        ctx.moveTo(padding, yPosition);
        ctx.lineTo(canvas.width - padding, yPosition);
        ctx.stroke();
    }

    // Σχεδιασμός της επάνω κλίμακας
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    const blackLineY = padding;
    ctx.beginPath();
    ctx.moveTo(padding, blackLineY);
    ctx.lineTo(canvas.width - padding, blackLineY);
    ctx.stroke();

    ctx.fillStyle = "green";
    ctx.font = "12px Arial";

    for (let i = 0; i < numMarks; i++) {
        const mark = startScale + i * scaleStep;
        const xPosition = padding + (i / (numMarks - 1)) * lineLength;

        ctx.fillText(mark, xPosition - 10, blackLineY - 10);
        ctx.beginPath();
        ctx.moveTo(xPosition, blackLineY);
        ctx.lineTo(xPosition, blackLineY + 10);
        ctx.stroke();
    }

    // Σχεδιασμός κινήσεων (βέλη)
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";

    const stepY = trackHeight / (sequence.length - 1);

    for (let i = 0; i < sequence.length - 1; i++) {
        const x1 = padding + (sequence[i] - startScale) * trackWidth;
        const y1 = padding + i * stepY;
        const x2 = padding + (sequence[i + 1] - startScale) * trackWidth;
        const y2 = padding + (i + 1) * stepY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        drawArrow(ctx, x1, y1, x2, y2, sequence[i + 1]);
    }
}



 
/**
 * Σχεδιάζει βέλος με δυνατότητα εμφάνισης αριθμών στην άκρη του βέλους (πάνω από το σημείο του).
 */
function drawArrow(ctx, fromX, fromY, toX, toY, value) {
    const headLength = 10; // Μήκος της κεφαλής του βέλους
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    // Σχεδίαση του βέλους
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = "green";
    ctx.fill();

    // Εμφάνιση αριθμών πάνω από την άκρη του βέλους
    if (showNumbersOnArrows) {
        const textOffset = 15; // Πόσο μακριά πάνω από την άκρη του βέλους (σε pixels)

        // Υπολογισμός θέσης αριθμών
        const textX = toX + textOffset * Math.cos(angle - Math.PI / 2); // Θέση X πάνω από το τέλος του βέλους
        const textY = toY + textOffset * Math.sin(angle - Math.PI / 2); // Θέση Y πάνω από το τέλος του βέλους

        ctx.fillStyle = "green";
        ctx.font = "12px Arial";
        ctx.textAlign = "center"; // Ευθυγράμμιση στο κέντρο του αριθμού
        ctx.fillText(value, textX, textY);
    }
}






/**
 * Δημιουργεί μια τυχαία ακολουθία αριθμών και την εισάγει στο πεδίο.
 */
function generateRandomSequence() {
    const sequenceLength = Math.floor(Math.random() * 10) + 5; // Μήκος 5-14
    const randomSequence = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * disk_size));
    document.getElementById("process-queue").value = randomSequence.join(", ");
}

// Συνδέσεις κουμπιών
document.getElementById("generateSequenceButton").addEventListener("click", generateRandomSequence);
document.getElementById("resetButton").addEventListener("click", resetCanvasAndInputs);
document.getElementById("toggleNumbersButton").addEventListener("click", () => {
    showNumbersOnArrows = !showNumbersOnArrows;
    executeSCAN();
});

/**
 * Συνάρτηση επαναφοράς.
 */
function resetCanvasAndInputs() {
    // Καθαρισμός του καμβά
    const canvas = document.getElementById("seekCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Καθαρισμός των πεδίων εισόδου και των αποτελεσμάτων
    document.getElementById("process-queue").value = "";
    document.getElementById("head-position").value = "";
    document.getElementById("seek-count-display").innerText = "";
    document.getElementById("seek-sequence-boxes").innerHTML = "";

    // Μηδενισμός μεταβλητών
    pages = [];
    frames = [];
    referenceBits = [];
    pointer = 0;
    faultCount = 0;
    hitCount = 0;
    step = 0;

    // Μηδενισμός του currentCount
    if (typeof currentCount !== "undefined") {
        currentCount = 0; // Μηδενισμός της μεταβλητής currentCount
    }

    // Απόκρυψη του κουμπιού "Επαναφορά"
    document.getElementById("resetButton").style.display = "none";
}
// script.js
document.addEventListener("DOMContentLoaded", () => {
    const openSidebar = document.getElementById("open-sidebar");
    const closeSidebar = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");
  
    openSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      sidebar.classList.add("open"); // Προσθέτουμε την κλάση για να εμφανιστεί το sidebar
    });
  
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open"); // Αφαιρούμε την κλάση για να κρυφτεί το sidebar
    });
  });
  
  document.querySelectorAll('.dropdown-submenu > div').forEach((menuTitle) => {
    menuTitle.addEventListener('click', () => {
      const parentLi = menuTitle.parentElement;
      parentLi.classList.toggle('open');
    });
  });
  
  document.querySelectorAll('.submenu-content li a').forEach((link) => {
    link.addEventListener('click', (e) => {
      document
        .querySelectorAll('.submenu-content li a')
        .forEach((el) => el.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  