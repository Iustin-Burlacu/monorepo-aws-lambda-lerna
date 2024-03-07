# Init Lambda

Each lambda is a separate npm project.
 
In Lambdas directory in each lambda file:
* run "npm install".
* run "npm run compile"


For deploy
* paste credentials took from aws command line
* move into lambda file that want to deploy
* first time "chmod +x deploy.sh"
  * npm run deploy


# Lerna
npx lerna init --packages="Lambdas/*" --packages="Lib/*"

https://lerna.js.org/docs/features/version-and-publish
https://github.com/lerna/lerna/tree/main/libs/commands/version#usage

https://github.com/lerna/getting-started-example/tree/main
https://www.youtube.com/watch?v=1oxFYphTS4Y

# Workspaces in package.json that I removed because I don't want all the dependencies will be installed in main node_module 
```
"workspaces": [
     "Lambdas/*",
     "Lib/*"
],
```

lerna version: "lerna": "^8.1.2"