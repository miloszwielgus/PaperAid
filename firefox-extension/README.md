# Firefox PDF Activation Extension

This is a simple Firefox extension that activates when the user is browsing a PDF file. It displays a pop-up message indicating whether the extension was successfully activated or not.

## Features

- User-activated extension
- Displays "activated" when browsing a PDF file
- Displays "could not activate" when not browsing a PDF file

## Project Structure

```
firefox-extension
├── src
│   ├── background.js      # Background script that checks the current tab's URL
│   ├── manifest.json      # Configuration file for the extension
│   └── popup
│       ├── popup.html     # HTML structure for the popup
│       └── popup.js       # JavaScript for handling popup messages
└── README.md              # Documentation for the extension
```

## Installation

1. Clone the repository or download the source code.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click on "Load Temporary Add-on".
4. Select the `manifest.json` file from the `src` directory.

## Usage

- Navigate to any PDF file in Firefox.
- Click on the extension icon to activate it.
- A pop-up will display "activated" if you are on a PDF file, or "could not activate" if you are on any other type of page.

## License

This project is licensed under the MIT License.