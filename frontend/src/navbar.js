let toggle = false;
let notiToggle = false;

//adds function to search bar
export function searchBar(selfuserId, token) {

    //hides search bar in mobile mode
    searchReveal();
    
    //puts email entered in searchbar to fetch user/watch
    document.getElementById("search-button").addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById("search").value
        const success = watchUser(email, token, true);
        success.then(success => {
            if (success === true) {
                successpop(`You are now watching ${email}`);
                showFeed(selfuserId, token);
            }
            else {
                errorpop("User does not exist");
            }
        })
    })
}

//when clicked, opens up search bar on mobile screens
function searchReveal() {
    document.getElementById("search-reveal").addEventListener('click', (event) => {
        event.preventDefault();
        const search = document.getElementById("searchBar");
        const profile = document.getElementById("profile-button");
        const navJob = document.getElementById("nav-post-job");
        if (toggle === false) {
            search.setAttribute('style', "display: flex !important");
            profile.style.visibility = "hidden";
            navJob.style.visibility = "hidden";
            toggle = true;
        }
        else {
            search.setAttribute('style', "display: none !important");
            profile.style.visibility = "visible";
            navJob.style.visibility = "visible";
            toggle = false;
        }
    })
}

//resets navbar when not in mobile mode
window.addEventListener('resize', (event) => {
    event.preventDefault();
    if (window.innerWidth > 600) {
        const search = document.getElementById("searchBar");
        const profile = document.getElementById("profile-button");
        const navJob = document.getElementById("nav-post-job");
        search.style.display = "flex";
        profile.style.visibility = "visible";
        navJob.style.visibility = "visible";
        toggle = false;
    }
})