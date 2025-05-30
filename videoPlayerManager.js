// videoPlayerManager.js

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
    lastVolumeBeforeMute: 0.7,

    init: function(config) {
        this.player = document.getElementById('background-video-player');
        if (!this.player) {
            console.error("Video Player Manager: HTML video element not found!");
            return false;
        }

        this.playlist = config.playlist || [];
        this.audioVisualizerInstance = config.audioVisualizer;
        this.p5Instance = config.p5Instance; // <--- GUARDAR LA INSTANCIA DE p5

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

        this.player.loop = false;
        this.player.autoplay = false;

        // ---- CREAR p5.MediaElement UNA SOLA VEZ ----
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
            this.updatePlayPauseButtonUI(false);
            if (this.audioVisualizerInstance) {
                this.audioVisualizerInstance.disconnectAudioSource();
            }
        });

        if (this.playlist.length > 0) {
            this.loadSong(0, false);
        } else {
            this.updateTrackInfoUI(null);
            if (this.uiPlayerProgressBar) this.uiPlayerProgressBar.disabled = true;
        }
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        console.log("Video Player Manager initialized.");
        return true;
    },

    loadSong: function(index, playImmediately = this.isGloballyPlaying) {
        if (index < 0 || index >= this.playlist.length) {
            console.warn("Video Player Manager: Indice de cancion invalido: " + index);
            if (this.playlist.length > 0) index = 0; else return;
        }
        this.currentSongIndex = index;
        const song = this.playlist[this.currentSongIndex];
        console.log("Video Player Manager: Cargando cancion " + index + ": " + song.title);

        if (this.player) this.player.style.display = 'none';

        if (this.audioVisualizerInstance) {
            this.audioVisualizerInstance.disconnectAudioSource();
        }

        if (song.filePath && song.filePath.trim() !== "") {
            this.player.src = song.filePath;
            this.player.load();
        } else {
            console.log("Video Player Manager: Cancion sin filePath. Limpiando player.");
            if (this.player) {
                this.player.removeAttribute('src');
                this.player.load();
                this.player.style.display = 'none';
            }
        }

        this.updateTrackInfoUI(song);
        if (this.uiPlayerProgressBar) {
            this.uiPlayerProgressBar.value = 0;
            this.uiPlayerProgressBar.disabled = !song.filePath;
        }
        if (this.uiPlayerTotalTime && !song.filePath) this.uiPlayerTotalTime.textContent = "0:00";
        if (this.uiPlayerCurrentTime && !song.filePath) this.uiPlayerCurrentTime.textContent = "0:00";

        this.isGloballyPlaying = playImmediately && !!song.filePath;
        this.updatePlayPauseButtonUI(this.isGloballyPlaying);
    },

    handleMetadata: function() {
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
        if (this.player) this.player.style.display = 'block';

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
                    attemptVisualizerConnection();
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
            });
        } else if (!this.isGloballyPlaying && !this.player.paused) {
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
        const endedSongTitle = this.playlist[this.currentSongIndex] ? this.playlist[this.currentSongIndex].title : "Cancion desconocida";
        console.log("Video Player Manager: Cancion terminada - " + endedSongTitle);
        this.playNextSong(this.isGloballyPlaying);
    },

    togglePlayPause: function() {
        if (!this.player) return;

        const currentSong = this.playlist[this.currentSongIndex];
        if (!currentSong || !currentSong.filePath || !this.player.currentSrc) {
            console.warn("Video Player Manager: No hay cancion con video cargada para reproducir/pausar.");
            this.updatePlayPauseButtonUI(false);
            this.isGloballyPlaying = false;
            return;
        }

        if (!this.p5MediaElement && this.player.currentSrc) {
            console.log("Video Player Manager (togglePlayPause): p5MediaElement no existe, intentando conectar.");
            this.connectToP5AudioSystem();
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
                performToggle();
            });
        } else {
            performToggle();
        }
    },

    _performTogglePlayPauseInternal: function() {
        if (!this.player.currentSrc) {
            console.warn("Video Player Manager (_performTogglePlayPauseInternal): No currentSrc. Abortando.");
            this.isGloballyPlaying = false;
            this.updatePlayPauseButtonUI(false);
            return;
        }

        if (this.player.paused || this.player.ended) {
            console.log("Video Player Manager: Intentando reproducir video.");

            if ((!this.p5MediaElement || (this.p5MediaElement.elt !== this.player)) && this.audioVisualizerInstance && this.player.currentSrc) {
                console.log("Video Player Manager (_performTogglePlayPauseInternal): p5MediaElement no existe, es obsoleto o no asociado. (Re)asegurando conexion a P5 Audio System.");
                this.connectToP5AudioSystem();
            }

            this.player.play()
                .then(() => {
                    this.isGloballyPlaying = true;
                    console.log("Video Player Manager: Reproduccion iniciada.");
                })
                .catch(e => {
                    console.error("Error al intentar reproducir video:", e);
                    this.isGloballyPlaying = false;
                    this.updatePlayPauseButtonUI(false);
                });
        } else {
            console.log("Video Player Manager: Pausando video.");
            this.player.pause();
            this.isGloballyPlaying = false;
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
        console.log("Video Player Manager: Buscando a " + this.formatTime(this.player.currentTime));
    },

    setVolume: function(level) {
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

    toggleMute: function() {
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
            if (volumeSlider) volumeSlider.value = this.player.volume;
        }
    },

    handleVolumeChange: function() {
        if (!this.player) return;
        console.log("Video Player Manager: Evento volumechange. Volumen: " + this.player.volume + ", Muted: " + this.player.muted);
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider && parseFloat(volumeSlider.value) !== this.player.volume && !this.player.muted) {
            volumeSlider.value = this.player.volume;
        }
    },

    updateVolumeIconUI: function(volume, muted) {
        if (!this.uiMusicVolumeIcon) return;
        this.uiMusicVolumeIcon.classList.remove('fa-volume-up','fa-volume-down','fa-volume-mute','fa-volume-off');
        if (muted || volume === 0) {
            this.uiMusicVolumeIcon.classList.add('fa-volume-off');
        } else if (volume < 0.01) {
            this.uiMusicVolumeIcon.classList.add('fa-volume-mute');
        } else if (volume < 0.5) {
            this.uiMusicVolumeIcon.classList.add('fa-volume-down');
        } else {
            this.uiMusicVolumeIcon.classList.add('fa-volume-up');
        }
    },

    updateTrackInfoUI: function(song) {
        if (song && song.filePath) {
            if(this.uiPlayerSongTitle) this.uiPlayerSongTitle.textContent = song.title;
            if(this.uiPlayerSongArtist) this.uiPlayerSongArtist.textContent = song.artist;
            if(this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.src = song.albumArtPath || 'assets/SONGS_COVERS/default_art.png';
        } else {
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
        return "" + minutes + ":" + (secs < 10 ? '0' : '') + secs;
    },

    getVideoElement: function() {
        return this.player;
    }
};