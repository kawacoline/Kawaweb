document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const iconItems = document.querySelectorAll('.icon-item');
    const modals = document.querySelectorAll('.modal');
    const clickSound = document.getElementById('clickSound');
    const musicControl = document.getElementById('music-control');
    const musicControlIcon = musicControl.querySelector('i');
    
    // --- State Variables ---
    let modalBaseZIndex = 1000;
    const modalStates = new Map();
    let p5SketchInstance; 
    let isActuallyMuted = false;
    let lastVolume = 0.7;

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

    // --- Render Work Section (ASEGÚRATE QUE ESTÉ DEFINIDA AQUÍ) ---
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
            handleGlobalUserInteraction(); 
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

        // Restaurar a la posición original y escala de CERRADO
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

    // Define handleModalButtonInteraction at a higher scope for reuse
    function handleModalButtonInteraction(e) {
        if (e) e.stopPropagation(); // Stop event propagation if event exists
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
        let isDragging = false; // Flag para controlar el estado de arrastre

        handle.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.closest('button')) return; 
            if (state.isMaximized || state.isMinimized) return; 
            
            isDragging = true; // Iniciar arrastre
            playClickSound(); 
            modalBaseZIndex++; 
            element.style.zIndex = modalBaseZIndex;

            const rect = element.getBoundingClientRect(); 
            
            elementXStart = rect.left;
            elementYStart = rect.top;

            mouseXStart = e.clientX; 
            mouseYStart = e.clientY;
            
            // Aplicar posición absoluta y quitar el transform de centrado
            element.style.left = `${elementXStart}px`;
            element.style.top = `${elementYStart}px`;
            element.style.transform = 'scale(1)'; // Solo mantener la escala

            // Temporalmente añadir una clase para anular el transform de .active si es necesario
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
            isDragging = false; // Finalizar arrastre
            element.classList.remove('dragging'); // Quitar la clase de arrastre

            document.removeEventListener('mousemove', onMouseMove); 
            document.removeEventListener('mouseup', onMouseUp);
            
            if (!state.isMaximized && !state.isMinimized) {
                state.current.left = element.style.left;
                state.current.top = element.style.top;
                // Después de arrastrar, el 'transform' debería ser solo 'scale(1)'
                state.current.transform = 'scale(1)'; 
            }
        }
    }

    // --- p5.js Sketch Definition ---
    const sketch = (p) => {
        let song, fft;
        let particles = [];
        let currentAmp;
        let musicSuccessfullyStarted = false;
        let songIsReady = false; // Nueva variable para verificar si la canción está cargada

        p.preload = () => {
            song = p.loadSound('assets/background_music.mp3', 
                () => { 
                    console.log("Song loaded successfully in preload."); 
                    songIsReady = true; // Marcar como lista aquí
                }, 
                (err) => { 
                    console.error("Error loading song in preload:", err); 
                    songIsReady = false;
                } 
            );
        };

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight).parent('p5-visualizer-container');
            p.angleMode(p.DEGREES);
            fft = new p5.FFT(0.8, 512);
            
            // Solo intentar operaciones de 'song' si está lista
            if (songIsReady && song) { 
                song.setVolume(lastVolume);
            } else {
                console.warn("Song not ready in setup, volume not set yet.");
            }

            p.noLoop(); 

            // Intentar iniciar música si el contexto ya corre y la canción está lista
            if (p.getAudioContext().state === 'running' && songIsReady && song && !song.isPlaying()) {
                try {
                    song.loop();
                    p.loop();
                    musicSuccessfullyStarted = true;
                    console.log("Music started in setup (audio context was already running & song ready).");
                    if (musicControlIcon && !isActuallyMuted) {
                        musicControlIcon.classList.remove('fa-volume-mute');
                        musicControlIcon.classList.add('fa-volume-up');
                    }
                } catch (e) {
                    console.error("Error attempting to loop song in setup (context running, song ready):", e);
                    p.noLoop();
                }
            } else {
                 console.log("AudioContext not running or song not ready in setup. Waiting for user interaction.");
            }
        };

        p.draw = () => {
            p.background(0); 
            fft.analyze();
            let wave = fft.waveform(); 
            currentAmp = fft.getEnergy(20, 200); 

            p.translate(p.width / 2, p.height / 2); 

            if (currentAmp > 210 && particles.length < 200) {
                 let pNum = p.random(0,3);
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
                    let r = p.map(wave[index], -1, 1, 150, 350); 
                    let x = r * p.sin(i) * t; 
                    let y = r * p.cos(i);
                    p.vertex(x, y);
                }
                p.endShape();
            }
        };

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
        
        p.startMusicAfterUserInteraction = () => {
            if (!songIsReady || !song) { // Nueva verificación
                console.warn("Attempted to start music, but song is not ready.");
                return;
            }
            if (!song.isPlaying() && !musicSuccessfullyStarted) {
                if (p.getAudioContext().state !== 'running') {
                    p.userStartAudio().then(() => {
                        console.log("Audio context started by user interaction.");
                        if (songIsReady && song) { // Re-verificar antes de loop
                            song.loop();
                            p.loop();
                            musicSuccessfullyStarted = true;
                            if (musicControlIcon && !isActuallyMuted) {
                                musicControlIcon.classList.remove('fa-volume-mute');
                                musicControlIcon.classList.add('fa-volume-up');
                            }
                        }
                    }).catch(e => console.error("Error al iniciar audio por usuario:", e));
                } else { 
                    if (songIsReady && song) { // Re-verificar
                        song.loop();
                        p.loop();
                        musicSuccessfullyStarted = true;
                        if (musicControlIcon && !isActuallyMuted) {
                            musicControlIcon.classList.remove('fa-volume-mute');
                            musicControlIcon.classList.add('fa-volume-up');
                        }
                    }
                }
            }
        };

        p.toggleMute = () => {
            if (!songIsReady || !song) { // Nueva verificación
                 console.warn("Attempted to toggle mute, but song is not ready.");
                return;
            }

            if (!musicSuccessfullyStarted && song.isLoaded()) {
                p.startMusicAfterUserInteraction(); // Intenta iniciar si no ha comenzado
            }
            
            if (isActuallyMuted) {
                song.setVolume(lastVolume);
                isActuallyMuted = false;
                if (musicControlIcon) {
                    musicControlIcon.classList.remove('fa-volume-mute');
                    musicControlIcon.classList.add('fa-volume-up');
                }
            } else {
                let currentVol = song.getVolume();
                if (currentVol > 0) lastVolume = currentVol; 
                else lastVolume = 0.7; 
                song.setVolume(0);
                isActuallyMuted = true;
                if (musicControlIcon) {
                    musicControlIcon.classList.remove('fa-volume-up');
                    musicControlIcon.classList.add('fa-volume-mute');
                }
            }
        };

        p.getSong = () => song; 
        p.hasMusicStarted = () => musicSuccessfullyStarted; 
        p.isSongReady = () => songIsReady; // Para la verificación externa
    };

    // --- Particle Class (Sin cambios) ---
    class Particle { /* ... (código de la clase Particle como en la respuesta anterior) ... */ 
        constructor(pInstance) {
            this.p = pInstance;
            this.pos = this.p.createVector(0,0); 
            this.vel = p5.Vector.random2D().mult(this.p.random(1, 3)); 
            this.acc = p5.Vector.random2D().mult(this.p.random(0.01, 0.05));
            this.w = this.p.random(2, 5);
            this.color = [this.p.random(200, 255), this.p.random(200, 255), this.p.random(200, 255), this.p.random(100, 200)];
            this.lifespan = 255;
        }
        update(bassKicked) {
            this.vel.add(this.acc); this.pos.add(this.vel);
            if (bassKicked) { let pushForce = this.pos.copy().normalize().mult(this.p.random(1,2)); this.vel.add(pushForce); }
            this.vel.limit(4); this.lifespan -= 2.5;
        }
        edges() { if ( this.pos.mag() > this.p.max(this.p.width, this.p.height) / 1.5 || this.lifespan < 0) { return true; } return false; }
        show() { this.p.noStroke(); this.p.fill(this.color[0], this.color[1], this.color[2], this.lifespan); this.p.ellipse(this.pos.x, this.pos.y, this.w); }
    }


    p5SketchInstance = new p5(sketch);

    function playClickSound() { if (clickSound) { clickSound.currentTime = 0; clickSound.play().catch(error => console.warn("Error playing click sound:", error)); } }

    if (musicControl) {
        musicControl.addEventListener('click', (e) => {
            e.stopPropagation(); playClickSound();
            if (p5SketchInstance) { p5SketchInstance.toggleMute(); }
        });
    }
    
    let globalUserInteractionDone = false;
    function handleGlobalUserInteraction() {
        if (!globalUserInteractionDone && p5SketchInstance && p5SketchInstance.getSong && p5SketchInstance.getSong().isLoaded()) {
            if (!p5SketchInstance.hasMusicStarted()) {
                 p5SketchInstance.startMusicAfterUserInteraction();
            }
            globalUserInteractionDone = true;
            document.body.removeEventListener('click', handleGlobalUserInteraction, true);
            document.body.removeEventListener('keydown', handleGlobalUserInteraction, true);
        }
    }
    document.body.addEventListener('click', handleGlobalUserInteraction, true);
    document.body.addEventListener('keydown', handleGlobalUserInteraction, true);

    const baseMinimizedInitialOffset = 15; // Renamed for clarity
    const minimizedWindowSpacing = 10; // Espacio entre ventanas minimizadas
    const minimizedWindowWidth = 220; // Ancho que definimos en CSS para .minimized

    function recalculateMinimizedOffsets(closedOrRestoredModal) {
        let currentOffset = 15; // Reiniciar al offset base
        const openMinimizedModals = [];

        // Filtrar todas las ventanas que AÚN ESTÁN minimizadas (excluyendo la que se cierra/restaura)
        modals.forEach(m => {
            const s = modalStates.get(m);
            if (m !== closedOrRestoredModal && s.isMinimized) {
                openMinimizedModals.push(m);
            }
        });

        // Ordenarlas por su offset actual para mantener un orden visual consistente
        openMinimizedModals.sort((a, b) => {
            const stateA = modalStates.get(a);
            const stateB = modalStates.get(b);
            return (stateA.minimizedOffset || 0) - (stateB.minimizedOffset || 0);
        });
        
        // Re-aplicar los offsets
        openMinimizedModals.forEach(m => {
            const s = modalStates.get(m);
            m.style.left = `${currentOffset}px`;
            s.minimizedOffset = currentOffset;
            currentOffset += minimizedWindowWidth + minimizedWindowSpacing;
        });

        minimizedWindowOffset = currentOffset; // Actualizar el offset global para la próxima ventana
    }
    
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
});