import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, errorpop, successpop, hideAllPages } from './helpers.js';
import { showFeed, pollServer } from './feed.js';

const signup = document.getElementById("signup-button");
const login = document.getElementById("login-button");
const loginForm = document.getElementById("login-container");
const signupForm = document.getElementById("signup-container");
const img = document.getElementById("login-image");

//switches to login page
function switchToLogin() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    document.body.style.background = "white";
    img.classList.remove("hidden");
}

//switches to signup page
function switchToSignup() {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    document.body.style.background = "#f0f2f5";
    img.classList.add("hidden");
}

//logs the user in with auth/login and shows feed, returns error if login fails
function loginFunction(email, password) {
    var data = {"email": email.value, "password": password.value};
    let request = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
    };
    fetch('http://localhost:5005/auth/login', request)
    .then(response => {
        if (response.status === 200) {
            response.json().then(response => {
                const token = response["token"];
                const userId = response["userId"];
                document.getElementById("navbar").classList.remove("hidden");
                showFeed(userId, token);
            });
        }
        else {
            response.json().then(response => {
                console.log(response["error"]);
                errorpop(response["error"]);
            })
        }
    })
};

//signs the user up with auth/register
function signupFunction(email, name, password) {
    var data = {"email": email, "password": password, "name": name};
    let request = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
    };
    fetch('http://localhost:5005/auth/register', request)
    .then(response => {
        if (response.status === 200) {
            response.json().then(response => {
                successpop("Successfully registered");
                switchToLogin();
            });
        }
        else {
            response.json().then(response => {
                console.log(response["error"]);
                errorpop(response["error"]);
            });
        }
    });
};

//when clicked, switches to signup page
signup.addEventListener('click', (event) =>{
    event.preventDefault();
    switchToSignup();
});

//when clicked, switches to login page
login.addEventListener('click', (event) =>{
    event.preventDefault();
    switchToLogin();
});

//calls the login function when clicked
const loginButton = document.getElementById("login");
loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    loginFunction(email, password);
});

//calls the signup function when clicked
const register = document.getElementById("register");
register.addEventListener('click', (event) => {
    event.preventDefault();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;
    if (password === confirm) {
        const email = document.getElementById("signup-email").value;
        const name = document.getElementById("signup-name").value;
        signupFunction(email, name, password);
    }
    else {
        errorpop("Passwords do not match");
    }
});