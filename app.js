const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const newNameInput = document.getElementById('newNameInput');
const addNameBtn = document.getElementById('addNameBtn');
const namesContainer = document.getElementById('namesContainer');
const spinBtn = document.getElementById('spinBtn');
const resultModal = document.getElementById('resultModal');
const winnerText = document.getElementById('winnerText');
const closeModal = document.getElementById('closeModal');

let names = []; 
let currentRotationAngle = 0;
let isSpinning = false;
let lastWinnerIndex = -1;

const wheelColors = ['#16a34a', '#000000', '#22c55e', '#171717'];

function syncNamesList() {
    namesContainer.innerHTML = '';
    
    if (names.length === 0) {
        namesContainer.innerHTML = '<div style="color: #64748b; padding: 10px; text-align: center; font-size: 0.9rem;">No names added yet.</div>';
    }

    names.forEach((item, index) => {
        const domItem = document.createElement('div');
        domItem.className = 'name-item';
        domItem.innerHTML = `
            <span>${item.name} (${item.weight}x)</span>
            <div class="item-controls">
                <button class="odds-up-btn" data-index="${index}">+ Up</button>
                <button class="odds-down-btn" data-index="${index}" style="background: #e11d48; color: #fff; border:none; padding:2px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold; cursor:pointer;">- Down</button>
                <button class="remove-btn" data-index="${index}">✕</button>
            </div>
        `;
        namesContainer.appendChild(domItem);
    });

    document.querySelectorAll('.odds-up-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            upOddsAt(idx);
        });
    });

    document.querySelectorAll('.odds-down-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            downOddsAt(idx);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idxToRemove = parseInt(e.target.getAttribute('data-index'));
            removeNameAt(idxToRemove);
        });
    });

    if (typeof updateOddsTable === 'function') {
        updateOddsTable(names, upOddsAt, downOddsAt, removeNameAt);
    }

    drawWheel();
}

function upOddsAt(index) {
    if (index > -1 && index < names.length) {
        names[index].weight += 1;
        if (typeof updateEarnings === 'function') updateEarnings(0.50);
        syncNamesList();
    }
}

// Lowers individual odds ticket allocation metrics and deducts money from ledger balances
function downOddsAt(index) {
    if (index > -1 && index < names.length) {
        // Prevents odds from falling below 1 ticket
        if (names[index].weight > 1) {
            names[index].weight -= 1;
            if (typeof updateEarnings === 'function') updateEarnings(-0.50);
            syncNamesList();
        }
    }
}

function removeNameAt(index) {
    if (index > -1 && index < names.length) {
        names.splice(index, 1);
        syncNamesList();
    }
}

function drawWheel() {
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    ctx.clearRect(0, 0, size, size);

    if (names.length === 0) {
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#171717';
        ctx.fill();
        
        ctx.fillStyle = '#64748b';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Add a name to generate the wheel', center, center);
        return;
    }

    const totalTickets = names.reduce((sum, item) => sum + item.weight, 0);
    let startAngle = currentRotationAngle;

    names.forEach((item, i) => {
        const sliceAngle = (item.weight / totalTickets) * (2 * Math.PI);
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.fill();
        
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#262626';
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        
        ctx.fillStyle = (wheelColors[i % wheelColors.length] === '#000000' || wheelColors[i % wheelColors.length] === '#171717') ? '#22c55e' : '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        
        let renderText = item.name;
        if (renderText.length > 12) renderText = renderText.substring(0, 10) + '...';
        
        ctx.fillText(renderText, radius - 25, 5);
        ctx.restore();

        startAngle = endAngle;
    });
}

addNameBtn.addEventListener('click', () => {
    const textValue = newNameInput.value.trim();
    if (textValue) {
        names.push({ name: textValue, weight: 1 });
        newNameInput.value = '';
        syncNamesList();
        if (typeof updateEarnings === 'function') updateEarnings(0.50);
    }
});

newNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNameBtn.click();
});

spinBtn.addEventListener('click', () => {
    if (isSpinning || names.length === 0) return;
    isSpinning = true;

    const totalTickets = names.reduce((sum, item) => sum + item.weight, 0);
    const randomTicketPoint = Math.random() * totalTickets;
    
    let ticketAccumulator = 0;
    lastWinnerIndex = 0;
    
    for (let i = 0; i < names.length; i++) {
        ticketAccumulator += names[i].weight;
        if (randomTicketPoint <= ticketAccumulator) {
            lastWinnerIndex = i;
            break;
        }
    }

    let precedingArcSum = 0;
    for (let i = 0; i < lastWinnerIndex; i++) {
        precedingArcSum += names[i].weight;
    }
    const winnerSliceAngleSize = (names[lastWinnerIndex].weight / totalTickets) * (2 * Math.PI);
    const winnerStartAngleOffset = (precedingArcSum / totalTickets) * (2 * Math.PI);

    const targetAngleOffset = (3 * Math.PI / 2) - winnerStartAngleOffset - (winnerSliceAngleSize / 2);
    const finalDestinationAngle = (Math.PI * 2 * 6) + targetAngleOffset;

    let startTimestamp = null;

    function animateWheel(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / 4500, 1);

        const easeOutFactor = 1 - Math.pow(1 - progress, 4);
        currentRotationAngle = easeOutFactor * finalDestinationAngle;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            isSpinning = false;
            winnerText.textContent = names[lastWinnerIndex].name;
            resultModal.style.display = 'flex';
        }
    }
    requestAnimationFrame(animateWheel);
});

closeModal.addEventListener('click', () => {
    if (lastWinnerIndex > -1 && lastWinnerIndex < names.length) {
        names.splice(lastWinnerIndex, 1);
        syncNamesList();
    }
    resultModal.style.display = 'none';
    lastWinnerIndex = -1; 
});

syncNamesList();
