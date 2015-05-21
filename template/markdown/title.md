Welcome to **blanc**!

To get started you will need to follow a few rules:
1. Store all Jade files in **/source** directory. Each file represents a specific page rendered in the root of destination folder. You can create another level of directory within this directory <small>(e.g. ./docs/setup.jade -> example.com/docs/setup.html)</small>
2. Store all Jade locals in **/source/_locals.json**. You can then include these locals/variable in your Jade files.
3. Store all Less files in the **/stylesheets** directory.
4. Store all Less includes in the **/stylesheets/includes** directory.
5. Store all Markdown files in the **/markdown** directory.
6. Include Markdown files in Jade source when needed. <small>e.g. include:markdown ../markdown/title.md</small>
7. Store all Javascript files in the **/javascript** directory.
8. Include all Browserify modules in **/javascript/master.js**.
9. Include **bundle.js** from **/resources/bundle.js** in your Jade layout.
10. Store all additional resources (images, videos, etc.) in the **/resources** folder.
**Create great things!**
