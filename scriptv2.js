let mediaRecorder;

let audioChunks = [];
const heartContainer = document.getElementById('heartContainer');
let isRecording = false;

function speakQuestion() {
    const speech = new SpeechSynthesisUtterance();
    speech.text = "Hello, I'm your health and wellness ally, and I'm here to help you take control of your health and health information. First I'd like to know your name and date of birth.";
    speech.lang = 'en-US'; // Set the language
    window.speechSynthesis.speak(speech); // Speak the text
}





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
            let soundDetected = false;

            function startRecording() {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                console.log('Recording started');
                isRecording = true;

                
                //audioChunks = []; // Clear previous audio chunks
                soundDetected = false; // Reset sound detection for the new recording

                mediaRecorder.ondataavailable = function(event) {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data); // Collect the audio data
                    }
                };

                mediaRecorder.onstop = function() {
                    console.log('Recording stopped.');
                    heartContainer.style.animationPlayState = 'paused'; // Stop heart animation
                    isRecording = false;

                    // Process the recorded audio
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    //const audioElement = new Audio(audioUrl);
                    //audioElement.play();

                    // Remove any previous download link if it exists
                    const existingLink = document.getElementById('compiledAudioLink');
                    if (existingLink) {
                        existingLink.remove();
                    }
                    
                    const downloadLink = document.createElement('a');
                    downloadLink.id = 'compiledAudioLink'; // Identify this link for future reference
                    downloadLink.href = audioUrl;
                    downloadLink.download = 'recorded_audio.webm';
                    downloadLink.textContent = 'Download recorded audio';
                    document.body.appendChild(downloadLink);
                   

                    // Start a new recording automatically
                    startRecording();
                    
                };
            }

            function detectSilence() {
                analyser.getByteFrequencyData(dataArray);
                const sum = dataArray.reduce((a, b) => a + b, 0);
                const averageVolume = sum / dataArray.length;

                // Check for silence

                if (averageVolume < 10) { // Arbitrary silence threshold
                    if (!silenceStart) {
                        silenceStart = Date.now(); // Mark the start of silence
                    } else {
                    // Calculate the total silent duration
                    const durationSilence = Date.now() - silenceStart;
                    console.log(`Silence duration: ${durationSilence} ms`);

                        if (durationSilence >= silenceDurationThreshold) {
                            // Stop the recording and show the downloadable link if silence exceeds 5 seconds
                            if (mediaRecorder && isRecording) {
                                mediaRecorder.stop();
                                console.log('Stopped due to silence');

                                 // Instead of playing a pre-saved audio, use the voice synthesis
                                speakQuestion(); // Call the function to speak the question

                                // Show completion message
                                const completionMessage = document.createElement('p');
                                completionMessage.textContent = 'Step of conversation completed';
                                document.body.appendChild(completionMessage);
                }
                // Reset silence tracking
                silenceStart = null; // Reset to prepare for the next detection
            }
        }
                } else {
                    silenceStart = null;
                    clearTimeout(silenceTimeoutId);

                    if (!soundDetected || (soundDetected && !isRecording)) { // Start heart animation only on first detection and also on next iterations
                        soundDetected = true;
                        console.log('Sound detected, heart starts bumping!');
                        heartContainer.style.animationPlayState = 'running'; // Start heart animation
                    }
                }

                requestAnimationFrame(detectSilence);
            }


            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = function(event) {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            transcript += event.results[i][0].transcript.trim() + ' ';
                        }
                    }

                    if (transcript) {
                        console.log('Recognized words:', transcript);

                        // If "stop" command is detected, stop recording
                        //if (transcript.toLowerCase().includes('stop')) {
                        //    if (isRecording) {
                        //        mediaRecorder.stop(); // This will call the onstop event to save the compiled file
                        //        istoSavefinalFile = true
                        //        console.log('Recording stopped by user command.');
                        //    }
                       // }
                        
                    }
                };

                recognition.onerror = function(event) {
                    console.error('Speech recognition error:', event.error);
                };

                recognition.start();
            } else {
                console.error('SpeechRecognition API is not supported in this browser.');
            }


            detectSilence();

            // Start the first recording
            startRecording();
            // Set up SpeechRecognition API

            
        }).catch(function(err) {
            console.error('Error accessing microphone:', err);
        });
    } else {
        console.error('getUserMedia not supported on your browser!');
    }
};
