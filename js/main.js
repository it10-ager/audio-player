var player = document.getElementById('player');
var rewindButton = document.getElementById('btn-rewind-10');
var playPauseButton = document.getElementById('btn-play-pause');
var forwardButton = document.getElementById('btn-forward-30');
var slider = document.getElementById('slider');
var currentTime = document.getElementById('current-time');
var totalTime = document.getElementById('total-time');
var playlist = document.getElementById('playlist');
var speedButtons = document.querySelectorAll('.player-controls button[id^="btn-speed-"]');
var defaultSpeedButton = document.querySelector('[id="btn-speed-1.0"]');
var previousButton = document.getElementById('btn-previous-track');
var nextButton = document.getElementById('btn-next-track');
var timeIndicator = document.getElementById('time-indicator');
let currentTrackIndex = 0;
var initialSliderValue = 0;
let isPaused = false;
let isPlaying = false;
let lastPlayedTime = 0;
let playbackRate = 1.0;
let isSeeking = false;

// Play the audio
function playAudio() {
	if (!player.src || player.src === '') {
		player.src = tracks[currentTrackIndex].url;
		player.load();
	}
	if (player.src) {
		player.play();
		playPauseButton.innerHTML = 'Pause';
		if (isPaused) {
			player.currentTime = lastPlayedTime;
			isPaused = false;
		}
	}
	player.playbackRate = playbackRate;
}

// Pause the audio
function pauseAudio() {
	player.pause();
	playPauseButton.innerHTML = 'Play';
	isPaused = true;
	lastPlayedTime = player.currentTime;
}

// Rewind the audio by 10 seconds
function rewindAudio() {
	player.currentTime -= 10;
}

// Forward the audio by 30 seconds
function forwardAudio() {
	player.currentTime += 30;
}

