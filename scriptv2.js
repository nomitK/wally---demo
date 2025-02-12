let mediaRecorder;
let audioChunks = [];

const heartContainer = document.getElementById('heartContainer');

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
            heartContainer.style.animationPlayState = 'running'; // Start heart animation

            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                    
                }
            };

            mediaRecorder.onstop = function() {
                console.log('Recording stopped due to silence.');
                // Create a blob from the audio chunks
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Create a new audio element to play back the recording
                const audioElement = new Audio(audioUrl);
                audioElement.play(); // Play the recorded audio

                // Optionally, create a download link
                const downloadLink = document.createElement('a');
                downloadLink.href = audioUrl;
                downloadLink.download = 'recorded_audio.webm';
                downloadLink.textContent = 'Download recorded audio';
                document.body.appendChild(downloadLink);                
                heartContainer.style.animationPlayState = 'paused'; // Para a animação do coração
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

           // Set up the SpeechRecognition API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true; // Keep listening even after speaking
                recognition.interimResults = true; // Support interim results for quicker feedback

                recognition.onresult = function(event) {
                    let transcript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            transcript += event.results[i][0].transcript.trim() + ' ';
                        }
                    }

                    if (transcript) {
                        console.log('Recognized words:', transcript); // Log recognized words to console
                    }
                };

                recognition.onerror = function(event) {
                    console.error('Speech recognition error:', event.error);
                };

                recognition.start(); // Start the recognition
            } else {
                console.error('SpeechRecognition API is not supported in this browser.');
            }            

        }).catch(function(err) {
            console.error('Error accessing microphone:', err);
        });
    } else {
        console.error('getUserMedia not supported on your browser!');
    }
};
