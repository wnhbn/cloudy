let container = document.getElementById('container')
let registerButton = document.querySelector('#btn-register')
let loginButton = document.querySelector('#btn-login')

toggle = () => {
    container.classList.toggle('sign-in')
    container.classList.toggle('sign-up')
}

setTimeout(() => {
    container.classList.add('sign-in')
}, 200)

function disableButton(button) {
    button.disabled = true;
    setTimeout(() => {
        button.disabled = false;
    }, 1500); // disable the button for 1,5 second
}

// Register
registerButton.addEventListener('click', function (event) {
    disableButton(registerButton);
    event.preventDefault();
    let fullName = document.querySelector('#full-name input');
    let email = document.querySelector('#email input');
    let password = document.querySelector('#password input');
    let confirmPassword = document.querySelector('#confirm-password input');
    // let form = document.querySelector('#register-form');

    if (password.value === confirmPassword.value) {
        // form.submit();
        fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: fullName.value,
                email: email.value,
                password: password.value
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status);
                }
                window.location.href = '/chat/cloudy';
                return response.json();
            })
            .then(data => {
                // console.log(data)
            })
            .catch(error => {
                if (error.message === '401') {
                    Swal.fire({
                        title: "Duplicate Email",
                        text: "This account has been registered before!",
                        icon: "warning",
                        confirmButtonColor: '#707cd0',
                    });
                } else {
                    console.log(error);
                }
            });
    } else {
        Swal.fire({
            title: "Password Error",
            text: "Passwords are not the same ~~",
            icon: "error",
            confirmButtonColor: '#707cd0',
        });
    }

})

// Login
loginButton.addEventListener('click', function (event) {
    disableButton(loginButton);
    event.preventDefault();
    let email = document.querySelector('#email-l input');
    let password = document.querySelector('#password-l input');

    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            window.location.href = '/chat/cloudy';
            return response.json();
        })
        .then(data => {
            // console.log(data)
        })
        .catch(error => {
            if (error.message === '401') {
                Swal.fire({
                    title: "Wrong Password",
                    text: "The password you have just entered is incorrect!",
                    icon: "error",
                    confirmButtonColor: '#707cd0',
                });
            } else if (error.message === '400') {
                Swal.fire({
                    title: "Wrong Email",
                    text: "You have not registered an account yet? Please register now!",
                    icon: "question",
                    confirmButtonColor: '#707cd0',
                });
            }
            else {
                console.log(error);
            }
        });
})