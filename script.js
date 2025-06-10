const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.email.value;
        const password = this.password.value;
        const userType = this.userType.value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, userType })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login successful: ' + data.message);
                this.reset();
                // Redirect or other logic here
            } else {
                alert('Login failed: ' + data.error);
            }
        } catch (error) {
            alert('Error during login: ' + error.message);
        }
    });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.email.value;
        const password = this.password.value;
        const confirmPassword = this.confirmPassword.value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful: ' + data.message);
                this.reset();
                // Redirect or other logic here
            } else {
                alert('Signup failed: ' + data.error);
            }
        } catch (error) {
            alert('Error during signup: ' + error.message);
        }
    });
}
