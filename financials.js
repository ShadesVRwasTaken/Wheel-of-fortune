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

// Generates structural percentage values grid matrix dynamically based on entry weights
function updateOddsTable(namesArray, upOddsCallback, downOddsCallback, deleteCallback) {
    oddsTableBody.innerHTML = '';

    if (namesArray.length === 0) {
        oddsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">
                    No entries active to compute odds profile configurations.
                </td>
            </tr>`;
        return;
    }

    const totalTickets = namesArray.reduce((sum, item) => sum + item.weight, 0);

    namesArray.forEach((item, index) => {
        const individualPercentage = totalTickets > 0 ? ((item.weight / totalTickets) * 100).toFixed(1) : "0.0";
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td style="font-weight: 600;">${item.name}</td>
            <td style="color: #fff; font-weight: bold;">${item.weight}</td>
            <td style="color: var(--accent); font-weight: bold;">${individualPercentage}%</td>
            <td>
                <div class="table-btn-group">
                    <button class="table-odds-up-btn" data-idx="${index}" style="background: var(--accent); color:#000; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:0.85rem;">+ Up Odds</button>
                    <button class="table-odds-down-btn" data-idx="${index}" style="background: #e11d48; color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:0.85rem;">- Down Odds</button>
                    <button class="table-remove-btn" data-idx="${index}">Erase</button>
                </div>
            </td>
        `;
        
        oddsTableBody.appendChild(row);
    });

    // Wire up event listeners
    document.querySelectorAll('.table-odds-up-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetIdx = parseInt(e.target.getAttribute('data-idx'));
            if (typeof upOddsCallback === 'function') upOddsCallback(targetIdx);
        });
    });

    document.querySelectorAll('.table-odds-down-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetIdx = parseInt(e.target.getAttribute('data-idx'));
            if (typeof downOddsCallback === 'function') downOddsCallback(targetIdx);
        });
    });

    document.querySelectorAll('.table-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetIdx = parseInt(e.target.getAttribute('data-idx'));
            if (typeof deleteCallback === 'function') deleteCallback(targetIdx);
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
