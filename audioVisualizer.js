
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

    connectAudioSource: function(p5MediaElementInput) {
        if (!this.p5Instance) {
            console.error("Audio Visualizer: p5 instance not available for connectAudioSource.");
            return;
        }
        if (!p5MediaElementInput || !p5MediaElementInput.elt) {
            console.warn("Audio Visualizer: Invalid p5.MediaElement for connection.");
            this.disconnectAudioSource();
            return;
        }

        this.mediaElementSource = p5MediaElementInput;

        if (!this.fft && this.p5Instance) {
             this.fft = new this.p5Instance.constructor.FFT(0.8, 256); // FFT(smoothing, bins)
             console.log("Audio Visualizer: FFT created on demand.");
        }

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
        console.log("Audio Visualizer: Disconnecting FFT input.");
        if (this.fft) {
            this.fft.setInput(null);
            console.log("Audio Visualizer: FFT input explicitly set to null.");
        }

        this.isDrawing = false;
        if (this.p5Instance && this.p5Instance.isLooping()) {
            this.p5Instance.noLoop();
            console.log("Audio Visualizer: p5 loop stopped.");
            if (this.p5Instance && typeof this.p5Instance.clear === 'function') {
                try {
                    this.p5Instance.clear(); // Limpiar el canvas una última vez
                    console.log("Audio Visualizer: Canvas cleared after stopping loop.");
                } catch (e) {
                    console.warn("Error clearing canvas during disconnect:", e);
                }
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

                audioVisualizer.p5SetupDone = true;
                console.log("Audio Visualizer: p5 setup completed successfully. p5SetupDone is true.");
                p.noLoop(); // Empezar sin loopear, se activa cuando hay audio
            } catch (error) {
                console.error("Audio Visualizer: ERROR DURING p5.setup():", error);
                audioVisualizer.p5SetupDone = false;
            }
        };

        p.draw = () => {
            if (!audioVisualizer.isDrawing ||
                !audioVisualizer.mediaElementSource ||
                !videoPlayerManager.player ||
                videoPlayerManager.player.paused ||
                videoPlayerManager.player.ended ||
                !audioVisualizer.fft) {

                if (p.isLooping() && !audioVisualizer.isDrawing) {
                     p.noLoop();
                     // No es necesario p.clear() aquí si no se está dibujando activamente.
                     // Se limpiará al inicio del próximo frame de dibujo si isDrawing vuelve a ser true.
                }
                return;
            }
            if (!p.isLooping() && audioVisualizer.isDrawing) {
                p.loop();
            }

            p.clear(); // Limpia los dibujos del frame anterior en el canvas p5.
                       // El canvas en sí es transparente por defecto, mix-blend-mode actuará sobre los píxeles dibujados.

            // No necesitamos p.blendMode(p.DIFFERENCE) aquí, lo maneja CSS.
            // p.blendMode(p.BLEND); // Asegurarse que p5 dibuja normalmente dentro de su propio canvas.

            audioVisualizer.fft.analyze();
            let wave = audioVisualizer.fft.waveform();
            let bassEnergy = audioVisualizer.fft.getEnergy("bass");

            // --- Visualización Central Existente (Círculo y Partículas) ---
            p.push();
            p.translate(p.width / 2, p.height / 2);

            // Lógica de partículas
            if (bassEnergy > 150 && audioVisualizer.particles.length < 150) {
                for (let i = 0; i < p.random(0, 2); i++) audioVisualizer.particles.push(new Particle(p));
            }
            for (let i = audioVisualizer.particles.length - 1; i >= 0; i--) {
                if (!audioVisualizer.particles[i].edges()) {
                    audioVisualizer.particles[i].update(bassEnergy > 180);
                    audioVisualizer.particles[i].show();
                } else audioVisualizer.particles.splice(i, 1);
            }

            // Dibujo de la onda circular
            p.stroke(255, 255, 255, 255); // Blanco opaco para el trazo
            p.strokeWeight(2.5);
            p.noFill(); // Importante para que solo el trazo se mezcle
            const rBase = p.min(p.width, p.height) * 0.25;
            const rRange = p.min(p.width, p.height) * 0.15;

            for (let t = -1; t <= 1; t += 2) {
                p.beginShape();
                for (let i = 0; i <= 180; i += 1.5) {
                    if (wave && wave.length > 0) {
                        let index = p.floor(p.map(i, 0, 180, 0, wave.length - 1));
                        index = p.constrain(index, 0, wave.length -1);
                        let rVal = p.map(wave[index], -1, 1, rBase - rRange, rBase + rRange);
                        p.vertex(rVal * p.sin(i) * t, rVal * p.cos(i));
                    }
                }
                p.endShape();
            }
            p.pop();

            // --- NUEVAS LÍNEAS LATERALES (CUERDAS DE GUITARRA) ---
            if (wave && wave.length > 0) {
                p.push();
                p.stroke(255, 255, 255, 255); // Blanco opaco para el trazo
                p.strokeWeight(2.5);
                p.noFill(); // Importante

                const lineMarginXRatio = 0.07;
                const lineTopRatio = 0.1;
                const lineBottomRatio = 0.9;

                const lineXLeft = p.width * lineMarginXRatio;
                const lineXRight = p.width * (1 - lineMarginXRatio);
                const lineYStart = p.height * lineTopRatio;
                const lineYEnd = p.height * lineBottomRatio;
                const lineHeight = lineYEnd - lineYStart;

                const numSegments = 40;
                const segmentLength = lineHeight / numSegments;
                const maxDisplacement = p.width * 0.02;

                const drawVibratingLine = (baseX, waveOffset, invertDisplacement = false) => {
                    p.beginShape();
                    for (let i = 0; i <= numSegments; i++) {
                        const currentY = lineYStart + i * segmentLength;
                        const portionToSample = wave.length / 2;
                        let waveSampleIndex = p.floor(p.map(i, 0, numSegments, 0, portionToSample - 1));
                        waveSampleIndex = (waveSampleIndex + waveOffset) % wave.length;
                        waveSampleIndex = p.constrain(waveSampleIndex, 0, wave.length - 1);
                        const waveValue = wave[waveSampleIndex] || 0;
                        let displacement = p.map(waveValue, -1, 1, -maxDisplacement, maxDisplacement);
                        if (invertDisplacement) {
                            displacement *= -1;
                        }
                        p.vertex(baseX + displacement, currentY);
                    }
                    p.endShape();
                };

                drawVibratingLine(lineXLeft, 0);
                let rightWaveOffset = Math.floor(wave.length / 4);
                drawVibratingLine(lineXRight, rightWaveOffset, true);
                p.pop();
            }

            // No es necesario restaurar p.blendMode(p.BLEND) aquí si no lo cambiamos antes.
        }; // Fin de p.draw

        p.windowResized = () => {
            if (p && typeof p.resizeCanvas === 'function') p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        class Particle {
            constructor(pInstance) {
                this.p = pInstance;
                this.pos = this.p.createVector(0, 0);
                this.vel = p5.Vector.random2D().mult(this.p.random(0.5, 2));
                this.acc = p5.Vector.random2D().mult(this.p.random(0.005, 0.02));
                this.w = this.p.random(1.5, 4);
                // Usar blanco opaco para las partículas también, para que mix-blend-mode actúe sobre ellas
                // El alfa decreciente controlará su visibilidad y cómo se mezclan.
                this.baseColor = [255, 255, 255]; // Blanco
                this.lifespan = 255; // Alfa inicial
            }
            update(bassKicked) {
                this.vel.add(this.acc);
                this.pos.add(this.vel);
                if (bassKicked) {
                    let push = this.pos.copy().normalize().mult(this.p.random(0.5, 1.5));
                    this.vel.add(push);
                }
                this.vel.limit(3);
                this.lifespan -= 2;
                this.lifespan = this.p.max(0, this.lifespan);
            }
            edges() {
                return (this.p && this.pos.mag() > this.p.max(this.p.width, this.p.height) * 0.75) || this.lifespan <= 0;
            }
            show() {
                if (this.p) {
                    this.p.noStroke();
                    // El color del fill es blanco, y el alfa es el lifespan.
                    // mix-blend-mode actuará sobre estos píxeles blancos (con su alfa)
                    this.p.fill(this.baseColor[0], this.baseColor[1], this.baseColor[2], this.lifespan);
                    this.p.ellipse(this.pos.x, this.pos.y, this.w);
                }
            }
        }
    }
};
audioVisualizer.init();
