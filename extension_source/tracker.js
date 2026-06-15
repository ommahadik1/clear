/* tracker.js */
(async function() {
    const video = document.getElementById('webcam-feed');
    let trackingLoopId = null;

    try {
        // Request the camera stream natively in the secure offscreen context
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        
        // Wait for video to be fully ready before starting ML inference
        await new Promise(resolve => {
            video.onloadedmetadata = () => resolve();
        });

        startTrackingEngine();
    } catch (err) {
        console.error('Offscreen tracker failed to get camera stream:', err);
    }

    function startTrackingEngine() {
        // [INSERT HEAVY ML LIBRARY INIT HERE - e.g., WebGazer.js or MediaPipe]
        console.log('Eye-Tracking Engine Started in Offscreen Sandbox');
        
        let mockTime = 0;

        function broadcastCoordinates() {
            // Simulated ML Gaze Coordinate Extraction
            // In a real implementation, you'd extract X/Y from the ML model analyzing the video frame here.
            // We use a figure-8 sine-wave pattern to mathematically prove the broadcast pipeline is alive and zero-lag.
            const mockX = (window.screen.availWidth / 2) + Math.sin(mockTime) * 300;
            const mockY = (window.screen.availHeight / 2) + Math.sin(mockTime * 2) * 150;
            mockTime += 0.05;

            // Broadcast the coordinates to all content scripts.
            // Using sendMessage allows tabs to catch the coordinates seamlessly without polling.
            chrome.runtime.sendMessage({ 
                type: 'EYE_TRACKING_UPDATE', 
                x: mockX, 
                y: mockY 
            }).catch(() => {
                // Ignore "Receiving end does not exist" errors if no tabs are listening.
            });

            trackingLoopId = requestAnimationFrame(broadcastCoordinates);
        }

        broadcastCoordinates();
    }
})();
