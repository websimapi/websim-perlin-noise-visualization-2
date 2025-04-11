// Perlin Noise implementation
class PerlinNoise {
  constructor() {
    this.permutation = new Array(256).fill(0).map((_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    this.p = [...this.permutation, ...this.permutation];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w,
      this.lerp(v,
        this.lerp(u,
          this.grad(this.p[AA], x, y, z),
          this.grad(this.p[BA], x - 1, y, z)
        ),
        this.lerp(u,
          this.grad(this.p[AB], x, y - 1, z),
          this.grad(this.p[BB], x - 1, y - 1, z)
        )
      ),
      this.lerp(v,
        this.lerp(u,
          this.grad(this.p[AA + 1], x, y, z - 1),
          this.grad(this.p[BA + 1], x - 1, y, z - 1)
        ),
        this.lerp(u,
          this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)
        )
      )
    );
  }
}

// Setup canvas and animation
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const perlin = new PerlinNoise();
const scaleSlider = document.getElementById('scale');
const speedSlider = document.getElementById('speed');

let time = 0;

function draw() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const scale = scaleSlider.value / 1000;
  
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const value = perlin.noise(x * scale, y * scale, time);
      const normalized = (value + 1) / 2;
      const idx = (y * canvas.width + x) * 4;
      
      const color = Math.floor(normalized * 255);
      imageData.data[idx] = color;     // R
      imageData.data[idx + 1] = color; // G
      imageData.data[idx + 2] = color; // B
      imageData.data[idx + 3] = 255;   // A
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  time += speedSlider.value / 10000;
  requestAnimationFrame(draw);
}

draw();

