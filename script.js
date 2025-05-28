// script.js

document.addEventListener('DOMContentLoaded', () => {
    const iconItems = document.querySelectorAll('.icon-item');
    const modals = document.querySelectorAll('.modal');
    const clickSound = document.getElementById('clickSound');
    const musicPlayerBarDOM = document.getElementById('music-player-bar'); // Renombrado para evitar confusión con variable global
    
    const playerPrevBtn = document.getElementById('player-prev-btn');
    const playerPlayPauseBtn = document.getElementById('player-play-pause-btn');
    const playerNextBtn = document.getElementById('player-next-btn');
    const playerProgressBar = document.getElementById('player-progress-bar'); 
    const volumeSlider = document.getElementById('volume-slider');
    const musicVolumeIcon = document.getElementById('music-volume-icon');

    const playlistData = [
        { title: "駿", artist: "Nhelv / Silentroom", 
          filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748396118/xtlnbonlqhgycnfgluhj.webm", 
          albumArtPath: "assets/SONGS_COVERS/駿_cover.jpg" },
        { title: "Rainshower", artist: "Silentroom × Shun", 
          filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748396759/%E9%A9%9F%E9%9B%A8%E3%81%AE%E7%8B%AD%E9%96%93_Rainshower_Silentroom_Shun_720p_tmtjhf.webm", 
          albumArtPath: "assets/SONGS_COVERS/rainshowe_cover.jpeg" },
        { title: "Aegleseeker", artist: "Silentroom vs Frums", 
          filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748395211/d3snqsjythwmwnszdpe0.mp4", 
          albumArtPath: "assets/SONGS_COVERS/aegleseeker_cover.jpg" },
        { title: "World execute (me)", artist: "Mili", 
          filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748323206/ybejaiedxaryhcbko9ms.webm", 
          albumArtPath: "assets/SONGS_COVERS/world_execute_me_cover.jpg" }
    ];

new p5(audioVisualizer.sketch); 

    function checkP5SystemReadyAndInitPlayer() {
        let p5CoreAndSketchSetupDone = audioVisualizer.p5SetupDone && audioVisualizer.p5Instance;
        // Ya no necesitamos verificar p5SoundReady aquí, videoPlayerManager lo hará internamente

        if (p5CoreAndSketchSetupDone) {
            console.log("Script.js: Sketch de p5 (audioVisualizer) está listo. Inicializando Video Player Manager.");
            videoPlayerManager.init({
                playlist: playlistData,
                audioVisualizer: audioVisualizer
                // No es necesario pasar audioContext aquí, el manager lo tomará de p5Instance
            });

            if (musicPlayerBarDOM && videoPlayerManager.playlist.length > 0 && videoPlayerManager.player) {
                musicPlayerBarDOM.classList.add('ready');
                console.log("Script.js: Barra de reproductor activada.");
            } else if (musicPlayerBarDOM) {
                 musicPlayerBarDOM.classList.remove('ready');
                 console.warn("Script.js: No se activa la barra del reproductor.");
            }
        } else {
            console.log(`Script.js: Waiting for p5 sketch (audioVisualizer.p5SetupDone && p5Instance) to be ready...`);
            setTimeout(checkP5SystemReadyAndInitPlayer, 100); 
        }
    }
    checkP5SystemReadyAndInitPlayer();

    // --- Lógica de UI (Modales, etc.) ---
    let modalBaseZIndex = 1000;
    const modalStates = new Map();
    const workData = [ 
        { type: 'banner', text: 'ффф <a href="mailto:kawacoline@gmail.com">work email</a>. ффф I do illustration, animation, web design, and web/app development. :)' },
        { type: 'tags', title: 'TOOLS', items: ['Adobe Photoshop', 'Adobe Animate', 'Clip Studio Paint', 'Unity 2D/3D', 'Adobe Illustrator', 'Adobe Premiere', 'Adobe After Effects', 'Blender', 'OpenToonz', 'InDesign', 'Figma']},
        { type: 'tags', title: 'DEVELOPMENT', items: ['C#', 'C++', 'C', 'Python', 'JavaScript', 'HTML/CSS', 'React', 'Gatsby', 'Next.js']},
        { type: 'videos', title: 'ANIMATION', items: [ { title: 'Dominate', youtubeId: 'v=zxyOdltHfb0' }, { title: '黒桃の触手 Battle Collaboration 紅桃の鉄腹 (by 夕䪯)', youtubeId: 'PBfBxPBUdhg' }, { title: 'WEAPON MASTER 2', youtubeId: 'https://www.youtube.com/watch?v=20a4iQucxWM' }, { title: 'WEAPON MASTER', youtubeId: 'IrVZW3gTxMs' } ]},
        { type: 'gallery', title: 'ILLUSTRATION', items: [ 'https://pbs.twimg.com/media/FRe6BQnXoAEljkb?format=jpg&name=4096x4096', 'https://pbs.twimg.com/media/FfKT2TUWAAAVlT5?format=jpg&name=large', 'https://pbs.twimg.com/media/F-SGKcnXwAAL1hd?format=jpg&name=large', 'https://pbs.twimg.com/media/FrxI8VQXgAAWWqK?format=jpg&name=4096x4096', 'https://pbs.twimg.com/media/FirVbTyXkAE79L2?format=png&name=900x900', 'https://media.discordapp.net/attachments/672451986469158923/1377114924454510592/image.png?ex=6837c9b7&is=68367837&hm=16f73c05de7aa5d257d6236685249201fbbfdafb92824f7fca69c2fd7949b5ac&=&format=webp&quality=lossless', ]},
        { type: 'devProjects', title: 'PROJECTS', items: [ { title: 'фисвуа', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Bingus', description: "фффффффффффффф <a href='#' target='_blank'>DevelUP!</a> фффффффф", downloadLink: '#', }, { title: 'This Website!', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Portfolio', description: "The very portfolio you are looking at now. Built with HTML, CSS, and vanilla JavaScript. Features include draggable and resizable modal windows, and an audio visualizer.", } ]},
        { type: 'footerText', text: "See more on <a href='https://github.com/kawacoline' target='_blank'>GitHub</a>."}
    ];

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
                case 'devProjects': const projectList = document.createElement('ul'); projectList.className = 'work-project-list'; section.items.forEach(project => { const itemLi = document.createElement('li'); itemLi.className = 'work-project-item'; itemLi.innerHTML = `${project.image ? `<img src="${project.image}" alt="${project.title} thumbnail" class="project-thumbnail">` : ''}<div class="work-project-content"><h4>${project.title}</h4><p>${project.description}</p><div class="work-project-links">${project.downloadLink ? `<a href="${project.downloadLink}" target='_blank'>Download Page</a>` : ''}${project.detailsLink ? `<a href="${project.detailsLink}" target='_blank'>Details</a>` : ''}</div></div>`; projectList.appendChild(itemLi); }); sectionDiv.appendChild(projectList); break;
                case 'footerText': const footerTextP = document.createElement('p'); footerTextP.style.textAlign = 'center'; footerTextP.style.marginTop = '20px'; footerTextP.innerHTML = section.text; contentElement.appendChild(footerTextP); return;
            }
            if (section.type !== 'banner' && section.type !== 'footerText') { contentElement.appendChild(sectionDiv); }
        });
    }
    modals.forEach(modal => { 
        modalStates.set(modal, {
            isOpen: false, isMaximized: false, isMinimized: false,
            original: { left: '50%', top: '50%', width: getComputedStyle(modal).width, transform: 'translate(-50%, -50%) scale(0.9)' }, 
            current: {} 
        });
    });
    iconItems.forEach(item => { 
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 
            playClickSound(); 
            handleGlobalUserInteractionForAudioContext(); 
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
        Object.assign(modal.style, state.original); 
        if (modal.id === 'work-modal') {
          const contentElement = modal.querySelector('.modal-content');
          if (contentElement && (contentElement.innerHTML.trim() === '' || contentElement.querySelector('.loading-placeholder'))) {
            renderWorkSection(contentElement);
          }
        }
        void modal.offsetWidth; 
        modal.classList.add('active'); 
        modal.style.transform = 'translate(-50%, -50%) scale(1)'; 
        Object.assign(state, { isOpen: true, isMinimized: false, isMaximized: false, current: { left: '50%', top: '50%', width: state.original.width, transform: 'translate(-50%, -50%) scale(1)' } });
    }
    function handleModalButtonInteraction(e) { if (e) e.stopPropagation(); playClickSound(); }
    modals.forEach(modal => { 
        const state = modalStates.get(modal);
        const closeBtn = modal.querySelector('.close-btn');
        const minimizeBtn = modal.querySelector('.minimize-btn');
        const maximizeBtn = modal.querySelector('.maximize-btn');
        if (closeBtn) { 
            closeBtn.addEventListener('click', (e) => {
                handleModalButtonInteraction(e); const wasMinimized = state.isMinimized;
                modal.classList.remove('active', 'minimized', 'maximized'); 
                Object.assign(modal.style, state.original, { '--minimized-left': null }); 
                modal.style.removeProperty('--minimized-left'); 
                Object.assign(state, { isOpen: false, isMaximized: false, isMinimized: false, minimizedOffset: undefined }); 
                if (wasMinimized) recalculateMinimizedOffsets(); 
            });
        }
        if (minimizeBtn) { 
            minimizeBtn.addEventListener('click', (e) => {
                handleModalButtonInteraction(e); modalBaseZIndex++; modal.style.zIndex = modalBaseZIndex;
                if (!state.isMinimized) { 
                    if (!state.isMaximized) state.current = { left: modal.style.left, top: modal.style.top, width: modal.style.width, transform: modal.style.transform }; 
                    modal.classList.add('minimized'); modal.classList.remove('maximized', 'active');
                    let calculatedLeftOffset = baseMinimizedInitialOffset; 
                    document.querySelectorAll('.modal.minimized').forEach(m => {
                        if (m !== modal) { const otherState = modalStates.get(m); if (otherState && otherState.minimizedOffset !== undefined) calculatedLeftOffset = Math.max(calculatedLeftOffset, otherState.minimizedOffset + minimizedWindowWidth + minimizedWindowSpacing); }
                    });
                    modal.style.setProperty('--minimized-left', `${calculatedLeftOffset}px`); 
                    Object.assign(state, { minimizedOffset: calculatedLeftOffset, isMinimized: true, isMaximized: false }); 
                } else { 
                    modal.classList.remove('minimized'); modal.classList.add('active');
                    state.minimizedOffset = undefined; modal.style.removeProperty('--minimized-left'); recalculateMinimizedOffsets();
                    const restoreState = (state.current && state.current.left && state.current.left !== '50%') ? state.current : { left: '50%', top: '50%', width: state.original.width, transform: 'translate(-50%, -50%) scale(1)' };
                    Object.assign(modal.style, restoreState, { bottom: 'auto' }); 
                    state.isMinimized = false; 
                }
            });
        }
        if (maximizeBtn) { 
            maximizeBtn.addEventListener('click', (e) => {
                handleModalButtonInteraction(e); modalBaseZIndex++; modal.style.zIndex = modalBaseZIndex;
                if (!state.isMaximized) { 
                    const wasMinimized = state.isMinimized;
                    if (wasMinimized) { state.minimizedOffset = undefined; modal.style.removeProperty('--minimized-left'); }
                    else if (state.isOpen) state.current = { left: modal.style.left, top: modal.style.top, width: modal.style.width, transform: modal.style.transform }; 
                    modal.classList.add('maximized', 'active'); modal.classList.remove('minimized');
                    modal.style.bottom = 'auto'; 
                    Object.assign(state, { isMaximized: true, isMinimized: false }); 
                    if (wasMinimized) recalculateMinimizedOffsets();
                } else { 
                    modal.classList.remove('maximized');
                    const restoreState = (state.current && state.current.left && state.current.left !== '50%') ? state.current : { left: '50%', top: '50%', width: state.original.width, transform: 'translate(-50%, -50%) scale(1)' };
                    Object.assign(modal.style, restoreState, { bottom: 'auto' }); 
                    if (!state.isMinimized) modal.classList.add('active');
                    state.isMaximized = false; 
                }
            });
        }
        const header = modal.querySelector('.modal-header');
        if (header) makeDraggable(modal, header, state);
    });
    function makeDraggable(element, handle, state) { 
        let mouseXStart, mouseYStart, elementXStart, elementYStart, isDragging = false;
        handle.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.closest('button') || state.isMaximized || state.isMinimized) return;
            isDragging = true; playClickSound(); modalBaseZIndex++; element.style.zIndex = modalBaseZIndex;
            const rect = element.getBoundingClientRect(); 
            elementXStart = rect.left; elementYStart = rect.top;
            mouseXStart = e.clientX; mouseYStart = e.clientY; 
            Object.assign(element.style, { left: `${elementXStart}px`, top: `${elementYStart}px`, transform: 'scale(1)' }); 
            element.classList.add('dragging'); 
            document.addEventListener('mousemove', onMouseMove); 
            document.addEventListener('mouseup', onMouseUp);   
        });
        function onMouseMove(e) {
            if (!isDragging) return;
            element.style.left = `${elementXStart + (e.clientX - mouseXStart)}px`;
            element.style.top = `${elementYStart + (e.clientY - mouseYStart)}px`;
        }
        function onMouseUp() {
            if (!isDragging) return; isDragging = false; element.classList.remove('dragging');
            document.removeEventListener('mousemove', onMouseMove); 
            document.removeEventListener('mouseup', onMouseUp);
            if (!state.isMaximized && !state.isMinimized) Object.assign(state.current, { left: element.style.left, top: element.style.top, transform: 'scale(1)' });
        }
    }
    const baseMinimizedInitialOffset = 15, minimizedWindowSpacing = 10, minimizedWindowWidth = 220;
    function recalculateMinimizedOffsets() { 
        let currentOffset = baseMinimizedInitialOffset; const minimized = [];
        modals.forEach(m => { const s = modalStates.get(m); if (s.isMinimized) minimized.push({modal:m, state:s}); });
        minimized.sort((a,b) => (a.state.minimizedOffset || baseMinimizedInitialOffset) - (b.state.minimizedOffset || baseMinimizedInitialOffset));
        minimized.forEach(item => { item.modal.style.setProperty('--minimized-left', `${currentOffset}px`); item.state.minimizedOffset = currentOffset; currentOffset += minimizedWindowWidth + minimizedWindowSpacing; });
    }
     function playClickSound() { if (clickSound) { clickSound.currentTime = 0; clickSound.play().catch(e => console.warn("Error sonido de clic:", e)); } }

    if (playerPlayPauseBtn) { playerPlayPauseBtn.addEventListener('click', () => { playClickSound(); handleGlobalUserInteractionForAudioContext(); videoPlayerManager.togglePlayPause(); }); }
    if (playerNextBtn) { playerNextBtn.addEventListener('click', () => { playClickSound(); handleGlobalUserInteractionForAudioContext(); videoPlayerManager.playNextSong(); }); }
    if (playerPrevBtn) { playerPrevBtn.addEventListener('click', () => { playClickSound(); handleGlobalUserInteractionForAudioContext(); videoPlayerManager.playPrevSong(); }); }
    
    if (playerProgressBar) {
        playerProgressBar.addEventListener('input', (e) => {
            videoPlayerManager.isUserDraggingProgressBar = true;
            if (videoPlayerManager.uiPlayerCurrentTime && videoPlayerManager.player) {
                const desiredTime = parseFloat(e.target.value);
                videoPlayerManager.uiPlayerCurrentTime.textContent = videoPlayerManager.formatTime(desiredTime);
            }
        });
        playerProgressBar.addEventListener('change', (e) => {
            playClickSound();
            videoPlayerManager.seek(parseFloat(e.target.value));
            videoPlayerManager.isUserDraggingProgressBar = false;
        });
        document.addEventListener('mouseup', () => {
            if (videoPlayerManager.isUserDraggingProgressBar) {
                videoPlayerManager.isUserDraggingProgressBar = false;
            }
        });
    }

    if (volumeSlider) {
        if (videoPlayerManager.player) {
            updateVolumeIconDisplay(videoPlayerManager.player.volume, videoPlayerManager.player.muted);
        }
        volumeSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            videoPlayerManager.setVolume(vol);
        });
        volumeSlider.addEventListener('change', playClickSound);
    }
    if (musicVolumeIcon) {
        musicVolumeIcon.addEventListener('click', () => {
            playClickSound();
            handleGlobalUserInteractionForAudioContext();
            videoPlayerManager.toggleMute();
        });
    }

    function updateVolumeIconDisplay(volume, muted) {
        if (!musicVolumeIcon) return;
        musicVolumeIcon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-mute', 'fa-volume-off');
        if (muted || volume === 0) {
            musicVolumeIcon.classList.add('fa-volume-off');
        } else if (volume < 0.01) {
            musicVolumeIcon.classList.add('fa-volume-mute');
        } else if (volume < 0.5) {
            musicVolumeIcon.classList.add('fa-volume-down');
        } else {
            musicVolumeIcon.classList.add('fa-volume-up');
        }
    }

    let globalUserInteractionHasOccurred = false;
    function handleGlobalUserInteractionForAudioContext() {
        if (!globalUserInteractionHasOccurred) {
            let ctxToResume = null;
            if (audioVisualizer.p5Instance && typeof audioVisualizer.p5Instance.getAudioContext === 'function') {
                let p5Ctx = audioVisualizer.p5Instance.getAudioContext();
                if (p5Ctx && p5Ctx.state === 'suspended') {
                    ctxToResume = p5Ctx;
                }
            }

            if (ctxToResume) {
                ctxToResume.resume().then(() => {
                    console.log("AudioContext resumed by global interaction. State:", ctxToResume.state);
                    if (videoPlayerManager.isGloballyPlaying && videoPlayerManager.player && videoPlayerManager.player.paused) {
                        console.log("Retrying play after AudioContext resume.");
                        videoPlayerManager.player.play().catch(e => console.warn("Error retrying play:", e));
                    }
                }).catch(e => console.error("Error resuming AudioContext globally:", e));
            }
            globalUserInteractionHasOccurred = true;
        }
    }
    document.body.addEventListener('click', handleGlobalUserInteractionForAudioContext, { once: true, capture: true });
    document.body.addEventListener('keydown', handleGlobalUserInteractionForAudioContext, { once: true, capture: true });

    const contentWrapper = document.querySelector('.content-wrapper');
    const toggleMainContentBtn = document.getElementById('toggle-main-content-btn');
    const toggleIcon = toggleMainContentBtn ? toggleMainContentBtn.querySelector('i') : null;

    if (toggleMainContentBtn && contentWrapper && toggleIcon) {
        toggleMainContentBtn.addEventListener('click', () => {
            playClickSound(); 
            contentWrapper.classList.toggle('hidden-by-toggle');
            if (contentWrapper.classList.contains('hidden-by-toggle')) {
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
                toggleMainContentBtn.title = "Mostrar Contenido";
            } else {
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
                toggleMainContentBtn.title = "Ocultar Contenido";
            }
        });
    } else {
        console.warn("Botón para ocultar contenido o contentWrapper no encontrado.");
    }
});