const terminalContent = document.getElementById('terminal-content');

// Commands without the '$' symbol in text
const commands = [
    {
        text: 'cd masham-portfolio',
        html: '<span class="command">cd</span> <span class="directory">masham-portfolio</span>'
    },
    {
        text: 'ls',
        html: '<span class="command">ls</span>'
    }
];

const outputLinks = `
    <div class="output">
        <a href="#" class="terminal-link">whoami</a>
        <a href="#" class="terminal-link">builds</a>
        <a href="#" class="terminal-link">ping me</a>
    </div>`;

let currentCommand = 0;
let charIndex = 0;
let tempLine = '';
let currentLine;
let cursorSpan;

function typeCommand() {
    const commandText = commands[currentCommand].text;

    if (charIndex < commandText.length) {
        tempLine += commandText[charIndex];
        currentLine.innerHTML = `<span class="dollar-sign">$</span> ` + tempLine;
        currentLine.appendChild(cursorSpan);
        charIndex++;
        setTimeout(typeCommand, 100);
    } else {
        // Replace with color-coded HTML once typing is complete
        currentLine.innerHTML = `<span class="dollar-sign">$</span> ` + commands[currentCommand].html;

        if (currentCommand < commands.length - 1) {
            currentCommand++;
            charIndex = 0;
            tempLine = '';

            // Immediately add the next line with static '$' and cursor
            currentLine = document.createElement('p');
            currentLine.innerHTML = `<span class="dollar-sign">$</span> `;
            cursorSpan = document.createElement('span');
            cursorSpan.classList.add('cursor');
            cursorSpan.textContent = '▊';
            currentLine.appendChild(cursorSpan);
            terminalContent.appendChild(currentLine);

            setTimeout(typeCommand, 500);
        } else {
            // Remove the cursor and show output links after typing is done
            setTimeout(() => {
                cursorSpan.remove();
                terminalContent.insertAdjacentHTML('beforeend', outputLinks);
            }, 500);
        }
    }
}

window.onload = () => {
    currentLine = document.createElement('p');
    currentLine.innerHTML = `<span class="dollar-sign">$</span> `;
    
    cursorSpan = document.createElement('span');
    cursorSpan.classList.add('cursor');
    cursorSpan.textContent = '▊';

    currentLine.appendChild(cursorSpan);
    terminalContent.appendChild(currentLine);

    typeCommand();
};
