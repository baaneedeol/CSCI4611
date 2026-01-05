$gitURL=(git config --get remote.origin.url) | Out-String

# Only allow these characters in the git URL: a-z, A-Z, 0-9, @, :, ., -, \, /
$gitURL=$gitURL -replace '[^a-zA-Z0-9\@\:\.\-\\\/]', ''

# Deleting existing temp directory, if any
if (Test-Path "./temp" -PathType Container)
{
    # Do these verbose remove commands because Powershell be complaining about non-empty dirs for no reason sometimes
    Get-ChildItem "./temp/*" -Recurse | Remove-Item -Force -Recurse
    Remove-Item -Force -Recurse "./temp"
    Write-Host "--- Deleted existing temp directory"
}

# Create temp dir for official build
mkdir temp
cd temp
Write-Host "--- Created temp directory"

# Fresh checkout of repo from github
git clone $gitURL
if ( $? -eq $true ) {
    Write-Host "--- cd-ing into cloned directory"
    cd *
    # TODO: If you need to add your name and email to local git config, add them here
    # git config user.name "Your Name"
    # git config user.email "email@umn.edu"
}
else {
    Write-Host "--- Cannot clone git repo"
    Write-Host "--- Please check that you have created a Github repo at $gitURL"
    exit 1
}

# Assign the temp/Asgn1-username/dist folder to be the content of gh-pages branch
git worktree add dist gh-pages --no-checkout
if ( $? -ne $true ) {
    git worktree add dist -b gh-pages --no-checkout
    Write-Host "--- No gh-pages"
}
else
{
    Write-Host "--- Has gh-pages"
}

npm install
npm run build

# Then push the temp dir to Github on gh-pages branch
cd dist
git add -A
git commit -m "Push official build to gh-pages branch"
git push -u origin gh-pages
Write-Host "--- Pushed official build to gh-pages branch"

# Then: Clean up
cd ..\..\..
Get-ChildItem "./temp/*" -Recurse | Remove-Item -Force -Recurse
Remove-Item -Force -Recurse "./temp"
Write-Host "--- Removed temp directory"
