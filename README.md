# blanc
*blanc* is a zero config static site generator featuring **Jade**, **Markdown**, **LESS**, **Live-reload** and more ... It utilizes [gulp](//www.npmjs.com/package/gulp) to build your sites on the fly without requiring any config.

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

You should then have a rapid development server setup at **localhost:8080** (or a higher port if occupied)

![localhost](https://raw.githubusercontent.com/schahriar/blanc/master/e.g.png)

## Init Options
```jade
blanc init site-folder build-destination
```
By default the **build destination** and **site folder** are set at *./* or current active directory. You can change this only at site init. e.g.:
```jade
blanc init ./ dist
```

## Usage
To take advantage of **blanc** you should follow a few rules:
- All Jade files must be stored in the **/source** directory and will represent a specific page rendered in the root of destination folder. You can create another level of directory within this directory (e.g. *./docs/setup.jade -> example.com/docs/setup.html*)
- All Jade locals must be stored in **/source/_locals.json**.
- All LESS files must be stored in the **/stylesheets** directory.
- All LESS includes which should **only** be rendered inline must be stored in the **/stylesheets/includes** directory.
- All Markdown files must be stored in the **/markdown** directory.
- All Markdown files must be exclusively included through Jade files.
- All Resources (images, javascript, etc.) that are packaged with the build must be stored in the **/resources** directory. Resources can be nested to up to one level.

## What's new?
- Jade locals support
- Much better error handling
- Auto fixer for config file

## Live-reload
To take advantage of the livereload function you must install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) plugin or anything that provides support for livereload. Currently the only supported port is the default 35729 port.

### Alpha Warning
This application is still in Alpha stages. This means you should expect bugs and API changes but it should work fine as a development tool.
