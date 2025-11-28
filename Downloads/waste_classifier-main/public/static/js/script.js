document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const capturedImage = document.getElementById('captured-image');
    const captureButton = document.getElementById('capture-btn');
    const classificationResult = document.getElementById('classification');
    const detailsResult = document.getElementById('details');
    const resultsDiv = document.getElementById('results');

    let stream = null;

    // Access the webcam
    async function initWebcam() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'environment'
                },
                audio: false
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            
            // Wait for video to load before enabling button
            video.onloadedmetadata = () => {
                video.play();
                captureButton.disabled = false;
                console.log("Webcam access granted and ready.");
            };
            
            video.style.display = 'block';
            capturedImage.style.display = 'none';
        } catch (err) {
            console.error("Error accessing webcam: ", err);
            let errorMsg = 'Error accessing webcam. ';
            
            if (err.name === 'NotAllowedError') {
                errorMsg += 'Camera permission denied. Please allow camera access in your browser settings.';
            } else if (err.name === 'NotFoundError') {
                errorMsg += 'No camera found on this device.';
            } else if (err.name === 'NotReadableError') {
                errorMsg += 'Camera is already in use by another application.';
            } else {
                errorMsg += `${err.message}`;
            }
            
            classificationResult.textContent = errorMsg;
            classificationResult.style.color = '#d32f2f';
            captureButton.disabled = true;
        }
    }

    // Capture image from webcam
    captureButton.addEventListener('click', () => {
        if (!stream) {
            console.error("Webcam stream not available.");
            classificationResult.textContent = 'Webcam not available.';
            classificationResult.style.color = '#d32f2f';
            return;
        }

        // Check if video is playing
        if (video.paused) {
            classificationResult.textContent = 'Video is not playing. Retrying...';
            classificationResult.style.color = '#1976d2';
            initWebcam();
            return;
        }

        // Draw the current video frame onto the canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data from the canvas
        const imageDataUrl = canvas.toDataURL('image/png');

        // Display the captured image
        capturedImage.src = imageDataUrl;
        capturedImage.style.display = 'block';
        video.style.display = 'none';

        console.log("Image captured. Sending to backend...");
        classificationResult.textContent = 'Analyzing... Please wait.';
        classificationResult.style.color = '#1976d2';
        classificationResult.classList.add('loading');
        detailsResult.textContent = '';
        captureButton.disabled = true;

        // Send image data to the backend
        sendImageToBackend(imageDataUrl);
    });

    // Function to send image data to the backend
    async function sendImageToBackend(imageDataUrl) {
        try {
            const response = await fetch('/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image_data: imageDataUrl })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
                throw new Error(`Server error: ${response.status} - ${errorData.error || response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Display results
            classificationResult.textContent = `Classification: ${data.classification}`;
            classificationResult.style.color = '#4CAF50';
            classificationResult.classList.remove('loading');
            detailsResult.textContent = `Details: ${data.details}`;

        } catch (error) {
            console.error('Error sending image or processing response:', error);
            classificationResult.textContent = 'Analysis failed.';
            classificationResult.style.color = '#d32f2f';
            classificationResult.classList.remove('loading');
            detailsResult.textContent = `Error: ${error.message}`;
        } finally {
            captureButton.disabled = false;
        }
    }

    // Helper function to get CSRF token (needed for POST requests in Django)
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Initialize webcam on page load
    captureButton.disabled = true; // Disabled until webcam is ready
    initWebcam();
});
