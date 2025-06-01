
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
                    this.p5Instance.clear();
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
                     p.clear();
                }
                return;
            }
            if (!p.isLooping() && audioVisualizer.isDrawing) {
                p.loop();
            }

            p.clear(); // Limpiar canvas en cada frame

            audioVisualizer.fft.analyze();
            let wave = audioVisualizer.fft.waveform(); // Esto devuelve valores entre -1 y 1
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
            p.stroke(255, 255, 255, 200);
            p.strokeWeight(2.5);
            p.noFill();
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
            p.pop(); // Fin de la visualización central (y su translate)

            // --- NUEVAS LÍNEAS LATERALES (CUERDAS DE GUITARRA) ---
            if (wave && wave.length > 0) {
                p.push(); // Nuevo contexto de dibujo para las líneas
                p.stroke(255, 255, 255, 170); // Color de las líneas, un poco más tenues
                p.strokeWeight(2.5);          // Grosor de las líneas
                p.noFill();

                const lineMarginXRatio = 0.07;  // 7% desde los bordes laterales
                const lineTopRatio = 0.1;       // 10% desde arriba
                const lineBottomRatio = 0.9;    // 10% desde abajo (ocupa 80% de la altura)

                const lineXLeft = p.width * lineMarginXRatio;
                const lineXRight = p.width * (1 - lineMarginXRatio);
                const lineYStart = p.height * lineTopRatio;
                const lineYEnd = p.height * lineBottomRatio;
                const lineHeight = lineYEnd - lineYStart;

                const numSegments = 40; // Número de segmentos para dibujar la "cuerda"
                const segmentLength = lineHeight / numSegments;
                // Máxima amplitud de la vibración, puede ser un porcentaje del ancho o un valor fijo
                const maxDisplacement = p.width * 0.02; // 2% del ancho de la pantalla

                // Función para dibujar una cuerda vibrante
                const drawVibratingLine = (baseX, waveOffset, invertDisplacement = false) => {
                    p.beginShape();
                    for (let i = 0; i <= numSegments; i++) {
                        const currentY = lineYStart + i * segmentLength;

                        // Mapear 'i' (o currentY) a un índice del waveform
                        // Usaremos una porción del waveform (ej. la primera mitad) y aplicaremos un offset
                        const portionToSample = wave.length / 2; // Cuántos puntos del waveform usamos
                        let waveSampleIndex = p.floor(p.map(i, 0, numSegments, 0, portionToSample - 1));
                        
                        // Aplicar offset y asegurar ciclicidad dentro de todo el array 'wave'
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

                // Dibujar línea izquierda
                drawVibratingLine(lineXLeft, 0); // waveOffset = 0

                // Dibujar línea derecha
                // Usamos un offset en el waveform para que no sea idéntica a la izquierda
                // y podemos invertir el desplazamiento para un efecto más simétrico si se desea.
                let rightWaveOffset = Math.floor(wave.length / 4); // Un cuarto del waveform de offset
                drawVibratingLine(lineXRight, rightWaveOffset, true); // invertDisplacement = true para que ondule hacia adentro o de forma opuesta

                p.pop(); // Fin del contexto de las líneas
            }
        }; // Fin de p.draw

        p.windowResized = () => {
            if (p && typeof p.resizeCanvas === 'function') p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        // Clase Particle (sin cambios)
        class Particle {
            constructor(pInstance) { this.p = pInstance; this.pos = this.p.createVector(0,0); this.vel = p5.Vector.random2D().mult(this.p.random(0.5,2)); this.acc = p5.Vector.random2D().mult(this.p.random(0.005,0.02)); this.w = this.p.random(1.5,4); this.color = [this.p.random(200,255),this.p.random(200,255),this.p.random(200,255),this.p.random(80,180)]; this.lifespan = 300; }
            update(bassKicked) { this.vel.add(this.acc); this.pos.add(this.vel); if(bassKicked) { let push = this.pos.copy().normalize().mult(this.p.random(0.5,1.5)); this.vel.add(push); } this.vel.limit(3); this.lifespan -= 1.5; }
            edges() { return this.p && this.pos.mag() > this.p.max(this.p.width, this.p.height) * 0.75 || this.lifespan < 0; }
            show() { if(this.p) {this.p.noStroke(); this.p.fill(this.color[0],this.color[1],this.color[2],this.lifespan); this.p.ellipse(this.pos.x,this.pos.y,this.w);} }
        }
    }
};
audioVisualizer.init();
