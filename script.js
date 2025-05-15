document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const iconItems = document.querySelectorAll('.icon-item');
    const modals = document.querySelectorAll('.modal');
    const clickSound = document.getElementById('clickSound');

    // Music Player DOM Elements
    const playerAlbumArtImg = document.getElementById('player-album-art-img');
    const playerSongTitle = document.getElementById('player-song-title');
    const playerSongArtist = document.getElementById('player-song-artist');
    const playerPrevBtn = document.getElementById('player-prev-btn');
    const playerPlayPauseBtn = document.getElementById('player-play-pause-btn');
    const playerPlayPauseIcon = playerPlayPauseBtn.querySelector('i');
    const playerNextBtn = document.getElementById('player-next-btn');
    const playerCurrentTime = document.getElementById('player-current-time');
    const playerTotalTime = document.getElementById('player-total-time');
    const playerProgressBar = document.getElementById('player-progress-bar');
    
    // Volume Controls (now part of the player bar, but IDs are the same)
    const musicVolumeIcon = document.getElementById('music-volume-icon');
    const volumeSlider = document.getElementById('volume-slider');


    // --- State Variables ---
    let modalBaseZIndex = 1000;
    const modalStates = new Map();
    let p5SketchInstance;
    let lastVolumeBeforeIconClickMute = 0.7; // Default starting volume for p5 sketch

    // --- Playlist Definition ---
    // IMPORTANT: Customize this playlist with your actual song data
    // Ensure file paths are correct and files exist in your project structure.
    const playlist = [
        {
            title: "гуляю",
            artist: "ANGUISH, EXILED, elfass",
            filePath: "assets/PLAYLIST/ANGUISH_HEXILED_elfass_Gulyau.mp3",
            albumArtPath: "assets/PLAYLIST_COVERS/gulyau_cover.jpg" // UPDATE THIS PATH
        },
        {
            title: "it's rainy outside",
            artist: "uselet",
            filePath: "assets/PLAYLIST/its_rainy_outside.mp3",
            albumArtPath: "assets/PLAYLIST_COVERS/its_rainy_outside_cover.jpg" // UPDATE THIS PATH
        },
        {
            title: "Aegleseeker",
            artist: "Silentroom vs Frums",
            filePath: "assets/PLAYLIST/Silentroom_vs_Frums_Aegleseeker.mp3",
            albumArtPath: "assets/PLAYLIST_COVERS/aegleseeker_cover.jpg" // UPDATE THIS PATH
        },
        {
            title: "World execute (me)",
            artist: "Mili",
            filePath: "assets/PLAYLIST/World_execute_(me)_Mili.mp3",
            albumArtPath: "assets/PLAYLIST_COVERS/world_execute_me_cover.jpg" // UPDATE THIS PATH
        }
        // Add more songs here if you have them
    ];
    let currentSongIndex = 0;
    let currentP5Song = null; // Will hold the p5.SoundFile object
    let isPlayerGloballyPlaying = false; // Tracks if the player *should* be playing (e.g., after user interaction)
    let isSongLoadedAndReady = false;


    // --- Work Section Data (Sin cambios) ---
    const workData = [
        { type: 'banner', text: 'Accepting work offers via my <a href="mailto:kawacoline@gmail.com">work email</a>. I do illustration, animation, web design, and web/app development. :)' },
        { type: 'tags', title: 'TOOLS', items: ['Adobe Photoshop', 'Adobe Animate', 'Clip Studio Paint', 'Unity 2D/3D', 'Adobe Illustrator', 'Adobe Premiere', 'Adobe After Effects', 'Blender', 'OpenToonz', 'InDesign', 'Figma']},
        { type: 'tags', title: 'DEVELOPMENT', items: ['C#', 'C++', 'C', 'Python', 'JavaScript', 'HTML/CSS', 'React', 'Gatsby', 'Next.js']},
        { type: 'videos', title: 'ANIMATION', items: [ { title: 'candy: a zelink fan animation', youtubeId: 'dQw4w9WgXcQ' }, { title: 'of the wild', youtubeId: 'oHg5SJYRHA0' }, { title: 'take me home, country roads', youtubeId: '1t_4YvN1B9w' }, { title: 'the duck', youtubeId: 'MtN1YnoL46Q' } ]},
        { type: 'gallery', title: 'ILLUSTRATION', items: [ 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+1', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+2', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+3', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+4', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+5', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+6', ]},
        { type: 'devProjects', title: 'PROJECTS', items: [ { title: 'Bingus Adventure', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Bingus', description: "a buggy RPG i made with a friend in college for a game jam, held by my game dev student org <a href='#' target='_blank'>DevelUP!</a> i worked on the programming and sprite art for this one, my friend Vince did the design, awesome writing, and environment art! it won't give you a virus but you'll probably encounter a lot of bugs LOL but i thought it would be fun to share here hehe, enjoy (or not)!!", downloadLink: '#', }, { title: 'This Website!', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Portfolio', description: "The very portfolio you are looking at now. Built with HTML, CSS, and vanilla JavaScript. Features include draggable and resizable modal windows, and an audio visualizer.", } ]},
        { type: 'footerText', text: "See more on <a href='https://github.com/yourusername' target='_blank'>GitHub</a>."}
    ];

    // --- Render Work Section ---
    function renderWorkSection(contentElement) {
        contentElement.innerHTML = '';
        workData.forEach(section => {
            const sectionDiv = document.createElement('div'); sectionDiv.className = 'work-section';
            if (section.title && section.type !== 'banner' && section.type !== 'footerText') { const titleEl = document.createElement('h3'); titleEl.textContent = section.title; sectionDiv.appendChild(titleEl); }
            switch (section.type) {
                case 'banner': const bannerDiv = document.createElement('div'); bannerDiv.className = 'work-top-banner'; bannerDiv.innerHTML = section.text; contentElement.appendChild(bannerDiv); return;
                case 'tags': const tagsContainer = document.createElement('div'); tagsContainer.className = 'work-tags'; section.items.forEach(tagText => { const tagEl = document.createElement('span'); tagEl.className = 'work-tag'; tagEl.textContent = tagText; tagsContainer.appendChild(tagEl); }); sectionDiv.appendChild(tagsContainer); break;
                case 'videos': const videoGrid = document.createElement('div'); videoGrid.className = 'work-video-grid'; section.items.forEach(video => { const itemDiv = document.createElement('div'); itemDiv.className = 'work-video-item'; itemDiv.innerHTML = `<iframe src="https://www.youtube.com/embed/${video.youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><p>${video.title}</p>`; videoGrid.appendChild(itemDiv); }); sectionDiv.appendChild(videoGrid); break;
                case 'gallery': const galleryGrid = document.createElement('div'); galleryGrid.className = 'work-image-gallery'; section.items.forEach(imgSrc => { const itemDiv = document.createElement('div'); itemDiv.className = 'work-gallery-item'; itemDiv.innerHTML = `<img src="${imgSrc}" alt="Illustration">`; galleryGrid.appendChild(itemDiv); }); sectionDiv.appendChild(galleryGrid); break;
                case 'devProjects': const projectList = document.createElement('ul'); projectList.className = 'work-project-list'; section.items.forEach(project => { const itemLi = document.createElement('li'); itemLi.className = 'work-project-item'; itemLi.innerHTML = `${project.image ? `<img src="${project.image}" alt="${project.title} thumbnail" class="project-thumbnail">` : ''}<div class="work-project-content"><h4>${project.title}</h4><p>${project.description}</p><div class="work-project-links">${project.downloadLink ? `<a href="${project.downloadLink}" target="_blank">Download Page</a>` : ''}${project.detailsLink ? `<a href="${project.detailsLink}" target="_blank">Details</a>` : ''}</div></div>`; projectList.appendChild(itemLi); }); sectionDiv.appendChild(projectList); break;
                case 'footerText': const footerTextP = document.createElement('p'); footerTextP.style.textAlign = 'center'; footerTextP.style.marginTop = '20px'; footerTextP.innerHTML = section.text; contentElement.appendChild(footerTextP); return;
            }
            if (section.type !== 'banner' && section.type !== 'footerText') { contentElement.appendChild(sectionDiv); }
        });
    }

    // --- Modal Initialization & Logic ---
    modals.forEach(modal => {
        modalStates.set(modal, {
            isOpen: false,
            isMaximized: false,
            isMinimized: false,
            original: {
                left: '50%',
                top: '50%',
                width: getComputedStyle(modal).width,
                transform: 'translate(-50%, -50%) scale(0.9)'
            },
            current: {}
        });
    
    });
    
        iconItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                playClickSound();
                handleGlobalUserInteraction(); // Ensures music context starts if not already
                const modalId = item.dataset.modalTarget;
                const targetModal = document.querySelector(modalId);
                if (targetModal) openModal(targetModal);
            });
        });

    function openModal(modal) {
        const state = modalStates.get(modal);
        modalBaseZIndex++;
        modal.style.zIndex = modalBaseZIndex;
        modal.classList.remove('minimized', 'maximized');

        modal.style.left = state.original.left;
        modal.style.top = state.original.top;
        modal.style.width = state.original.width;
        modal.style.transform = state.original.transform;

        if (modal.id === 'work-modal') renderWorkSection(modal.querySelector('.modal-content'));

        void modal.offsetWidth;
        modal.classList.add('active');
        modal.style.transform = 'translate(-50%, -50%) scale(1)';

        state.isOpen = true;
        state.isMinimized = false;
        state.isMaximized = false;
        state.current = {
            left: '50%',
            top: '50%',
            width: state.original.width,
            transform: 'translate(-50%, -50%) scale(1)'
        };
    }

    function handleModalButtonInteraction(e) {
        if (e) e.stopPropagation();
        playClickSound();
    }

    modals.forEach(modal => {
        const state = modalStates.get(modal);
        const closeBtn = modal.querySelector('.close-btn');
        const minimizeBtn = modal.querySelector('.minimize-btn');
        const maximizeBtn = modal.querySelector('.maximize-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                handleModalButtonInteraction(e);
                const wasMinimized = state.isMinimized;
                modal.classList.remove('active', 'minimized', 'maximized');
                modal.style.left = state.original.left;
                modal.style.top = state.original.top;
                modal.style.width = state.original.width;
                modal.style.transform = state.original.transform;
                modal.style.removeProperty('--minimized-left');
                state.isOpen = false;
                state.isMaximized = false;
                state.isMinimized = false;
                state.minimizedOffset = undefined;
                if (wasMinimized) {
                    recalculateMinimizedOffsets();
                }
            });
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                handleModalButtonInteraction(e);
                modalBaseZIndex++;
                modal.style.zIndex = modalBaseZIndex;
                if (!state.isMinimized) {
                    if (!state.isMaximized) {
                        state.current = {
                            left: modal.style.left, top: modal.style.top,
                            width: modal.style.width, transform: modal.style.transform
                        };
                    }
                    modal.classList.add('minimized');
                    modal.classList.remove('maximized', 'active');
                    let calculatedLeftOffset = baseMinimizedInitialOffset;
                    document.querySelectorAll('.modal.minimized').forEach(m => {
                        if (m !== modal) {
                            const otherState = modalStates.get(m);
                            if (otherState && otherState.minimizedOffset !== undefined) {
                                calculatedLeftOffset = Math.max(calculatedLeftOffset, otherState.minimizedOffset + minimizedWindowWidth + minimizedWindowSpacing);
                            }
                        }
                    });
                    modal.style.setProperty('--minimized-left', `${calculatedLeftOffset}px`);
                    state.minimizedOffset = calculatedLeftOffset;
                    state.isMinimized = true;
                    state.isMaximized = false;
                } else {
                    modal.classList.remove('minimized');
                    modal.classList.add('active');
                    state.minimizedOffset = undefined;
                    modal.style.removeProperty('--minimized-left');
                    recalculateMinimizedOffsets();
                    const restoreState = (state.current && state.current.left && state.current.left !== '50%') ? state.current : {
                        left: '50%', top: '50%', width: state.original.width, transform: 'translate(-50%, -50%) scale(1)'
                    };
                    modal.style.left = restoreState.left;
                    modal.style.top = restoreState.top;
                    modal.style.width = restoreState.width;
                    modal.style.transform = restoreState.transform;
                    modal.style.bottom = 'auto';
                    state.isMinimized = false;
                }
            });
        }

        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', (e) => {
                handleModalButtonInteraction(e);
                modalBaseZIndex++;
                modal.style.zIndex = modalBaseZIndex;
                if (!state.isMaximized) {
                    const wasMinimized = state.isMinimized;
                    if (wasMinimized) {
                        state.minimizedOffset = undefined;
                        modal.style.removeProperty('--minimized-left');
                    } else if (state.isOpen) {
                        state.current = {
                            left: modal.style.left, top: modal.style.top,
                            width: modal.style.width, transform: modal.style.transform
                        };
                    }
                    modal.classList.add('maximized', 'active');
                    modal.classList.remove('minimized');
                    modal.style.bottom = 'auto';
                    state.isMaximized = true;
                    state.isMinimized = false;
                    if (wasMinimized) {
                        recalculateMinimizedOffsets();
                    }
                } else {
                    modal.classList.remove('maximized');
                    const restoreState = (state.current && state.current.left && state.current.left !== '50%') ? state.current : {
                        left: '50%', top: '50%', width: state.original.width, transform: 'translate(-50%, -50%) scale(1)'
                    };
                    modal.style.left = restoreState.left;
                    modal.style.top = restoreState.top;
                    modal.style.width = restoreState.width;
                    modal.style.transform = restoreState.transform;
                    modal.style.bottom = 'auto';
                    if (!state.isMinimized) {
                        modal.classList.add('active');
                    }
                    state.isMaximized = false;
                }
            });
        }
        const header = modal.querySelector('.modal-header');
        if (header) makeDraggable(modal, header, state);
    });

    function makeDraggable(element, handle, state) {
        let mouseXStart, mouseYStart, elementXStart, elementYStart;
        let isDragging = false;

        handle.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.closest('button')) return;
            if (state.isMaximized || state.isMinimized) return;

            isDragging = true;
            playClickSound();
            modalBaseZIndex++;
            element.style.zIndex = modalBaseZIndex;

            const rect = element.getBoundingClientRect();
            elementXStart = rect.left;
            elementYStart = rect.top;
            mouseXStart = e.clientX;
            mouseYStart = e.clientY;

            element.style.left = `${elementXStart}px`;
            element.style.top = `${elementYStart}px`;
            element.style.transform = 'scale(1)';
            element.classList.add('dragging');

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDragging) return;
            const deltaX = e.clientX - mouseXStart;
            const deltaY = e.clientY - mouseYStart;
            element.style.left = `${elementXStart + deltaX}px`;
            element.style.top = `${elementYStart + deltaY}px`;
        }

        function onMouseUp() {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove('dragging');

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            if (!state.isMaximized && !state.isMinimized) {
                state.current.left = element.style.left;
                state.current.top = element.style.top;
                state.current.transform = 'scale(1)';
            }
        }
    }

    // --- Music Player UI Update Functions ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updatePlayerUITrackInfo() {
        if (playlist.length === 0) return;
        const songData = playlist[currentSongIndex];
        playerSongTitle.textContent = songData.title;
        playerSongArtist.textContent = songData.artist;
        playerAlbumArtImg.src = songData.albumArtPath || 'assets/PLAYLIST_COVERS/default_art.png'; // Fallback
        playerAlbumArtImg.alt = songData.title + " Album Art";
    }

    function updatePlayPauseButton(isPlaying) {
        if (isPlaying) {
            playerPlayPauseIcon.classList.remove('fa-play');
            playerPlayPauseIcon.classList.add('fa-pause');
        } else {
            playerPlayPauseIcon.classList.remove('fa-pause');
            playerPlayPauseIcon.classList.add('fa-play');
        }
    }
    
    function updateProgressUI() {
        if (currentP5Song && currentP5Song.isLoaded()) {
            const currentTime = currentP5Song.currentTime();
            const duration = currentP5Song.duration();
            if (isFinite(duration) && duration > 0) {
                playerCurrentTime.textContent = formatTime(currentTime);
                playerTotalTime.textContent = formatTime(duration);
                playerProgressBar.value = (currentTime / duration) * 100;
            } else { 
                playerCurrentTime.textContent = "0:00";
                playerTotalTime.textContent = "0:00";
                playerProgressBar.value = 0;
            }
        } else {
            playerCurrentTime.textContent = "0:00";
            playerTotalTime.textContent = "0:00";
            playerProgressBar.value = 0;
        }
    }


    // --- p5.js Sketch Definition ---
    const sketch = (p) => {
        let fft;
        let particles = [];
        let musicSuccessfullyStartedThisSession = false; 
        let isProcessingOnended = false; // Prevent re-entrant onended calls
        let isIntentionalTrackChange = false; // Flag for next/previous track changes

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight).parent('p5-visualizer-container');
            p.angleMode(p.DEGREES);
            fft = new p5.FFT(0.8, 512); 

            if (playlist.length > 0) {
                p.loadSongAtIndex(currentSongIndex, false); 
            }
            
            const initialVolume = parseFloat(volumeSlider.value);
            lastVolumeBeforeIconClickMute = initialVolume > 0 ? initialVolume : 0.7;
            // Volume will be applied to song when it loads in loadSongAtIndex
            updateVolumeIconDisplay(initialVolume);

            p.noLoop(); 
        };

        p.draw = () => {
            p.background(0); 

            if (currentP5Song && currentP5Song.isLoaded() && currentP5Song.isPlaying()) {
                 fft.analyze();
                let wave = fft.waveform();
                let currentAmp = fft.getEnergy(20, 200);

                p.translate(p.width / 2, p.height / 2);

                if (currentAmp > 210 && particles.length < 200) {
                    let pNum = p.random(0, 3);
                    for (let i = 0; i < pNum; i++) {
                        particles.push(new Particle(p));
                    }
                }

                for (let i = particles.length - 1; i >= 0; i--) {
                    if (!particles[i].edges()) {
                        particles[i].update(currentAmp > 210);
                        particles[i].show();
                    } else {
                        particles.splice(i, 1);
                    }
                }

                p.stroke(255);
                p.strokeWeight(3);
                p.noFill();

                for (let t = -1; t <= 1; t += 2) {
                    p.beginShape();
                    for (let i = 0; i <= 180; i += 0.75) {
                        let index = p.floor(p.map(i, 0, 180, 0, wave.length - 1));
                        let r = p.map(wave[index], -1, 1, 250, 550);
                        let x = r * p.sin(i) * t;
                        let y = r * p.cos(i);
                        p.vertex(x, y);
                    }
                    p.endShape();
                }
            }
             updateProgressUI(); 
        };

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        // Helper functions for the intentional track change flag
        p.setIntentionalTrackChange = () => {
            isIntentionalTrackChange = true;
        };
        p.clearIntentionalTrackChange = () => {
            isIntentionalTrackChange = false;
        };
        p.getIntentionalTrackChange = () => {
            return isIntentionalTrackChange;
        };

        p.loadSongAtIndex = (index, playAfterLoad) => {
            if (playlist.length === 0) {
                console.warn("Playlist is empty. Cannot load song.");
                updatePlayPauseButton(false);
                return;
            }
            isSongLoadedAndReady = false;

            // --- Aggressive cleanup of the previous song ---
            if (currentP5Song) {
                const oldSongDataForCleanup = playlist[currentSongIndex]; // Get data before index might change
                console.log("Cleaning up previous song:", oldSongDataForCleanup.title);

                if (fft) {
                    fft.setInput(null); // Disconnect FFT from the old song first
                    console.log("FFT input set to null for old song:", oldSongDataForCleanup.title);
                }

                // IMPORTANT: Neutralize the onended callback of the song we are about to stop
                // to prevent it from triggering a premature 'next song' when we call .stop().
                currentP5Song.onended(() => {
                    console.log("Neutralized onended for explicitly stopped song:", oldSongDataForCleanup.title);
                });

                if (currentP5Song.isPlaying()) {
                    currentP5Song.stop(); // This will trigger the (now neutralized) onended
                    console.log("Previous song stopped:", oldSongDataForCleanup.title);
                } else if (currentP5Song.isLoaded()) {
                    // If loaded but paused, still call stop() to ensure full cleanup
                    // and to trigger the neutralized onended, resetting its state.
                    currentP5Song.stop();
                    console.log("Previous (paused) song explicitly stopped to ensure cleanup:", oldSongDataForCleanup.title);
                }
                
                currentP5Song.disconnect(); // Fully disconnect from p5.sound master output
                console.log(oldSongDataForCleanup.title, "disconnected from master output.");

                currentP5Song = null;
                console.log("Previous song reference (currentP5Song) set to null.");
            }
            // --- End aggressive cleanup ---

            currentSongIndex = (index + playlist.length) % playlist.length;
            const songData = playlist[currentSongIndex];
            console.log("Loading new song:", songData.title, "at index:", currentSongIndex);
            updatePlayerUITrackInfo();

            playerCurrentTime.textContent = "0:00";
            playerTotalTime.textContent = "0:00";
            playerProgressBar.value = 0;
            updatePlayPauseButton(playAfterLoad && isPlayerGloballyPlaying);

            p.loadSound(songData.filePath,
                (loadedSound) => {
                    console.log("Successfully loaded:", songData.title);
                    // Ensure any lingering previous sound object is truly gone before assigning new one
                    if (currentP5Song && currentP5Song !== loadedSound) {
                        console.warn("A previous currentP5Song object was still present before assigning the new one. This should have been cleaned up.");
                        // Attempt an additional cleanup just in case, though the main cleanup should handle this.
                        currentP5Song.stop();
                        currentP5Song.disconnect();
                    }
                    currentP5Song = loadedSound;
                    isSongLoadedAndReady = true;
                    currentP5Song.setVolume(parseFloat(volumeSlider.value));
                    if (fft) {
                        fft.setInput(currentP5Song);
                        console.log("FFT input set to new song:", songData.title);
                    }

                    p.clearIntentionalTrackChange();

                    currentP5Song.onended(() => {
                        if (isProcessingOnended) {
                            console.warn(`Re-entrancy detected in onended for ${songData.title}. Aborting.`);
                            return;
                        }
                        isProcessingOnended = true;

                        const songTitleForCallback = songData.title;
                        const wasPlayingGlobally = isPlayerGloballyPlaying;

                        p.clearIntentionalTrackChange();

                        if (wasPlayingGlobally) {
                            console.log(`Song "${songTitleForCallback}" ended while player was active. Playing next.`);
                            p.playNextSong();
                        } else {
                            console.log(`onended for "${songTitleForCallback}" triggered. Player was not globally playing. Halting playback.`);
                            updatePlayPauseButton(false);
                            if (p5SketchInstance && typeof p5SketchInstance.noLoop === 'function') p5SketchInstance.noLoop();
                        }

                        setTimeout(() => { isProcessingOnended = false; }, 50);
                    });

                    if (isFinite(currentP5Song.duration()) && currentP5Song.duration() > 0) {
                        playerTotalTime.textContent = formatTime(currentP5Song.duration());
                    } else {
                        console.warn("Song loaded but duration is invalid:", currentP5Song.duration());
                        playerTotalTime.textContent = "0:00"; // Fallback for invalid duration
                    }
                    
                    // Defer playback slightly if p5.AudioContext is not yet running (it should be after first interaction)
                    // and if playAfterLoad is requested.
                    if (playAfterLoad && isPlayerGloballyPlaying) {
                         if (p.getAudioContext().state === 'running') {
                            console.log("Attempting to play newly loaded song due to playAfterLoad & isPlayerGloballyPlaying flags:", songData.title);
                            p.playCurrentSong();
                         } else {
                             console.log("Audio context not running, will defer play attempt for:", songData.title);
                             // The globalUserInteraction handler should pick this up if isPlayerGloballyPlaying is true
                         }
                    } else {
                        console.log("Newly loaded song will not auto-play. playAfterLoad:", playAfterLoad, "isPlayerGloballyPlaying:", isPlayerGloballyPlaying);
                    }
                },
                (err) => {
                    console.error("Error loading song:", songData.filePath, err);
                    p.clearIntentionalTrackChange();
                    isProcessingOnended = false;
                }
            );
        };
        
        p.startMusicAfterUserInteraction = () => {
            if (p.getAudioContext().state !== 'running') {
                p.userStartAudio().then(() => {
                    console.log("Audio context started by user interaction.");
                    musicSuccessfullyStartedThisSession = true;
                    if (isPlayerGloballyPlaying && currentP5Song && currentP5Song.isLoaded() && !currentP5Song.isPlaying()) {
                        p.playCurrentSong();
                    }
                }).catch(e => console.error("Error starting audio context by user:", e));
            } else {
                musicSuccessfullyStartedThisSession = true;
                if (isPlayerGloballyPlaying && currentP5Song && currentP5Song.isLoaded() && !currentP5Song.isPlaying()) {
                     p.playCurrentSong();
                }
            }
        };

        p.playCurrentSong = () => {
            if (!isSongLoadedAndReady) {
                if (playlist.length > 0) {
                    // If song isn't loaded, try loading it. It will play if playAfterLoad is true.
                    p.loadSongAtIndex(currentSongIndex, true); 
                } else {
                    console.warn("Cannot play: No song loaded and playlist is empty.");
                }
                return;
            }

            if (currentP5Song && currentP5Song.isLoaded()) { 
                if (p.getAudioContext().state !== 'running') {
                    p.startMusicAfterUserInteraction(); 
                    // Music will attempt to play once audio context is running via the callback in startMusicAfterUserInteraction
                    return; 
                }
                // Ensure we only call play if it's not already playing to avoid potential issues
                if (!currentP5Song.isPlaying()) {
                    p.clearIntentionalTrackChange();
                    currentP5Song.play();
                }
                updatePlayPauseButton(true);
                p.loop(); 
            }
        };

        p.pauseCurrentSong = () => {
            if (currentP5Song && currentP5Song.isPlaying()) {
                p.clearIntentionalTrackChange();
                currentP5Song.pause();
                updatePlayPauseButton(false);
                p.noLoop(); 
            }
        };

        p.playNextSong = () => {
            if (playlist.length > 0) {
                p.setIntentionalTrackChange();
                p.loadSongAtIndex(currentSongIndex + 1, isPlayerGloballyPlaying);
            }
        };

        p.playPrevSong = () => {
            if (playlist.length > 0) {
                p.setIntentionalTrackChange();
                p.loadSongAtIndex(currentSongIndex - 1, isPlayerGloballyPlaying);
            }
        };

        p.setAudioVolume = (volumeLevel) => {
            if (currentP5Song && currentP5Song.isLoaded()) {
                currentP5Song.setVolume(volumeLevel);
            }
            if (volumeLevel > 0) {
                lastVolumeBeforeIconClickMute = volumeLevel;
            }
        };
        
        p.getAudioVolume = () => {
            if (currentP5Song && currentP5Song.isLoaded() && typeof currentP5Song.getVolume === 'function') {
                return currentP5Song.getVolume();
            }
            return parseFloat(volumeSlider.value); 
        };
        
        p.getLastNonZeroVolume = () => {
             return lastVolumeBeforeIconClickMute > 0 ? lastVolumeBeforeIconClickMute : 0.7;
        };

        p.seekSong = (percentage) => {
            if (currentP5Song && currentP5Song.isLoaded() && isFinite(currentP5Song.duration()) && currentP5Song.duration() > 0) {
                const time = currentP5Song.duration() * (percentage / 100);
                currentP5Song.jump(time);
                updateProgressUI(); 
            }
        };
    };

    // --- Particle Class ---
    class Particle {
        constructor(pInstance) {
            this.p = pInstance;
            this.pos = this.p.createVector(0, 0);
            this.vel = p5.Vector.random2D().mult(this.p.random(1, 3));
            this.acc = p5.Vector.random2D().mult(this.p.random(0.01, 0.05));
            this.w = this.p.random(2, 5);
            this.color = [this.p.random(200, 255), this.p.random(200, 255), this.p.random(200, 255), this.p.random(100, 200)];
            this.lifespan = 255;
        }
        update(bassKicked) {
            this.vel.add(this.acc); this.pos.add(this.vel);
            if (bassKicked) { let pushForce = this.pos.copy().normalize().mult(this.p.random(1, 2)); this.vel.add(pushForce); }
            this.vel.limit(4); this.lifespan -= 1.0;
        }
        edges() { if (this.pos.mag() > this.p.max(this.p.width, this.p.height) * 0.85 || this.lifespan < 0) { return true; } return false; }
        show() { this.p.noStroke(); this.p.fill(this.color[0], this.color[1], this.color[2], this.lifespan); this.p.ellipse(this.pos.x, this.pos.y, this.w); }
    }

    p5SketchInstance = new p5(sketch);

    // --- Player Control Event Listeners ---
    playerPlayPauseBtn.addEventListener('click', () => {
        playClickSound();
        handleGlobalUserInteraction(); 
        
        isPlayerGloballyPlaying = !isPlayerGloballyPlaying; 
        if (isPlayerGloballyPlaying) {
            if (p5SketchInstance.playCurrentSong) p5SketchInstance.playCurrentSong();
        } else {
            if (p5SketchInstance.pauseCurrentSong) p5SketchInstance.pauseCurrentSong();
        }
    });

    playerNextBtn.addEventListener('click', () => {
        playClickSound();
        handleGlobalUserInteraction();
        if (p5SketchInstance.playNextSong) {
            p5SketchInstance.playNextSong();
        }
    });

    playerPrevBtn.addEventListener('click', () => {
        playClickSound();
        handleGlobalUserInteraction();
        if (p5SketchInstance.playPrevSong) {
            p5SketchInstance.playPrevSong();
        }
    });

    playerProgressBar.addEventListener('input', (e) => {
        const percentage = parseFloat(e.target.value);
        if (p5SketchInstance.seekSong && isSongLoadedAndReady) { // Only seek if song is ready
             p5SketchInstance.seekSong(percentage);
        }
    });
    playerProgressBar.addEventListener('change', (e) => { 
        playClickSound();
        const percentage = parseFloat(e.target.value);
        if (p5SketchInstance.seekSong && isSongLoadedAndReady) {
            p5SketchInstance.seekSong(percentage);
        }
    });


    // --- Volume Control Logic ---
    function updateVolumeIconDisplay(volume) {
        if (!musicVolumeIcon) return;
        musicVolumeIcon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-mute', 'fa-volume-off'); 
        if (volume === 0) {
            musicVolumeIcon.classList.add('fa-volume-off'); 
        } else if (volume < 0.01) { 
            musicVolumeIcon.classList.add('fa-volume-mute');
        } else if (volume < 0.5) {
            musicVolumeIcon.classList.add('fa-volume-down');
        } else {
            musicVolumeIcon.classList.add('fa-volume-up');
        }
    }
    
    volumeSlider.value = lastVolumeBeforeIconClickMute;
    updateVolumeIconDisplay(lastVolumeBeforeIconClickMute);


    if (musicVolumeIcon && volumeSlider && p5SketchInstance) {
        volumeSlider.addEventListener('input', (e) => {
            const newVolume = parseFloat(e.target.value);
            if (p5SketchInstance.setAudioVolume) {
                p5SketchInstance.setAudioVolume(newVolume);
            }
            updateVolumeIconDisplay(newVolume);
        });

        volumeSlider.addEventListener('change', () => {
            playClickSound(); 
        });

        musicVolumeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            playClickSound();
            handleGlobalUserInteraction(); 

            const currentP5Volume = p5SketchInstance.getAudioVolume ? p5SketchInstance.getAudioVolume() : parseFloat(volumeSlider.value);

            if (currentP5Volume > 0) {
                if (p5SketchInstance.setAudioVolume) p5SketchInstance.setAudioVolume(0);
                volumeSlider.value = 0;
                updateVolumeIconDisplay(0);
            } else {
                const volumeToRestore = p5SketchInstance.getLastNonZeroVolume ? p5SketchInstance.getLastNonZeroVolume() : 0.7;
                if (p5SketchInstance.setAudioVolume) p5SketchInstance.setAudioVolume(volumeToRestore);
                volumeSlider.value = volumeToRestore;
                updateVolumeIconDisplay(volumeToRestore);
            }
        });
    } else {
        console.warn("Volume control elements not fully found or p5 sketch not ready for volume setup.");
    }

    // --- Sound and Global Interaction ---
    function playClickSound() { if (clickSound) { clickSound.currentTime = 0; clickSound.play().catch(error => console.warn("Error playing click sound:", error)); } }

    let globalUserInteractionHasOccurred = false;
    function handleGlobalUserInteraction() {
        if (!globalUserInteractionHasOccurred && p5SketchInstance) {
            if (p5SketchInstance.startMusicAfterUserInteraction) {
                 p5SketchInstance.startMusicAfterUserInteraction();
            }
            globalUserInteractionHasOccurred = true; 
        }
    }
    document.body.addEventListener('click', handleGlobalUserInteraction, { once: true, capture: true });
    document.body.addEventListener('keydown', handleGlobalUserInteraction, { once: true, capture: true });


    // --- Minimized Modals Positioning ---
    const baseMinimizedInitialOffset = 15;
    const minimizedWindowSpacing = 10;
    const minimizedWindowWidth = 220;

    function recalculateMinimizedOffsets() {
        let currentDynamicOffset = baseMinimizedInitialOffset;
        const currentlyMinimizedModals = [];

        modals.forEach(m => {
            const s = modalStates.get(m);
            if (s.isMinimized) {
                currentlyMinimizedModals.push({ modal: m, state: s });
            }
        });

        currentlyMinimizedModals.sort((a, b) => (a.state.minimizedOffset || baseMinimizedInitialOffset) - (b.state.minimizedOffset || baseMinimizedInitialOffset));

        currentlyMinimizedModals.forEach(item => {
            item.modal.style.setProperty('--minimized-left', `${currentDynamicOffset}px`);
            item.state.minimizedOffset = currentDynamicOffset;
            currentDynamicOffset += minimizedWindowWidth + minimizedWindowSpacing;
        });
    }

    // Initial UI setup for player
    if (playlist.length > 0) {
        updatePlayerUITrackInfo(); 
        updatePlayPauseButton(false); 
        playerProgressBar.value = 0;
        playerCurrentTime.textContent = "0:00";
        playerTotalTime.textContent = "0:00"; 
    } else {
        playerSongTitle.textContent = "No Songs in Playlist";
        playerSongArtist.textContent = "";
        playerAlbumArtImg.src = 'assets/PLAYLIST_COVERS/default_art.png'; // Default art even if no songs
        playerPlayPauseBtn.disabled = true;
        playerNextBtn.disabled = true;
        playerPrevBtn.disabled = true;
        playerProgressBar.disabled = true;
    }

});