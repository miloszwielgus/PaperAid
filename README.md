# PaperAid

PaperAid is a chrome extension which helps you to read and understand scientific papers (or any other pdf documents) by parsing them, extracting definitions from them and later displaying them as tooltips over previously defined words / phrases. It is built on top of [PDF.js](https://mozilla.github.io/pdf.js/) - community driven pdf-reader supported by Mozilla.




## Getting the Code and setting it up

To get a local copy of the current code, clone it using git:

    $ git clone https://github.com/miloszwielgus/PaperAid
    $ cd paper-aid/pdf.js

Next, install Node.js via the [official package](https://nodejs.org) or via
[nvm](https://github.com/creationix/nvm). If everything worked out, install
all dependencies for PDF.js and build the chrome extension:

    $ npm install
    $ npx gulp chromium

Now go to the server folder and create the venv:

    $ cd ../server
    $ touch .env
    $ python -m venv paper-aid
    $ source paper-aid/bin/activate
    $ pip install -r requirements.txt

Get your free Groq API key from [Groq webiste](https://console.groq.com/keys) and paste it into the .env file you just created along with port number you want your server to run on so it looks like:
`GROQ_API_KEY=<your-api-key>`  
`PORT=<your-port number>`  
Launch the server:

    $ python3 server.py

Then you can open Chrome, go to `Extensions (puzzle symbol) > Manage extensions` click `Load unpacked` and select `~/paper-aid/pdf.js/build/chromium`


## Usage
When reading a PDF file select the portion of text you want to extract the definitions from (or hit `Ctrl + A` to select all of it), click your right mouse button and select `Process selected text` in the context menu. Now when you hover over a defined word / phrase and hit `Ctrl` button a tooltip with the definition will be displayed. 
Next time you open that PDF file the defintions will load automatically. Keep in mind that if you want to extract definitions from another portion of text they will overwrite the existing ones.
