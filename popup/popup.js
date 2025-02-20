document.addEventListener('DOMContentLoaded', function () {
  let watchedTags = [];

  chrome.storage.sync.get('watchedTags', function (result) {
    if (result.watchedTags) {
      watchedTags = result.watchedTags;
    }
    displayWatchedTags();
  });

  function displayWatchedTags() {
    const watchedTabsDiv = document.getElementById('watchedTabs');
    const watchedTagsDiv = document.getElementById('watchedTags');
    watchedTabsDiv.innerHTML = '';
    watchedTagsDiv.innerHTML = '';

    const numTabs = Math.ceil(watchedTags.length / 50);
    for (let i = 0; i < numTabs; i++) {
      const tabButton = document.createElement('button');
      tabButton.textContent = `Watched ${String.fromCharCode(65 + i)}`;
      tabButton.addEventListener('click', () => {
        displayTagsForTab(i);
      });
      watchedTabsDiv.appendChild(tabButton);
    }

    displayTagsForTab(0);
  }

  function displayTagsForTab(tabIndex) {
    const startIndex = tabIndex * 50;
    const endIndex = Math.min(startIndex + 50, watchedTags.length);
    const tagsToDisplay = watchedTags.slice(startIndex, endIndex);

    const watchedTagsDiv = document.getElementById('watchedTags');
    watchedTagsDiv.innerHTML = '';

    const tagList = document.createElement('ul');
    tagsToDisplay.forEach(tag => {
      const listItem = document.createElement('li');
      const tagLink = document.createElement('a');
      tagLink.href = `https://e621.net/posts?tags=${tagsToDisplay.map(t => `~${t}`).join('+')}`;
      tagLink.textContent = tag;
      tagLink.target = '_blank';
      listItem.appendChild(tagLink);
      tagList.appendChild(listItem);
    });

    watchedTagsDiv.appendChild(tagList);
  }
});
