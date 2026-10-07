from pathlib import Path

import numpy as np
from PIL import Image

SIZE = 512
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "textures"

def tileable_value_noise(size: int, lattice: int, rng: np.random.Generator) -> np.ndarray:
    grid = rng.random((lattice, lattice))

    coords = np.arange(size) * lattice / size
    index0 = np.floor(coords).astype(int) % lattice
    index1 = (index0 + 1) % lattice
    frac = coords - np.floor(coords)
    weight = frac * frac * (3 - 2 * frac)

    wx = weight[None, :]
    wy = weight[:, None]

    top = grid[np.ix_(index0, index0)] * (1 - wx) + grid[np.ix_(index0, index1)] * wx
    bottom = grid[np.ix_(index1, index0)] * (1 - wx) + grid[np.ix_(index1, index1)] * wx
    return top * (1 - wy) + bottom * wy

def fbm(size: int, base_lattice: int, octaves: int, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    total = np.zeros((size, size))
    amplitude = 1.0
    norm = 0.0

    for octave in range(octaves):
        lattice = base_lattice * (2**octave)
        if size % lattice:
            raise ValueError(f"Ґратка {lattice} не ділить розмір {size} — плитка не зійдеться")
        total += amplitude * tileable_value_noise(size, lattice, rng)
        norm += amplitude
        amplitude *= 0.5

    total /= norm
    low, high = total.min(), total.max()
    return (total - low) / (high - low or 1)

def save_white_alpha(path: Path, alpha: np.ndarray) -> None:
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = np.clip(alpha, 0, 1) * 255
    Image.fromarray(rgba, mode="RGBA").save(path, optimize=True)
    print(f"{path.name}: {path.stat().st_size / 1024:.1f} КБ")

def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    noise = fbm(SIZE, base_lattice=8, octaves=4, seed=5)
    veins = np.exp(-((noise - 0.5) ** 2) / (2 * 0.055**2))
    save_white_alpha(OUT_DIR / "caustics.png", veins * 0.9)

    flow = fbm(SIZE, base_lattice=4, octaves=3, seed=3)
    save_white_alpha(OUT_DIR / "water-flow.png", np.clip(flow * 0.8 - 0.15, 0, 1))

if __name__ == "__main__":
    main()
