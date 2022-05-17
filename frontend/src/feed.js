
import { fileToDataUrl, timeDiff, parseDate, hideAllPages, getUserInfo, successpop, errorpop } from './helpers.js';
import { showUserProfile, initialiseProfile, watchUser } from './user.js';
import { searchBar } from './navbar.js'

var poll = setInterval((console.log("polling")), 5000);

//unhides the feed page and adds function to navbar
export function showFeed(userId, token) {
    let num = 0;
    document.body.style.background = "#f0f2f5";
    hideAllPages();
    document.getElementById("feed-page").classList.remove("hidden");

    //initialises user profile
    initialiseProfile(userId, token);

    //adds functionality to search bar
    searchBar(userId, token);

    //adds function to post job button
    initialisePostJob(userId, token);

    //resets job feed
    const feed = document.getElementById("feed-main")
    while (feed.lastElementChild) {
        if (feed.lastElementChild.id === "job-template") {
            break;
        }
        feed.removeChild(feed.lastElementChild);
    }
    
    //infinite load
    endless.init(userId, token, num);

}

//fetches all data from job/feed and updates likes and comments
export function pollServer(userId, token, num) {
    let promises = [];
    for (let i = 0; i < (num + 5); i += 5) {
        promises.push(fetch(`http://localhost:5005/job/feed?start=${i}`, {
            method: 'GET',
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${token}` 
            },
        }));
    }
    Promise.all(promises)
    .then(response => {
        for (let i = 0; i < response.length; i++) {
            if(response[i].status === 200) {
                response[i].json().then(response => {
                updateFeed(response, userId, token, i * 5);
                })
            }
            else {
            }
        }
    })
}

//Fetches job/feed to load a user's feed
export function getFeed(userId, token, num) {
    return fetch(`http://localhost:5005/job/feed?start=${num}`, {
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

//Shows the user's job feed
function showJobs(token, userId, num) {
    const info = getFeed(userId, token, num);
    if (info != null) {      
        info.then(response => {
            //loops through all jobs received from backend and creates a job positing for each
            for(let i = 0 ; i < response.length; i++) {
                //clones the job temeplate div and adds information
                const jobInput = document.getElementById("job-template").cloneNode(true);
                const jobListing = response[i];
                const collection = jobInput.children;
                jobInput.removeAttribute("id");
                jobInput.setAttribute("id", `job${i + num}`);
                jobInput.classList.remove("hidden");
                
                const info = getUserInfo(token, jobListing['creatorId']);
                info.then(info => {
                    //author
                    collection[0].textContent = info['name'];
                })
                collection[0].setAttribute('id', jobListing['creatorId']);
        
                const date = new Date(jobListing['createdAt']);
                const time = timeDiff(date);
                //time posted
                if (time < 24) {
                    collection[1].textContent = `Posted ${time} hours ago`;
                }
                else {
                    collection[1].textContent = `Posted on ${parseDate(date)}`;
                }
                //job title
                collection[2].textContent = jobListing['title'];
                //job description
                collection[3].textContent = jobListing['description'];
                //job start date
                const startDate = new Date(jobListing['start']);
                collection[4].textContent = `Starts on ${parseDate(startDate)}`;
                //job image
                collection[5].src = jobListing['image'];
                //job likes and comments count
                collection[6].textContent = `${jobListing['likes'].length} likes`;
                collection[7].textContent = `${jobListing['comments'].length} comments`;
                collection[7].setAttribute('for', `comment${i + num}`);
                collection[10].setAttribute('id', `comment${i + num}`);
                collection[11].setAttribute('id', `like-container${i + num}`);
                const likeFeed = collection[11].children[0];
                likeFeed.setAttribute('id', `likes${i + num}`);
                
                //appends the above job post to the page
                document.getElementById("feed-main").appendChild(jobInput);
    
                        
                //adds the users who have liked this job to a separate div, userLiked is for checking whether self has liked post
                const userLiked = showLikes(likeFeed, jobListing['likes'], token, userId);
        
                //when clicked, shows which users have liked this particular job
                const likeButton = collection[6];
                likeButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    collection[11].classList.remove("hidden");
                });
                
                //allows users to post comments
                addComment(collection[9], jobListing['id'], userId, token);
    
                //loads comments
                showComments(collection[10], jobListing, token, userId);
    
                //when clicked, shows the comments of the job
                const commentButton = collection[7];
                let commentOn = false;
                commentButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (commentOn === false) {
                        collection[10].classList.remove("hidden");
                        commentOn = true;
                    }
                    else {
                        collection[10].classList.add("hidden");
                        commentOn = false;
                    }
                });
        
                //adds a like to the job
                const buttons = collection[8].children;
                const postLike = buttons[0];
                //checks if user has liked job
                if (userLiked === true) {
                    postLike.classList.add("liked");
                    postLike.textContent = "Liked";
                }
                else {
                    postLike.classList.remove("liked");
                    postLike.textContent = "Like";
                }
                //when clicked, toggles the like on the job
                postLike.addEventListener('click', (event) => {
                    let turnon = false;
                    if (postLike.classList.contains("liked")) {
                        turnon = false;
                        postLike.classList.remove("liked");
                        postLike.textContent = "Like";
                    }
                    else {
                        turnon = true;
                        postLike.classList.add("liked");
                        postLike.textContent = "Liked";
                    }
                    event.preventDefault();
                    addLike(jobListing['id'], token, turnon);
                    pollServer(userId, token, num);
                })
                
                //when clicked, refers user to comment post
                buttons[1].setAttribute('for', `postComment${i + num}`);
                collection[9].children[1].setAttribute('id', `postComment${i + num}`);
        
                //when clicked, shows other user's profile
                collection[0].addEventListener('click', (event) => {
                    event.preventDefault();
                    showUserProfile(collection[0].id, token, userId);
                })
            }
        })
    }
};

//fetches /job/like to add a like to a job post
function addLike(id, token, turnon) {
    var data = {"id": id, "turnon": turnon};
    fetch('http://localhost:5005/job/like', {
        method: 'PUT',
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}` 
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if(response.status === 200) {
        }
        else {
            response.json().then(response => {
                console.log(response["error"]);
            })
        }
    })
}




//gets information of all users who have liked a particular job
function showLikes(likeFeed, likeList, token, selfUserId) {
    let liked = false;

    //resets likes
    while (likeFeed.lastElementChild) {
        if (likeFeed.lastElementChild.id === "like-template") {
            break;
        }
        likeFeed.removeChild(likeFeed.lastElementChild);
    }

    //loops through all likes on a job
    for (let i=0; i < likeList.length; i++) {
        //clones template div and add information
        const likeInput = document.getElementById("like-template").cloneNode(true);
        likeInput.removeAttribute("id");
        likeInput.classList.remove("hidden");
        const collection = likeInput.children;
        const likeInfo = collection[0].children;
        const promise = getUserInfo(token, likeList[i]['userId']);
        promise.then(info => {
            //checks for profile pic
            if (info['image'] != null) {
                likeInfo[0].src = info['image'];
            }

            likeInfo[1].textContent = info['name'];
        })
        
        //adds link to profile on user's name
        likeInfo[1].addEventListener('click', (event) => {
            event.preventDefault();
            showUserProfile(likeList[i]['userId'], token, selfUserId);
        })

        //appends cloned div to like feed
        document.getElementById(likeFeed.id).appendChild(likeInput);

        
        if(likeList[i]['userId'] === selfUserId) {
            liked = true;
        }
    }
    //close button for the like screen
    const closeButton = likeFeed.children[0];
    closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        likeFeed.parentElement.classList.add("hidden");
    })
    return liked;
}


function addComment(commentDiv, jobId, selfUserId, token) {
    const children = commentDiv.children;

    //profile pic
    const user = getUserInfo(token, selfUserId);
    user.then(user => {
        if (user['image']) {
            children[0].src = user['image'];
        }
        else {
            children[0].src = "assets/default-user-image.png";
        }
    })

    //posting a comment with POST job/comment
    children[2].addEventListener('click', (event) => {
        event.preventDefault();
        const comment = children[1].value;
        var data = {"id": jobId, "comment": comment};
                fetch('http://localhost:5005/job/comment', {
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : `Bearer ${token}` 
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if(response.status === 200) {
                        showFeed(selfUserId, token);
                        successpop("successfully posted comment");
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

//gets information of all comments that have been put on the job
function showComments(comments, jobListing, token, selfUserId) {

    //refreshes comments
    while (comments.lastElementChild) {
        if (comments.lastElementChild.id === "comment-template") {
            break;
        }
        comments.removeChild(comments.lastElementChild);
    }
    const commentList = jobListing['comments'];
    //loops through all comments of a job
    for(let i=0; i < commentList.length; i++) {
        //clones the template div and add information
        const commentInput = document.getElementById("comment-template").cloneNode(true);
        commentInput.removeAttribute("id");
        commentInput.classList.remove("hidden");
        const collection = commentInput.children;
        const commentInfo = collection[1].children;
        const promise = getUserInfo(token, commentList[i]['userId']);
        promise.then(info => {
            if(info['image'] != null) {
                collection[0].src = info['image'];
            }
            commentInfo[0].textContent = info['name'];
        })
        commentInfo[1].textContent = commentList[i]['comment'];

        //adds link to profile on comment name
        commentInfo[0].addEventListener('click', (event) =>{
            event.preventDefault();
            showUserProfile(commentList[i]['userId'], token, selfUserId);
        })
        //appends cloned div to job post
        comments.appendChild(commentInput);
    }
}

//updates likes and comments for every poll of the sever
function updateFeed(response, selfUserId, token, num) {

    for(let i=0; i < response.length; i++) {
        const job = document.getElementById(`job${i + num}`);
        const jobListing = response[i];
        const collection = job.children;

        collection[6].textContent = `${jobListing['likes'].length} likes`;
        collection[7].textContent = `${jobListing['comments'].length} comments`;
        
        const likeFeed = collection[11].children[0];

        showLikes(likeFeed, jobListing['likes'], token, selfUserId);
        
        //loads comments
        showComments(collection[10], jobListing, token, selfUserId); 
    }
}

function initialisePostJob(selfUserId, token) {
    //opens up screen to post a job when clicked
    document.querySelectorAll(".post-job").forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            hideAllPages();
            document.getElementById("addjob-page").classList.remove("hidden");
            document.getElementById("addjob-button").classList.remove("hidden");
            document.getElementById("changejob-button").classList.add("hidden");
        })
    })

    //back button
    document.getElementById("addjob-back").addEventListener('click', (event) => {
        event.preventDefault;
        hideAllPages();
        showFeed(selfUserId, token);
    })
    
    //posts the job to POST /job when clicked
    document.getElementById("addjob-button").addEventListener('click', (event) => {
        event.preventDefault();
        const title = document.getElementById("addjob-title").value;
        const start = new Date(document.getElementById("addjob-start").value);
        const description = document.getElementById("addjob-description").value;
        const image = document.getElementById("addjob-image").files[0];

        if (image) {
            fileToDataUrl(image).then(image => {
                var data = {"title": title, "start": start, "description": description, "image": image};
                fetch('http://localhost:5005/job', {
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : `Bearer ${token}` 
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if(response.status === 200) {
                        showFeed(selfUserId, token);
                        successpop("Successfully posted job");
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
            errorpop("Please enter all relevant fields");
        }
    })
}

//loads more jobs when user scrolls down
var endless = {
    init: function (userId, token, num) {
        window.addEventListener("scroll", function () {
            if ((window.scrollY + window.innerHeight) >= document.body.scrollHeight) {
                num += 5;
                endless.load(userId, token, num);
                //polls server every 5 seconds
                clearInterval(poll);
                poll = setInterval(function(){pollServer(userId, token, num)}, 5000);
            }
        })
        endless.load(userId, token, num);
        clearInterval(poll);
        poll = setInterval(function(){pollServer(userId, token, num)}, 5000);
    },

    load: function (userId, token, num) {
        showJobs(token, userId, num);
    }

};

