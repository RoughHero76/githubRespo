let pageSize = 10;
let username;
let repositories = [];

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    username = params.get('username');

    if (username) {
        showLoader();
        fetchUserInfo(username);
        fetchRepos(username);
    } else {
        alert('Invalid access. Please enter a GitHub username first.');
        window.location.href = 'index.html';
    }
});

function fetchUserInfo(username) {
    showLoader();
    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch user information. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            const userAvatar = document.getElementById('user-avatar');
            const userName = document.getElementById('user-name');
            const userAbout = document.getElementById('user-about');
            const viewProfileLink = document.getElementById('view-profile-link');

            userAvatar.src = user.avatar_url;
            userName.textContent = user.name || username;
            userAbout.textContent = user.bio || "No bio available.";


            const socialLinksContainer = document.createElement('div');
            socialLinksContainer.classList.add('mb-3');

            const githubLink = createSocialLink('GitHub', user.html_url);
            socialLinksContainer.appendChild(githubLink);

  
            if (user.twitter_username) {
                const twitterLink = createSocialLink('Twitter', `https://twitter.com/${user.twitter_username}`);
                socialLinksContainer.appendChild(twitterLink);
            }
            userAbout.appendChild(socialLinksContainer);


            viewProfileLink.href = user.html_url;
        })
        .catch(error => {
            console.error('Error fetching user information:', error);

            const errorMessage = getErrorMessage(error);
            displayError(errorMessage);
        });
}

function createSocialLink(platform, url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = platform;
    link.classList.add('btn', 'btn-secondary', 'mr-2');
    return link;
}

function fetchRepos(username) {

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch repositories. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(repos => {
            repositories = repos;
            renderRepos(repositories);
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);

            const errorMessage = getErrorMessage(error);
            displayError(errorMessage);
        })
        .finally(() => {
            hideLoader(); 
        });
}

function showLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
}


function getErrorMessage(error) {
    if (error.message.includes('Rate limit exceeded')) {
        return 'GitHub API rate limit exceeded. Please try again later.';
    } else {
        return 'Failed to fetch information. Please try again later. ';
    }
}

function displayError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('alert', 'alert-danger');
    errorContainer.textContent = message;

    const errorContainerWrapper = document.getElementById('error-container');
    errorContainerWrapper.innerHTML = '';
    errorContainerWrapper.appendChild(errorContainer);
}

function filterRepositories() {
    const filterInput = document.getElementById('repoFilter');
    const searchTerm = filterInput.value.toLowerCase();

    const filteredRepos = repositories.filter(repo => repo.name.toLowerCase().includes(searchTerm));
    renderRepos(filteredRepos);
}

function renderRepos(repos) {
    const reposContainer = document.getElementById('repos-container');
    const paginationContainer = document.getElementById('pagination');
    reposContainer.innerHTML = ''; 
    paginationContainer.innerHTML = ''; 

    const totalPages = Math.ceil(repos.length / pageSize);

    for (let page = 1; page <= totalPages; page++) {
        const reposOnPage = repos.slice((page - 1) * pageSize, page * pageSize);

        const pageContainer = document.createElement('div');
        pageContainer.classList.add('repo-grid');

        reposOnPage.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.classList.add('card', 'repo-card');

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const repoName = document.createElement('h5');
            repoName.classList.add('card-title');
            repoName.textContent = repo.name;

            const repoTags = document.createElement('p');
            repoTags.classList.add('card-text');

            if (repo.topics && repo.topics.length > 0) {
                repoTags.textContent = `Tags: ${repo.topics.join(', ')}`;
            } else if (repo.description) {
                repoTags.textContent = `Description: ${repo.description}`;
            } else {
                repoTags.textContent = "No tags or description available.";
            }

            const repoLanguages = document.createElement('p');
            repoLanguages.classList.add('card-text');

            const languages = repo.language ? [repo.language] : [];
            if (repo.languages_url) {
                fetch(repo.languages_url)
                    .then(response => response.json())
                    .then(data => {
                        languages.push(...Object.keys(data));
                        createLanguageButtons(languages, repoLanguages);
                    })
                    .catch(error => console.error('Error fetching languages:', error));
            } else {
                createLanguageButtons(languages, repoLanguages);
            }

            cardBody.appendChild(repoName);
            cardBody.appendChild(repoTags);
            cardBody.appendChild(repoLanguages);

            repoCard.appendChild(cardBody);
            pageContainer.appendChild(repoCard);
        });

        reposContainer.appendChild(pageContainer);

        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = page;
        pageLink.onclick = function () {
            displayPage(page);
        };

        pageItem.appendChild(pageLink);
        paginationContainer.appendChild(pageItem);
    }

    displayPage(1);
}


function updatePageSize() {
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    pageSize = parseInt(pageSizeSelect.value, 10);
    renderRepos(repositories); 
}

function displayPage(page) {
    const reposContainer = document.getElementById('repos-container');
    const pages = reposContainer.getElementsByClassName('repo-grid');

    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = i + 1 === page ? 'grid' : 'none';
    }
}

function createLanguageButtons(languages, container) {
    languages.forEach(language => {
        const languageButton = document.createElement('a');
        languageButton.classList.add('btn', 'btn-primary', 'language-button');
        languageButton.href = `https://en.wikipedia.org/wiki/${language}`;
        languageButton.textContent = language;
        container.appendChild(languageButton);
    });
}
