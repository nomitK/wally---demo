window.onload = function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512; // Set the FFT size for analyzing frequencies

            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.fftSize);
            let mediaRecorder;
            let isRecording = false;

            function detectSound() {
                analyser.getByteFrequencyData(dataArray);
                const sum = dataArray.reduce((a, b) => a + b, 0);
                const averageVolume = sum / dataArray.length;

                if (!isRecording && averageVolume > 30) { // Arbitrary threshold
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
                    isRecording = true;
                    console.log('Recording started due to sound');
                }
                
                if (isRecording) {
                    mediaRecorder.ondataavailable = function(event) {
                        if (event.data.size > 0) {
                            const audioChunks = [];
                            audioChunks.push(event.data);

                            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                            // Handle audio blob (e.g., upload or playback)
                        }
                    };

                    mediaRecorder.onstop = function() {
                        console.log('Recording stopped');
                        isRecording = false;
                    };
                }

                requestAnimationFrame(detectSound); // Continuously run the detection loop
            }

            detectSound(); // Start detecting sound
    
        }).catch(function(err) {
            console.error('Error accessing microphone:', err);
        });
    } else {
        console.error('getUserMedia not supported on your browser!');
    }
};
