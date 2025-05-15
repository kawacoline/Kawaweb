// Script dedicado al reproductor de audio y playlist

// --- Playlist y Player ---
// (Extraído de script.js)

window.playlist = [
    {
        title: "гуляю",
        artist: "ANGUISH, EXILED, elfass",
        filePath: "assets/PLAYLIST/ANGUISH_HEXILED_elfass_Gulyau.mp3",
        albumArtPath: "assets/PLAYLIST_COVERS/gulyau_cover.jpg"
    },
    {
        title: "it's rainy outside",
        artist: "uselet",
        filePath: "assets/PLAYLIST/its_rainy_outside.mp3",
        albumArtPath: "assets/PLAYLIST_COVERS/its_rainy_outside_cover.jpg"
    },
    {
        title: "Aegleseeker",
        artist: "Silentroom vs Frums",
        filePath: "assets/PLAYLIST/Silentroom_vs_Frums_Aegleseeker.mp3",
        albumArtPath: "assets/PLAYLIST_COVERS/aegleseeker_cover.jpg"
    },
    {
        title: "World execute (me)",
        artist: "Mili",
        filePath: "assets/PLAYLIST/World_execute_(me)_Mili.mp3",
        albumArtPath: "assets/PLAYLIST_COVERS/world_execute_me_cover.jpg"
    }
];
window.currentSongIndex = 0;
window.currentP5Song = null;
window.isPlayerGloballyPlaying = false;
window.isSongLoadedAndReady = false;

// Aquí irían las funciones de UI, eventos y control del reproductor, igual que antes pero usando window. para exponerlas si es necesario
// Por ejemplo:
window.updateProgressUI = function() {
    // ...implementación igual que antes...
};
// ...y así sucesivamente para el resto de funciones del reproductor...
