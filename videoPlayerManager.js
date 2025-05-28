// videoPlayerManager.js

const videoPlayerManager = {
    player: null,
    playlist: [],
    currentSongIndex: -1,
    isGloballyPlaying: false,
    isUserDraggingProgressBar: false,
    p5MediaElement: null,
    audioVisualizerInstance: null,

    uiPlayerAlbumArtImg: null,
    uiPlayerSongTitle: null,
    uiPlayerSongArtist: null,
    uiPlayerCurrentTime: null,
    uiPlayerTotalTime: null,
    uiPlayerProgressBar: null,
    uiPlayerPlayPauseIcon: null,
    uiMusicVolumeIcon: null,
    lastVolumeBeforeMute: 0.7,

    init: function(config) {
        this.player = document.getElementById('background-video-player');
        if (!this.player) {
            console.error("Video Player Manager: HTML video element not found!");
            return false;
        }

        this.playlist = config.playlist || [];
        this.audioVisualizerInstance = config.audioVisualizer; // Guardar referencia al objeto visualizador

        this.uiPlayerAlbumArtImg = document.getElementById('player-album-art-img');
        this.uiPlayerSongTitle = document.getElementById('player-song-title');
        this.uiPlayerSongArtist = document.getElementById('player-song-artist');
        this.uiPlayerCurrentTime = document.getElementById('player-current-time');
        this.uiPlayerTotalTime = document.getElementById('player-total-time');
        this.uiPlayerProgressBar = document.getElementById('player-progress-bar');
        this.uiMusicVolumeIcon = document.getElementById('music-volume-icon');
        const playPauseButton = document.getElementById('player-play-pause-btn');
        if(playPauseButton) this.uiPlayerPlayPauseIcon = playPauseButton.querySelector('i');
        
        const initialVolumeSlider = document.getElementById('volume-slider');
        if (initialVolumeSlider) {
            this.player.volume = parseFloat(initialVolumeSlider.value);
            this.lastVolumeBeforeMute = this.player.volume > 0 ? this.player.volume : 0.7;
        } else {
            this.player.volume = 0.7;
            this.lastVolumeBeforeMute = 0.7;
        }
        
        this.player.loop = false; // La lógica de playlist maneja la repetición o el siguiente
        this.player.autoplay = false; // Controlamos la reproducción explícitamente

        this.player.addEventListener('loadedmetadata', this.handleMetadata.bind(this));
        this.player.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
        this.player.addEventListener('ended', this.handleSongEnded.bind(this));
        this.player.addEventListener('play', () => this.updatePlayPauseButtonUI(true));
        this.player.addEventListener('pause', () => this.updatePlayPauseButtonUI(false));
        this.player.addEventListener('volumechange', this.handleVolumeChange.bind(this));
        this.player.addEventListener('error', (e) => {
            const songTitle = this.playlist[this.currentSongIndex]?.title || "canción actual";
            console.error(`Video Element Error for ${songTitle}:`, this.player.error);
            this.updatePlayPauseButtonUI(false);
            if (this.audioVisualizerInstance) {
                this.audioVisualizerInstance.disconnectAudioSource();
            }
        });

        if (this.playlist.length > 0) {
            this.loadSong(0, false); // Cargar la primera canción, no reproducir inmediatamente
        } else {
            this.updateTrackInfoUI(null);
            if(this.uiPlayerProgressBar) this.uiPlayerProgressBar.disabled = true;
        }
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        console.log("Video Player Manager initialized.");
        return true;
    },

    connectToP5AudioSystem: function() {
        if (!this.audioVisualizerInstance || !this.audioVisualizerInstance.p5Instance) {
            console.warn("Video Player Manager: Instancia de p5 del visualizador no disponible para conectar.");
            if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }
        if (!this.player.currentSrc) { // No intentar conectar si no hay video cargado
             console.warn("Video Player Manager: No hay video cargado (currentSrc), no se puede conectar a p5.");
             if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
             return;
        }

        const p5_instance = this.audioVisualizerInstance.p5Instance;
        let p5AudioCtx = null;

        if (typeof p5_instance.getAudioContext === 'function') {
             p5AudioCtx = p5_instance.getAudioContext();
        } else {
            console.error("Video Player Manager: p5_instance.getAudioContext no es una función.");
            if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }
        
        const attemptConnection = () => {
            try {
                console.log("Video Player Manager: Intentando _createAndConnectMediaElement.");
                this._createAndConnectMediaElement(p5_instance);
            } catch (error) {
                console.error("Video Player Manager: Error en _createAndConnectMediaElement:", error);
                if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            }
        };

        if (p5AudioCtx && p5AudioCtx.state === 'suspended') {
            console.warn("Video Player Manager: AudioContext de p5 suspendido. Intentando reanudar...");
            p5AudioCtx.resume().then(() => {
                console.log("Video Player Manager: AudioContext de p5 reanudado.");
                attemptConnection();
            }).catch(err => {
                console.error("Video Player Manager: Error reanudando AudioContext de p5.", err);
                if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            });
        } else if (p5AudioCtx && p5AudioCtx.state === 'running') {
            console.log("Video Player Manager: AudioContext de p5 ya está 'running'.");
            attemptConnection();
        } else {
             console.error("Video Player Manager: No se pudo obtener un AudioContext válido de p5 o está cerrado. Estado:", p5AudioCtx ? p5AudioCtx.state : "Contexto nulo");
             if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
        }
    },

    _createAndConnectMediaElement: function(p5_instance) {
        if (!this.player.currentSrc) {
            console.warn("VideoPlayerManager: _createAndConnectMediaElement llamado sin currentSrc en el player.");
            return;
        }

        try {
            // Si ya existe un p5MediaElement Y está asociado con el MISMO this.player HTML element
            // Y ese p5MediaElement es una instancia de p5.MediaElement (lo que implica que ya pasó por esta lógica antes)
            // Intenta desconectarlo antes de crear uno nuevo para el mismo this.player.
            // Esto es para intentar prevenir el "HTMLMediaElement already connected previously".
            if (this.p5MediaElement && this.p5MediaElement.elt === this.player && typeof this.p5MediaElement.disconnect === 'function') {
                console.log("Video Player Manager: Desconectando p5MediaElement existente del mismo HTMLVideoElement antes de recrear.");
                this.p5MediaElement.disconnect(); // Desconecta del pipeline de p5.sound
                // Aunque disconnectAudioSource en el visualizador también lo llama,
                // hacerlo aquí justo antes de la recreación es más directo para este problema.
            }
            // Y ahora, nos aseguramos de anular la referencia *antes* de intentar crear una nueva
            // para que no se confunda con el anterior si la desconexión no fue "total" para el GC.
            this.p5MediaElement = null;

            console.log("Video Player Manager: Creando nueva instancia de p5.MediaElement.");
            if (typeof p5 !== 'undefined' && typeof p5.MediaElement === 'function') {
                this.p5MediaElement = new p5.MediaElement(this.player, p5_instance);
            } else if (p5_instance && p5_instance.constructor && typeof p5_instance.constructor.MediaElement === 'function') {
                this.p5MediaElement = new p5_instance.constructor.MediaElement(this.player, p5_instance);
            } else {
                console.error("Video Player Manager: p5.MediaElement constructor not found.");
                throw new Error("p5.MediaElement constructor not found.");
            }
            console.log("Video Player Manager: p5.MediaElement creado.");

        } catch (e) {
            console.error("Error al crear/reconectar p5.MediaElement:", e); // Mensaje de error más específico
            // El error "InvalidStateError" probablemente ocurrirá aquí.
            if (this.audioVisualizerInstance) {
                // Si la creación falla, nos aseguramos que el visualizador sepa que no hay fuente
                this.audioVisualizerInstance.disconnectAudioSource();
            }
            this.p5MediaElement = null; // Asegurarse de que esté nulo si falló
            return;
        }

        if (this.audioVisualizerInstance && this.p5MediaElement) {
            this.audioVisualizerInstance.connectAudioSource(this.p5MediaElement);
        } else {
            console.warn("Video Player Manager: No se pudo conectar al visualizador (instancia o mediaElement faltante después del intento de creación).");
            if (this.audioVisualizerInstance && !this.p5MediaElement) {
                 this.audioVisualizerInstance.disconnectAudioSource();
            }
        }
    },

    loadSong: function(index, playImmediately = this.isGloballyPlaying) {
        if (index < 0 || index >= this.playlist.length) {
            console.warn("Video Player Manager: Índice de canción inválido", index);
            if (this.playlist.length > 0) index = 0; 
            else return; 
        }
        this.currentSongIndex = index;
        const song = this.playlist[this.currentSongIndex];
        console.log(`Video Player Manager: Cargando canción ${index}: ${song.title}`);

        if (this.player) this.player.style.display = 'none'; 
        if (this.audioVisualizerInstance) { 
            this.audioVisualizerInstance.disconnectAudioSource();
        }
        this.p5MediaElement = null; // Resetear p5MediaElement al cargar nueva canción

        if (song.filePath && song.filePath.trim() !== "") {
            this.player.src = song.filePath;
            this.player.load(); // Make sure browser loads the new source
        } else {
            console.log(`Video Player Manager: Canción ${song.title} no tiene video. Limpiando player.`);
            if(this.player) {
                this.player.removeAttribute('src'); // Clear the src attribute
                this.player.load(); // Important to call load() after changing src or removing it
                this.player.style.display = 'none';
            }
        }
        this.updateTrackInfoUI(song);
        if(this.uiPlayerProgressBar) {
            this.uiPlayerProgressBar.value = 0;
            this.uiPlayerProgressBar.max = 100; // Default max until metadata loads
            this.uiPlayerProgressBar.disabled = !song.filePath; 
        }
        if(this.uiPlayerTotalTime && !song.filePath) this.uiPlayerTotalTime.textContent = "0:00";
        if(this.uiPlayerCurrentTime && !song.filePath) this.uiPlayerCurrentTime.textContent = "0:00";


        // The decision to play or not is handled by isGloballyPlaying.
        // If playImmediately is true, we want it to play once metadata is loaded.
        this.isGloballyPlaying = playImmediately && !!song.filePath;
        this.updatePlayPauseButtonUI(this.isGloballyPlaying); // Update button based on intent
    },

    handleMetadata: function() {
        if (!this.player || !isFinite(this.player.duration) || !this.player.currentSrc) {
            console.warn("Video Player Manager: Metadatos cargados, pero sin duración o src válido.");
            if (this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = "0:00";
            if (this.uiPlayerProgressBar) {this.uiPlayerProgressBar.max = 0; this.uiPlayerProgressBar.value = 0; this.uiPlayerProgressBar.disabled = true;}
            if (this.player) this.player.style.display = 'none';
            // Ensure visualizer is disconnected if metadata is bad
            if(this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }
        console.log(`Video Player Manager: Metadatos cargados para ${this.player.currentSrc}. Duración: ${this.formatTime(this.player.duration)}`);
        if(this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = this.formatTime(this.player.duration);
        if(this.uiPlayerProgressBar) {
            this.uiPlayerProgressBar.max = this.player.duration;
            this.uiPlayerProgressBar.disabled = false;
        }
        if (this.player) this.player.style.display = 'block'; // Or as per your design
        
        this.connectToP5AudioSystem(); // Connect to visualizer now that we have metadata and src

        if (this.isGloballyPlaying && (this.player.paused || this.player.ended)) { 
            console.log("Video Player Manager: Reproduciendo después de loadedmetadata porque isGloballyPlaying es true.");
            this.player.play().catch(e => {
                console.warn("Error en play() después de loadedmetadata:", e);
                this.isGloballyPlaying = false; // Update state if play fails
                this.updatePlayPauseButtonUI(false);
            });
        } else if (!this.isGloballyPlaying && !this.player.paused) {
            // If it's not supposed to be playing, but it is (e.g. autoplay), pause it.
            // This case might be rare due to explicit autoplay=false.
            this.player.pause();
        }
    },

    handleTimeUpdate: function() {
        if (!this.player || !isFinite(this.player.duration) || !this.player.currentSrc) return;
        if (this.uiPlayerCurrentTime) this.uiPlayerCurrentTime.textContent = this.formatTime(this.player.currentTime);
        if (this.uiPlayerProgressBar && !this.isUserDraggingProgressBar) {
            this.uiPlayerProgressBar.value = this.player.currentTime;
        }
    },

    handleSongEnded: function() {
        const endedSongTitle = this.playlist[this.currentSongIndex]?.title || "Canción desconocida";
        console.log(`Video Player Manager: Canción terminada - ${endedSongTitle}`);
        // Decide if the next song should play based on whether the player was globally playing.
        this.playNextSong(this.isGloballyPlaying); 
    },

    togglePlayPause: function() {
        if (!this.player) return;
        
        const currentSong = this.playlist[this.currentSongIndex];
        if (!currentSong || !currentSong.filePath || !this.player.currentSrc) { // Check currentSrc too
            console.warn("Video Player Manager: No hay canción con video cargada para reproducir/pausar.");
            this.updatePlayPauseButtonUI(false); // Ensure button is in 'play' state
            this.isGloballyPlaying = false; // Update global playing state
            return;
        }
        
        // Ensure p5 sound system is connected if not already
        if (!this.p5MediaElement && this.player.currentSrc) {
            console.log("Video Player Manager (togglePlayPause): p5MediaElement no existe, intentando conectar.");
            this.connectToP5AudioSystem(); // This might be async due to AudioContext resume
        }

        // Handle AudioContext resume if suspended
        let p5AudioCtx = null;
        if (this.audioVisualizerInstance && this.audioVisualizerInstance.p5Instance && typeof this.audioVisualizerInstance.p5Instance.getAudioContext === 'function') {
            p5AudioCtx = this.audioVisualizerInstance.p5Instance.getAudioContext();
        }

        const performToggle = () => {
            if (!this.player.currentSrc) { // Re-check, as connectToP5AudioSystem might clear src on error
                 console.warn("Video Player Manager (togglePlayPause): No currentSrc after attempting connection. Aborting toggle.");
                 this.updatePlayPauseButtonUI(false);
                 this.isGloballyPlaying = false;
                 return;
            }
            this._performTogglePlayPauseInternal();
        };

        if (p5AudioCtx && p5AudioCtx.state === 'suspended') {
            p5AudioCtx.resume().then(() => {
                console.log("AudioContext reanudado por togglePlayPause.");
                performToggle();
            }).catch(e => {
                console.error("Error reanudando AudioContext en togglePlayPause", e);
                performToggle(); // Attempt to play/pause even if resume fails
            });
        } else {
            performToggle();
        }
    },

    _performTogglePlayPauseInternal: function() {
        if (!this.player.currentSrc) { // Añadir esta guarda por si acaso
            console.warn("Video Player Manager (_performTogglePlayPauseInternal): No currentSrc. Abortando.");
            this.isGloballyPlaying = false;
            this.updatePlayPauseButtonUI(false);
            return;
        }

        if (this.player.paused || this.player.ended) {
            console.log("Video Player Manager: Intentando reproducir video.");

            // Punto CRÍTICO para el primer play:
            // Si p5MediaElement no existe o no está asociado con el player actual
            // (podría ser de una canción anterior o no haberse creado bien por AudioContext suspendido),
            // intentar conectar/reconectar AHORA que el AudioContext debería estar activo
            // gracias a la interacción del usuario en togglePlayPause.
            if ((!this.p5MediaElement || this.p5MediaElement.elt !== this.player) && this.audioVisualizerInstance) {
                console.log("Video Player Manager (_performTogglePlayPauseInternal): p5MediaElement no existe o es obsoleto. (Re)conectando a P5 Audio System.");
                this.connectToP5AudioSystem(); // Esto intentará crear/conectar p5MediaElement
                                              // y luego llamará a audioVisualizer.connectAudioSource()
            }

            this.player.play()
                .then(() => {
                    this.isGloballyPlaying = true;
                    console.log("Video Player Manager: Reproducción iniciada.");
                    // La UI del botón se actualiza por el evento 'play' del video element.
                    // Si la conexión a P5 falló arriba, el visualizador no funcionará, pero el audio HTML5 sí.
                })
                .catch(e => {
                    console.error("Error al intentar reproducir video:", e);
                    this.isGloballyPlaying = false;
                    this.updatePlayPauseButtonUI(false); // Asegurar que el botón refleje el fallo
                });
        } else {
            console.log("Video Player Manager: Pausando video.");
            this.player.pause();
            this.isGloballyPlaying = false;
            // La UI del botón se actualiza por el evento 'pause' del video element.
        }
    },
    
    playNextSong: function(playImmediately = true) {
        console.log("Video Player Manager: playNextSong llamado.");
        if (this.playlist.length === 0) return;
        let nextIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.loadSong(nextIndex, playImmediately);
    },

    playPrevSong: function(playImmediately = true) {
        console.log("Video Player Manager: playPrevSong llamado.");
        if (this.playlist.length === 0) return;
        let prevIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(prevIndex, playImmediately);
    },

    seek: function(time) {
        if (!this.player || !isFinite(this.player.duration) || !isFinite(time) || !this.player.currentSrc) return;
        const newTime = Math.max(0, Math.min(time, this.player.duration));
        this.player.currentTime = newTime;
        console.log(`Video Player Manager: Buscando a ${this.formatTime(this.player.currentTime)}`);
    },

    setVolume: function(level) {
        if (!this.player) return;
        const newVolume = Math.max(0, Math.min(1, level));
        this.player.volume = newVolume;
        if (newVolume > 0 && this.player.muted) {
             this.player.muted = false; // Unmute if volume is set to a positive value
        }
        // Update lastVolumeBeforeMute only if not muted and volume is positive
        if (!this.player.muted && newVolume > 0) {
            this.lastVolumeBeforeMute = newVolume;
        } else if (newVolume === 0 && !this.player.muted) {
            // If setting volume to 0 explicitly (not muting), treat it as such
            // lastVolumeBeforeMute remains the previous non-zero volume
        }
        // The 'volumechange' event will trigger UI update
    },
    
    toggleMute: function() {
        if (!this.player) return;
        this.player.muted = !this.player.muted;
        console.log(`Video Player Manager: Mute toogleado a ${this.player.muted}`);
        
        const volumeSlider = document.getElementById('volume-slider');
        if (this.player.muted) {
            // If muted, store current volume if it's > 0
            if (this.player.volume > 0) {
                this.lastVolumeBeforeMute = this.player.volume;
            }
            // Optionally set slider to 0 or disable it, or reflect player.volume which might be 0
            // if (volumeSlider) volumeSlider.value = 0; 
        } else {
            // Unmuting: restore last known volume if current volume is 0
            if (this.player.volume === 0 && this.lastVolumeBeforeMute > 0) {
                this.player.volume = this.lastVolumeBeforeMute;
            }
            // Update slider to current player volume
            if (volumeSlider) volumeSlider.value = this.player.volume;
        }
        // The 'volumechange' event handles icon UI updates.
    },
    
    handleVolumeChange: function() { 
        if (!this.player) return;
        console.log(`Video Player Manager: Evento volumechange. Volumen: ${this.player.volume}, Muted: ${this.player.muted}`);
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        // Update slider if change was not from slider itself
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider && parseFloat(volumeSlider.value) !== this.player.volume && !this.player.muted) {
            volumeSlider.value = this.player.volume;
        }
        // If muted and volume is 0, keep slider reflecting that, or lastVolumeBeforeMute if unmuted
        if (this.player.muted && volumeSlider) {
           // Slider could reflect 0 or be disabled. Current behavior is it reflects actual volume.
           // If you want slider to show pre-mute value, that's different logic.
        }
    },

    updateVolumeIconUI: function(volume, muted) {
        if (!this.uiMusicVolumeIcon) return;
        this.uiMusicVolumeIcon.classList.remove('fa-volume-up','fa-volume-down','fa-volume-mute','fa-volume-off');
        if (muted || volume === 0) {
            this.uiMusicVolumeIcon.classList.add('fa-volume-off');      
        } else if (volume < 0.01) { // Extremely low volume, practically mute
            this.uiMusicVolumeIcon.classList.add('fa-volume-mute'); 
        } else if (volume < 0.5) {
            this.uiMusicVolumeIcon.classList.add('fa-volume-down');  
        } else {
            this.uiMusicVolumeIcon.classList.add('fa-volume-up');      
        }
    },

    updateTrackInfoUI: function(song) {
        if (song && song.filePath) { // Ensure there's a file path to consider it a valid song for UI
            if(this.uiPlayerSongTitle) this.uiPlayerSongTitle.textContent = song.title;
            if(this.uiPlayerSongArtist) this.uiPlayerSongArtist.textContent = song.artist;
            if(this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.src = song.albumArtPath || 'assets/SONGS_COVERS/default_art.png';
        } else { // Handles null song or song without filePath
            if(this.uiPlayerSongTitle) this.uiPlayerSongTitle.textContent = "No Song Loaded";
            if(this.uiPlayerSongArtist) this.uiPlayerSongArtist.textContent = "---";
            if(this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.src = 'assets/SONGS_COVERS/default_art.png';
            if(this.uiPlayerCurrentTime) this.uiPlayerCurrentTime.textContent = "0:00";
            if(this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = "0:00";
            if(this.uiPlayerProgressBar) {
                 this.uiPlayerProgressBar.value = 0;
                 this.uiPlayerProgressBar.max = 0; 
                 this.uiPlayerProgressBar.disabled = true;
            }
        }
    },
    
    updatePlayPauseButtonUI: function(isPlaying) {
        if (this.uiPlayerPlayPauseIcon) {
            this.uiPlayerPlayPauseIcon.classList.toggle('fa-pause', isPlaying);
            this.uiPlayerPlayPauseIcon.classList.toggle('fa-play', !isPlaying);
        }
    },

    formatTime: function(seconds) {
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },

    getVideoElement: function() {
        return this.player;
    }
};