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
let stream; // Declare 'stream' globally for broader accessibility
let numberRecordings = 0;
let finalizeSession = false;
let speechRecognition; // Declare for speech recognizer variable
// Variables related to audio context
let analyser; // Declare here
let dataArray;
const silenceDurationThreshold = 4000; // Silence condition


//GLOBAL FUNCTIONS
//FUNCTION 1: MOCK QUESTIONS
function speakQuestion1() {
    if (isRecording) {
        mediaRecorder.stop(); // Stop recording before speaking
        console.log('Stopped recording for speech synthesis');
    }

    const speech = new SpeechSynthesisUtterance();
    if (numberRecordings === 1) { 
        speech.text = "Hello, I'm your health and wellness ally, and I'm here to help you take control of your health and health information. First, I'd like to know your name and date of birth.";
        speech.lang = 'en-US';
    } 
    else if (numberRecordings === 2) { 
        speech.text = "Great! Now I want to know more about you! How is your level of stress doing, scale it from 1 to 10. What about your sleeping habits?";
        speech.lang = 'en-US';
    } 
    else if (numberRecordings === 3) { 
        speech.text = "I see that you are doing great! Keeping the level of stress controled and having good slepping time is great. what about sports this week?";
        speech.lang = 'en-US';
    } 
    else if (numberRecordings === 4) { 
        speech.text = "I see! This is clearly an area with room for improvement. Lets target to practive sports at least three times next week! Anything else you'd like me to know about your health and wellness?";
        speech.lang = 'en-US';
    }     
    else if (numberRecordings === 5) { 
        speech.text = "That it something that requires your attention. High coholesterol is clearly something you should take immediate action. Are you doing any specific diet?";
        speech.lang = 'en-US';
    }             
    else {
        speech.text = "So, wraping up todays conversation. You should aim to be more active next week, and ideally avoid night snacking and alchool. I'll talk you later this week, hoping that you are making progress on your goals! See ya, and Be-Healthy!";
        speech.lang = 'en-US';
        finalizeSession = true
        heartContainer.style.animationPlayState = 'paused';
    }
    

    // Flag to indicate speaking in progress
    isSpeaking = true; 
    heartContainer.style.animationPlayState = 'paused'; // Stop heart animation

    // Setup event listener for when speaking ends
    speech.onend = function() {
        isSpeaking = false; // Reset speaking flag
        if (finalizeSession === false) {
            console.log('Speech synthesis finished. Resuming recording...');
            heartContainer.style.animationPlayState = 'running'; // Resume heart animation
            startRecording(stream); // Resume recording after speaking
        }
    };

    window.speechSynthesis.speak(speech); // Execute the text-to-speech
}

//FUNCTION 2: DETECT SILENCE
function detectSilence() {
if (finalizeSession === false) {
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
                    //completionMessage.textContent = 'Step of conversation completed';
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
else {
console.log("done!!")
}
}


//FUNCTION 3: INITIATE SPEECH RECOGNITION
function initializeSpeechRecognition() {
  if (finalizeSession === false) {  
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
else {
console.log("done!!")
}
}


// Function to recognize speech from the recorded audio blob
function recognizeSpeech(audioBlob) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false; // Stop recognizing after the first result
    recognition.interimResults = false; // Don't return interim results

    // Create a URL for the audio and use it in a new Audio element
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioToPlay = new Audio(audioUrl);

    // Play the recorded audio for the user to hear
    audioToPlay.play();

    recognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript.trim() + ' ';
            }
        }

        if (transcript) {
            console.log('Recognized words:', transcript);

            // Process the transcript and define the next question
            processTranscript(transcript);
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };

    // Start the recognition process using the audio input
    recognition.start();

    // Use a Blob URL for the audio source in the SpeechRecognition API
    audioToPlay.src = audioUrl;
}



function startRecording(stream) {
 if (finalizeSession === false) {  
    numberRecordings++
    console.log('Recording started');
    console.log('Number of recordings',numberRecordings);
    
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
//        if (finalizeSession = true) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            recognizeSpeech(audioBlob); // Call function to convert audio to text
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
 //       }
        // this a test
        isRecording = true
        // Start a new recording automatically
        //startRecording();
        
    };
}
else {
console.log("done!!")
}
}


//FUNCTION 3: WHAT HAPPENS ON PAGE LOAD

window.onload = function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(userStream) {
            stream = userStream; // Save the stream for reuse

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            source.connect(analyser);
            dataArray = new Uint8Array(analyser.fftSize); // Analysis

            if (finalizeSession === false) {
                detectSilence();
                initializeSpeechRecognition();

                // Start the initial recording
                startRecording(stream);
            } else {
                heartContainer.style.animationPlayState = 'paused';
            }

        }).catch(function(err) {
            console.error('Error accessing microphone:', err);
        });
    } else {
        console.error('getUserMedia not supported in this browser!');
    }
};
