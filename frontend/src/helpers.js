/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

export function errorpop(message) {
    const error = document.getElementById("error-red");
    error.firstChild.textContent = message;
    error.style.display = "none";
    error.style.display = "block";
};

export function successpop(message) {
    const error = document.getElementById("success");
    error.firstChild.textContent = message;
    error.style.display = "none";
    error.style.display = "block";
};

//hides all divs except header
export function hideAllPages() {
    const divs = document.body.children;
    for (let i = 0; i < divs.length; i++) {
        if (divs[i] === document.getElementById("header")) {}
        else {
            divs[i].classList.add("hidden");
        }
    }
}

//calculates the time difference between now and input time
export function timeDiff(date) {
    const now = new Date();
    const diff = Math.abs(now - date );
    const time = Math.floor(diff / (1000 * 60 * 60));
    return time;
}

//Puts date format into a more readable string
export function parseDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${year}/${month}/${day} at ${hour}:${minute}`;
}

//gets the info of a user from their userID
export function getUserInfo (token, userId) {
    return fetch(`http://localhost:5005/user?userId=${userId}`, {
        method: 'GET',
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}` 
        },
    })
    .then(response => {
        if(response.status === 200) {
            return response.json();

        }
        else {
            response.json().then(response => {
                console.log(response["error"]);
            })
        }
    })
    .then(response => {
        return response;
    })
}
