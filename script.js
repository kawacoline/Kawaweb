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

    // --- Playlist Definition y Player ---
    // (Todo el bloque de definición de playlist, variables de control, y funciones del reproductor de audio)
    // --- MOVIDO a audioPlayer.js ---

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
    // (Todas las funciones de UI del reproductor, eventos de botones, control de volumen, etc.)
    // --- MOVIDO a audioPlayer.js ---

    // --- p5.js Sketch Definition ---
    // (Todo el bloque de definición de sketch, clase Particle, y lógica de visualización)
    // --- MOVIDO a audioVisualizer.js ---

    // --- El resto de la lógica de modales y utilidades permanece aquí ---

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