# Init monorepo lambda with lerna

## Each lambda is a separate npm project.

## Install node_modules in each single project
```bash
$ npm run install:all
```

## Compile each single project (generate .dist)
```bash
$ npm run compile
```

## Push to repo using versioning
* https://github.com/semantic-release/semantic-release
```bash
$ npm run push
```

## Clean .dist
* Remove .dist in each single project
```bash
$ npm run clean
```

## Clean node_modules
* Remove node_modules in each single project
```bash
$ npm run clean:node
```

## Lerna command
```
$ npx lerna init --packages="Lambdas/*" --packages="Lib/*"
```

## For deploy
* paste credentials took from aws command line
* move into lambda file that want to deploy
* first time "chmod +x deploy.sh"
  * npm run deploy


## Useful link

https://lerna.js.org/docs/features/version-and-publish

https://github.com/lerna/lerna/tree/main/libs/commands/version#usage

https://github.com/lerna/getting-started-example/tree/main

https://www.youtube.com/watch?v=1oxFYphTS4Y

### Workspaces in package.json that I removed because I don't want all the dependencies will be installed in main node_module 
```
"workspaces": [
     "Lambdas/*",
     "Lib/*"
],
```