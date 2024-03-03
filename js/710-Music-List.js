// Wait for the DOM to be fully loaded before executing the script
//console.log('1-Script loaded');
document.addEventListener('DOMContentLoaded', () => {
// Select all audio elements on the page
//console.log('2-DOM fully loaded and parsed');
const audioPlayers = document.querySelectorAll('audio');
//console.log(`Total audio elements found: ${audioPlayers.length}`);
let isPlaying = true; // Track play/pause status
let currentTrack = 0; // Index of the currently playing track
let isShuffle = false; // Shuffle mode status (off by default)
let repeatMode = 0; // Repeat mode status (0: No Repeat, 1: Repeat One, 2: Repeat All)
let shuffleOrder = []; // Array to hold the order of tracks when shuffling
// Function to initialize or update the order of tracks for shuffle mode
const updateShuffleOrder = () => {
    // Create an array with indices corresponding to the track list
    shuffleOrder = Array.from({length: audioPlayers.length}, (_, i) => i);
    if (isShuffle) {
        //console.log('3-Shuffle mode is on');
        let currentIndex = shuffleOrder.indexOf(currentTrack);
        shuffleOrder.splice(currentIndex, 1); // Remove the current track from shuffle order
        shuffleOrder.sort(() => Math.random() - 0.5); // Randomly shuffle the remaining tracks
        shuffleOrder.unshift(currentTrack); // Reinsert the current track at the start
    }
};
// Function to highlight the playing track
const highlightPlayingTrack = (index) => {
    const tracks = document.querySelectorAll('li');
    tracks.forEach((track, i) => {
        if (i === index) {
            track.classList.add('playing');
            // Ensure the playing track is visible on the screen
            track.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            track.classList.remove('playing');
        }
    });
};

const playTrack = (index) => {
    // First, pause and reset all tracks
    audioPlayers.forEach((audio, audioIndex) => {
        if (!audio.paused) {
            audio.pause(); // Pause any playing track
            audio.currentTime = 0; // Reset its time
        }
    });

    // Now, attempt to play the selected track
    const trackToPlay = audioPlayers[index];
    trackToPlay.play().then(() => {
        console.log(`Track ${index} is now playing.`);
        currentTrack = index; // Update the currentTrack index only after playback starts
        highlightPlayingTrack(index); // Highlight and scroll to the playing track
        }).catch(error => {
        console.error(`Error playing track ${index}:`, error);
    });
};

// Function to pause all tracks except the currently playing one
function pauseOtherTracks(currentIndex) {
    audioPlayers.forEach((audio, index) => {
    if (index !== currentIndex && !audio.paused) {
        audio.pause(); // Pause the track
        audio.currentTime = 0; // Optionally, reset its time
    }
});
}

// Add event listeners to each audio element
audioPlayers.forEach((audio, index) => {
audio.addEventListener('play', () => pauseOtherTracks(index));
});

document.getElementById('repeatTrack').addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    const repeatSymbols = ['', '🔂', '🔁'];
    const repeatTexts = ['OFF', 'ONE', 'ALL'];
    const button = document.getElementById('repeatTrack');
    button.textContent = repeatSymbols[repeatMode] + ' ' + repeatTexts[repeatMode];
    // Remove all possible classes before adding the new one to avoid conflicts
    button.classList.remove('repeat-off', 'repeat-one', 'repeat-all');
    button.classList.add('repeat-' + ['off', 'one', 'all'][repeatMode]); // Update the button's class based on the repeat mode
});
// Function to get the index of the next track to play
const getNextTrackIndex = () => {
    //console.log("5-Next function called");
    if (isShuffle) {
        // In shuffle mode, proceed according to the shuffled order
        let currentShuffleIndex = shuffleOrder.indexOf(currentTrack);
        return shuffleOrder[(currentShuffleIndex + 1) % shuffleOrder.length];
    }
    // In linear mode, simply proceed to the next track
    return (currentTrack + 1) % audioPlayers.length;
};

