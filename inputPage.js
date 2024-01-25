function goToRepos() {
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value;

    if (username.trim() !== "") {
        window.location.href = `repos.html?username=${username}`;
    } else {
        alert('Please enter a valid GitHub username.');
    }
}
