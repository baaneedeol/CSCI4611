$gitURL=(git config --get remote.origin.url) | Out-String
$gitURL=$gitURL -replace "`n", ""

# Create temp dir for official build
mkdir temp
cd temp
Write-Host "--- Created temp directory"

# Fresh checkout of repo from github
git clone $gitURL
if ( $? -eq $true ) {
    Write-Host "--- cd-ing into cloned directory"
    cd *
}
else {
    Write-Host "--- Cannot clone git repo"
    Write-Host "--- Please check that you have created a Github repo at $gitURL"
    exit 1
}

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
rm -r -fo temp
Write-Host "--- Removed temp directory"
