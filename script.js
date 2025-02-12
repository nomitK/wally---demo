let mediaRecorder;
let audioChunks = [];
let silenceTimeout;
let silenceInterval;
const SILENCE_THRESHOLD = 10000; // 10 segundos

const silenceCounterDisplay = document.getElementById('silenceCounter');
const countDisplay = document.getElementById('count');

// Verifique se a API SpeechRecognition está disponível
//const SpeechRecognition = window.SpeechRecognition || window.webkit.SpeechRecognition;
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent


if (SpeechRecognition) {
  statusMessage.innerText = "SpeechRecognition está disponível. Você pode usar comandos de voz."; // Mensagem de sucesso
  var recognition = new SpeechRecognition();
  recognition.interimResults = true; 

  const heartContainer = document.getElementById('heartContainer');

  // Função para começar a gravação
  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
                    clearTimeout(silenceTimeout); // Limpa o timeout ao receber dados
                    clearInterval(silenceInterval); // Limpa o contador de silêncio
                    silenceCounterDisplay.style.display = 'none'; // Oculta o contador

         silenceTimeout = setTimeout(stopRecording, SILENCE_THRESHOLD); // Para a gravação após 10 segundos 
        };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('audioPlayback').src = audioUrl;
        document.getElementById('audioPlayback').style.display = 'block';

         // Criar um link para download
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = audioUrl;
        downloadLink.download = 'gravacao.wav';
        downloadLink.innerText = 'Baixar Gravação';
        downloadLink.style.display = 'block';

        audioChunks = []; // Limpar os chunks após a gravação
        heartContainer.style.animationPlayState = 'paused'; // Para a animação do coração
      };

        mediaRecorder.start();
        document.getElementById('stopButton').disabled = false;
        heartContainer.style.animationPlayState = 'running'; // Inicia a animação do coração


                // Contador de silêncio
                silenceInterval = setInterval(() => {
                    countDisplay.textContent = parseInt(countDisplay.textContent) + 1; // Incrementa o contador
                    silenceCounterDisplay.style.display = 'block'; // Mostra o contador
                }, 1000); // Incrementa a cada segundo
            })
        .catch(err => console.error('Erro ao acessar o microfone: ', err));
      }



    function stopRecording() {
        mediaRecorder.stop();
        clearTimeout(silenceTimeout); // Limpa o tempo limite de silêncio
        clearInterval(silenceInterval); // Para o incremento do contador
        silenceCounterDisplay.style.display = 'none'; // Oculta o contador
        document.getElementById('stopButton').disabled = true;
        heartContainer.style.animationPlayState = 'paused'; // Para a animação do coração
    }



  
    recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log(transcript); // Para depuração

    if (transcript.includes('inner')) {
                    startRecording(); // Chama a função para iniciar a gravação se "inner" for detectada
      } else if (transcript.includes('stop')) {
            stopRecording(); // Para a gravação se "stop" for dita
    }
    };


   recognition.onerror = (event) => {
      console.error('Erro de reconhecimento: ', event.error);
    };

    recognition.onend = () => {
      recognition.start(); // Reinicia o reconhecimento após terminar
    };

  recognition.start(); // Inicia o reconhecimento quando a página carrega

} else {
  console.error("SpeechRecognition não suportado neste navegador.");
   alert("Desculpe, esta funcionalidade de reconhecimento de voz não é suportada pelo seu navegador.");
}
