// popup.js

document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    loadWatchedTags();
}

function loadWatchedTags() {
    chrome.storage.sync.get(['watchedTags'], function (result) {
        let watchedTags = result.watchedTags || [];
        createNavTabs(watchedTags);
    });
}

function createNavTabs(watchedTags) {
    const BATCH_SIZE = 50;
    let tagBatches = [];

    for (let i = 0; i < watchedTags.length; i += BATCH_SIZE) {
        tagBatches.push(watchedTags.slice(i, i + BATCH_SIZE));
    }

    const navbar = document.getElementById('navbar');
    navbar.innerHTML = ''; // Clear existing tabs

    tagBatches.forEach((batch, index) => {
        let tabName = `Watched${String.fromCharCode(65 + index)}`; // WatchedA, WatchedB, etc.
        let tabButton = document.createElement('button');
        tabButton.textContent = tabName;
        tabButton.dataset.batchIndex = index;
        tabButton.addEventListener('click', function () {
            // Remove active class from all buttons
            let buttons = navbar.getElementsByTagName('button');
            for (let btn of buttons) {
                btn.style.backgroundColor = '#333';
                btn.style.color = '#f2f2f2';
            }
            // Add active style to the clicked button
            tabButton.style.backgroundColor = '#ddd';
            tabButton.style.color = 'black';

            loadContent(batch);
        });
        navbar.appendChild(tabButton);
    });

    // Simulate a click on the first tab to load its content
    if (navbar.firstChild) {
        navbar.firstChild.click();
    } else {
        document.getElementById('content').innerHTML = '<p>No watched tags found.</p>';
    }
}

function loadContent(batch) {
    // Construct the search URL for the batch of tags
    let searchURL = getSearchURL(batch);

    // Fetch and display the posts
    fetchPosts(searchURL);
}

function getSearchURL(tags) {
    let tagQuery = tags.join(' ');
    return `https://e621.net/posts.json?tags=${encodeURIComponent(tagQuery)}&limit=20`;
}

function fetchPosts(url) {
    let contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Loading posts...</p>';

    // Fetch posts from e621 API
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            // Add your User-Agent string as per e621 API policy
            'User-Agent': 'YourUsername/ExtensionName/Version (by YourUsername on e621)'
        }
    })
        .then(response => response.json())
        .then(data => {
            displayPosts(data.posts);
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            contentDiv.innerHTML = '<p>Error loading posts.</p>';
        });
}

function displayPosts(posts) {
    let contentDiv = document.getElementById('content');
    contentDiv.innerHTML = ''; // Clear existing content

    if (posts.length === 0) {
        contentDiv.innerHTML = '<p>No posts found for these tags.</p>';
        return;
    }

    posts.forEach(post => {
        let postDiv = document.createElement('div');
        postDiv.style.marginBottom = '10px';

        let thumbnail = document.createElement('img');
        thumbnail.src = post.preview.url;
        thumbnail.alt = `Post #${post.id}`;
        thumbnail.style.cursor = 'pointer';
        thumbnail.addEventListener('click', () => {
            // Open the post in a new tab
            chrome.tabs.create({ url: `https://e621.net/posts/${post.id}` });
        });

        postDiv.appendChild(thumbnail);
        contentDiv.appendChild(postDiv);
    });
}
