/**
 * orbit-controls.js — Manual Spherical Orbit Camera
 *
 * Replaces THREE.OrbitControls with a lightweight pointer-based
 * spherical orbit implementation. Supports drag-to-rotate and scroll-to-zoom.
 */

/**
 * Attach orbit controls to a camera and renderer.
 * @param {THREE.OrthographicCamera} camera
 * @param {HTMLElement} domElement - the renderer's canvas
 * @param {HTMLElement} container - the container element for sizing
 * @returns {{ update: Function }} controller handle
 */
export function attachOrbitControls(camera, domElement, container) {
    let theta = Math.PI / 4;
    let phi = Math.PI / 4;
    let radius = 173;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    const target = new THREE.Vector3(0, 0, 0);

    function update() {
        phi = Math.max(0.2, Math.min(Math.PI / 1.5, phi));
        radius = Math.max(60, Math.min(700, radius));

        camera.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
        camera.lookAt(target);

        const aspect = container.clientWidth / container.clientHeight;
        const fz = 250 * (radius / 173);
        camera.left = -fz * aspect / 2;
        camera.right = fz * aspect / 2;
        camera.top = fz / 2;
        camera.bottom = -fz / 2;
        camera.updateProjectionMatrix();
    }

    domElement.addEventListener('pointerdown', e => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener('pointerup', () => { isDragging = false; });

    window.addEventListener('pointermove', e => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        theta -= dx * 0.005;
        phi -= dy * 0.005;
        lastX = e.clientX;
        lastY = e.clientY;
        update();
    });

    domElement.addEventListener('wheel', e => {
        e.preventDefault();
        radius += e.deltaY * 0.3;
        update();
    }, { passive: false });

    // Initial position
    update();

    return { update };
}
