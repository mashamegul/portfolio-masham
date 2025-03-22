const terminalContent = document.getElementById('terminal-content');

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
        currentLine.innerHTML = `<span class="dollar-sign">$</span> ` + commands[currentCommand].html;

        if (currentCommand < commands.length - 1) {
            currentCommand++;
            charIndex = 0;
            tempLine = '';

            currentLine = document.createElement('p');
            currentLine.innerHTML = `<span class="dollar-sign">$</span> `;
            cursorSpan = document.createElement('span');
            cursorSpan.classList.add('cursor');
            cursorSpan.textContent = '▊';
            currentLine.appendChild(cursorSpan);
            terminalContent.appendChild(currentLine);

            adjustTerminalHeight();

            setTimeout(typeCommand, 500);
        } else {
            setTimeout(() => {
                cursorSpan.remove();
                terminalContent.insertAdjacentHTML('beforeend', outputLinks);

                adjustTerminalHeight();
            }, 500);
        }
    }
}

function adjustTerminalHeight() {
    const terminalWindow = document.querySelector('.terminal-window');
    const contentHeight = terminalContent.scrollHeight; // Get the total height of the content
    terminalWindow.style.height = `${contentHeight + 40}px`; // Add some padding for smoothness
}

window.onload = () => {
    currentLine = document.createElement('p');
    currentLine.innerHTML = `<span class="dollar-sign">$</span> `;
    
    cursorSpan = document.createElement('span');
    cursorSpan.classList.add('cursor');
    cursorSpan.textContent = '▊';

    currentLine.appendChild(cursorSpan);
    terminalContent.appendChild(currentLine);

    adjustTerminalHeight();

    typeCommand();
};

const syncPointer = ({ x, y }) => {
    document.documentElement.style.setProperty('--x', x.toFixed(2));
    document.documentElement.style.setProperty(
    '--xp',
    (x / window.innerWidth).toFixed(2)
    );
    document.documentElement.style.setProperty('--y', y.toFixed(2));
    document.documentElement.style.setProperty(
    '--yp',
    (y / window.innerHeight).toFixed(2)
    );
};

document.body.addEventListener('pointermove', syncPointer);