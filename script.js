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
        { title: "Aegleseeker", artist: "Silentroom vs Frums", 
          filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748395211/d3snqsjythwmwnszdpe0.mp4", 
          albumArtPath: "assets/SONGS_COVERS/aegleseeker_cover.jpg" },
        { title: "World execute (me)", artist: "Mili", 
          filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748323206/ybejaiedxaryhcbko9ms.webm", 
          albumArtPath: "assets/SONGS_COVERS/world_execute_me_cover.jpg" }
    ];

    // 1. Crear la instancia de p5 para el visualizador.
    new p5(audioVisualizer.sketch); 

    // 2. Esperar a que el setup de p5 Y el sistema de sonido de p5 estén listos
    function checkP5SystemReadyAndInitPlayer() {
        let p5CoreAndSketchSetupDone = audioVisualizer.p5SetupDone && audioVisualizer.p5Instance;
        let p5SoundReadyAndContextAvailable = false;
        let audioCtxFromP5 = null;

        if (p5CoreAndSketchSetupDone) {
            if (typeof audioVisualizer.p5Instance.getAudioContext === 'function') {
                try {
                    audioCtxFromP5 = audioVisualizer.p5Instance.getAudioContext();
                    if (audioCtxFromP5 && (audioCtxFromP5.state === 'running' || audioCtxFromP5.state === 'suspended')) {
                        p5SoundReadyAndContextAvailable = true;
                        console.log("Script.js: p5.sound y AudioContext (desde instancia p5) están listos. Estado:", audioCtxFromP5.state);
                    } else {
                        console.warn("Script.js: p5Instance.getAudioContext() existe, pero el AudioContext no es válido o no está listo. Estado:", audioCtxFromP5 ? audioCtxFromP5.state : "AudioContext nulo");
                        if (audioCtxFromP5 && audioCtxFromP5.state === 'closed') {
                            console.error("Script.js: El AudioContext de p5 está CERRADO.");
                        }
                    }
                } catch (e) {
                    console.warn("Script.js: Error al llamar a p5Instance.getAudioContext():", e);
                }
            } else {
                console.log("Script.js: p5.setup completado, pero p5Instance.getAudioContext aún no es una función.");
            }
        } else {
            console.log("Script.js: Esperando a que el setup del sketch de p5 (audioVisualizer.p5SetupDone y p5Instance) esté completo...");
        }

        if (p5CoreAndSketchSetupDone && p5SoundReadyAndContextAvailable) {
            console.log("Script.js: p5 (core y sound) está completamente listo. Inicializando Video Player Manager.");
            videoPlayerManager.init({
                playlist: playlistData,
                audioVisualizer: audioVisualizer,
                audioContext: audioCtxFromP5 
            });

            if (musicPlayerBarDOM && videoPlayerManager.playlist.length > 0 && videoPlayerManager.player) {
                musicPlayerBarDOM.classList.add('ready');
                console.log("Script.js: Barra de reproductor activada.");
            } else if (musicPlayerBarDOM) {
                 musicPlayerBarDOM.classList.remove('ready');
                 console.warn("Script.js: No se activa la barra del reproductor.");
            }
        } else {
            console.log(`Script.js: Waiting for p5 core/sketch (${p5CoreAndSketchSetupDone}) and p5.sound/context (${p5SoundReadyAndContextAvailable}) to be ready...`);
            setTimeout(checkP5SystemReadyAndInitPlayer, 250); 
        }
    }
    checkP5SystemReadyAndInitPlayer();

    // --- Lógica de UI (Modales, etc.) ---
    let modalBaseZIndex = 1000;
    const modalStates = new Map();
    const workData = [ 
        { type: 'banner', text: 'Accepting work offers via my <a href="mailto:kawacoline@gmail.com">work email</a>. I do illustration, animation, web design, and web/app development. :)' },
        { type: 'tags', title: 'TOOLS', items: ['Adobe Photoshop', 'Adobe Animate', 'Clip Studio Paint', 'Unity 2D/3D', 'Adobe Illustrator', 'Adobe Premiere', 'Adobe After Effects', 'Blender', 'OpenToonz', 'InDesign', 'Figma']},
        { type: 'tags', title: 'DEVELOPMENT', items: ['C#', 'C++', 'C', 'Python', 'JavaScript', 'HTML/CSS', 'React', 'Gatsby', 'Next.js']},
        { type: 'videos', title: 'ANIMATION', items: [ { title: 'candy: a zelink fan animation', youtubeId: 'dQw4w9WgXcQ' }, { title: 'of the wild', youtubeId: 'oHg5SJYRHA0' }, { title: 'take me home, country roads', youtubeId: '1t_4YvN1B9w' }, { title: 'the duck', youtubeId: 'MtN1YnoL46Q' } ]},
        { type: 'gallery', title: 'ILLUSTRATION', items: [ 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+1', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+2', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+3', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+4', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+5', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+6', ]},
        { type: 'devProjects', title: 'PROJECTS', items: [ { title: 'Bingus Adventure', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Bingus', description: "a buggy RPG i made with a friend in college for a game jam, held by my game dev student org <a href='#' target='_blank'>DevelUP!</a> i worked on the programming and sprite art for this one, my friend Vince did the design, awesome writing, and environment art! it won't give you a virus but you'll probably encounter a lot of bugs LOL but i thought it would be fun to share here hehe, enjoy (or not)!!", downloadLink: '#', }, { title: 'This Website!', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Portfolio', description: "The very portfolio you are looking at now. Built with HTML, CSS, and vanilla JavaScript. Features include draggable and resizable modal windows, and an audio visualizer.", } ]},
        { type: 'footerText', text: "See more on <a href='https://github.com/yourusername' target='_blank'>GitHub</a>."}
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
            if (videoPlayerManager.uiPlayerCurrentTime && videoPlayerManager.player) { // Check player exists
                 // Formatear el tiempo basado en el valor del slider, no en player.duration si este aún no está listo
                const duration = parseFloat(playerProgressBar.max) || 0; // Usar max de la barra o 0
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
                // El 'change' event del slider debería haber manejado el seek final
            }
        });
    }

    if (volumeSlider) {
        // La inicialización del volumen del player ya se hace en videoPlayerManager.init
        // Aquí solo aseguramos que el slider refleje ese estado inicial si es necesario
        // o que el updateVolumeIconDisplay se llame
        if (videoPlayerManager.player) {
            updateVolumeIconDisplay(videoPlayerManager.player.volume, videoPlayerManager.player.muted);
        }

        volumeSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            videoPlayerManager.setVolume(vol);
            // updateVolumeIconDisplay se llamará por el evento 'volumechange' del video player
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
            // Priorizar el contexto de p5 si ya está en el videoPlayerManager
            if (videoPlayerManager.audioContextForP5 && videoPlayerManager.audioContextForP5.state === 'suspended') {
                ctxToResume = videoPlayerManager.audioContextForP5;
            } else if (audioVisualizer.p5Instance && typeof audioVisualizer.p5Instance.getAudioContext === 'function') {
                // Si no, intentar obtenerlo de la instancia p5 del visualizador
                let p5Ctx = audioVisualizer.p5Instance.getAudioContext();
                if (p5Ctx && p5Ctx.state === 'suspended') {
                    ctxToResume = p5Ctx;
                }
            }

            if (ctxToResume) {
                ctxToResume.resume().then(() => {
                    console.log("AudioContext resumed by global interaction. State:", ctxToResume.state);
                    // Si el reproductor estaba intentando sonar y falló por esto, podría reintentar
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

}); // Fin de DOMContentLoaded