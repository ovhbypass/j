const textInput = document.getElementById('textInput');
const speedInput = document.getElementById('speedInput');
const speedValue = document.getElementById('speedValue');
const loopInput = document.getElementById('loopInput');
const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const presetButton = document.getElementById('presetButton');

let isLooping = false;
let isSpeaking = false;
let speechChunks = [];
let currentChunkIndex = 0;

// Define a multiplier for speed adjustment
const speedMultiplier = 2;

speedInput.addEventListener('input', () => {
    speedValue.textContent = `${speedInput.value}x`;
});

playButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter some text.');
        return;
    }

    isLooping = loopInput.checked;
    isSpeaking = true;
    splitTextIntoChunks(text);
    currentChunkIndex = 0;
    speakNextChunk();
});

stopButton.addEventListener('click', () => {
    speechSynthesis.cancel();
    isSpeaking = false;
    isLooping = false;
});

presetButton.addEventListener('click', () => {
    fetch('preset.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load preset file');
            }
            return response.text();
        })
        .then(data => {
            textInput.value = data.trim(); // Set the preset text
        })
        .catch(error => {
            alert(`Error loading preset: ${error.message}`);
        });
});

function splitTextIntoChunks(text) {
    const maxChunkLength = 100; // Adjust for smaller chunks
    const regex = new RegExp(`.{1,${maxChunkLength}}(\\s|$)`, 'g');
    speechChunks = text.match(regex) || [];
}

function speakNextChunk() {
    if (currentChunkIndex >= speechChunks.length) {
        if (isLooping) {
            currentChunkIndex = 0; // Restart from the beginning
            speakNextChunk();
        } else {
            isSpeaking = false;
            return;
        }
    }

    const chunk = speechChunks[currentChunkIndex];
    const speech = new SpeechSynthesisUtterance(chunk);
    speech.rate = parseFloat(speedInput.value) * speedMultiplier;

    speech.onend = () => {
        currentChunkIndex++;
        if (isSpeaking) speakNextChunk();
    };

    speechSynthesis.speak(speech);
}
