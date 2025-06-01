
const videoPlayerManager = {
    player: null,
    playlist: [],
    currentSongIndex: -1,
    isGloballyPlaying: false,
    isUserDraggingProgressBar: false,
    p5MediaElement: null, // Se inicializara una vez
    audioVisualizerInstance: null,

    uiPlayerAlbumArtImg: null,
    uiPlayerSongTitle: null,
    uiPlayerSongArtist: null,
    uiPlayerCurrentTime: null,
    uiPlayerTotalTime: null,
    uiPlayerProgressBar: null,
    uiPlayerPlayPauseIcon: null,
    uiMusicVolumeIcon: null,
    uiPlayerLoaderElement: null, // NUEVO: Referencia al spinner
    isInitialising: false,      // NUEVO: Flag para la carga inicial
    lastVolumeBeforeMute: 0.7,

    init: function (config) {
        this.player = document.getElementById('background-video-player');
        if (!this.player) {
            console.error("Video Player Manager: HTML video element not found!");
            return false;
        }

        this.playlist = config.playlist || [];
        this.audioVisualizerInstance = config.audioVisualizer;
        this.p5Instance = config.p5Instance;

        // Obtener elementos UI
        this.uiPlayerAlbumArtImg = document.getElementById('player-album-art-img');
        this.uiPlayerSongTitle = document.getElementById('player-song-title');
        this.uiPlayerSongArtist = document.getElementById('player-song-artist');
        this.uiPlayerCurrentTime = document.getElementById('player-current-time');
        this.uiPlayerTotalTime = document.getElementById('player-total-time');
        this.uiPlayerProgressBar = document.getElementById('player-progress-bar');
        this.uiMusicVolumeIcon = document.getElementById('music-volume-icon');
        this.uiPlayerLoaderElement = document.getElementById('player-loading-spinner'); // NUEVO
        const playPauseButton = document.getElementById('player-play-pause-btn');
        if (playPauseButton) this.uiPlayerPlayPauseIcon = playPauseButton.querySelector('i');

        this.isInitialising = true; // NUEVO: Marcar inicio de inicialización

        const initialVolumeSlider = document.getElementById('volume-slider');
        if (initialVolumeSlider) {
            this.player.volume = parseFloat(initialVolumeSlider.value);
            this.lastVolumeBeforeMute = this.player.volume > 0 ? this.player.volume : 0.7;
        } else {
            this.player.volume = 0.7;
            this.lastVolumeBeforeMute = 0.7;
        }

        this.player.loop = false;
        this.player.autoplay = false;

        if (this.p5Instance && this.player) {
            try {
                this.p5MediaElement = new this.p5Instance.constructor.MediaElement(this.player, this.p5Instance);
                console.log("Video Player Manager: p5.MediaElement creado UNA VEZ en init.");
            } catch (e) {
                console.error("Video Player Manager: Error creando p5.MediaElement en init.", e);
            }
        } else {
            console.warn("Video Player Manager: p5Instance o player no disponible en init para crear p5MediaElement.");
        }

        this.player.addEventListener('loadedmetadata', this.handleMetadata.bind(this));
        this.player.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
        this.player.addEventListener('ended', this.handleSongEnded.bind(this));
        this.player.addEventListener('play', () => this.updatePlayPauseButtonUI(true));
        this.player.addEventListener('pause', () => this.updatePlayPauseButtonUI(false));
        this.player.addEventListener('volumechange', this.handleVolumeChange.bind(this));
        this.player.addEventListener('error', (e) => {
            console.error("Video Element Error:", this.player.error);
            if (this.isInitialising) { // NUEVO
                this._hideInitialLoader();
                this.isInitialising = false;
            }
            this.updatePlayPauseButtonUI(false);
            if (this.audioVisualizerInstance) {
                this.audioVisualizerInstance.disconnectAudioSource();
            }
        });

        // Lógica inicial del loader
        if (this.playlist.length > 0 && this.playlist[0] && this.playlist[0].filePath) {
            this._showInitialLoader();
        } else {
            this._hideInitialLoader();
            this.isInitialising = false; // No hay nada que cargar inicialmente
        }

        if (this.playlist.length > 0) {
            this.loadSong(0, false);
        } else {
            this.updateTrackInfoUI(null); // Esto también maneja el loader si isInitialising es true
            if (this.uiPlayerProgressBar) this.uiPlayerProgressBar.disabled = true;
        }
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        console.log("Video Player Manager initialized.");
        return true;
    },

    _showInitialLoader: function() {
        if (this.uiPlayerLoaderElement) this.uiPlayerLoaderElement.style.display = 'flex';
        if (this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.style.visibility = 'hidden';
        if (this.uiPlayerSongTitle) this.uiPlayerSongTitle.style.visibility = 'hidden';
        if (this.uiPlayerSongArtist) this.uiPlayerSongArtist.style.visibility = 'hidden';
    },

    _hideInitialLoader: function() {
        if (this.uiPlayerLoaderElement) this.uiPlayerLoaderElement.style.display = 'none';
        if (this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.style.visibility = 'visible';
        if (this.uiPlayerSongTitle) this.uiPlayerSongTitle.style.visibility = 'visible';
        if (this.uiPlayerSongArtist) this.uiPlayerSongArtist.style.visibility = 'visible';
    },

    loadSong: function (index, playImmediately = this.isGloballyPlaying) {
        if (index < 0 || index >= this.playlist.length) {
            console.warn("Video Player Manager: Indice de cancion invalido: " + index);
            if (this.playlist.length > 0) index = 0; else return;
        }
        this.currentSongIndex = index;
        const song = this.playlist[this.currentSongIndex];
        console.log("Video Player Manager: Cargando cancion " + index + ": " + song.title);

        if (this.isInitialising) { // NUEVO: Manejo del loader durante la carga inicial
            if (song && song.filePath && song.filePath.trim() !== "") {
                this._showInitialLoader();
            } else {
                this._hideInitialLoader();
                this.isInitialising = false; // Canción inicial inválida, termina fase de loader
            }
        }

        if (this.player) this.player.style.display = 'none'; // Ocultar video mientras carga nueva fuente

        if (this.audioVisualizerInstance) {
            this.audioVisualizerInstance.disconnectAudioSource();
        }

        if (song.filePath && song.filePath.trim() !== "") {
            this.player.src = song.filePath;
            this.player.load();
             // No mostramos el player.style.display = 'block' aquí, se hará en handleMetadata
        } else {
            console.log("Video Player Manager: Cancion sin filePath. Limpiando player.");
            if (this.player) {
                this.player.removeAttribute('src');
                this.player.load(); // Para limpiar estado
                this.player.style.display = 'none';
            }
            // Si es la carga inicial y no hay filePath, nos aseguramos de que el loader se oculte
            if (this.isInitialising) {
                this._hideInitialLoader();
                this.isInitialising = false;
            }
        }

        this.updateTrackInfoUI(song); // Actualizar info (respetará visibilidad si isInitialising)

        if (this.uiPlayerProgressBar) {
            this.uiPlayerProgressBar.value = 0;
            this.uiPlayerProgressBar.disabled = !song.filePath;
        }
        if (this.uiPlayerTotalTime && !song.filePath) this.uiPlayerTotalTime.textContent = "0:00";
        if (this.uiPlayerCurrentTime && !song.filePath) this.uiPlayerCurrentTime.textContent = "0:00";

        this.isGloballyPlaying = playImmediately && !!song.filePath;
        this.updatePlayPauseButtonUI(this.isGloballyPlaying);
    },

    handleMetadata: function () {
        if (this.isInitialising) { // NUEVO: Ocultar loader cuando los metadatos están listos
            this._hideInitialLoader();
            this.isInitialising = false;
        }

        if (!this.player || !isFinite(this.player.duration) || !this.player.currentSrc) {
            console.warn("Video Player Manager: Metadatos cargados, pero sin duracion o src valido.");
            if (this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = "0:00";
            if (this.uiPlayerProgressBar) {
                this.uiPlayerProgressBar.max = 0;
                this.uiPlayerProgressBar.value = 0;
                this.uiPlayerProgressBar.disabled = true;
            }
            if (this.player) this.player.style.display = 'none';
            if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }
        console.log("Video Player Manager: Metadatos cargados para " + this.player.currentSrc + ". Duracion: " + this.formatTime(this.player.duration));
        if (this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = this.formatTime(this.player.duration);
        if (this.uiPlayerProgressBar) {
            this.uiPlayerProgressBar.max = this.player.duration;
            this.uiPlayerProgressBar.disabled = false;
        }
        
        // Solo mostrar el video si tiene una fuente válida y no estamos en un estado de error implícito
        if (this.player && this.player.currentSrc && this.player.readyState >= 2) { // HAVE_METADATA or higher
             this.player.style.display = 'block';
        } else {
             this.player.style.display = 'none';
        }


        if (this.audioVisualizerInstance && this.p5MediaElement) {
            let p5AudioCtx = this.p5Instance ? this.p5Instance.getAudioContext() : null;

            const attemptVisualizerConnection = () => {
                console.log("Video Player Manager: Intentando conectar visualizador de audio.");
                this.audioVisualizerInstance.connectAudioSource(this.p5MediaElement);
            };

            if (p5AudioCtx && p5AudioCtx.state === 'suspended') {
                p5AudioCtx.resume().then(() => {
                    console.log("Video Player Manager: AudioContext de p5 reanudado en handleMetadata.");
                    attemptVisualizerConnection();
                }).catch(err => {
                    console.error("Video Player Manager: Error reanudando AudioContext de p5 en handleMetadata.", err);
                    attemptVisualizerConnection(); // Intentar de todas formas
                });
            } else if (p5AudioCtx && p5AudioCtx.state === 'running') {
                attemptVisualizerConnection();
            } else {
                console.warn("Video Player Manager: No se pudo conectar visualizador, estado de AudioContext: " + (p5AudioCtx ? p5AudioCtx.state : "nulo"));
            }
        } else {
            console.warn("Video Player Manager: No se pudo conectar visualizador (instancia, p5MediaElement, o p5Instance faltante).")
        }

        if (this.isGloballyPlaying && (this.player.paused || this.player.ended)) {
            console.log("Video Player Manager: Reproduciendo despues de loadedmetadata porque isGloballyPlaying es true.");
            this.player.play().catch(e => {
                console.warn("Error en play() despues de loadedmetadata:", e);
                this.isGloballyPlaying = false;
                this.updatePlayPauseButtonUI(false);
                if (this.isInitialising) { // NUEVO: Manejar error durante play inicial
                    this._hideInitialLoader();
                    this.isInitialising = false;
                }
            });
        } else if (!this.isGloballyPlaying && !this.player.paused) {
            this.player.pause();
        }
    },

    handleTimeUpdate: function () {
        if (!this.player || !isFinite(this.player.duration) || !this.player.currentSrc) return;
        if (this.uiPlayerCurrentTime) this.uiPlayerCurrentTime.textContent = this.formatTime(this.player.currentTime);
        if (this.uiPlayerProgressBar && !this.isUserDraggingProgressBar) {
            this.uiPlayerProgressBar.value = this.player.currentTime;
        }
    },

    handleSongEnded: function () {
        const endedSongTitle = this.playlist[this.currentSongIndex] ? this.playlist[this.currentSongIndex].title : "Cancion desconocida";
        console.log("Video Player Manager: Cancion terminada - " + endedSongTitle);
        this.playNextSong(this.isGloballyPlaying);
    },

    togglePlayPause: function () {
        if (!this.player) return;

        const currentSong = this.playlist[this.currentSongIndex];
        if (!currentSong || !currentSong.filePath || !this.player.currentSrc) {
            console.warn("Video Player Manager: No hay cancion con video cargada para reproducir/pausar.");
            this.updatePlayPauseButtonUI(false);
            this.isGloballyPlaying = false;
            if (this.isInitialising) { // NUEVO
                this._hideInitialLoader();
                this.isInitialising = false;
            }
            return;
        }

        if (!this.p5MediaElement && this.player.currentSrc) {
            console.log("Video Player Manager (togglePlayPause): p5MediaElement no existe, intentando conectar.");
            this.connectToP5AudioSystem(); // Esta función no está definida en el código provisto, asumo que es interna o futura
        }

        let p5AudioCtx = null;
        if (this.audioVisualizerInstance && this.audioVisualizerInstance.p5Instance && typeof this.audioVisualizerInstance.p5Instance.getAudioContext === 'function') {
            p5AudioCtx = this.audioVisualizerInstance.p5Instance.getAudioContext();
        }

        const performToggle = () => {
            if (!this.player.currentSrc) {
                console.warn("Video Player Manager (togglePlayPause): No currentSrc after attempting connection. Aborting toggle.");
                this.updatePlayPauseButtonUI(false);
                this.isGloballyPlaying = false;
                if (this.isInitialising) { // NUEVO
                    this._hideInitialLoader();
                    this.isInitialising = false;
                }
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
                performToggle(); // Intentar de todas formas
            });
        } else {
            performToggle();
        }
    },

    _performTogglePlayPauseInternal: function () {
        if (!this.player.currentSrc) {
            console.warn("Video Player Manager (_performTogglePlayPauseInternal): No currentSrc. Abortando.");
            this.isGloballyPlaying = false;
            this.updatePlayPauseButtonUI(false);
            if (this.isInitialising) { // NUEVO
                this._hideInitialLoader();
                this.isInitialising = false;
            }
            return;
        }

        if (this.player.paused || this.player.ended) {
            console.log("Video Player Manager: Intentando reproducir video.");

            if ((!this.p5MediaElement || (this.p5MediaElement.elt !== this.player)) && this.audioVisualizerInstance && this.player.currentSrc) {
                console.log("Video Player Manager (_performTogglePlayPauseInternal): p5MediaElement no existe, es obsoleto o no asociado. (Re)asegurando conexion a P5 Audio System.");
                // this.connectToP5AudioSystem(); // Asumo que esta función se implementará o existe
            }

            this.player.play()
                .then(() => {
                    this.isGloballyPlaying = true;
                    console.log("Video Player Manager: Reproduccion iniciada.");
                    // Si la reproducción comienza con éxito durante la inicialización, ocultar el loader.
                    if (this.isInitialising) { // NUEVO
                        this._hideInitialLoader();
                        this.isInitialising = false;
                    }
                })
                .catch(e => {
                    console.error("Error al intentar reproducir video:", e);
                    this.isGloballyPlaying = false;
                    this.updatePlayPauseButtonUI(false);
                    if (this.isInitialising) { // NUEVO: Error al reproducir inicialmente
                        this._hideInitialLoader();
                        this.isInitialising = false;
                    }
                });
        } else {
            console.log("Video Player Manager: Pausando video.");
            this.player.pause();
            this.isGloballyPlaying = false;
        }
    },

    playNextSong: function (playImmediately = true) {
        console.log("Video Player Manager: playNextSong llamado.");
        if (this.playlist.length === 0) return;
        let nextIndex = (this.currentSongIndex + 1) % this.playlist.length;
        // No necesitamos manejar `isInitialising` aquí, ya que solo aplica a la primera carga.
        this.loadSong(nextIndex, playImmediately);
    },

    playPrevSong: function (playImmediately = true) {
        console.log("Video Player Manager: playPrevSong llamado.");
        if (this.playlist.length === 0) return;
        let prevIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(prevIndex, playImmediately);
    },

    seek: function (time) {
        if (!this.player || !isFinite(this.player.duration) || !isFinite(time) || !this.player.currentSrc) return;
        const newTime = Math.max(0, Math.min(time, this.player.duration));
        this.player.currentTime = newTime;
        console.log("Video Player Manager: Buscando a " + this.formatTime(this.player.currentTime));
    },

    setVolume: function (level) {
        if (!this.player) return;
        const newVolume = Math.max(0, Math.min(1, level));
        this.player.volume = newVolume;
        if (newVolume > 0 && this.player.muted) {
            this.player.muted = false;
        }
        if (!this.player.muted && newVolume > 0) {
            this.lastVolumeBeforeMute = newVolume;
        }
    },

    toggleMute: function () {
        if (!this.player) return;
        this.player.muted = !this.player.muted;
        console.log("Video Player Manager: Mute toogleado a " + this.player.muted);

        const volumeSlider = document.getElementById('volume-slider');
        if (this.player.muted) {
            if (this.player.volume > 0) {
                this.lastVolumeBeforeMute = this.player.volume;
            }
        } else {
            if (this.player.volume === 0 && this.lastVolumeBeforeMute > 0) {
                this.player.volume = this.lastVolumeBeforeMute;
            }
            // Actualizar el slider solo si no está silenciado y el volumen cambió
            if (volumeSlider && this.player.volume !== parseFloat(volumeSlider.value)) {
                 volumeSlider.value = this.player.volume;
            }
        }
         // El evento 'volumechange' se encargará de actualizar el ícono y el slider si es necesario
    },

    handleVolumeChange: function () {
        if (!this.player) return;
        console.log("Video Player Manager: Evento volumechange. Volumen: " + this.player.volume + ", Muted: " + this.player.muted);
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        const volumeSlider = document.getElementById('volume-slider');
        // Solo actualizar el valor del slider si no lo está arrastrando el usuario
        // y si el valor realmente cambió (y no está silenciado con volumen > 0)
        if (volumeSlider && parseFloat(volumeSlider.value) !== this.player.volume) {
            if (!this.player.muted || (this.player.muted && this.player.volume === 0)) {
                 volumeSlider.value = this.player.volume;
            }
        }
    },

    updateVolumeIconUI: function (volume, muted) {
        if (!this.uiMusicVolumeIcon) return;
        this.uiMusicVolumeIcon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-mute', 'fa-volume-off');
        if (muted || volume === 0) {
            this.uiMusicVolumeIcon.classList.add('fa-volume-off');
        } else if (volume < 0.01) { // Prácticamente mute pero no estrictamente 0
            this.uiMusicVolumeIcon.classList.add('fa-volume-mute');
        } else if (volume < 0.5) {
            this.uiMusicVolumeIcon.classList.add('fa-volume-down');
        } else {
            this.uiMusicVolumeIcon.classList.add('fa-volume-up');
        }
    },

    updateTrackInfoUI: function (song) {
        // La visibilidad de los elementos de la canción (título, artista, art)
        // se maneja por _showInitialLoader y _hideInitialLoader durante la inicialización.
        // Esta función solo actualiza el contenido.

        if (song && song.filePath) {
            if (this.uiPlayerSongTitle) this.uiPlayerSongTitle.textContent = song.title;
            if (this.uiPlayerSongArtist) this.uiPlayerSongArtist.textContent = song.artist;
            if (this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.src = song.albumArtPath || 'assets/SONGS_COVERS/default_art.png';
        } else {
            if (this.uiPlayerSongTitle) this.uiPlayerSongTitle.textContent = "No Song Loaded";
            if (this.uiPlayerSongArtist) this.uiPlayerSongArtist.textContent = "---";
            if (this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.src = 'assets/SONGS_COVERS/default_art.png';
            if (this.uiPlayerCurrentTime) this.uiPlayerCurrentTime.textContent = "0:00";
            if (this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = "0:00";
            if (this.uiPlayerProgressBar) {
                this.uiPlayerProgressBar.value = 0;
                this.uiPlayerProgressBar.max = 0;
                this.uiPlayerProgressBar.disabled = true;
            }
            // Si esto se llama durante la inicialización y no hay canción válida, ocultar el loader.
            if (this.isInitialising) { // NUEVO
                this._hideInitialLoader();
                this.isInitialising = false;
            }
        }
    },

    updatePlayPauseButtonUI: function (isPlaying) {
        if (this.uiPlayerPlayPauseIcon) {
            this.uiPlayerPlayPauseIcon.classList.toggle('fa-pause', isPlaying);
            this.uiPlayerPlayPauseIcon.classList.toggle('fa-play', !isPlaying);
        }
    },

    formatTime: function (seconds) {
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return "" + minutes + ":" + (secs < 10 ? '0' : '') + secs;
    },

    getVideoElement: function () {
        return this.player;
    }
    // Asumo que connectToP5AudioSystem() es una función que podrías tener o desarrollar:
    // connectToP5AudioSystem: function() {
    //     if (this.p5Instance && this.player && !this.p5MediaElement) {
    //         try {
    //             this.p5MediaElement = new this.p5Instance.constructor.MediaElement(this.player, this.p5Instance);
    //             console.log("Video Player Manager: p5.MediaElement (re)creado.");
    //             if (this.audioVisualizerInstance && this.player.currentSrc) {
    //                 this.audioVisualizerInstance.connectAudioSource(this.p5MediaElement);
    //             }
    //         } catch (e) {
    //             console.error("Video Player Manager: Error (re)creando p5.MediaElement.", e);
    //         }
    //     } else if (this.p5MediaElement && this.p5MediaElement.elt !== this.player && this.player.currentSrc) {
    //          // Si p5MediaElement existe pero está asociado a un elemento <video> obsoleto
    //          console.warn("Video Player Manager: p5MediaElement obsoleto, intentando reconectar.");
    //          if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource(); // Desconectar el viejo
    //          this.p5MediaElement = new this.p5Instance.constructor.MediaElement(this.player, this.p5Instance); // Conectar el nuevo
    //          if (this.audioVisualizerInstance) this.audioVisualizerInstance.connectAudioSource(this.p5MediaElement);
    //     }
    // }
};
