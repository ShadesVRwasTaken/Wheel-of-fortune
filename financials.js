let totalEarnings = 0.00;

const totalEarningsDisplay = document.getElementById('totalEarningsDisplay');
const prizePoolDisplay = document.getElementById('prizePoolDisplay');
const oddsTableBody = document.getElementById('oddsTableBody');

function updateEarnings(amount) {
    totalEarnings += amount;
    const halfEarnings = totalEarnings / 2;
    
    totalEarningsDisplay.textContent = `$${totalEarnings.toFixed(2)}`;
    prizePoolDisplay.textContent = `$${halfEarnings.toFixed(2)}`;
}

// Generates structural percentage values grid matrix dynamically
function updateOddsTable(namesArray, deleteCallback) {
    oddsTableBody.innerHTML = '';

    if (namesArray.length === 0) {
        oddsTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #64748b; padding: 20px;">
                    No entries active to compute odds profile configurations.
                </td>
            </tr>`;
        return;
    }

    // Every slice has an exactly equal statistical percentage probability layout distribution profile
    const individualPercentage = (100 / namesArray.length).toFixed(1);

    namesArray.forEach((name, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td style="font-weight: 600;">${name}</td>
            <td style="color: var(--accent); font-weight: bold;">${individualPercentage}%</td>
            <td><button class="table-remove-btn" data-idx="${index}">Erase</button></td>
        `;
        
        oddsTableBody.appendChild(row);
    });

    // Wire up delete event hooks directly inside the dashboard grid views framework row item buttons
    document.querySelectorAll('.table-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetIdx = parseInt(e.target.getAttribute('data-idx'));
            if (typeof deleteCallback === 'function') {
                deleteCallback(targetIdx);
            }
        });
    });
}

function setupTabs() {
    const tabWheel = document.getElementById('tabWheel');
    const tabPrize = document.getElementById('tabPrize');
    const wheelView = document.getElementById('wheel-tab');
    const prizeView = document.getElementById('prize-tab');

    tabWheel.addEventListener('click', () => {
        tabWheel.classList.add('active');
        tabPrize.classList.remove('active');
        wheelView.classList.add('active');
        prizeView.classList.remove('active');
    });

    tabPrize.addEventListener('click', () => {
        tabPrize.classList.add('active');
        tabWheel.classList.remove('active');
        prizeView.classList.add('active');
        wheelView.classList.remove('active');
    });
}

setupTabs();
