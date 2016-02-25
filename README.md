# pushtodeploy

`pushtodeploy` is a package which allows you to automatically deploy your Node.js application into your production or CI environment.

## What does it do?

1. Does a `git pull` to get the latest changes on your `master` (or other) branch.
1. Clones the repo into `.pushtodeploy/<commit-hash>`.
1. Copies the `node_module` from the latest deployed version.
1. Symlinks any secrets that are not in the repo into the build directory.
1. Runs `npm install` to install the package.
1. Runs `npm test`.
1. Updates the `.pushtodeploy/current` symlink to point to `.pushtodeploy/builds/<commit-hash>`.
1. Starts a simple server which listens to web hook events for pushes to your Git repo.

## How to use it

1. Run `npm install pushtodeploy --save`
1. Create a `pushtodeploy.json` config file:

1. Add `"deploy": "pushtodeploy --config pushtodeploy.json"` to `package.json`'s scripts:

       "scripts": {
         "deploy": "pushtodeploy"
       }
1. Clone your repo onto your production server. Run `npm run deploy`.
