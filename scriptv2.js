window.onload = function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.fftSize);
            let silenceStart = null;
            let silenceTimeoutId;
            const silenceDurationThreshold = 5000; // 5 seconds threshold
            let mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            console.log('Recording started');

            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    const audioChunks = [];
                    audioChunks.push(event.data);
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    // Handle audio blob (e.g., upload or playback)
                }
            };

            mediaRecorder.onstop = function() {
                console.log('Recording stopped due to silence.');
                // Additional actions after stop
            };

            function detectSilence() {
                analyser.getByteFrequencyData(dataArray);
                const sum = dataArray.reduce((a, b) => a + b, 0);
                const averageVolume = sum / dataArray.length;
                
                if (averageVolume < 10) { // Arbitrary silence threshold
                    if (!silenceStart) {
                        silenceStart = Date.now();
                        silenceTimeoutId = setTimeout(() => {
                            mediaRecorder.stop();
                        }, silenceDurationThreshold);
                    }
                } else {
                    silenceStart = null;
                    clearTimeout(silenceTimeoutId);
                }
                
                requestAnimationFrame(detectSilence);
            }

            detectSilence();

        }).catch(function(err) {
            console.error('Error accessing microphone:', err);
        });
    } else {
        console.error('getUserMedia not supported on your browser!');
    }
};
