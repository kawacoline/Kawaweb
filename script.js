
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Selecciona todos los elementos con la clase 'icon-item' (iconos clickeables del portfolio)
    const iconItems = document.querySelectorAll('.icon-item');
    // Selecciona todos los elementos con la clase 'modal' (ventanas emergentes)
    const modals = document.querySelectorAll('.modal');
    // Obtiene el elemento de audio para el sonido de clic
    const clickSound = document.getElementById('clickSound');
    // Obtiene la barra contenedora del reproductor de música
    const musicPlayerBar = document.getElementById('music-player-bar');

    // Music Player DOM Elements (elementos específicos dentro de la barra del reproductor)
    const playerAlbumArtImg = document.getElementById('player-album-art-img'); // Imagen del álbum
    const playerSongTitle = document.getElementById('player-song-title');     // Título de la canción
    const playerSongArtist = document.getElementById('player-song-artist');   // Artista de la canción
    const playerPrevBtn = document.getElementById('player-prev-btn');         // Botón de canción anterior
    const playerPlayPauseBtn = document.getElementById('player-play-pause-btn'); // Botón de play/pausa
    const playerPlayPauseIcon = playerPlayPauseBtn.querySelector('i');        // Icono dentro del botón play/pausa
    const playerNextBtn = document.getElementById('player-next-btn');         // Botón de siguiente canción
    const playerCurrentTime = document.getElementById('player-current-time'); // Tiempo actual de reproducción
    const playerTotalTime = document.getElementById('player-total-time');     // Duración total de la canción
    const playerProgressBar = document.getElementById('player-progress-bar'); // Barra de progreso de la canción
    
    const musicVolumeIcon = document.getElementById('music-volume-icon');     // Icono de volumen
    const volumeSlider = document.getElementById('volume-slider');            // Slider de volumen

    // --- State Variables ---
    // Z-index base para las ventanas modales, para que la última clickeada esté encima
    let modalBaseZIndex = 1000;
    // Mapa para almacenar el estado (abierto, minimizado, maximizado, posición, etc.) de cada modal
    const modalStates = new Map();
    // Variable para almacenar la instancia del sketch de p5.js (visualizador)
    let p5SketchInstance;
    // Almacena el último nivel de volumen antes de silenciar, para restaurarlo
    let lastVolumeBeforeIconClickMute = 0.7;

    // Array que contiene la información de las canciones de la lista de reproducción
    const playlist = [
        { title: "гуляю", artist: "ANGUISH, EXILED, elfass", filePath: "assets/PLAYLIST/ANGUISH_HEXILED_elfass_Gulyau.mp3", albumArtPath: "assets/PLAYLIST_COVERS/gulyau_cover.jpg" },
        { title: "it's rainy outside", artist: "uselet", filePath: "assets/PLAYLIST/its_rainy_outside.mp3", albumArtPath: "assets/PLAYLIST_COVERS/its_rainy_outside_cover.jpg" },
        { title: "Aegleseeker", artist: "Silentroom vs Frums", filePath: "assets/PLAYLIST/Silentroom_vs_Frums_Aegleseeker.mp3", albumArtPath: "assets/PLAYLIST_COVERS/aegleseeker_cover.jpg" },
        { title: "World execute (me)", artist: "Mili", filePath: "assets/PLAYLIST/World_execute_(me)_Mili.mp3", albumArtPath: "assets/PLAYLIST_COVERS/world_execute_me_cover.jpg" }
    ];
    // Índice de la canción actualmente seleccionada en la 'playlist'
    let currentSongIndex = 0;
    // Almacena la instancia p5.SoundFile de la canción actualmente cargada o seleccionada
    let currentP5Song = null;
    // Indica si el reproductor está en estado de reproducción global (play) o pausa (pause)
    let isPlayerGloballyPlaying = false;
    
    // Esta bandera es true mientras el usuario está arrastrando el círculo de la barra de progreso.
    let isUserDraggingProgressBar = false;

    // Array para guardar las instancias p5.SoundFile precargadas
    let preloadedP5Sounds = [];
    // Contador para saber cuántas canciones faltan por procesar durante la precarga inicial
    let songsToPreloadCount = 0;
    // Bandera que indica si todas las canciones de la playlist han sido intentadas cargar (éxito o fallo)
    let allSongsProcessedForPreload = false;

    // Array que contiene la data para la sección "Work" (Trabajos)
    const workData = [
        { type: 'banner', text: 'Accepting work offers via my <a href="mailto:kawacoline@gmail.com">work email</a>. I do illustration, animation, web design, and web/app development. :)' },
        { type: 'tags', title: 'TOOLS', items: ['Adobe Photoshop', 'Adobe Animate', 'Clip Studio Paint', 'Unity 2D/3D', 'Adobe Illustrator', 'Adobe Premiere', 'Adobe After Effects', 'Blender', 'OpenToonz', 'InDesign', 'Figma']},
        { type: 'tags', title: 'DEVELOPMENT', items: ['C#', 'C++', 'C', 'Python', 'JavaScript', 'HTML/CSS', 'React', 'Gatsby', 'Next.js']},
        { type: 'videos', title: 'ANIMATION', items: [ { title: 'candy: a zelink fan animation', youtubeId: 'dQw4w9WgXcQ' }, { title: 'of the wild', youtubeId: 'oHg5SJYRHA0' }, { title: 'take me home, country roads', youtubeId: '1t_4YvN1B9w' }, { title: 'the duck', youtubeId: 'MtN1YnoL46Q' } ]},
        { type: 'gallery', title: 'ILLUSTRATION', items: [ 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+1', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+2', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+3', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+4', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+5', 'https://via.placeholder.com/300x200/1c1c1c/eeeeee?text=Illustration+6', ]},
        { type: 'devProjects', title: 'PROJECTS', items: [ { title: 'Bingus Adventure', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Bingus', description: "a buggy RPG i made with a friend in college for a game jam, held by my game dev student org <a href='#' target='_blank'>DevelUP!</a> i worked on the programming and sprite art for this one, my friend Vince did the design, awesome writing, and environment art! it won't give you a virus but you'll probably encounter a lot of bugs LOL but i thought it would be fun to share here hehe, enjoy (or not)!!", downloadLink: '#', }, { title: 'This Website!', image: 'https://via.placeholder.com/120x90/1c1c1c/eeeeee?text=Portfolio', description: "The very portfolio you are looking at now. Built with HTML, CSS, and vanilla JavaScript. Features include draggable and resizable modal windows, and an audio visualizer.", } ]},
        { type: 'footerText', text: "See more on <a href='https://github.com/yourusername' target='_blank'>GitHub</a>."}
    ];

    // Función para renderizar dinámicamente el contenido de la sección "Work" en su modal
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

    // Inicializa los estados de todas las ventanas modales
    modals.forEach(modal => { 
        modalStates.set(modal, {
            isOpen: false, isMaximized: false, isMinimized: false,
            original: { left: '50%', top: '50%', width: getComputedStyle(modal).width, transform: 'translate(-50%, -50%) scale(0.9)' }, 
            current: {} 
        });
    });
    
    // Añade event listeners a cada icono para abrir su modal correspondiente
    iconItems.forEach(item => { 
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 
            playClickSound(); 
            handleGlobalUserInteraction(); 
            const modalId = item.dataset.modalTarget; 
            const targetModal = document.querySelector(modalId); 
            if (targetModal) openModal(targetModal); 
        });
    });

    // Función para abrir una ventana modal
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

    // Manejador para interacciones con botones dentro de los modales (minimizar, maximizar, cerrar)
    function handleModalButtonInteraction(e) { if (e) e.stopPropagation(); playClickSound(); }

    // Añade event listeners a los botones de control (cerrar, minimizar, maximizar) de cada modal
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

    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; }

    function updatePlayerUITrackInfo() { 
        if (playlist.length === 0 || !playlist[currentSongIndex]) {
            if (playerSongTitle) playerSongTitle.textContent = "No Song";
            if (playerSongArtist) playerSongArtist.textContent = "";
            if (playerAlbumArtImg) playerAlbumArtImg.src = 'assets/PLAYLIST_COVERS/default_art.png';
            return;
        }
        const songData = playlist[currentSongIndex];
        if (playerSongTitle) playerSongTitle.textContent = songData.title;
        if (playerSongArtist) playerSongArtist.textContent = songData.artist;
        if (playerAlbumArtImg) {
            playerAlbumArtImg.src = songData.albumArtPath || 'assets/PLAYLIST_COVERS/default_art.png';
            playerAlbumArtImg.alt = songData.title + " Album Art";
        }
    }

    function updatePlayPauseButton(isPlaying) { if (playerPlayPauseIcon) { playerPlayPauseIcon.classList.toggle('fa-pause', isPlaying); playerPlayPauseIcon.classList.toggle('fa-play', !isPlaying); } }
    
    // Actualiza la UI de progreso de la canción (barra de progreso, tiempo actual y total)
    // --- CORRECCIÓN: Eliminada la duplicación de esta función ---
    function updateProgressUI() { 
        // Si el usuario está arrastrando la barra Y la barra existe Y hay una canción cargada con duración válida:
        if (isUserDraggingProgressBar && playerProgressBar && currentP5Song && currentP5Song.isLoaded() && isFinite(currentP5Song.duration())) {
            // Calcula el tiempo deseado basado en el valor actual del input de la barra (que el usuario está moviendo)
            const percentage = parseFloat(playerProgressBar.value);
            const desiredTime = currentP5Song.duration() * (percentage / 100);
            // Actualiza solo el TEXTO del tiempo actual para dar feedback visual del arrastre
            if (playerCurrentTime) {
                playerCurrentTime.textContent = formatTime(desiredTime);
            }
            // No se actualiza la posición del círculo de la barra aquí (playerProgressBar.value) desde currentSong.currentTime()
            // porque el usuario lo está controlando directamente a través del input. El valor del input ya refleja la posición deseada.
            return; // No hacer más nada si se está arrastrando
        }

        // Si no se está arrastrando, o no se cumplen las condiciones anteriores, actualiza normalmente:
        if (currentP5Song && currentP5Song.isLoaded()) { 
            const currentTime = currentP5Song.currentTime(); 
            const duration = currentP5Song.duration();
            if (isFinite(duration) && duration > 0) { 
                if (playerCurrentTime) playerCurrentTime.textContent = formatTime(currentTime);
                if (playerTotalTime) playerTotalTime.textContent = formatTime(duration);
                // Actualiza la posición del círculo de la barra de progreso SOLO si no se está arrastrando
                if (playerProgressBar && !isUserDraggingProgressBar) playerProgressBar.value = (currentTime / duration) * 100;
            } else { 
                if (playerCurrentTime) playerCurrentTime.textContent = "0:00"; 
                if (playerTotalTime) playerTotalTime.textContent = "0:00"; 
                if (playerProgressBar && !isUserDraggingProgressBar) playerProgressBar.value = 0; 
            }
        } else { 
            if (playerCurrentTime) playerCurrentTime.textContent = "0:00"; 
            if (playerTotalTime) playerTotalTime.textContent = "0:00"; 
            if (playerProgressBar && !isUserDraggingProgressBar) playerProgressBar.value = 0; 
        }
    }
    // --- FIN CORRECCIÓN ---

    const sketch = (p) => {
        let fft, particles = [], musicSuccessfullyStartedThisSession = false;
        let isProcessingOnended = false, expectingOnEndedDueToManipulation = false;

        p.setup = () => { 
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('p5-visualizer-container'); 
            p.angleMode(p.DEGREES); 
            fft = new p5.FFT(0.8, 512); 
            
            preloadedP5Sounds = new Array(playlist.length).fill(null); 
            if (playlist.length > 0) {
                songsToPreloadCount = playlist.length; 
                playlist.forEach((song, index) => { 
                    p.loadSound(song.filePath, 
                        (loadedSound) => { 
                            preloadedP5Sounds[index] = loadedSound; 
                            console.log(`Precargada: ${song.title}`);
                            p.checkPreloadComplete(); 
                        }, 
                        (err) => { 
                            preloadedP5Sounds[index] = null; 
                            console.error(`Error precargando ${song.title}:`, err);
                            p.checkPreloadComplete(); 
                        }
                    );
                });
            } else { 
                p.checkPreloadComplete(); 
            }
            
            const initialVolume = volumeSlider ? parseFloat(volumeSlider.value) : 0.7; 
            lastVolumeBeforeIconClickMute = initialVolume > 0 ? initialVolume : 0.7;
            updateVolumeIconDisplay(initialVolume); 
            p.noLoop(); 
        };

        p.checkPreloadComplete = () => {
            songsToPreloadCount--; 
            if (songsToPreloadCount <= 0 && !allSongsProcessedForPreload) {
                allSongsProcessedForPreload = true; 
                console.log("Todas las canciones procesadas para precarga.");
                if (musicPlayerBar) { 
                    musicPlayerBar.classList.add('ready');
                }
                if (playlist.length > 0) {
                    const firstValidSongIndex = preloadedP5Sounds.findIndex(sound => sound !== null && sound.isLoaded());
                    if (firstValidSongIndex !== -1) {
                        currentSongIndex = firstValidSongIndex; 
                        p.switchToSong(currentSongIndex, false); 
                    } else { 
                        console.warn("Ninguna canción pudo ser precargada exitosamente.");
                        updatePlayerUITrackInfo(); 
                         if (playerProgressBar) playerProgressBar.disabled = true; 
                    }
                } else { 
                    updatePlayerUITrackInfo(); 
                    if (playerProgressBar) playerProgressBar.disabled = true;
                }
                const hasValidSongs = preloadedP5Sounds.some(s => s !== null && s.isLoaded());
                if (playerPlayPauseBtn) playerPlayPauseBtn.disabled = !hasValidSongs;
                if (playerNextBtn) playerNextBtn.disabled = !hasValidSongs;
                if (playerPrevBtn) playerPrevBtn.disabled = !hasValidSongs;
            }
        };

        p.draw = () => { 
            p.background(0); 
            if (currentP5Song && currentP5Song.isLoaded() && currentP5Song.isPlaying()) {
                fft.analyze(); 
                let wave = fft.waveform(); 
                let currentAmp = fft.getEnergy(20, 200); 
                p.translate(p.width / 2, p.height / 2); 
                if (currentAmp > 210 && particles.length < 200) { for (let i = 0; i < p.random(0, 3); i++) particles.push(new Particle(p)); }
                for (let i = particles.length - 1; i >= 0; i--) { if (!particles[i].edges()) { particles[i].update(currentAmp > 210); particles[i].show(); } else particles.splice(i, 1); }
                p.stroke(255); p.strokeWeight(3); p.noFill();
                for (let t = -1; t <= 1; t += 2) { 
                    p.beginShape();
                    for (let i = 0; i <= 180; i += 0.75) { let index = p.floor(p.map(i, 0, 180, 0, wave.length - 1)), r = p.map(wave[index], -1, 1, 250, 550); p.vertex(r * p.sin(i) * t, r * p.cos(i)); }
                    p.endShape();
                }
            }
            updateProgressUI(); 
        };

        p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);

        p.switchToSong = (newIndex, playAfterSwitch, seekTime = -1) => {
            if (!allSongsProcessedForPreload || preloadedP5Sounds.length === 0) {
                console.warn("Aún no se han procesado las canciones para precarga o no hay canciones.");
                return;
            }

            if (currentP5Song) {
                if (currentP5Song.isPlaying()) {
                    currentP5Song.stop();
                }
                // Neutraliza el callback 'onended' de la canción anterior para evitar que se dispare inesperadamente.
                currentP5Song.onended(() => { 
                    /* console.log(`onended neutralizado para canción previa`); */
                }); 
                if (fft) fft.setInput(null); 
            }
            
            currentSongIndex = (newIndex + playlist.length) % playlist.length; 
            currentP5Song = preloadedP5Sounds[currentSongIndex]; 

            if (!currentP5Song || !currentP5Song.isLoaded()) { 
                console.error(`La canción ${playlist[currentSongIndex]?.title} no está disponible o no se cargó correctamente.`);
                updatePlayerUITrackInfo(); 
                updatePlayPauseButton(false);
                if (p.noLoop) p.noLoop();
                return;
            }
            
            updatePlayerUITrackInfo(); 
            if (playerProgressBar) playerProgressBar.value = 0; 
            if (playerCurrentTime) playerCurrentTime.textContent = "0:00";
            if (playerTotalTime && isFinite(currentP5Song.duration())) playerTotalTime.textContent = formatTime(currentP5Song.duration());
            else if (playerTotalTime) playerTotalTime.textContent = "0:00";

            currentP5Song.setVolume(volumeSlider ? parseFloat(volumeSlider.value) : 0.7);
            if (fft) fft.setInput(currentP5Song); 

            // Define una función nombrada para el callback 'onended'.
            const handleSongEnd = () => {
                if (isProcessingOnended) { return; }
                isProcessingOnended = true;
                const songTitleCb = playlist[currentSongIndex]?.title; 
                const endedSongInstance = currentP5Song; 

                if (expectingOnEndedDueToManipulation) { 
                    expectingOnEndedDueToManipulation = false; 
                    if (isPlayerGloballyPlaying && endedSongInstance && endedSongInstance.isLoaded()) {
                        // No se reanuda aquí si fue por pausa manual; el control de play/pause se encarga.
                    } else { 
                        updatePlayPauseButton(false);
                        if (p.noLoop) p.noLoop();
                    }
                } else if (isPlayerGloballyPlaying) { 
                    console.log(`Fin natural de "${songTitleCb}". Reproduciendo siguiente canción.`);
                    p.playNextSong(); 
                } else { 
                    updatePlayPauseButton(false); 
                    if (p.noLoop) p.noLoop(); 
                }
                setTimeout(() => { isProcessingOnended = false; }, 100);
            };
            currentP5Song.onended(handleSongEnd); // Asigna la función nombrada como callback.

            if (seekTime >= 0 && isFinite(currentP5Song.duration())) {
                currentP5Song.jump(seekTime);
            }

            if (playAfterSwitch && isPlayerGloballyPlaying) {
                p.playCurrentSong(); 
            } else { 
                updatePlayPauseButton(false); 
                if (p.noLoop && !isUserDraggingProgressBar) p.noLoop(); 
                updateProgressUI(); 
            }
        };
        
        p.startMusicAfterUserInteraction = () => { 
            if (p.getAudioContext().state !== 'running') { 
                p.userStartAudio().then(() => { 
                    musicSuccessfullyStartedThisSession = true; 
                    if (isPlayerGloballyPlaying && currentP5Song && currentP5Song.isLoaded() && !currentP5Song.isPlaying()) {
                        p.playCurrentSong();
                    }
                }).catch(e => console.error("Error starting audio context:", e));
            } else { 
                musicSuccessfullyStartedThisSession = true;
                 if (isPlayerGloballyPlaying && currentP5Song && currentP5Song.isLoaded() && !currentP5Song.isPlaying()) {
                    p.playCurrentSong();
                }
            }
        };
        
        p.playCurrentSong = () => {
            if (!allSongsProcessedForPreload) { 
                console.warn("Las canciones aún no se han procesado para precarga.");
                return;
            }
            if (!currentP5Song || !currentP5Song.isLoaded()) {
                console.warn("No hay canción actual válida para reproducir o no está cargada.");
                if (!currentP5Song && playlist.length > 0) {
                    const firstValidIndex = preloadedP5Sounds.findIndex(s => s && s.isLoaded());
                    if (firstValidIndex !== -1) {
                        p.switchToSong(firstValidIndex, true); 
                    } else { 
                         updatePlayPauseButton(false);
                    }
                } else { 
                    updatePlayPauseButton(false);
                }
                return;
            }

            if (p.getAudioContext().state !== 'running') {
                p.startMusicAfterUserInteraction(); 
                return;
            }
            
            expectingOnEndedDueToManipulation = false; 
            if (!currentP5Song.isPlaying()) { 
                console.log(`Intentando reproducir ${playlist[currentSongIndex]?.title}`);
                currentP5Song.play(); 
            }
            updatePlayPauseButton(true); 
            if (p.loop) p.loop(); 
        };
            
        p.pauseCurrentSong = () => { 
            if (currentP5Song && currentP5Song.isPlaying()) { 
                console.log("Acción de Pausa. Estableciendo expectingOnEndedDueToManipulation = true");
                expectingOnEndedDueToManipulation = true; 
                currentP5Song.pause(); 
                updatePlayPauseButton(false); 
                if (p.noLoop) p.noLoop(); 
            }
        };

        p.playNextSong = () => { 
            if (!allSongsProcessedForPreload || preloadedP5Sounds.length === 0) return; 
            let nextIndex = (currentSongIndex + 1) % playlist.length; 
            let initialNextIndex = nextIndex;
            while(!preloadedP5Sounds[nextIndex] || !preloadedP5Sounds[nextIndex].isLoaded()){
                nextIndex = (nextIndex + 1) % playlist.length;
                if(nextIndex === initialNextIndex) { 
                    console.warn("No hay más canciones válidas para reproducir hacia adelante.");
                    return;
                }
            }
            p.switchToSong(nextIndex, isPlayerGloballyPlaying); 
        };
        p.playPrevSong = () => { 
            if (!allSongsProcessedForPreload || preloadedP5Sounds.length === 0) return;
            let prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length; 
            let initialPrevIndex = prevIndex;
            while(!preloadedP5Sounds[prevIndex] || !preloadedP5Sounds[prevIndex].isLoaded()){
                prevIndex = (prevIndex - 1 + playlist.length) % playlist.length;
                if(prevIndex === initialPrevIndex) { 
                    console.warn("No hay más canciones válidas para reproducir hacia atrás.");
                    return;
                }
            }
            p.switchToSong(prevIndex, isPlayerGloballyPlaying); 
        };

        p.setAudioVolume = (vol) => { if (currentP5Song && currentP5Song.isLoaded()) currentP5Song.setVolume(vol); if (vol > 0) lastVolumeBeforeIconClickMute = vol; };
        p.getAudioVolume = () => (currentP5Song && currentP5Song.isLoaded() && typeof currentP5Song.getVolume === 'function') ? currentP5Song.getVolume() : (volumeSlider ? parseFloat(volumeSlider.value) : 0.7);
        p.getLastNonZeroVolume = () => lastVolumeBeforeIconClickMute > 0 ? lastVolumeBeforeIconClickMute : 0.7;

        // Permite buscar (seek) a un porcentaje específico de la canción actual
        p.seekSong = (percentage) => { 
            if (currentP5Song && currentP5Song.isLoaded() && isFinite(currentP5Song.duration()) && currentP5Song.duration() > 0) {
                const time = currentP5Song.duration() * (percentage / 100); 
                console.log(`p.seekSong: Buscando a ${time.toFixed(2)}s. Estableciendo expectingOnEndedDueToManipulation = true.`); // Log identificador
                expectingOnEndedDueToManipulation = true; 
                currentP5Song.jump(time); 
                
                // Forzar actualización INMEDIATA de la UI después del salto.
                updateProgressUI(); 

                if (isPlayerGloballyPlaying && !currentP5Song.isPlaying()) {
                    currentP5Song.play();
                    updatePlayPauseButton(true);
                    if(p.loop) p.loop(); 
                }
            }
        };
    };

    class Particle { 
        constructor(pInstance) { this.p = pInstance; this.pos = this.p.createVector(0,0); this.vel = p5.Vector.random2D().mult(this.p.random(1,3)); this.acc = p5.Vector.random2D().mult(this.p.random(0.01,0.05)); this.w = this.p.random(2,5); this.color = [this.p.random(200,255),this.p.random(200,255),this.p.random(200,255),this.p.random(100,200)]; this.lifespan = 255; }
        update(bassKicked) { this.vel.add(this.acc); this.pos.add(this.vel); if(bassKicked) { let push = this.pos.copy().normalize().mult(this.p.random(1,2)); this.vel.add(push); } this.vel.limit(4); this.lifespan -= 1.0; }
        edges() { return this.pos.mag() > this.p.max(this.p.width,this.p.height) * 0.85 || this.lifespan < 0; }
        show() { this.p.noStroke(); this.p.fill(this.color[0],this.color[1],this.color[2],this.lifespan); this.p.ellipse(this.pos.x,this.pos.y,this.w); }
    }

    p5SketchInstance = new p5(sketch);

    if (playerPlayPauseBtn) playerPlayPauseBtn.addEventListener('click', () => { 
        playClickSound(); handleGlobalUserInteraction(); 
        isPlayerGloballyPlaying = !isPlayerGloballyPlaying; 
        if (isPlayerGloballyPlaying) { 
            if (p5SketchInstance.playCurrentSong) p5SketchInstance.playCurrentSong();
        } else { 
            if (p5SketchInstance.pauseCurrentSong) p5SketchInstance.pauseCurrentSong();
        }
    });
    if (playerNextBtn) playerNextBtn.addEventListener('click', () => { playClickSound(); handleGlobalUserInteraction(); if (p5SketchInstance.playNextSong) p5SketchInstance.playNextSong(); });
    if (playerPrevBtn) playerPrevBtn.addEventListener('click', () => { playClickSound(); handleGlobalUserInteraction(); if (p5SketchInstance.playPrevSong) p5SketchInstance.playPrevSong(); });

    if (playerProgressBar) {
        playerProgressBar.addEventListener('mousedown', () => {
            isUserDraggingProgressBar = true; 
            // console.log("mousedown en barra, isUserDraggingProgressBar = true");
        });

        playerProgressBar.addEventListener('input', (e) => {
            if (isUserDraggingProgressBar) { 
                updateProgressUI(); 
            }
        });

        playerProgressBar.addEventListener('change', (e) => {
            playClickSound(); 
            const seekPercentage = parseFloat(e.target.value); 
            
            if (isUserDraggingProgressBar) { // Solo actuar si realmente se estaba arrastrando y 'change' es el primer evento de finalización
                isUserDraggingProgressBar = false; 
                if (p5SketchInstance.seekSong && currentP5Song && currentP5Song.isLoaded()) { 
                    p5SketchInstance.seekSong(seekPercentage); 
                }
            }
            // Si isUserDraggingProgressBar ya es false, significa que mouseup en document probablemente ya manejó el seek.
        });

        document.addEventListener('mouseup', (e) => { 
            if (isUserDraggingProgressBar) { // Solo si el usuario ESTABA arrastrando y soltó (posiblemente fuera de la barra)
                isUserDraggingProgressBar = false; 
                const seekPercentage = parseFloat(playerProgressBar.value); // Usar el valor actual de la barra
                if (p5SketchInstance.seekSong && currentP5Song && currentP5Song.isLoaded()) {
                    p5SketchInstance.seekSong(seekPercentage);
                }
                updateProgressUI(); 
            }
        });
    }

    function updateVolumeIconDisplay(volume) { 
        if (!musicVolumeIcon) return; 
        musicVolumeIcon.classList.remove('fa-volume-up','fa-volume-down','fa-volume-mute','fa-volume-off');
        if (volume === 0) musicVolumeIcon.classList.add('fa-volume-off');      
        else if (volume < 0.01) musicVolumeIcon.classList.add('fa-volume-mute'); 
        else if (volume < 0.5) musicVolumeIcon.classList.add('fa-volume-down');  
        else musicVolumeIcon.classList.add('fa-volume-up');      
    }
    
    if (volumeSlider) {
      volumeSlider.value = lastVolumeBeforeIconClickMute; 
      updateVolumeIconDisplay(lastVolumeBeforeIconClickMute); 
    }

    if (musicVolumeIcon && volumeSlider && p5SketchInstance) { 
        volumeSlider.addEventListener('input', (e) => { 
            const vol = parseFloat(e.target.value); 
            if (p5SketchInstance.setAudioVolume) p5SketchInstance.setAudioVolume(vol); 
            updateVolumeIconDisplay(vol); 
        });
        volumeSlider.addEventListener('change', playClickSound); 
        musicVolumeIcon.addEventListener('click', (e) => {
            e.stopPropagation(); playClickSound(); handleGlobalUserInteraction();
            const currentVol = p5SketchInstance.getAudioVolume ? p5SketchInstance.getAudioVolume() : (volumeSlider ? parseFloat(volumeSlider.value) : 0.7);
            const volToSet = currentVol > 0 ? 0 : (p5SketchInstance.getLastNonZeroVolume ? p5SketchInstance.getLastNonZeroVolume() : 0.7);
            if (p5SketchInstance.setAudioVolume) p5SketchInstance.setAudioVolume(volToSet); 
            if (volumeSlider) volumeSlider.value = volToSet; 
            updateVolumeIconDisplay(volToSet); 
        });
    } else console.warn("Controles de volumen (barra de reproductor) no encontrados o sketch p5 no listo.");

    function playClickSound() { if (clickSound) { clickSound.currentTime = 0; clickSound.play().catch(e => console.warn("Error sonido de clic:", e)); } }
    
    let globalUserInteractionHasOccurred = false;
    function handleGlobalUserInteraction() { 
        if (!globalUserInteractionHasOccurred && p5SketchInstance && p5SketchInstance.startMusicAfterUserInteraction) {
            p5SketchInstance.startMusicAfterUserInteraction(); 
            globalUserInteractionHasOccurred = true; 
        }
    }
    document.body.addEventListener('click', handleGlobalUserInteraction, { once: true, capture: true });
    document.body.addEventListener('keydown', handleGlobalUserInteraction, { once: true, capture: true });

    const baseMinimizedInitialOffset = 15, minimizedWindowSpacing = 10, minimizedWindowWidth = 220;
    function recalculateMinimizedOffsets() { 
        let currentOffset = baseMinimizedInitialOffset; const minimized = [];
        modals.forEach(m => { const s = modalStates.get(m); if (s.isMinimized) minimized.push({modal:m, state:s}); });
        minimized.sort((a,b) => (a.state.minimizedOffset || baseMinimizedInitialOffset) - (b.state.minimizedOffset || baseMinimizedInitialOffset));
        minimized.forEach(item => { item.modal.style.setProperty('--minimized-left', `${currentOffset}px`); item.state.minimizedOffset = currentOffset; currentOffset += minimizedWindowWidth + minimizedWindowSpacing; });
    }

    if (playlist.length > 0) { 
        updatePlayerUITrackInfo(); 
        updatePlayPauseButton(false); 
        if (playerProgressBar) playerProgressBar.value = 0; 
        if (playerCurrentTime) playerCurrentTime.textContent = "0:00"; 
        if (playerTotalTime) playerTotalTime.textContent = "0:00"; 
    } else { 
        if (playerSongTitle) playerSongTitle.textContent = "No Songs in Playlist"; 
        if (playerSongArtist) playerSongArtist.textContent = "";
        if (playerAlbumArtImg) playerAlbumArtImg.src = 'assets/PLAYLIST_COVERS/default_art.png';
        [playerPlayPauseBtn, playerNextBtn, playerPrevBtn, playerProgressBar].forEach(el => { if (el) el.disabled = true; });
        if (musicPlayerBar) { 
            musicPlayerBar.classList.remove('ready');
        }
    }
});