// Update the current time display
function updateTimeDisplay() {
	let currentHours = Math.floor(player.currentTime / 3600);
	let currentMinutes = Math.floor((player.currentTime % 3600) / 60);
	let currentSeconds = Math.floor(player.currentTime % 60);
	let totalHours = Math.floor(player.duration / 3600);
	let totalMinutes = Math.floor((player.duration % 3600) / 60);
	let totalSeconds = Math.floor(player.duration % 60);

	if (!isNaN(player.duration))
		totalTime.innerHTML = `${totalHours < 10 ? '0' : ''}${totalHours}:${totalMinutes < 10 ? '0' : ''}${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
	currentTime.innerHTML = `${currentHours < 10 ? '0' : ''}${currentHours}:${currentMinutes < 10 ? '0' : ''}${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;

	if (!isNaN(player.duration) && player.duration > 0) {
		slider.value = (player.currentTime / player.duration) * 100;
	} else { slider.value = 0; }
}

// Play the selected track from its start time
function playTrack(trackId) {
	let selectedTrack = tracks.find(track => track.id === trackId);
	if (!selectedTrack) { return; }
	player.src = selectedTrack.url;
	player.playbackRate = playbackRate;
	player.currentTime = selectedTrack.startTime;
	lastPlayedTime = 0;
	player.src = selectedTrack.url;
	isPaused = false;
	playAudio();
	currentTrackIndex = tracks.findIndex(track => track.id === trackId);
	playlist.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
	playlist.querySelectorAll('li')[currentTrackIndex].classList.add('selected');
	// Сброс положения ползунка к начальному значению
	slider.value = initialSliderValue;
}

// Play or pause the selected track
function togglePlayPauseTrack(trackId) {
	let selectedTrack = tracks.find(track => track.id === trackId);
	if (!selectedTrack) { return; }

	if (!player.paused && currentTrackIndex === tracks.findIndex(track => track.id === trackId)) {
		pauseAudio();
	} else {
		playTrack(trackId);
	}
}

// Toggle favorite state and save to local storage
function toggleFavorite(index) {
	let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	var currentIndex = favorites.indexOf(index);

	if (currentIndex !== -1) {
		// Remove from favorites
		favorites.splice(currentIndex, 1);
	} else {
		// Add to favorites
		favorites.push(index);
	}

	localStorage.setItem('favorites', JSON.stringify(favorites));

	// Update star color
	let li = playlist.querySelector(`li[data-index="${index}"]`);
	if (li) {
		let star = li.querySelector('.star');
		star.classList.toggle('yellow');
		if (star.classList.contains('yellow')) {
			// Add to favorites
			favorites.push(index);
		} else {
			let currentIndex = favorites.indexOf(index);
			if (currentIndex !== -1) {
				// Remove from favorites
				favorites.splice(currentIndex, 1);
			}
		}
	}
}

// Check if the track at the given index is marked as favorite
function isFavorite(index) {
	let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	return favorites.includes(index);
}

// Create playlist items for each track
function createPlaylistItems() {
	currentTrackIndex = 0;
	tracks.forEach((track, index) => {
		let li = document.createElement('li');
		li.innerHTML = `${index + 1}. ${track.title} <span class="star">&#9733;</span>`;

		li.addEventListener('click', () => {
			togglePlayPauseTrack(track.id);
			currentTrackIndex = index;
		});

		// Add click event listener to the star
		let star = li.querySelector('.star');
		star.addEventListener('click', (event) => {
			// Prevent the click event from propagating to the li element
			event.stopPropagation();
			// Toggle the 'yellow' class on the star element
			star.classList.toggle('yellow');
			toggleFavorite(index);
		});

		if (index === 0) {
			li.classList.add('selected');
		}
		playlist.appendChild(li);
		// Check if the track is marked as favorite and update star color
		if (isFavorite(index)) {
			star.classList.add('yellow');
		}
	});
}

playPauseButton.addEventListener('click', () => {
	if (player.paused) {
		playAudio();
	} else {
		pauseAudio();
		isPaused = true;
	}
});

defaultSpeedButton.classList.add('active-speed');
player.playbackRate = parseFloat(defaultSpeedButton.innerHTML);

speedButtons.forEach(button => {
	let speed = parseFloat(button.innerHTML);
	button.addEventListener('click', function () {
		player.playbackRate = speed;
		playbackRate = player.playbackRate;
		speedButtons.forEach(btn => btn.classList.remove('active-speed'));
		this.classList.add('active-speed');
	});
});

// Play the previous track
function playPreviousTrack() {
	currentTrackIndex--;
	if (currentTrackIndex < 0) {
		currentTrackIndex = tracks.length - 1;
	}
	pauseAudio();
	playTrack(tracks[currentTrackIndex].id);
	isPaused = true;
}

// Play the next track
function playNextTrack() {
	currentTrackIndex++;
	if (currentTrackIndex >= tracks.length) {
		currentTrackIndex = 0;
	}
	pauseAudio();
	playTrack(tracks[currentTrackIndex].id);
	isPaused = true;
}

previousButton.addEventListener('click', playPreviousTrack);
nextButton.addEventListener('click', playNextTrack);
rewindButton.addEventListener('click', rewindAudio);
forwardButton.addEventListener('click', forwardAudio);

slider.addEventListener('input', () => {
	let seekTime = (slider.value / 100) * player.duration;
	if (!isNaN(seekTime)) {
		player.currentTime = seekTime;
		updateTimeIndicator(seekTime);
	}
});

slider.addEventListener('mousedown', () => {
	isSeeking = true;
	showTimeIndicator();
});

slider.addEventListener('mouseup', () => {
	isSeeking = false;
	hideTimeIndicator();
	if (currentTrackIndex === -1) {
		slider.value = initialSliderValue;
	}
});

// for mobile devices
slider.addEventListener('touchstart', (e) => {
	isSeeking = true;
	showTimeIndicator();
});

slider.addEventListener('touchend', (e) => {
	isSeeking = false;
	hideTimeIndicator();
	if (currentTrackIndex === -1) {
		slider.value = initialSliderValue;
	}
});

function updateTimeIndicator(time) {
	let currentHours = Math.floor(time / 3600);
	let currentMinutes = Math.floor((time % 3600) / 60);
	let currentSeconds = Math.floor(time % 60);
	timeIndicator.innerHTML = `${currentHours < 10 ? '0' : ''}${currentHours}:${currentMinutes < 10 ? '0' : ''}${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
}

function showTimeIndicator() {
	timeIndicator.style.display = 'flex';
	timeIndicator.style.background = 'rgba(0, 0, 0, 0.5)';
}

function hideTimeIndicator() {
	timeIndicator.style.display = 'none';
	timeIndicator.style.background = 'rgba(0, 0, 0, 0);';
}

player.addEventListener('timeupdate', () => {
	if (!isSeeking) {
		updateTimeDisplay();
		updateTimeIndicator(player.currentTime);
	}
});

player.addEventListener('ended', () => {
	pauseAudio();
	isPaused = true;
});

createPlaylistItems();
// Restore favorites from Local Storage and update star colors
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
favorites.forEach(index => {
	let li = playlist.querySelector(`li[data-index="${index}"]`);
	if (li) {
		let star = li.querySelector('.star');
		star.classList.add('yellow');
	}
});
playPauseButton.innerHTML = 'Play';

function handleError(error) {
	// to ignore error
}

window.addEventListener('error', function (event) {
	event.preventDefault();
	handleError(event.error);
});

window.addEventListener('unhandledrejection', function (event) {
	event.preventDefault();
	handleError(event.reason);
});