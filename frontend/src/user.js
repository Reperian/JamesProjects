import { fileToDataUrl, timeDiff, parseDate, hideAllPages, getUserInfo, errorpop, successpop } from './helpers.js';
import { showFeed } from "./feed.js";

//gets information for the user's profile when logged in
export function initialiseProfile(userId, token) {

    const profileButton = document.getElementById("profile-button").children;
    const info = getUserInfo(token, userId);
    info.then(info => {
        if (info['image'] != null) {
            profileButton[0].src = info['image'];
        }
        profileButton[1].textContent = info['name'];
    })

    document.getElementById("profile-button").addEventListener('click', (event) => {
        showUserProfile(userId, token, userId);
    })
}


//opens user's profile with all relevant information
export function showUserProfile(userId, token, selfUserId) {

    hideAllPages();
    window.scrollTo(0,0);
    document.getElementById("user-container").classList.remove("hidden");
    const profile = document.getElementById("user-profile");
    const profileJobs = document.getElementById("user-jobs");
    const profileWatchers = document.getElementById("watcher-list");
    const collection = profile.children;

    //hides edit profile button if user is not own user
    if(selfUserId === userId) {
        collection[1].classList.remove("hidden");
    }
    else {
        collection[1].classList.add("hidden");
    }

    const info = getUserInfo(token, userId);
    
    info.then(info => {
        //putting info for user
        if (info['image'] != null) {
            collection[2].src = info['image'];
        }
        else {
            collection[2].src = "../assets/default-user-image.png";
        }
        collection[3].textContent = info['name'];
        collection[4].textContent = info['id'];
        collection[5].textContent = info['email'];
        collection[6].textContent = `${info['watcheeUserIds'].length} watchers`

        //adds function for watch button and unwatch button
        const watchButton = document.getElementById("watch").cloneNode(true);
        collection[7].parentElement.replaceChild(watchButton, collection[7]);
        watchButton.addEventListener('click', (event) => {
            event.preventDefault();
            watchUser(info['email'], token, true);
            showUserProfile(userId, token, selfUserId);
        })

        
        const unwatchButton = document.getElementById("unwatch").cloneNode(true);
        collection[8].parentElement.replaceChild(unwatchButton, collection[8]);
        unwatchButton.addEventListener('click', (event) => {
            event.preventDefault();
            watchUser(info['email'], token, false);
            showUserProfile(userId, token, selfUserId);
        })
        
        //check whether user follows profile
        if (userId === selfUserId) {
            watchButton.classList.add("hidden");
            unwatchButton.classList.add("hidden");
        }
        else {
            if(info['watcheeUserIds'].includes(selfUserId)) {
                watchButton.classList.add("hidden");
                unwatchButton.classList.remove("hidden");
            }
            else {
                watchButton.classList.remove("hidden");
                unwatchButton.classList.add("hidden");
            }
        }

        const jobs = info['jobs'];

        //resetting jobs and watcher list
        while (profileJobs.lastElementChild) {
            if (profileJobs.lastElementChild.id === "job-template2") {
                break;
            }
            profileJobs.removeChild(profileJobs.lastElementChild);
        }
        while (profileWatchers.lastElementChild) {
            if (profileWatchers.lastElementChild.id === "watcher-template") {
                break;
            }
            profileWatchers.removeChild(profileWatchers.lastElementChild);
        }

        //putting info for user's jobs
        profileJobs.children[0].textContent = `Jobs posted by ${info['name']}`;
        for(let i = 0; i < jobs.length; i++) {
            const jobInput = document.getElementById("job-template2").cloneNode(true);
            const job = jobs[i];
            jobInput.removeAttribute("id");
            jobInput.classList.remove("hidden");
            const collection = jobInput.children;
            collection[1].textContent = info['name'];

            const date = new Date(job['createdAt']);
            const time = timeDiff(date);
            if (time < 24) {
                collection[2].textContent = `Posted ${time} hours ago`;
            }
            else {
                collection[2].textContent = `Posted on ${parseDate(date)}`;
            }

            collection[3].textContent = job['title'];
            collection[4].textContent = job['description'];
            const startDate = new Date(job['start']);
            collection[5].textContent = `Starts on ${parseDate(startDate)}`;
            collection[6].src = job['image'];

            //edit job button
            collection[0].children[0].addEventListener('click', (event) => {
                event.preventDefault();
                hideAllPages();
                document.getElementById("addjob-page").classList.remove("hidden");
                document.getElementById("addjob-button").classList.add("hidden");
                
                const save = document.getElementById("changejob-button");
                save.classList.remove("hidden");
                save.addEventListener('click', (event) => {
                    event.preventDefault();
                    changeJob(job['id'], token, selfUserId);
                })
            })

            //delete job button
            collection[0].children[1].addEventListener('click', (event) => {
                deleteJob(job['id'], selfUserId, token);
            })

            profileJobs.appendChild(jobInput);
        }

        //putting info for user's watchers
        const watcherList = info['watcheeUserIds'];
        for (let i = 0; i < watcherList.length; i++) {
            const watcherInput = document.getElementById("watcher-template").cloneNode(true);
            watcherInput.removeAttribute("id");
            watcherInput.classList.remove("hidden");
            const link = watcherInput.children;
            const info = getUserInfo(token, watcherList[i]);
            link[0].setAttribute('id', watcherList[i]);
            info.then(info => {
                link[0].textContent = info['name'];
            })

            profileWatchers.appendChild(watcherInput);

            link[0].addEventListener('click', (event) => {
                showUserProfile(link[0].id, token, selfUserId);
            })
        }
    })

    //back button
    var newBackButton = collection[0].cloneNode(true);
    collection[0].parentElement.replaceChild(newBackButton, collection[0]);
    newBackButton.addEventListener('click', (event) => {
        event.preventDefault();
        showFeed(selfUserId, token);
    })

    //edit profile button
    var newProfileButton = collection[1].cloneNode(true);
    collection[1].parentElement.replaceChild(newProfileButton, collection[1]);
    newProfileButton.addEventListener('click', (event) => {
        event.preventDefault();
        showEditProfile(selfUserId, token);
    })
}

