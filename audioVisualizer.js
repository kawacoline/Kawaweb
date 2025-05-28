// audioVisualizer.js
const audioVisualizer = {
    p5Instance: null,
    fft: null,
    particles: [], 
    mediaElementSource: null,
    isDrawing: false,
    p5SetupDone: false,

    init: function() {
        console.log("Audio Visualizer: Initializing, waiting for p5 instance and setup...");
        this.p5SetupDone = false;
    },

    connectAudioSource: function(p5MediaElement) {
        if (!this.p5Instance) {
            console.error("Audio Visualizer: p5 instance not available for connectAudioSource.");
            return;
        }
        if (!p5MediaElement || !p5MediaElement.elt) {
            console.warn("Audio Visualizer: Invalid p5MediaElement for connection.");
            this.disconnectAudioSource(); 
            return;
        }
        this.mediaElementSource = p5MediaElement;
        if (this.fft) {
            this.fft.setInput(this.mediaElementSource);
            console.log("Audio Visualizer: FFT input connected to p5.MediaElement.");
            this.isDrawing = true; 
            if (this.p5Instance && !this.p5Instance.isLooping()) {
                this.p5Instance.loop();
                 console.log("Audio Visualizer: p5 loop started.");
            }
        } else {
            console.error("Audio Visualizer: FFT not initialized when trying to connect source.");
        }
    },

    disconnectAudioSource: function() {
        console.log("Audio Visualizer: Attempting to disconnect audio source.");
        if (this.fft) this.fft.setInput(null);
        this.mediaElementSource = null; // Importante resetear
        this.isDrawing = false; 
        if (this.p5Instance && this.p5Instance.isLooping()) {
            this.p5Instance.noLoop();
            console.log("Audio Visualizer: p5 loop stopped.");
        }
        if (this.p5Instance && typeof this.p5Instance.clear === 'function') {
            try {
                this.p5Instance.clear();
            } catch (e) {
                console.warn("Error clearing canvas during disconnect:", e);
            }
        }
    },

    sketch: function(p) {
        console.log("Audio Visualizer: p5 sketch function called. 'p' is available locally.");
        audioVisualizer.p5Instance = p; 

        p.setup = () => {
            console.log("Audio Visualizer: p5 setup() started.");
            try {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                console.log("Audio Visualizer: Canvas created.");
                canvas.parent('p5-visualizer-container');
                console.log("Audio Visualizer: Canvas parented.");
                p.angleMode(p.DEGREES);
                console.log("Audio Visualizer: Angle mode set.");
                
                // No es necesario p.soundFormats() aquí si usamos MediaElement del video
                
                audioVisualizer.fft = new p5.FFT(0.8, 256); 
                console.log("Audio Visualizer: FFT created.");
                
                audioVisualizer.p5SetupDone = true;
                console.log("Audio Visualizer: p5 setup completed successfully. p5SetupDone is true.");
                p.noLoop(); 
            } catch (error) {
                console.error("Audio Visualizer: ERROR DURING p5.setup():", error);
                audioVisualizer.p5SetupDone = false;
            }
        };

        p.draw = () => {
            if (!audioVisualizer.isDrawing || 
                !audioVisualizer.mediaElementSource || 
                !videoPlayerManager.player || // Verificar que el player HTML exista
                videoPlayerManager.player.paused ||
                videoPlayerManager.player.ended ||
                !audioVisualizer.fft) { // Verificar que FFT exista
                
                if (audioVisualizer.isDrawing && p.isLooping()) { 
                     if(p && typeof p.clear === 'function') p.clear();
                }
                return; 
            }
            if(p && !p.isLooping()) p.loop();

            if(p && typeof p.clear === 'function') p.clear();

            audioVisualizer.fft.analyze();
            let wave = audioVisualizer.fft.waveform();
            let bassEnergy = audioVisualizer.fft.getEnergy("bass");

            p.push();
            p.translate(p.width / 2, p.height / 2);

            if (bassEnergy > 150 && audioVisualizer.particles.length < 150) {
                for (let i = 0; i < p.random(0, 2); i++) audioVisualizer.particles.push(new Particle(p));
            }
            for (let i = audioVisualizer.particles.length - 1; i >= 0; i--) {
                if (!audioVisualizer.particles[i].edges()) {
                    audioVisualizer.particles[i].update(bassEnergy > 180);
                    audioVisualizer.particles[i].show();
                } else audioVisualizer.particles.splice(i, 1);
            }
            
            p.stroke(255, 255, 255, 200);
            p.strokeWeight(2.5);
            p.noFill();
            const rBase = p.min(p.width, p.height) * 0.25;
            const rRange = p.min(p.width, p.height) * 0.15;

            for (let t = -1; t <= 1; t += 2) {
                p.beginShape();
                for (let i = 0; i <= 180; i += 1.5) {
                    if (wave && wave.length > 0) { // Verificar que wave no esté vacío
                        let index = p.floor(p.map(i, 0, 180, 0, wave.length - 1));
                        index = p.constrain(index, 0, wave.length -1); // Asegurar que el índice es válido
                        let r = p.map(wave[index], -1, 1, rBase - rRange, rBase + rRange); 
                        p.vertex(r * p.sin(i) * t, r * p.cos(i));
                    }
                }
                p.endShape();
            }
            p.pop();
        };

        p.windowResized = () => {
            if (p && typeof p.resizeCanvas === 'function') p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        class Particle { 
            constructor(pInstance) { this.p = pInstance; this.pos = this.p.createVector(0,0); this.vel = p5.Vector.random2D().mult(this.p.random(0.5,2)); this.acc = p5.Vector.random2D().mult(this.p.random(0.005,0.02)); this.w = this.p.random(1.5,4); this.color = [this.p.random(200,255),this.p.random(200,255),this.p.random(200,255),this.p.random(80,180)]; this.lifespan = 200; }
            update(bassKicked) { this.vel.add(this.acc); this.pos.add(this.vel); if(bassKicked) { let push = this.pos.copy().normalize().mult(this.p.random(0.5,1.5)); this.vel.add(push); } this.vel.limit(3); this.lifespan -= 1.5; }
            edges() { return this.p && this.pos.mag() > this.p.max(this.p.width, this.p.height) * 0.75 || this.lifespan < 0; } // Verificar this.p
            show() { if(this.p) {this.p.noStroke(); this.p.fill(this.color[0],this.color[1],this.color[2],this.lifespan); this.p.ellipse(this.pos.x,this.pos.y,this.w);} }
        }
    } 
};
audioVisualizer.init();