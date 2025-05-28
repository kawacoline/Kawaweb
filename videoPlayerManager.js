// videoPlayerManager.js

const videoPlayerManager = {
    player: null,
    playlist: [],
    currentSongIndex: -1,
    isGloballyPlaying: false,
    isUserDraggingProgressBar: false,
    p5MediaElement: null,
    audioVisualizerInstance: null, // Referencia al objeto audioVisualizer

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
            this.loadSong(0, false);
        } else {
            this.updateTrackInfoUI(null);
            if(this.uiPlayerProgressBar) this.uiPlayerProgressBar.disabled = true;
        }
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        console.log("Video Player Manager initialized.");
        return true;
    },

    connectToP5AudioSystem: function() {
        if (!this.audioVisualizerInstance || !this.audioVisualizerInstance.p5Instance || !this.player.currentSrc) {
            console.warn("Video Player Manager: p5 instance o video src no disponibles para conectar visualizador.");
            if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }

        const p5_instance = this.audioVisualizerInstance.p5Instance;
        let p5AudioCtx = null;

        if (typeof p5_instance.getAudioContext === 'function') {
             p5AudioCtx = p5_instance.getAudioContext();
        } else {
            console.error("Video Player Manager: p5_instance.getAudioContext no es una función. p5.sound puede no estar listo o accesible.");
            if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }
        
        try {
            if (p5AudioCtx && p5AudioCtx.state === 'suspended') {
                console.warn("Video Player Manager: AudioContext de p5 suspendido. Intentando reanudar...");
                p5AudioCtx.resume().then(() => {
                    console.log("Video Player Manager: AudioContext de p5 reanudado.");
                    this._createAndConnectMediaElement(p5_instance);
                }).catch(err => {
                    console.error("Video Player Manager: Error reanudando AudioContext de p5.", err);
                    if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
                });
            } else if (p5AudioCtx && p5AudioCtx.state === 'running') {
                console.log("Video Player Manager: AudioContext de p5 ya está 'running'.");
                this._createAndConnectMediaElement(p5_instance);
            } else {
                 console.error("Video Player Manager: No se pudo obtener un AudioContext válido de p5 o está cerrado. Estado:", p5AudioCtx ? p5AudioCtx.state : "Contexto nulo");
                 if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            }
        } catch (error) {
            console.error("Video Player Manager: Error general al conectar con p5.MediaElement:", error);
            if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
        }
    },

    _createAndConnectMediaElement: function(p5_instance) {
        if (!this.p5MediaElement || this.p5MediaElement.elt !== this.player) {
            // Usa p5_instance.createMediaElement(this.player) o directamente new p5.MediaElement si p5 está global
            // Pero para asegurar que usa el contexto de p5 de esta instancia:
            try {
                 this.p5MediaElement = p5_instance.createचीनMediaElement(this.player); // Método preferido si disponible en instancia 'p'
                 console.log("Video Player Manager: p5.MediaElement creado via p.createMediaElement.");
            } catch (e) {
                 console.warn("p.createMediaElement no existe, intentando new p5.MediaElement (puede usar contexto global). Error:", e);
                 // Fallback si p.createMediaElement no está (versiones más viejas o si 'p' no es completo)
                 if (typeof p5 !== 'undefined' && typeof p5.MediaElement === 'function') {
                    this.p5MediaElement = new p5.MediaElement(this.player);
                 } else {
                    console.error("No se pudo crear p5.MediaElement.");
                    if (this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
                    return;
                 }
            }
        }
        this.audioVisualizerInstance.connectAudioSource(this.p5MediaElement);
        console.log("Video Player Manager: Conexión con p5.MediaElement solicitada.");
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

        if (song.filePath && song.filePath.trim() !== "") {
            this.player.src = song.filePath;
            this.player.load();
        } else {
            console.log(`Video Player Manager: Canción ${song.title} no tiene video. Limpiando player.`);
            if(this.player) {
                this.player.removeAttribute('src');
                this.player.load(); 
                this.player.style.display = 'none';
            }
        }
        this.updateTrackInfoUI(song);
        if(this.uiPlayerProgressBar) {
            this.uiPlayerProgressBar.value = 0;
            this.uiPlayerProgressBar.max = 100; 
            this.uiPlayerProgressBar.disabled = !song.filePath; 
        }
        if(this.uiPlayerTotalTime && !song.filePath) this.uiPlayerTotalTime.textContent = "0:00";

        if (playImmediately && this.isGloballyPlaying && song.filePath) {
             console.log("Video Player Manager: Carga solicitada con playImmediately para canción con video.");
        } else if (playImmediately && this.isGloballyPlaying && !song.filePath) {
            console.log("Video Player Manager: Carga solicitada con playImmediately para canción SIN video.");
            this.isGloballyPlaying = false; 
        } else {
            if (song.filePath && this.player) this.player.pause();
        }
        this.updatePlayPauseButtonUI(this.isGloballyPlaying && playImmediately && !!song.filePath && this.player && !this.player.paused);
    },

    handleMetadata: function() {
        if (!this.player || !isFinite(this.player.duration) || !this.player.currentSrc) {
            console.log("Video Player Manager: Metadatos cargados, pero sin duración o src válido.");
            if (this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = "0:00";
            if (this.uiPlayerProgressBar) {this.uiPlayerProgressBar.max = 0; this.uiPlayerProgressBar.value = 0; this.uiPlayerProgressBar.disabled = true;}
            if (this.player) this.player.style.display = 'none';
            if(this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }
        console.log(`Video Player Manager: Metadatos cargados para ${this.player.currentSrc}. Duración: ${this.formatTime(this.player.duration)}`);
        if(this.uiPlayerTotalTime) this.uiPlayerTotalTime.textContent = this.formatTime(this.player.duration);
        if(this.uiPlayerProgressBar) {
            this.uiPlayerProgressBar.max = this.player.duration;
            this.uiPlayerProgressBar.disabled = false;
        }
        if (this.player) this.player.style.display = 'block'; 
        this.connectToP5AudioSystem();
        if (this.isGloballyPlaying && (this.player.paused || this.player.ended)) { 
            console.log("Video Player Manager: Reproduciendo después de loadedmetadata porque isGloballyPlaying es true.");
            const playPromise = this.player.play();
             if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn("Error en play() después de loadedmetadata:", e);
                    this.isGloballyPlaying = false; 
                    this.updatePlayPauseButtonUI(false);
                });
            }
        }
    },

    handleTimeUpdate: function() {
        if (!this.player || !isFinite(this.player.duration)) return;
        if (this.uiPlayerCurrentTime) this.uiPlayerCurrentTime.textContent = this.formatTime(this.player.currentTime);
        if (this.uiPlayerProgressBar && !this.isUserDraggingProgressBar) {
            this.uiPlayerProgressBar.value = this.player.currentTime;
        }
    },

    handleSongEnded: function() {
        const endedSongTitle = this.playlist[this.currentSongIndex]?.title || "Canción desconocida";
        console.log(`Video Player Manager: Canción terminada - ${endedSongTitle}`);
        this.playNextSong(this.isGloballyPlaying); 
    },

    togglePlayPause: function() {
        if (!this.player || (!this.player.currentSrc && this.playlist.length > 0 && this.currentSongIndex === -1)) {
             if(this.playlist.length > 0 && this.currentSongIndex === -1) {
                console.warn("Video Player Manager: No hay canción cargada, cargando la primera.");
                this.loadSong(0, true); 
                this.isGloballyPlaying = true; 
             } else {
                console.warn("Video Player Manager: No hay src en el player para togglePlayPause y playlist vacía o índice inválido.");
             }
            return;
        }
        
        // Obtener el contexto de p5 si existe
        let p5AudioCtx = null;
        if (this.audioVisualizerInstance && this.audioVisualizerInstance.p5Instance && typeof this.audioVisualizerInstance.p5Instance.getAudioContext === 'function') {
            p5AudioCtx = this.audioVisualizerInstance.p5Instance.getAudioContext();
        }

        if (p5AudioCtx && p5AudioCtx.state === 'suspended') {
            p5AudioCtx.resume().then(() => {
                console.log("AudioContext reanudado por togglePlayPause.");
                this._performTogglePlayPauseInternal();
            }).catch(e => {
                console.error("Error reanudando AudioContext en togglePlayPause", e);
                this._performTogglePlayPauseInternal(); 
            });
        } else {
            this._performTogglePlayPauseInternal();
        }
    },

    _performTogglePlayPauseInternal: function() {
        const currentSong = this.playlist[this.currentSongIndex];
        if (!this.player.currentSrc && currentSong && !currentSong.filePath) {
            console.log("Video Player Manager: Canción actual no tiene video, no se puede reproducir/pausar video.");
            // Para canciones sin video, solo cambiamos el estado visual del botón play/pause
            this.isGloballyPlaying = !this.isGloballyPlaying;
            this.updatePlayPauseButtonUI(this.isGloballyPlaying); 
            if(this.audioVisualizerInstance) this.audioVisualizerInstance.disconnectAudioSource();
            return;
        }

        if (this.player.paused || this.player.ended) {
            console.log("Video Player Manager: Intentando reproducir video.");
            const playPromise = this.player.play();
            if (playPromise !== undefined) {
                playPromise.then(() => { 
                            this.isGloballyPlaying = true; 
                            console.log("Video Player Manager: Reproducción iniciada.");
                           })
                           .catch(e => {
                               console.error("Error al intentar reproducir video:", e);
                               this.isGloballyPlaying = false; 
                               this.updatePlayPauseButtonUI(false);
                           });
            } else { 
                 this.isGloballyPlaying = true;
                 this.updatePlayPauseButtonUI(true); 
            }
        } else {
            console.log("Video Player Manager: Pausando video.");
            this.player.pause();
            this.isGloballyPlaying = false;
        }
    },
    
    playNextSong: function(playImmediately = true) {
        console.log("Video Player Manager: playNextSong llamado.");
        let nextIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.isGloballyPlaying = playImmediately; 
        this.loadSong(nextIndex, playImmediately);
    },

    playPrevSong: function(playImmediately = true) {
        console.log("Video Player Manager: playPrevSong llamado.");
        let prevIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.isGloballyPlaying = playImmediately;
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
             this.player.muted = false; 
        }
        this.lastVolumeBeforeMute = newVolume > 0 ? newVolume : this.lastVolumeBeforeMute;
        console.log(`Video Player Manager: Volumen ajustado a ${this.player.volume}`);
    },
    
    toggleMute: function() {
        if (!this.player) return;
        this.player.muted = !this.player.muted;
        console.log(`Video Player Manager: Mute toogleado a ${this.player.muted}`);
        
        const volumeSlider = document.getElementById('volume-slider');
        if (!this.player.muted && this.player.volume === 0 && this.lastVolumeBeforeMute > 0) {
            this.player.volume = this.lastVolumeBeforeMute;
        }
        if (volumeSlider) { 
             if (!this.player.muted) volumeSlider.value = this.player.volume;
        }
    },
    
    handleVolumeChange: function() { 
        if (!this.player) return;
        console.log(`Video Player Manager: Evento volumechange. Volumen: ${this.player.volume}, Muted: ${this.player.muted}`);
        this.updateVolumeIconUI(this.player.volume, this.player.muted);
        
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider && !this.player.muted && parseFloat(volumeSlider.value).toFixed(2) !== this.player.volume.toFixed(2)) {
             // Solo actualizar si el valor es realmente diferente y no estamos muteados
             // Esto ayuda a prevenir bucles si el evento se dispara por nuestro propio seteo del slider
             // volumeSlider.value = this.player.volume; // Comentado para evitar posibles bucles, el usuario maneja el slider
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
        if (song) {
            if(this.uiPlayerSongTitle) this.uiPlayerSongTitle.textContent = song.title;
            if(this.uiPlayerSongArtist) this.uiPlayerSongArtist.textContent = song.artist;
            if(this.uiPlayerAlbumArtImg) this.uiPlayerAlbumArtImg.src = song.albumArtPath || 'assets/SONGS_COVERS/default_art.png';
        } else {
            if(this.uiPlayerSongTitle) this.uiPlayerSongTitle.textContent = "No Song Loaded";
            if(this.uiPlayerSongArtist) this.uiPlayerSongArtist.textContent = "";
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