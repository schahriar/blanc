# blanc
*blanc* is a static site generator for the modern web featuring **Jade**, **Markdown**, **LESS**, **Browserify** and more ... It utilizes [gulp](//www.npmjs.com/package/gulp) to build your sites in minutes without requiring any configuration! Did I mention that it runs a **livereload** enabled server for rapid development? No? Ok.
## Installation
```
npm install -g blanc
```
& then
```bash
mkdir site
cd site
blanc init && blanc watch
```
**blanc** will then start a development server at an available port between 8080 - 9000 and display the address in the console. This dev sever will have live-reload enabled by default!

You should then have a rapid development server setup at **localhost:8080** (or a higher port if occupied). You can monitor your development through the **blanc command line interface** packaged with this module:

![localhost](https://raw.githubusercontent.com/schahriar/blanc/master/e.g.png)

## Methods
### Init
```jade
blanc init <site-folder> <build-destination>
```
**Init** creates a new site in the current directory or the given **<site-filder>**. **<build-destination>** is used to determine where the rendered files should be stored. By default this value is set to *./* but you may want to change this to *dist* or *build*.

#### Flags
- --silent (disables the interface)

#### e.g.
```jade
blanc init ./ build
```

-----------
### Watch
```jade
blanc watch <site-folder>
```
**Watch** provides a rapid development interface (SERVER/CLI) that watches and builds as you develop. The changes then are automatically reloaded on the development server using the built-in livereload. **<site-folder>** is used to determine the site folder that was previously initialized. By default it is set to the current directory.

#### Flags
- --silent (prevents notifications | use --silent="force" to disable interface)
- --open   (opens development server in browser)

#### e.g.
```jade
blanc watch
```

----------

### Build
```jade
blanc build <build-destination> --zip
```
**Build** provides a build method similar to the Watch interface but it exits once done. This is useful to build your site into an archive. **<build-destination>** is used to determine the destination of the build. By default it is set to *build*.

#### Flags
- --silent  (disables the interface)
- --zip     (archives build to a zip file)
- --archive (alias for zip)

#### e.g.
```jade
blanc build ./build.zip --zip
```

## 10 Simple Rules
To take advantage of **blanc** you should follow a few rules:
- All Jade files must be stored in the **/source** directory and will represent a specific page rendered in the root of destination folder. You can create another level of directory within this directory (e.g. *./docs/setup.jade -> example.com/docs/setup.html*)
- All Jade locals must be stored in **/source/_locals.json**.
- All LESS files must be stored in the **/stylesheets** directory.
- All LESS includes which should **only** be rendered inline must be stored in the **/stylesheets/includes** directory.
- All Markdown files must be stored in the **/markdown** directory.
- All Markdown files must be exclusively included through Jade files.
- All Javascript files must be stored in the **/javascript** folder.
- All *Browserify* includes must originate from **/javascript/master.js**.
- All Resources (images, etc.) that are packaged with the build must be stored in the **/resources** directory. Resources can be nested to up to one level.
- The 10th rule is still a mystery!

## What's new?
- **Events**
- **API**
- **Build to directory/zip**
- **Launch in Browser**
- *Mocha Test Suite*
- *Better Init Interface*
- *Improved Command Line Interface*
- *Time tracker*
- *Browserify support*
- *OS Notifications*
- Jade locals support
- Better error handling
- Fixer for config file
- Autoprefixer for Less/CSS

## Live-reload
To take advantage of the livereload function you must install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) plugin or anything that provides support for livereload. Currently the only supported port is the default 35729 port.

## API
You can use **blanc** as a module:
```javascript
// Use true as the first attribute to silence blanc
var blanc = require('blanc')(<silent:Boolean>);

blanc.init(<directory>, <build-destination>, <silent>, function(error){
    blanc.watch(<directory>, <silent>, <open>, function(error, port){
        // Listen for events
        blanc.on('less:done', function(){
            console.log("LESS Files rendered!");
        })
    })
})
```
