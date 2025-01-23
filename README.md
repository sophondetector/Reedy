# Reedy
A Chrome extension to help you stuff on the Internet. Built with `typescript`, `vite`, and `crxjs`.

![gif](demo.mov)

## Installation
### Building
There's no "official" distribution yet, so you gotta install all the dev dependencies and then build it yourself.
```sh
$ npm i -D
$ npm run build
```
This will create the source code in the `dist/` folder. You can then install it as an unpacked chrome extension. 

### Loading an Unpacked Chrome Extension
1. Do the build steps above
1. In Chrome, navigate to `chrome://extensions`
1. Ensure `Developer mode` is on (upper right corner)
1. Click `Load unpacked` (upper left corner)
1. Navigate to the `dist/` folder you created in the build steps above
1. Load the `dist/` folder

## Usage
1. Highlight the text you want to load into `Reedy`
1. Right click, choose `Reedy > Open as new text in Reedy`
1. In the `Reedy` tab click `Reading Mode` (upper right) 
1. Scroll through the sentences using the `up` and `down` arrows, or the keys `j` and `k` 
1. If you want to add to an existing text, highlight the text you want to add, right click and choose `Reedy > Add selection to existing text in Reedy`

## Developer Mode
Press `ctrl + <backtick>` to enable **super janky** features that are in development.

## Plans
* pdf mode built off of `pdfjs`
* unify the apis for the line-by-line and sent-by-sent viewers
* *in page* senting and line-by-line viewer

# Copyright
Copyright (c) 2025 Nathaniel Taylor