//watches or unwatches another user with user/watch
export function watchUser(email, token, turnon) {
    var data = {"email": email, "turnon": turnon};
        return fetch('http://localhost:5005/user/watch', {
            method: 'PUT',
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if(response.status === 200) {
                return true;
            }
            else {
                response.json().then(response => {
                    console.log(response["error"]);
                    return false;
                })
            }
        })
}

//shows the profile edit page
function showEditProfile(selfUserId, token) {
    hideAllPages();
    document.getElementById("edit-profile-container").classList.remove("hidden");

    document.getElementById("edit-back").addEventListener('click', (event) => {
        event.preventDefault();
        hideAllPages();
        showUserProfile(selfUserId, token, selfUserId);
    })
    
    //calls editProfile to change profile of user
    document.getElementById("edit-confirm-button").addEventListener('click', (event) => {
        event.preventDefault();
        const pass = document.getElementById("edit-password").value;
        const confirmPass = document.getElementById("edit-confirm").value;
        if (pass === confirmPass) {
            editProfile(selfUserId, token);
        }
        else {
            errorpop("Passwords do not match");
        }
    })
}

//changes profile of user with PUT /user
function editProfile(userId, token) {

    const email = document.getElementById("edit-email").value;
    const password = document.getElementById("edit-password").value;
    const name = document.getElementById("edit-name").value;
    const image = document.getElementById("edit-image").files[0];

    if (image) {
        fileToDataUrl(image).then(image => {
            var data = {"email": email, "password": password, "name": name, "image": image};
            fetch('http://localhost:5005/user', {
                method: 'PUT',
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if(response.status === 200) {
                    showFeed(userId, token);
                    successpop("Successfully changed profile");
                }
                else {
                    response.json().then(response => {
                        console.log(response["error"]);
                        errorpop(response["error"]);
                    })
                }
            })
        })
    }
    else {
        var data = {"email": email, "password": password, "name": name};
            fetch('http://localhost:5005/user', {
                method: 'PUT',
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if(response.status === 200) {
                    showFeed(userId, token);
                    successpop("Successfully changed profile");
                }
                else {
                    response.json().then(response => {
                        console.log(response["error"]);
                        errorpop(response["error"]);
                    })
                }
            })
    }
}

//edits job post with PUT /job
function changeJob(jobId, token, selfUserId) {
    const title = document.getElementById("addjob-title").value;
    const start = new Date(document.getElementById("addjob-start").value);
    const description = document.getElementById("addjob-description").value;
    const image = document.getElementById("addjob-image").files[0];
    if (image) {
        fileToDataUrl(image).then(image => {
            var data = {"id": jobId, "title": title, "start": start, "description": description, "image": image};
            fetch('http://localhost:5005/job', {
                method: 'PUT',
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if(response.status === 200) {
                    showFeed(selfUserId, token);
                    successpop("Successfully changed job");
                }
                else {
                    response.json().then(response => {
                        console.log(response["error"]);
                        errorpop(response["error"]);
                    })
                }
            })
        })
    }
    else {
        var data = {"id": jobId, "title": title, "start": start, "description": description};
            fetch('http://localhost:5005/job', {
                method: 'PUT',
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if(response.status === 200) {
                    showFeed(selfUserId, token);
                    successpop("Successfully changed job");
                }
                else {
                    response.json().then(response => {
                        console.log(response["error"]);
                        errorpop(response["error"]);
                    })
                }
            })
    }


}

//deletes job with DELETE /job
function deleteJob(jobId, selfUserId, token) {
    var data = {"id": jobId};
            fetch('http://localhost:5005/job', {
                method: 'DELETE',
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if(response.status === 200) {
                    showUserProfile(selfUserId, token, selfUserId);
                    successpop("Successfully deleted job");
                }
                else {
                    response.json().then(response => {
                        console.log(response["error"]);
                        errorpop(response["error"]);
                    })
                }
            })
}
