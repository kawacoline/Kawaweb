// Script dedicado al visualizador gráfico de audio con p5.js

// --- p5.js Sketch Definition y visualizador gráfico ---
// (Extraído de script.js)

const sketch = (p) => {
    let fft;
    let particles = [];
    let musicSuccessfullyStartedThisSession = false; 

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight).parent('p5-visualizer-container');
        p.angleMode(p.DEGREES);
        fft = new p5.FFT(0.8, 512); 
        p.noLoop(); 
    };

    p.draw = () => {
        p.background(0); 
        if (window.currentP5Song && window.currentP5Song.isLoaded() && window.currentP5Song.isPlaying()) {
            fft.analyze();
            let wave = fft.waveform();
            let currentAmp = fft.getEnergy(20, 200);
            p.translate(p.width / 2, p.height / 2);
            if (currentAmp > 210 && particles.length < 200) {
                let pNum = p.random(0, 3);
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
                    let r = p.map(wave[index], -1, 1, 250, 550);
                    let x = r * p.sin(i) * t;
                    let y = r * p.cos(i);
                    p.vertex(x, y);
                }
                p.endShape();
            }
        }
        if (window.updateProgressUI) window.updateProgressUI();
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    // Clase Particle igual que antes
    class Particle {
        constructor(pInstance) {
            this.p = pInstance;
            this.pos = this.p.createVector(0, 0);
            this.vel = p5.Vector.random2D().mult(this.p.random(1, 3));
            this.acc = p5.Vector.random2D().mult(this.p.random(0.01, 0.05));
            this.w = this.p.random(2, 5);
            this.color = [this.p.random(200, 255), this.p.random(200, 255), this.p.random(200, 255), this.p.random(100, 200)];
            this.lifespan = 255;
        }
        update(bassKicked) {
            this.vel.add(this.acc); this.pos.add(this.vel);
            if (bassKicked) { let pushForce = this.pos.copy().normalize().mult(this.p.random(1, 2)); this.vel.add(pushForce); }
            this.vel.limit(4); this.lifespan -= 1.0;
        }
        edges() { if (this.pos.mag() > this.p.max(this.p.width, this.p.height) * 0.85 || this.lifespan < 0) { return true; } return false; }
        show() { this.p.noStroke(); this.p.fill(this.color[0], this.color[1], this.color[2], this.lifespan); this.p.ellipse(this.pos.x, this.pos.y, this.w); }
    }
};

window.p5SketchInstance = new p5(sketch);
