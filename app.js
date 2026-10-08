const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const newNameInput = document.getElementById('newNameInput');
const addNameBtn = document.getElementById('addNameBtn');
const namesContainer = document.getElementById('namesContainer');
const spinBtn = document.getElementById('spinBtn');
const resultModal = document.getElementById('resultModal');
const winnerText = document.getElementById('winnerText');
const closeModal = document.getElementById('closeModal');

// Verified hard-reset state array workspace
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

    names.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'name-item';
        item.innerHTML = `
            <span>${name}</span>
            <button class="remove-btn" data-index="${index}">✕</button>
        `;
        namesContainer.appendChild(item);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idxToRemove = parseInt(e.target.getAttribute('data-index'));
            removeNameAt(idxToRemove);
        });
    });

    // Simultaneously updates mathematical profiles tracking on Tab 2 data sets
    if (typeof updateOddsTable === 'function') {
        updateOddsTable(names, removeNameAt);
    }

    drawWheel();
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

    const sliceAngle = (2 * Math.PI) / names.length;

    names.forEach((name, i) => {
        const startAngle = currentRotationAngle + (i * sliceAngle);
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
        
        let renderText = name;
        if (renderText.length > 12) renderText = renderText.substring(0, 10) + '...';
        
        ctx.fillText(renderText, radius - 25, 5);
        ctx.restore();
    });
}

addNameBtn.addEventListener('click', () => {
    const textValue = newNameInput.value.trim();
    if (textValue) {
        names.push(textValue);
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

    const totalSlices = names.length;
    lastWinnerIndex = Math.floor(Math.random() * totalSlices);
    const sliceSizeRad = (2 * Math.PI) / totalSlices;
    
    const targetAngleOffset = (3 * Math.PI / 2) - (lastWinnerIndex * sliceSizeRad) - (sliceSizeRad / 2);
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
            winnerText.textContent = names[lastWinnerIndex];
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
