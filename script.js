// --- DOMContentLoaded: Aquí empieza todo el desmadre ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de elementos del DOM ---
    const iconItems = document.querySelectorAll('.icon-item'); // Icons
    const modals = document.querySelectorAll('.modal'); // Modales
    const clickSound = document.getElementById('clickSound'); // Sonido de clic, bajarle volumen a esta mierda
    const musicPlayerBarDOM = document.getElementById('music-player-bar'); // Barra del reproductor
    const playerPrevBtn = document.getElementById('player-prev-btn'); // Botón para canción anterior
    const playerPlayPauseBtn = document.getElementById('player-play-pause-btn'); // Botón play/pause
    const playerNextBtn = document.getElementById('player-next-btn'); // Botón para siguiente canción
    const playerProgressBar = document.getElementById('player-progress-bar'); // Barra de progreso
    const volumeSlider = document.getElementById('volume-slider'); // Slider de volumen
    const musicVolumeIcon = document.getElementById('music-volume-icon'); // Ícono de volumen

    // NUEVO: Referencia al botón de colapsar reproductor
    const togglePlayerBarBtn = document.getElementById('toggle-player-bar-btn'); // Botón para colapsar la barra del reproductor
    const togglePlayerBarIcon = togglePlayerBarBtn ? togglePlayerBarBtn.querySelector('i') : null; // Ícono dentro del botón

    // --- Playlist: Datos de las canciones ---
    const playlistData = [
       
        {
            title: "駿", artist: "Silentroom",
            filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748396118/xtlnbonlqhgycnfgluhj.webm",
            albumArtPath: "assets/SONGS_COVERS/駿_cover.jpg"
        },
        {
            title: "nostalmic", artist: "いっしん/just usual imagination by Hercelot",
            filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748806936/%E3%83%A2%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3%E3%83%83%E3%82%AF%E3%82%B9_nostalmic_pd5bh0.webm",
            albumArtPath: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxgxgtwNKDmZ1ZFCTUIPE2o_BtPfSOhgI_bzKW1sNtoOXk7MMrJRPcAlJEo-Gj0RJj-Ww&usqp=CAU"
        },
        {
            title: "Rainshower", artist: "Silentroom × Shun",
            filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748396759/%E9%A9%9F%E9%9B%A8%E3%81%AE%E7%8B%AD%E9%96%93_Rainshower_Silentroom_Shun_720p_tmtjhf.webm",
            albumArtPath: "assets/SONGS_COVERS/rainshowe_cover.jpeg"
        },
        {
            title: "Disengaging", artist: "katagiri/kkmfd - 脱社会ヴァンダリズム独白if",
            filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748805972/Disengaging_fwzokn.webm",
            albumArtPath: "https://i.ytimg.com/vi/YQRZKOawkrI/sddefault.jpg?v=64849fda"
        },
        {
            title: "World execute (me)", artist: "Mili",
            filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1748323206/ybejaiedxaryhcbko9ms.webm",
            albumArtPath: "assets/SONGS_COVERS/world_execute_me_cover.jpg"
        },
        {
            title: "Kami no kotoba", artist: "Luschka",
            filePath: "https://res.cloudinary.com/dru0licqm/video/upload/v1752637147/Luschka_-_Kami_no_Kotoba_lyrics_mK4yZ6Vp6u4_dmyupo.mp4",
            albumArtPath: "https://i1.sndcdn.com/artworks-000102543629-fz3fhm-t500x500.jpg"
        }
    ];

    // --- Inicialización de p5.js para el visualizador de audio ---
    new p5(audioVisualizer.sketch); // Dolor de cabeza, pero es necesario para que p5.js funcione correctamente

    // --- Función para inicializar el reproductor cuando p5 esté listo ---
    function checkP5SystemReadyAndInitPlayer() {
        let p5CoreAndSketchSetupDone = audioVisualizer.p5SetupDone && audioVisualizer.p5Instance; // Verificar si p5.js y el sketch están listos

        if (p5CoreAndSketchSetupDone) {
            console.log("Script.js: Sketch de p5 (audioVisualizer) está listo. Inicializando Video Player Manager.");
            videoPlayerManager.init({
                playlist: playlistData,
                audioVisualizer: audioVisualizer,
                p5Instance: audioVisualizer.p5Instance
            });

            if (musicPlayerBarDOM && videoPlayerManager.playlist.length > 0 && videoPlayerManager.player) {
                musicPlayerBarDOM.classList.add('ready');
                if (togglePlayerBarBtn) togglePlayerBarBtn.classList.add('ready'); // NUEVO: Hacer visible el botón de colapso
                console.log("Script.js: Barra de reproductor y botón de colapso activados.");
            } else if (musicPlayerBarDOM) {
                musicPlayerBarDOM.classList.remove('ready');
                if (togglePlayerBarBtn) togglePlayerBarBtn.classList.remove('ready'); // NUEVO
                console.warn("Script.js: No se activa la barra del reproductor.");
            }
        } else {
            console.log(`Script.js: Waiting for p5 sketch (audioVisualizer.p5SetupDone && p5Instance) to be ready...`);
            setTimeout(checkP5SystemReadyAndInitPlayer, 100); // debería ser más corto, pero no quiero que se rompa si p5.js tarda más en inicializarse
        }
    }
    checkP5SystemReadyAndInitPlayer();

    // --- Lógica de UI (Modales, etc.) ---
    let modalBaseZIndex = 1000; // Base para el z-index de los modales
    const modalStates = new Map(); // Map para flexibilidad a la hora manejar estados de modales.
    const workData = [
        { type: 'banner', text: 'ффф <a href="mailto:kawacoline@gmail.com">work email</a>. ффф I do illustration, animation, web design, and web/app development. :)' },
        { type: 'tags', title: 'TOOLS', items: ['Adobe SUITE', 'Google SUITE', 'Blender', 'SAI2', 'Figma'] },
        { type: 'tags', title: 'DEVELOPMENT', items: ['C++', 'Python', 'HTML/CSS/JavaScript', 'React', 'LUA', 'Next.js'] },
        { type: 'videos', title: 'ANIMATIONS/Not mine', items: [{ title: 'Dominate', youtubeId: 'zxyOdltHfb0' }, { title: 'Thrilling Zümrütrüyası【Arknights R.A. anim】', youtubeId: '3kZD1oNxLA0' }, { title: 'EXC3_CM3', youtubeId: 'o1hggJOIY_c' }, { title: 'LOOKING GLASS LUMINESCENCE', youtubeId: 'aftOCaPnsns' }] },
        { type: 'gallery', title: 'ILLUSTRATION', items: ['https://pbs.twimg.com/media/FRe6BQnXoAEljkb?format=jpg&name=4096x4096', 'https://pbs.twimg.com/media/FfKT2TUWAAAVlT5?format=jpg&name=large', 'https://res.cloudinary.com/dru0licqm/image/upload/v1748721784/chrome_afzHj4q8sT_cxlgp0.png', 'https://pbs.twimg.com/media/FrxI8VQXgAAWWqK?format=jpg&name=4096x4096', 'https://pbs.twimg.com/media/FirVbTyXkAE79L2?format=png&name=900x900', 'https://res.cloudinary.com/dru0licqm/image/upload/v1748813856/Kaelyn_fa1aio.jpg',] },
        { type: 'devProjects', title: 'PROJECTS', items: [{ title: 'Rhythm Game', image: 'https://pbs.twimg.com/media/GqHVqlzagAAIAuI?format=png&name=small', description: "I was bored <a href='#' target='_blank'>Play now!</a>", downloadLink: '#', }, { title: 'This Website!', image: 'https://res.cloudinary.com/dru0licqm/image/upload/v1748710517/chrome_LsMZLfLxop_k9pz2c.png', description: "The very portfolio you are looking at now. Built with HTML, CSS, and vanilla JavaScript. Features include draggable and resizable modal windows, and an audio visualizer.", }] },
        { type: 'footerText', text: "Kinda kinda kinda kinda kinda" }
    ];

    // --- Renderizar la sección de trabajo ---
    function renderWorkSection(contentElement) {
        contentElement.innerHTML = ''; // Limpiar contenido previo
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
        modals.forEach(m => { const s = modalStates.get(m); if (s.isMinimized) minimized.push({ modal: m, state: s }); });
        minimized.sort((a, b) => (a.state.minimizedOffset || baseMinimizedInitialOffset) - (b.state.minimizedOffset || baseMinimizedInitialOffset));
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
        document.addEventListener('mouseup', () => { // Asegurar que el arrastre termine globalmente
            if (videoPlayerManager.isUserDraggingProgressBar) {
                 videoPlayerManager.isUserDraggingProgressBar = false;
                 // Si se soltó fuera de la barra, actualiza con el último valor del input
                 if (videoPlayerManager.player && playerProgressBar.value !== videoPlayerManager.player.currentTime) {
                    videoPlayerManager.seek(parseFloat(playerProgressBar.value));
                 }
            }
        });
    }

    if (volumeSlider) {
        if (videoPlayerManager.player) { // Ya no es necesario llamar a updateVolumeIconDisplay aquí
            // videoPlayerManager.player.volume y muted se setean en init de videoPlayerManager
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

    // No es necesario updateVolumeIconDisplay aquí, videoPlayerManager.handleVolumeChange lo hará.

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
    const toggleMainContentIcon = toggleMainContentBtn ? toggleMainContentBtn.querySelector('i') : null;

    if (toggleMainContentBtn && contentWrapper && toggleMainContentIcon) {
        toggleMainContentBtn.addEventListener('click', () => {
            playClickSound();
            contentWrapper.classList.toggle('hidden-by-toggle');
            if (contentWrapper.classList.contains('hidden-by-toggle')) {
                toggleMainContentIcon.classList.remove('fa-eye');
                toggleMainContentIcon.classList.add('fa-eye-slash');
                toggleMainContentBtn.title = "Mostrar Contenido";
            } else {
                toggleMainContentIcon.classList.remove('fa-eye-slash');
                toggleMainContentIcon.classList.add('fa-eye');
                toggleMainContentBtn.title = "Ocultar Contenido";
            }
        });
    } else {
        console.warn("Botón para ocultar contenido o contentWrapper no encontrado.");
    }

    // --- NUEVA LÓGICA PARA EL BOTÓN DE COLAPSAR REPRODUCTOR ---
    if (togglePlayerBarBtn && musicPlayerBarDOM && togglePlayerBarIcon) {
        togglePlayerBarBtn.addEventListener('click', () => {
            playClickSound();
            handleGlobalUserInteractionForAudioContext(); // Buena práctica si interactúa con audio

            const isCurrentlyHidden = musicPlayerBarDOM.classList.contains('collapsed-by-button');

            musicPlayerBarDOM.classList.toggle('collapsed-by-button');
            togglePlayerBarBtn.classList.toggle('player-hidden');

            if (isCurrentlyHidden) { // Si estaba oculto, ahora se muestra
                togglePlayerBarIcon.classList.remove('fa-chevron-down');
                togglePlayerBarIcon.classList.add('fa-chevron-up');
                togglePlayerBarBtn.title = "Ocultar Reproductor";
                contentWrapper.style.paddingTop = "85px"; // Restaurar padding si es necesario
            } else { // Si estaba visible, ahora se oculta
                togglePlayerBarIcon.classList.remove('fa-chevron-up');
                togglePlayerBarIcon.classList.add('fa-chevron-down');
                togglePlayerBarBtn.title = "Mostrar Reproductor";
                contentWrapper.style.paddingTop = "15px"; // Reducir padding cuando la barra está oculta
            }
        });
    } else {
        console.warn("Botón para colapsar reproductor, la barra de música o su ícono no encontrado(s).");
    }


// === Pricing UI + Lightbox (nuevo) ===
(function pricingUIAndLightbox(){
  const modal = document.querySelector('#prices-modal .modal-content');
  if(!modal) return;

  // ----- Estado precios -----
  const state = {
    estilo: 'color',
    personajes: 1,
    fondo: 0,
    selectedType: 'icon',
    multipliers: { bn: 0.75, color: 1.0, render: 1.4 },
    base: { icon: { base: 14, msrp: 20 }, hb: { base: 29, msrp: 35 }, fb: { base: 39, msrp: 45 } },
    extraCharFactor: 0.8
  };

  const cards = modal.querySelectorAll('.pricing-card');
  const totalEl = modal.querySelector('.js-total');

  function updateCardPrices(){
    cards.forEach(card => {
      const type = card.dataset.type;
      const base = parseFloat(card.dataset.base);
      const msrp = parseFloat(card.dataset.msrp);
      const unit = Math.round(base * state.multipliers[state.estilo]);
      const msrpEl = card.querySelector('.msrp');
      if(msrpEl) msrpEl.textContent = `$${msrp}`;
      const priceEl = card.querySelector('.js-price');
      if(priceEl) priceEl.textContent = `$${unit}`;
      card.classList.toggle('selected', state.selectedType === type);
    });
  }

  function computeTotal(){
    const unitBase = state.base[state.selectedType].base;
    const unit = Math.round(unitBase * state.multipliers[state.estilo]);
    let total = unit;
    if(state.personajes > 1){
      const extras = state.personajes - 1;
      total += Math.round(unit * state.extraCharFactor) * extras;
    }
    total += parseInt(state.fondo, 10) || 0;
    if(totalEl) totalEl.textContent = `$${total}`;
    return total;
  }

  function refresh(){ updateCardPrices(); computeTotal(); }

  // Selección de card por clic (fuera de botones/miniaturas)
  cards.forEach(card => {
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.btn') || e.target.closest('.thumb')) return;
      state.selectedType = card.dataset.type; refresh();
    });
  });

  // Chips de estilo
  modal.querySelectorAll('.chip-group [data-estilo]').forEach(btn => {
    btn.addEventListener('click', ()=>{
      modal.querySelectorAll('.chip-group [data-estilo]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.estilo = btn.dataset.estilo; refresh();
    });
  });

  // Stepper personajes
  const stepper = modal.querySelector('.stepper');
  if(stepper){
    const input = stepper.querySelector('input');
    stepper.addEventListener('click', (e)=>{
      const delta = parseInt(e.target.dataset.step, 10);
      if(!isNaN(delta)){
        state.personajes = Math.max(1, Math.min(4, state.personajes + delta));
        input.value = state.personajes; refresh();
      }
    });
  }

  // Fondo
  const fondoSel = modal.querySelector('[data-control="fondo"]');
  if(fondoSel){
    fondoSel.addEventListener('change', ()=>{
      state.fondo = parseInt(fondoSel.value, 10) || 0; refresh();
    });
  }

  // CTA -> abrir modal de contacto (usa tu openModal existente)
  modal.querySelectorAll('.js-order').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const contact = document.querySelector('#contact-modal');
      if(contact) openModal(contact);
    });
  });

  // ----- Lightbox -----
  function openLightbox(urls, startIndex=0){
    let index = startIndex || 0;
    const backdrop = document.createElement('div'); backdrop.className = 'lb-backdrop';
    const img = document.createElement('img'); img.className = 'lb-img'; img.alt = 'Example';
    const btnClose = document.createElement('button'); btnClose.className = 'lb-close'; btnClose.innerHTML = '✕';
    const btnPrev = document.createElement('button'); btnPrev.className = 'lb-prev'; btnPrev.innerHTML = '‹';
    const btnNext = document.createElement('button'); btnNext.className = 'lb-next'; btnNext.innerHTML = '›';

    function show(i){ index = (i + urls.length) % urls.length; img.src = urls[index]; }
    function close(){ document.removeEventListener('keydown', onKey); backdrop.remove(); btnClose.remove(); btnPrev.remove(); btnNext.remove(); }

    function onKey(e){
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowLeft') show(index-1);
      if(e.key === 'ArrowRight') show(index+1);
    }

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', ()=>show(index-1));
    btnNext.addEventListener('click', ()=>show(index+1));
    backdrop.addEventListener('click', (e)=>{ if(e.target === backdrop) close(); });

    backdrop.appendChild(img); document.body.appendChild(backdrop);
    document.body.appendChild(btnClose); document.body.appendChild(btnPrev); document.body.appendChild(btnNext);
    document.addEventListener('keydown', onKey);
    show(index);
  }

  function gatherThumbsIn(el){
    return Array.from(el.querySelectorAll('.thumb')).map(t => t.getAttribute('data-full') || t.src);
  }

  // Abrir lightbox desde miniaturas
  modal.querySelectorAll('.thumb').forEach(thumb=>{
    thumb.addEventListener('click', (e)=>{
      e.stopPropagation();
      const card = e.target.closest('.pricing-card, .addon-card') || modal;
      const urls = gatherThumbsIn(card);
      const idx = parseInt(thumb.dataset.index || '0', 10) || 0;
      if(urls.length) openLightbox(urls, idx);
    });
  });

  // Abrir lightbox con botón "Ver ejemplos"
  modal.querySelectorAll('.js-open-gallery').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const card = btn.closest('.pricing-card, .addon-card') || modal;
      const urls = gatherThumbsIn(card);
      if(urls.length) openLightbox(urls, 0);
    });
  });

  // Init
  state.fondo = parseInt(fondoSel ? fondoSel.value : 0, 10) || 0;
  refresh();
})();
});
