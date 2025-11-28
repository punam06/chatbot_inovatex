document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const capturedImage = document.getElementById('captured-image');
    const captureButton = document.getElementById('capture-btn');
    const classificationResult = document.getElementById('classification');
    const detailsResult = document.getElementById('details');
    const resultsDiv = document.getElementById('results');

    let stream = null;

    // Access the webcam with better error handling
    async function initWebcam() {
        try {
            // Request camera with specific constraints
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                console.log("Webcam access granted and playing.");
            };
            video.style.display = 'block';
            capturedImage.style.display = 'none';
            captureButton.disabled = false;
            classificationResult.textContent = '';
        } catch (err) {
            console.error("Error accessing webcam: ", err);
            let errorMsg = 'Error accessing webcam. ';
            if (err.name === 'NotAllowedError') {
                errorMsg += 'Permission denied. Please allow camera access.';
            } else if (err.name === 'NotFoundError') {
                errorMsg += 'No camera found on this device.';
            } else if (err.name === 'NotReadableError') {
                errorMsg += 'Camera is already in use by another application.';
            } else {
                errorMsg += err.message;
            }
            classificationResult.textContent = errorMsg;
            captureButton.disabled = true;
        }
    }

    // Capture image from webcam
    captureButton.addEventListener('click', async () => {
        if (!stream || !video.srcObject) {
            console.error("Webcam stream not available.");
            classificationResult.textContent = 'Webcam not available. Please refresh and allow camera access.';
            return;
        }

        try {
            // Wait for video to be ready
            if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                console.warn("Video not ready yet");
                classificationResult.textContent = 'Webcam loading... Please wait.';
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
            detailsResult.textContent = '';

            // Send image data to the backend
            await sendImageToBackend(imageDataUrl);
        } catch (error) {
            console.error('Error during capture:', error);
            classificationResult.textContent = 'Capture failed: ' + error.message;
        }
    });

    // Function to send image data to the backend
    async function sendImageToBackend(imageDataUrl) {
        try {
            const analyzeUrl = window.location.origin + '/analyze/';
            console.log("Sending to:", analyzeUrl);
            
            const response = await fetch(analyzeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image_data: imageDataUrl })
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
                throw new Error(`Server error: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Display results
            classificationResult.textContent = `Classification: ${data.classification}`;
            detailsResult.textContent = `Details: ${data.details}`;

        } catch (error) {
            console.error('Error sending image or processing response:', error);
            classificationResult.textContent = 'Analysis failed.';
            detailsResult.textContent = `Error: ${error.message}`;
        }
    }

    // Initialize webcam on page load
    initWebcam();
});