// Function to get the index of the previous track to play
const getPreviousTrackIndex = () => {
    //console.log("6-Previous function called");
    if (isShuffle) {
        // In shuffle mode, find the previous index in the shuffled order
        let currentShuffleIndex = shuffleOrder.indexOf(currentTrack);
        let prevIndex = (currentShuffleIndex - 1 + shuffleOrder.length) % shuffleOrder.length;
        return shuffleOrder[prevIndex];
    }
    // In linear mode, go back to the previous track
    return (currentTrack - 1 + audioPlayers.length) % audioPlayers.length;
};

// Function to toggle play/pause
const togglePlayPause = () => {
    if (isPlaying) {
        // If currently playing, pause all tracks
        audioPlayers.forEach(audio => audio.pause());
        isPlaying = false;
    } else {
        // If currently paused, play the current track
        playTrack(currentTrack);
        isPlaying = true;
    }
};

// Event listener for the play/pause button
document.getElementById('Play').addEventListener('click', togglePlayPause);

const playPauseButton = document.getElementById('Play');

playPauseButton.addEventListener('click', () => {
    if (audioPlayers[currentTrack].paused) {
        audioPlayers[currentTrack].play();
        playPauseButton.textContent = '▶️';//click will play the current track.
    } else {
        audioPlayers[currentTrack].pause();
        playPauseButton.textContent = '⏸️';//click will pause the current track
    }
});

// Design CSS for the play/pause button
const playButton = document.getElementById('Play');

// Function to toggle the "paused" class on the play button
const togglePausedClass = () => {
    playButton.classList.toggle('paused');
};

// Add event listener to the audio elements to toggle the class
audioPlayers.forEach((audio, index) => {
    audio.addEventListener('play', () => togglePausedClass());
    audio.addEventListener('pause', () => togglePausedClass());
});

 // Event listeners for controls
document.getElementById('nextTrack').addEventListener('click', () => {
    if (repeatMode === 1) {
      playTrack(currentTrack); // Repeat current track in "Repeat One" mode
    } else {
      playTrack(getNextTrackIndex());
    }
});

document.getElementById('prevTrack').addEventListener('click', () => {
    if (repeatMode === 1) {
      playTrack(currentTrack); // Repeat current track in "Repeat One" mode
    } else {
      playTrack(getPreviousTrackIndex());
    }
});

// Event listener for toggling shuffle mode
document.getElementById('shuffleTrack').addEventListener('click', () => {
    isShuffle = !isShuffle; // Toggle shuffle mode
    document.getElementById('shuffleTrack').classList.toggle('active', isShuffle); // Update button appearance
    updateShuffleOrder(); // Reinitialize shuffle order with the new mode
});

// Set up handling for when a track ends
audioPlayers.forEach((player, index) => {
    player.onended = () => {
            let nextIndex = getNextTrackIndex();
            if (nextIndex === currentTrack && repeatMode === 0) {
                // If it's the last track and no repeat mode is active, do nothing
                return;
            }
            playTrack(nextIndex); // Otherwise, move to the next track
        };
});

updateShuffleOrder(); // Initialize shuffle order when the page loads

//make the changing images background same as the gif
const images_header = [
    'url(https://tuphung1787.github.io/TuPhung/image/menu.png)',
    'url(https://tuphung1787.github.io/TuPhung/image/main_1.jpg)',
       // Add as many images as you want, ensure they're wrapped with url()
];
const images_main = [
    'url(https://tuphung1787.github.io/TuPhung/image/art_6.png)',
    'url(https://tuphung1787.github.io/TuPhung/image/art_7.png)',
    'url(https://tuphung1787.github.io/TuPhung/image/art_8.png)',
       // Add as many images as you want, ensure they're wrapped with url()
];
let currentIndex = 0;

const changeBackgroundImage = () => {
    // Change the background image to the header images.
    const headerElement = document.getElementById('dynamicHeader');
    headerElement.style.backgroundImage = images_header[currentIndex];
    currentIndex = (currentIndex + 1) % images_header.length; // Loop back to the first image

    const MainElement = document.getElementById('dynamicMain');
    MainElement.style.backgroundImage = images_main[currentIndex];
    currentIndex = (currentIndex + 1) % images_main.length; // Loop back to the first image

};

// Set the interval to change the background image. 1000ms = 1 second
setInterval(changeBackgroundImage, 1000); // Change background image every 1 seconds

});
