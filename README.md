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

## Options
### Init
```jade
blanc init site-folder build-destination
```
By default the **build destination** and **site folder** are set at *./* or current active directory. You can change this only at site init. e.g.:
```jade
blanc init ./ dist
```
### Watch
By default the watch command works in the **current directory** and **creates notifications**. You can change this behavior using:
```javascript
// Set destination
blanc watch ./mysite
// Silent notifications
blanc watch --silent
// Launch in browser
blanc watch --open
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
- **Launch in Browser**
- **Mocha Test Suite**
- **Better Init Interface**
- **Improved Command Line Interface**
- **Time tracker**
- *Browserify support*
- *OS Notifications*
- Jade locals support
- Much better error handling
- Auto fixer for config file

## Live-reload
To take advantage of the livereload function you must install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) plugin or anything that provides support for livereload. Currently the only supported port is the default 35729 port.
