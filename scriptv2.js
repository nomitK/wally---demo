/***************************************************************************************************************************************************************************************************************************************************/
/***--                                                                                                                LEARNINGS                                                                                                                --***/
/***************************************************************************************************************************************************************************************************************************************************/

//1: NAVIGATOR OBJECT
//This is a built-in object in the browser that provides information about the web browser and the operating system. It is part of the Window interface.

//2: NAVIGATOR.MEDIADEVICES
//This is a property of the navigator object that provides access to the MediaDevices interface, which is responsible for managing 
//media devices such as cameras and microphones.


//3: NAVIGATOR.MEDIADEVICES.GETUSERMEDIA
//This is a method provided by the MediaDevices interface. It prompts the user for permission to use a media input (like a microphone or camera) 
//and returns a promise that resolves to a MediaStream object if the permission is granted.


//4: STREAM PARAMETER
//The stream parameter is an instance of the MediaStream object, which represents the media stream from the user's device.
//This object contains the audio (or video, if requested) tracks that you can work with, such as playing back the audio or sending it to a server.

//5:Dynamics of .then() and .catch()
//The .catch(function(err) {}) method is associated with the preceding .then(function(stream) {...}) as part of the Promise handling mechanism in JavaScript. 
//Here’s how it works and its significance:
//Promise Structure:

//When you call a function that returns a Promise (like navigator.mediaDevices.getUserMedia()), it can be in one of three states:
//Pending: The initial state, neither fulfilled nor rejected.
//Fulfilled: The operation completed successfully.
//Rejected: The operation failed (an error occurred).


//Using .then():
//The .then() method is used to specify what should happen when the Promise is fulfilled (i.e., when the asynchronous operation completes successfully).
//When you use .then(), you can pass in a callback function that will execute with the result of the fulfilled Promise—in this case, the stream object.

//Using .catch():
//The .catch() method is used to handle any errors that occur during the execution of the Promise.
//If the Promise is rejected (i.e., if there is an error, such as the user denying permission to access the microphone), the callback function inside .catch() will execute


//6: requestAnimationFrame
//The requestAnimationFrame(detectSilence) function in JavaScript is a method that tells the browser to perform an animation or execute a function that updates the animation before the next repaint. 


//GLOBAL VARIABLES
let mediaRecorder;
let audioChunks = [];
const heartContainer = document.getElementById('heartContainer');
let isRecording = false;
let messageDisplayed = false; // Flag for completion message
let soundDetected = false; // Flag to indicate sound detection
let silenceStart = null; // Reset silence start time
let silenceTimeoutId;
let isSpeaking = false; // Flag to indicate if speech synthesis is in progress

// Variables related to audio context
let analyser; // Declare here
let dataArray;
const silenceDurationThreshold = 5000; // Silence condition


//GLOBAL FUNCTIONS
//FUNCTION 1: MOCK QUESTIONS
function speakQuestion1() {
    //The heart should stop pumoing when the assistant is talking (in the future we should add a second image that will illustrate that the assistant is talking
    heartContainer.style.animationPlayState = 'paused'; // Stop heart animation
    const speech = new SpeechSynthesisUtterance();
    speech.text = "Hello, I'm your health and wellness ally, and I'm here to help you take control of your health and health information. First, I'd like to know your name and date of birth.";
    speech.lang = 'en-US';

    // Set the flag before speaking
    isSpeaking = true; 

    // Reset the flag after speaking ends
    speech.onend = function() {
        console.log('Speech synthesis finished. Resuming recording...');
        isSpeaking = false; // Reset flag when speaking ends
    };

    window.speechSynthesis.speak(speech); // Speak the text
}


//FUNCTION 2: DETECT SILENCE
function detectSilence() {

    if (isSpeaking) {
        // Skip silent detection while speaking
        requestAnimationFrame(detectSilence); // Keep calling this function
        return; // Exit the function to prevent further processing
    }
    
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
        //console.log(`Silence duration: ${durationSilence} ms`);
    
            if (durationSilence >= silenceDurationThreshold) {
                // Stop the recording and show the downloadable link if silence exceeds 5 seconds
                console.log(`Stop recording - speech initiated`);
                console.log(mediaRecorder);
                console.log(isRecording);
                if (mediaRecorder && isRecording) {
                    mediaRecorder.stop();
                    console.log('Stopped due to silence');
    
                     // Instead of playing a pre-saved audio, use the voice synthesis
                    speakQuestion1(); // Call the function to speak the question
    
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

//FUNCTION 3: INITIATE SPEECH RECOGNITION
function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true; // Provide interim results
        
        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript.trim() + ' ';
                }
            }

            if (transcript) {
                console.log('Recognized words:', transcript);
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };

        recognition.start(); // Start recognition
    } else {
        console.error('SpeechRecognition API is not supported in this browser.');
    }
}


function startRecording(stream) {
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
        //startRecording();
        
    };
}


//FUNCTION 3: WHAT HAPPENS ON PAGE LOAD

window.onload = function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser(); // Initialize analyser
            analyser.fftSize = 256;

            source.connect(analyser);

            dataArray = new Uint8Array(analyser.fftSize); // Initialize dataArray to hold audio data

            // Start recording and detecting silence
            startRecording(stream);   // Call function to start recording
            detectSilence();          // Start detecting silence
            initializeSpeechRecognition(); // Set up speech recognition
        }).catch(function(err) {
            console.error('Error accessing microphone:', err);
        });
    } else {
        console.error('getUserMedia not supported on your browser!');
    }
};
