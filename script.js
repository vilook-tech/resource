const owner = 'vilook-tech'; // Replace with your GitHub username
const repo = 'resource'; // Replace with your repository name

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

function renderGroups(groups) {
    const container = document.getElementById('groups');
    container.innerHTML = '';
    Object.keys(groups).forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group';
        groupDiv.innerHTML = `<h2>${group.replace(/_/g, ' ')}</h2>`;
        groups[group].forEach(release => {
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
                releaseDiv.appendChild(document.createElement('br'));
            });
            groupDiv.appendChild(releaseDiv);
        });
        container.appendChild(groupDiv);
    });
}

async function init() {
    document.getElementById('loading').style.display = 'block';
    const releases = await fetchReleases();
    document.getElementById('loading').style.display = 'none';
    if (releases.length > 0) {
        const groups = groupReleases(releases);
        renderGroups(groups);
    }
}

init();