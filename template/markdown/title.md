Welcome to **blanc**!

To get started you will need to follow a few rules:
1. Store all Jade files in **/source** directory. Each file represents a specific page rendered in the root of destination folder. You can create another level of directory within this directory <small>(e.g. ./docs/setup.jade -> example.com/docs/setup.html)</small>
- Store all Jade locals in **/source/_locals.json**. You can then include these locals/variable in your Jade files.
- Store all Less files in the **/stylesheets** directory.
- Store all Less includes in the **/stylesheets/includes** directory.
- Store all Markdown files in the **/markdown** directory.
- Include Markdown files in Jade source when needed. <small>e.g. include:markdown ../markdown/title.md</small>
- Store all Javascript files in the **/javascript** directory.
- Include all Browserify modules in **/javascript/master.js**.
- Store all additional resources (images, videos, etc.) in the **/resources** folder.
- Create great things!
