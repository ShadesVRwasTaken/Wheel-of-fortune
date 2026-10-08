// Global tracking data states
let totalEarnings = 0.00;

const totalEarningsDisplay = document.getElementById('totalEarningsDisplay');
const prizePoolDisplay = document.getElementById('prizePoolDisplay');

// Financial Tracker Management Update Routine
function updateEarnings(amount) {
    totalEarnings += amount;
    const halfEarnings = totalEarnings / 2;
    
    totalEarningsDisplay.textContent = `$${totalEarnings.toFixed(2)}`;
    prizePoolDisplay.textContent = `$${halfEarnings.toFixed(2)}`;
}

// Tab Switching Navigation Handler
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

// Kickstart tabs on resource load
setupTabs();
