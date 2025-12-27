# resource
VILOOK public resource

## GitHub Releases Downloader

This is a simple GitHub Pages site that displays and allows downloading of releases from the GitHub repository, grouped by app.

### Setup

1. Replace `your-github-username` and `Vilook` in `script.js` with your actual GitHub username and repository name.
2. Push these files to your GitHub repository.
3. Go to your repository settings > Pages, and set the source to "Deploy from a branch" and select the main branch (or whichever branch has these files).
4. The site will be available at `https://your-github-username.github.io/Vilook/resource/`

### Features

- Fetches releases from the specified GitHub repo.
- Skips releases containing "check_for_update_info" in the name.
- Groups releases by app prefix (e.g., "deep_logic_setup", "audio_setup").
- Displays release notes and download links for each version.
