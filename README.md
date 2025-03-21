# Reedy
Reedy is a Chrome extension to help you read stuff on the Internet. 
Reedy helps you read by darkening the screen except for a single line or sentence, so you can read them one at a time.

## Development
Reedy is written in `typescript`, and built with `vite` and `crxjs`. 

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
* Press `alt-l` to turn the Reedy-screen on and off.
* When the Reedy-screen is on, press `alt-upArrow` or `alt-downArrow` to move the highlighted range up or down
* You can also you `alt-j` and `alt-k` to move the highlighted range up or down

## Plans
* pdf mode built off of `pdfjs`

## Copyright
Copyright (c) 2025 Nathaniel Taylor
