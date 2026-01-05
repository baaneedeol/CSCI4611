#!/bin/bash

# Concerns:
# - Students need to learn some git, don't hide everything
# - But setting up the deployment process so that it can push to a separate gh-pages branch is an involved process that requires some automation scripts

# Proposed solution:
# So we will let students have experience with Git, but maybe just to commit and push do their source code. And we will ease the deployment process. Also, source code on github and dist can get out of sync if student forgets to push either of them. So we will probably go with this strategy: ignore local source, do a build from the version on Github 

gitURL=$(git config --get remote.origin.url)

# Create temp dir for official build
mkdir temp
cd temp
echo "--- Created temp directory"

# Fresh checkout of repo from github
git clone $gitURL
if [ $? -eq 0 ]; then
    echo "--- cd-ing into cloned directory"
    cd */
else
    echo "--- Cannot clone git repo"
    echo "--- Please check that you have created a Github repo at $gitURL"
    exit 1
fi

# Inside temp, create dist folder that sync up with gh-pages branch
git worktree add dist gh-pages --no-checkout
if [ $? -ne 0 ]; then
    git worktree add dist -b gh-pages --no-checkout
    echo "--- No gh-pages"
else
    echo "--- Has gh-pages"
fi

npm install
npm run build

# Then push the temp dir to Github on gh-pages branch
cd dist
git add -A
git commit -m "Push official build to gh-pages branch"
git push -u origin gh-pages
echo "--- Pushed official build to gh-pages branch"

# Then: Clean up
cd ../../..
rm -rf temp
echo "--- Removed temp directory"
