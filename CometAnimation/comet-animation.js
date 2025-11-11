/**
 * Comet Animation Script
 * Spawns animated comets across the screen every 2 seconds
 */
(function() {
    'use strict';

    // Configuration
    const COMET_DURATION = 4000; // milliseconds (matches CSS animation)
    const DELAY_AFTER_EXIT = 3000; // 3 seconds after comet exits
    // Obtain comet image path from a hidden global <img id="comet-image-src"> element injected in each HTML page.
    // This avoids brittle relative path math across nested folders and works on case-sensitive hosts.
    const globalImageEl = typeof document !== 'undefined' ? document.getElementById('comet-image-src') : null;
    const COMET_IMAGE_PATH = globalImageEl ? globalImageEl.src : 'CometAnimation/Comet.png';
    // If the image's head naturally points UP, set offset to +90.
    // If it naturally points RIGHT, set to 0. Tweak if needed.
    const IMAGE_HEADING_OFFSET_DEG = 90;

    // Create and inject the comet container
    function initCometContainer() {
        const container = document.createElement('div');
        container.id = 'comet-container';
        document.body.appendChild(container);
        return container;
    }

    // Generate random starting position (any edge of the screen)
    function getRandomStartPosition() {
        const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let x, y;
        
        switch(edge) {
            case 0: // top
                x = Math.random() * 100;
                y = -5;
                break;
            case 1: // right
                x = 105;
                y = Math.random() * 100;
                break;
            case 2: // bottom
                x = Math.random() * 100;
                y = 105;
                break;
            case 3: // left
                x = -5;
                y = Math.random() * 100;
                break;
        }
        
        return { x, y };
    }

    // Generate random ending position (opposite direction, any point)
    function getRandomEndPosition(startX, startY) {
        // End should be on the opposite side of the screen
        let x, y;
        
        if (startX < 10) {
            // Started from left, go to right
            x = 100 + Math.random() * 10;
        } else if (startX > 90) {
            // Started from right, go to left
            x = -10 - Math.random() * 10;
        } else {
            // Started from top or bottom, random horizontal
            x = Math.random() * 100;
        }
        
        if (startY < 10) {
            // Started from top, go to bottom
            y = 100 + Math.random() * 10;
        } else if (startY > 90) {
            // Started from bottom, go to top
            y = -10 - Math.random() * 10;
        } else {
            // Started from left or right, random vertical
            y = Math.random() * 100;
        }
        
        return { x, y };
    }

    // Calculate rotation angle based on direction
    function calculateRotation(startX, startY, endX, endY) {
        const dx = endX - startX;
        const dy = endY - startY;
        // atan2 gives us the angle in radians, convert to degrees
        // The comet image naturally points right, so we adjust accordingly
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return angle;
    }

    // Create and animate a single comet
    function spawnComet(container) {
        const comet = document.createElement('div');
        comet.className = 'comet';
        
        const img = document.createElement('img');
        img.src = COMET_IMAGE_PATH;
        img.alt = 'Comet';
        // Rotate the image itself by 45 degrees on load (independent of travel rotation)
        img.style.transform = 'rotate(135deg)';
        img.style.transformOrigin = '50% 50%';
        comet.appendChild(img);

        // Get random start and end positions
        const start = getRandomStartPosition();
        const end = getRandomEndPosition(start.x, start.y);
        
        // Set starting position
        comet.style.left = `${start.x}%`;
        comet.style.top = `${start.y}%`;

        // Calculate and apply rotation based on trajectory
        // Adding 0 degrees assumes the comet naturally points to the right
        // Adjust this offset if the image points in a different direction
    const rotation = calculateRotation(start.x, start.y, end.x, end.y);
    const rotationWithOffset = rotation + IMAGE_HEADING_OFFSET_DEG;
        
        // Create inline keyframe animation for this specific trajectory
        const animationName = `comet-move-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const keyframes = `
            @keyframes ${animationName} {
                from {
                    left: ${start.x}%;
                    top: ${start.y}%;
                    transform: rotate(${rotationWithOffset}deg);
                }
                to {
                    left: ${end.x}%;
                    top: ${end.y}%;
                    transform: rotate(${rotationWithOffset}deg);
                }
            }
        `;
        
        // Inject keyframes
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        // Apply animation
        comet.style.animation = `${animationName} 4s linear, comet-fade 4s ease-in-out`;

        // Add to container
        container.appendChild(comet);

        // Remove comet and keyframes after animation completes
        setTimeout(() => {
            if (comet.parentNode) {
                comet.parentNode.removeChild(comet);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, COMET_DURATION);
    }

    // Initialize and start the comet animation system
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        const container = initCometContainer();

        // Function to spawn comet and schedule the next one
        function spawnAndScheduleNext() {
            spawnComet(container);
            
            // Schedule next comet after this one exits + delay
            setTimeout(spawnAndScheduleNext, COMET_DURATION + DELAY_AFTER_EXIT);
        }

        // Start the sequence with first comet
        spawnAndScheduleNext();
    }

    // Start the animation
    init();
})();
