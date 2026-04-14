/**
 * texture-atlas.js — 4096-Glyph Heterogeneous Texture Atlas
 *
 * Generates a 2048×2048 texture with a 64×64 grid of tiles.
 * Each tile contains a Unicode glyph (math operators, runes)
 * and a 5-digit ℤ₃₂ binary state label.
 */

const GLYPHS = Array.from(
    '∀∁∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∭∮∯∰∱∲∳∴∵∶∷∸∹∺∻∼∽∾∿' +
    '←↑→↓↔↕↖↗↘↙↚↛↜↝↞↟' +
    'ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙ'
);

/**
 * Create the 4096-glyph texture atlas as a THREE.CanvasTexture.
 * @returns {THREE.CanvasTexture}
 */
export function createHyperCubieTextureAtlas() {
    const size = 2048;
    const tiles = 64;
    const tileSize = size / tiles;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Dark base (gap between tiles)
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, size, size);

    for (let row = 0; row < tiles; row++) {
        for (let col = 0; col < tiles; col++) {
            const x = col * tileSize;
            const y = row * tileSize;

            // Tile face (white — tinted by GPU instance color)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

            // Center glyph
            ctx.fillStyle = 'rgba(6, 8, 20, 0.88)';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            ctx.fillText(glyph, x + tileSize / 2, y + tileSize / 2 - 2);

            // 5-digit ℤ₃₂ binary state
            ctx.fillStyle = '#dc2626';
            ctx.font = '7px monospace';
            let bin = '';
            for (let b = 0; b < 5; b++) bin += Math.random() > 0.5 ? '1' : '0';
            ctx.fillText(bin, x + tileSize / 2, y + tileSize - 4);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
}
