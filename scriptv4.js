//Botao 1: Gerar a questao inicial com base num Json file
        async function callGenerativeAI(prompt) {
            const apiKey = 'AIzaSyCdrUb7yvO2XHAfM1IoQWFcOthyAqKZLyg'; // Substitua pela sua chave da API
            const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/{model=models/*}:generateContent'; // URL do endpoint da API

            const requestData = {
                model: "gemini-1.5-flash", // Nome do modelo
                prompt: prompt,
                maxTokens: 50,
                temperature: 0.7,
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`Erro: ${response.statusText}`);
                }

                const result = await response.json();
                return result.response.text; // Ajuste conforme o formato de resposta
            } catch (error) {
                console.error('Erro ao chamar a API:', error);
                throw error; // Rethrow ou handle error como necessário
            }
        }

        document.getElementById('generateButton').onclick = async function() {
            const prompt = "Explain how AI works"; // O prompt que você quer usar
            try {
                const result = await callGenerativeAI(prompt);
                document.getElementById('result').innerText = result; // Mostra o resultado na página
            } catch (error) {
                document.getElementById('result').innerText = 'Erro ao gerar a resposta.';
            }
        };

/* async function loadJSONFile(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Erro ao carregar o arquivo JSON: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

async function generateInitialQuestion(inputData) {
    const apiKey = 'AIzaSyCdrUb7yvO2XHAfM1IoQWFcOthyAqKZLyg'; // Substitua pela sua chave da API
    const apiUrl = `https://YOUR_ENDPOINT_URL`; // Substitua pelo endpoint correto

    const requestData = {
        prompt: inputData.prompt, // Exemplo de prompt, ajuste conforme necessário
        maxTokens: 50, // Quantidade máxima de tokens a serem gerados
        temperature: 0.7 // Controle da aleatoriedade na geração
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        throw new Error(`Erro ao chamar a API: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text; // Ajuste conforme o formato de resposta da API
}

document.getElementById('askInitialQuestion').onclick = async function() {

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCdrUb7yvO2XHAfM1IoQWFcOthyAqKZLyg");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());
  * /  
//    try {
//        const jsonData = await loadJSONFile('data.json'); // Substitua pelo caminho do seu arquivo JSON
//        const initialQuestion = await generateInitialQuestion(jsonData);
//        console.log('Pergunta Inicial:', initialQuestion);
//        document.getElementById('statusMessage').innerText = initialQuestion; // Exibir a pergunta na mensagem de status
//    } catch (error) {
//        console.error('Erro:', error);
//        document.getElementById('statusMessage').innerText = 'Erro ao gerar a pergunta.';
//    }
};
