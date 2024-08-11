
var sendRegister = document.getElementById("sendRegister");

if(sendRegister !== null){
    const registerForm = document.getElementById("registerForm");

    sendRegister.addEventListener("click",async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const lastName = document.getElementById('last_name').value;
        const password = document.getElementById('password').value;

        const nameRegex = /^[a-zA-Z]+$/;
        const usernameRegex = /^.{8,}$/;
        const passwordRegex = /^.{8,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        var usernameError = document.getElementById('usernameError');
        var emailError = document.getElementById('emailError');
        var nameError = document.getElementById('nameError');
        var lastNameError = document.getElementById('lastNameError');
        var passwordError = document.getElementById('passwordError');

        var error = false;

        if (!nameRegex.test(name)) {
            nameError.innerHTML = 'Ime mora sadržavati samo slova.';
            error = true;
        } else {
            nameError.innerHTML = "";
        }

        if (!nameRegex.test(lastName)) {
            lastNameError.innerHTML = 'Prezime mora sadržavati samo slova.';
            error = true;
        } else {
            lastNameError.innerHTML = "";
        }

        // Proveri da li je korisničko ime već zauzeto
        const usernameResponse = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
        const usernameData = await usernameResponse.json();

        if (!usernameRegex.test(username)) {
            usernameError.innerHTML = 'Korisničko ime mora imati najmanje 8 karaktera.';
            error = true;
        } else if (!usernameData.available) {
            usernameError.innerHTML = usernameData.message;
            error = true;
        } else {
            usernameError.innerHTML = "";
        }

        // Proveri da li je email već zauzet
        const emailResponse = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
        const emailData = await emailResponse.json();

        if (!emailRegex.test(email)) {
            emailError.innerHTML = 'Nevalidan email format.';
            error = true;
        } else if (!emailData.available) {
            emailError.innerHTML = emailData.message;
            error = true;
        }else {
            emailError.innerHTML = "";
        }

        if (!passwordRegex.test(password)) {
            passwordError.innerHTML = 'Lozinka mora imati najmanje 8 karaktera.';
            error = true;
        } else {
            passwordError.innerHTML = "";
        }



        if (!error) {
            registerForm.submit();
        }
    });
}
