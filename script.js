const owner = 'vilook-tech'; // Replace with your GitHub username
const repo = 'resource'; // Replace with your repository name

let allGroups = {};

async function fetchReleases() {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`);
        if (!response.ok) {
            throw new Error('Failed to fetch releases');
        }
        const releases = await response.json();
        return releases.filter(release => !release.name.includes('check_for_update_info'));
    } catch (error) {
        console.error(error);
        document.getElementById('error').textContent = 'Error loading releases: ' + error.message;
        document.getElementById('error').style.display = 'block';
        return [];
    }
}

function groupReleases(releases) {
    const groups = {};
    releases.forEach(release => {
        const match = release.name.match(/^(.+?)_\d+\.\d+\.\d+$/);
        if (match) {
            const group = match[1];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(release);
        }
    });
    // Sort releases within each group by version descending
    Object.keys(groups).forEach(group => {
        groups[group].sort((a, b) => {
            const aVer = a.name.match(/\d+\.\d+\.\d+$/)[0].split('.').map(Number);
            const bVer = b.name.match(/\d+\.\d+\.\d+$/)[0].split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                if (aVer[i] !== bVer[i]) return bVer[i] - aVer[i];
            }
            return 0;
        });
    });
    return groups;
}

function renderGroups(groups, filter = '') {
    const container = document.getElementById('groups');
    container.innerHTML = '';
    const filteredGroups = Object.keys(groups).filter(group => group.toLowerCase().includes(filter.toLowerCase()));
    filteredGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group';
        groupDiv.dataset.showAll = 'false';
        groupDiv.innerHTML = `<h2>${group.replace(/_/g, ' ')}</h2><button class="toggle-btn" onclick="toggleVersions('${group}')">Show All Versions</button>`;
        const releasesToShow = groups[group].slice(0, 1); // Show only latest by default
        releasesToShow.forEach(release => {
            const releaseDiv = document.createElement('div');
            releaseDiv.className = 'release';
            releaseDiv.innerHTML = `
                <h3>${release.name}</h3>
                <p><strong>Release Notes:</strong></p>
                <p>${release.body || 'No release notes available.'}</p>
                <p><strong>Downloads:</strong></p>
            `;
            release.assets.forEach(asset => {
                const link = document.createElement('a');
                link.className = 'download-link';
                link.href = asset.browser_download_url;
                link.textContent = asset.name;
                releaseDiv.appendChild(link);
            });
            groupDiv.appendChild(releaseDiv);
        });
        container.appendChild(groupDiv);
    });
    if (filteredGroups.length === 0) {
        container.innerHTML = '<p>No apps match your search.</p>';
    }
}

function toggleVersions(group) {
    const groupDivs = document.querySelectorAll('.group');
    const groupDiv = Array.from(groupDivs).find(div => div.querySelector('h2').textContent === group.replace(/_/g, ' '));
    const showAll = groupDiv.dataset.showAll === 'true';
    groupDiv.dataset.showAll = !showAll;
    const btn = groupDiv.querySelector('.toggle-btn');
    btn.textContent = showAll ? 'Show All Versions' : 'Show Latest Only';
    const releases = allGroups[group];
    const releasesToShow = showAll ? releases.slice(0, 1) : releases;
    const existingReleases = groupDiv.querySelectorAll('.release');
    existingReleases.forEach(el => el.remove());
    releasesToShow.forEach(release => {
        const releaseDiv = document.createElement('div');
        releaseDiv.className = 'release';
        releaseDiv.innerHTML = `
            <h3>${release.name}</h3>
            <p><strong>Release Notes:</strong></p>
            <p>${release.body || 'No release notes available.'}</p>
            <p><strong>Downloads:</strong></p>
        `;
        release.assets.forEach(asset => {
            const link = document.createElement('a');
            link.className = 'download-link';
            link.href = asset.browser_download_url;
            link.textContent = asset.name;
            releaseDiv.appendChild(link);
        });
        groupDiv.appendChild(releaseDiv);
    });
}

async function init() {
    document.getElementById('loading').style.display = 'block';
    const releases = await fetchReleases();
    document.getElementById('loading').style.display = 'none';
    if (releases.length > 0) {
        allGroups = groupReleases(releases);
        renderGroups(allGroups);
    }
    // Add search functionality
    document.getElementById('search').addEventListener('input', (e) => {
        renderGroups(allGroups, e.target.value);
    });
}

init();