document.addEventListener('DOMContentLoaded', function() {
        const sidebar = document.querySelector('.sidebar');
        const maincont = document.querySelector('.main-container');
        const backBtn = document.querySelector('.back-btn');
        loadingDiv.style.display = 'none';
        backBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    });
// JavaScript để chuyển đổi giữa các tab
document.getElementById('text-tab').addEventListener('click', function() {
    document.getElementById('document-container').style.display = 'none';
    document.getElementById('text-container').style.display = 'block';

    // Cập nhật trạng thái tab
    this.classList.add('active');
    document.getElementById('document-tab').classList.remove('active');
});

document.getElementById('document-tab').addEventListener('click', function() {
    document.getElementById('document-container').style.display = 'block';
    document.getElementById('text-container').style.display = 'none';

    // Cập nhật trạng thái tab
    this.classList.add('active');
    document.getElementById('text-tab').classList.remove('active');
});


// Thay YOUR_API_KEY_HERE bằng API key của bạn
const OPENAI_API_KEY = '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';
        
let userAnswers = [];
let quizData = [];
let currentQuestion = 0;
let score = 0;
let answered = false;

const quiz = document.getElementById('quiz');
const submitBtn = document.getElementById('submit-btn');
const resultDiv = document.getElementById('result');
const generateBtn = document.getElementById('quizz-generate');
const inputSection = document.getElementById('text-input');
const quizSection = document.getElementById('quiz-section');
const loadingDiv = document.getElementById('loading');
const textTab = document.getElementById('text-tab');
const documentTab = document.getElementById('document-tab');
const reminder = document.getElementById('reminder');
let isReviewing = false;
const prevBtn = document.createElement('button');
const nextBtn = document.createElement('button');
const quizCount = document.getElementById('quiz-count').value;
const quizLanguage = document.getElementById('quiz-language').value;

document.getElementById('quiz-count').addEventListener('change', (event) => {
    console.log('Số lượng câu hỏi:', event.target.value);
});

document.getElementById('quiz-language').addEventListener('change', (event) => {
    console.log('Ngôn ngữ câu hỏi:', event.target.value);
});

function initializeQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    submitBtn.style.display = 'block';
    submitBtn.textContent = 'Trả lời';
    resultDiv.innerHTML = '';
    userAnswers = [];
    currentQuestion = 0;
    score = 0;
    answered = false;
}



async function generateQuestions() {
    const documentContent = document.getElementById('text-input').value;
    const quizCount = document.getElementById('quiz-count').value;
    const quizLanguage = document.getElementById('quiz-language').value;

    if (!documentContent.trim()) {
        alert('Enter your document.');
        return;
    }
    loadingDiv.style.display = 'block';
    inputSection.style.display = 'none';
    textTab.style.display = 'none';
    reminder.style.display = 'none';
    documentTab.style.display = 'none';
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-0125",
                messages: [{
                    role: "user",
                    content: `Based on the following document, create ${quizCount} multiple choice questions with 4 possible answers for each question. The questions and answers should be in ${quizLanguage}. The returned JSON format should be in the form:
                    - Make sure to double check questions and answers to always have correct solution.
                    {
                        "questions": [
                            {
                                "question": "Question",
                                "options": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
                                "correct": 0
                            }
                        ]
                    }
                    
                    Document: ${documentContent}`
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate questions');
        }

        const data = await response.json();
        try {
            quizData = JSON.parse(data.choices[0].message.content).questions;
        } catch (e) {
            console.error('Error parsing questions:', e);
            throw new Error('Invalid response format');
        }

        loadingDiv.style.display = 'none';
        quizSection.style.display = 'block';
        initializeQuiz();
        showQuestion();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating questions. Please try again!');
        loadingDiv.style.display = 'none';
        inputSection.style.display = 'block';
    }
}

function showQuestion() {
    document.getElementById('current-question').textContent = currentQuestion + 1;
    document.getElementById('total-questions').textContent = quizData.length;
    updateProgressBar();
    
    const questionData = quizData[currentQuestion];
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');

    const userAnswer = userAnswers[currentQuestion];
    const isAnswered = userAnswer !== undefined;

    questionDiv.innerHTML = `
        <h2>${questionData.question}</h2>
        <div class="options">
            ${questionData.options.map((option, index) => `
                <div class="option 
                    ${isAnswered ? (index === questionData.correct ? 'correct' : 
                                  index === userAnswer.selected ? 'wrong' : '') : ''}
                    ${isAnswered ? 'disabled' : ''}"
                    data-index="${index}">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;

    quiz.innerHTML = '';
    quiz.appendChild(questionDiv);

    // Thêm dòng này
    if (!document.querySelector('.nav-btn')) {
        setupNavigationButtons();
    }

    if (!isReviewing && !isAnswered) {
        submitBtn.style.display = 'block';
        submitBtn.textContent = 'Submit';

        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => selectOption(option));
        });
    } else {
        submitBtn.style.display = 'none';
    }
}

function selectOption(selected) {
    if (userAnswers[currentQuestion] !== undefined) return;
    
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    selected.classList.add('selected');
}

function updateProgressBar() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
}

function showResult() {
    const percentage = (score / quizData.length) * 100;
    let message = '';
    if (percentage >= 80) {
        message = 'Excellent! 🎉';
    } else if (percentage >= 60) {
        message = 'Very Well! 👍';
    } else {
        message = 'Keep Trying! 💪';
    }

    resultDiv.innerHTML = `
        <div class="result-score">${score}/${quizData.length}</div>
        <div class="result-message">${message}</div>
        <div class="result-percentage">${percentage}%</div>
        <button id="review-btn" class="review-btn">Review</button>
        <button id="reset-btn" class="reset-btn">Generate Again</button>
    `;
    
    // Thêm event listeners cho các nút
    document.getElementById('review-btn').addEventListener('click', startReview);
    document.getElementById('reset-btn').addEventListener('click', resetQuiz);
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    generateBtn.style.display = 'none';
    submitBtn.style.display = 'none';
}

function startReview() {
    isReviewing = true;
    currentQuestion = 0;
    showQuestion();
    submitBtn.style.display = 'none';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.style.display = 'block');
    const reviewButton = document.getElementById("review-btn");
    reviewButton.style.display = 'none';
    const resetButton = document.getElementById("reset-btn");
    resetButton.style.left = "50%";
}

function updateNavigationButtons() {
    prevBtn.style.visibility = currentQuestion === 0 ? 'hidden' : 'visible';
    nextBtn.style.visibility = currentQuestion === quizData.length - 1 ? 'hidden' : 'visible';
    generateBtn.style.display = 'none';
}

function setupNavigationButtons() {
    prevBtn.innerHTML = '&larr;';
    nextBtn.innerHTML = '&rarr;';
    prevBtn.className = 'nav-btn prev-btn';
    nextBtn.className = 'nav-btn next-btn';
    
    const quizContainer = document.getElementById('quiz');
    quizContainer.appendChild(prevBtn);
    quizContainer.appendChild(nextBtn);
    
    prevBtn.onclick = () => navigateQuestion(-1);
    nextBtn.onclick = () => navigateQuestion(1);
    updateNavigationButtons();
    generateBtn.style.display = 'none';
}



function navigateQuestion(direction) {
        currentQuestion = Math.max(0, Math.min(quizData.length - 1, currentQuestion + direction));
        showQuestion();
        updateNavigationButtons();
        generateBtn.style.display = 'none';
    
}

function checkAnswer() {
    const selected = document.querySelector('.option.selected');
    if (!selected && currentQuestion < quizData.length) {
        alert('Vui lòng chọn một đáp án!');
        return;
    }

    answered = true;
    const selectedIndex = parseInt(selected.dataset.index);
    const correct = quizData[currentQuestion].correct;

    userAnswers[currentQuestion] = {
        selected: selectedIndex,
        correct: correct
    };

    if (selectedIndex === correct) {
        score++;
        selected.classList.add('correct');
    } else {
        selected.classList.add('wrong');
        document.querySelectorAll('.option')[correct].classList.add('correct');
    }

    currentQuestion++;
    
    if (currentQuestion < quizData.length) {
        submitBtn.textContent = 'Next Question';
    } else {
        submitBtn.textContent = 'Finish';
    }
}

function nextQuestion() {
    if (currentQuestion < quizData.length) {
        answered = false;
        showQuestion();
        submitBtn.textContent = 'Submit';
    } else {
        showResult();
    }
}

function resetQuiz() {
    inputSection.style.display = 'block';
    quizSection.style.display = 'none';
    resultDiv.innerHTML = '';
    document.getElementById('text-input').value = '';
    inputSection.style.display = 'block';
    textTab.style.display = 'block';
    reminder.style.display = 'block';
    generateBtn.style.display = 'block';
    documentTab.style.display = 'block';
    isReviewing = false;
}

generateBtn.addEventListener('click', generateQuestions);

submitBtn.addEventListener('click', () => {
    if (!answered) {
        checkAnswer();
    } else {
        nextQuestion();
    }
});

// First, add PDF.js library to your HTML
document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(script);
});

// PDF handling and quiz generation code
let quizData2 = [];
let currentQuestion2 = 0;
let score2 = 0;
let answered2 = false;
let isReviewing2 = false;
const prevBtn2 = document.createElement('button');
const nextBtn2 = document.createElement('button');

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// File handling setup
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const errorMessage = document.getElementById('error-message');
const loadingDiv2 = document.getElementById('loading2');
const generateBtn2 = document.getElementById('quizz-generate2');
const quizSection2 = document.getElementById('quiz-section2');

dropArea.addEventListener('click', function(e) {
    fileInput.click(); // Trigger click event trên input file
    e.preventDefault(); // Ngăn chặn hành vi mặc định
});

// Ngăn chặn sự kiện click lan truyền từ input file
fileInput.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Drag and drop handlers
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFileSelect, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
            displayFileInfo(file);
            errorMessage.textContent = '';
        } else {
            errorMessage.textContent = 'Please upload a PDF file.';
            fileInfo.textContent = '';
        }
    }
}

function displayFileInfo(file) {
    fileInfo.textContent = `File: ${file.name} (${formatFileSize(file.size)})`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

// Quiz generation and handling functions
function initializeQuiz2() {
    currentQuestion2 = 0;
    score2 = 0;
    answered2 = false;
    const submitBtn2 = document.getElementById('submit-btn2');
    submitBtn2.style.display = 'block';
    submitBtn2.textContent = 'Submit';
    document.getElementById('result2').innerHTML = '';
}

async function generateQuestionsFromPDF() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a PDF file.');
        return;
    }

    const file = fileInput.files[0];
    loadingDiv2.style.display = 'block';
    generateBtn2.style.display = 'none';

    try {
        const extractedText = await extractTextFromPDF(file);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-0125",
                messages: [{
                    role: "user",
                    content: `Based on the following document, create 3 multiple choice questions with 4 possible answers for each question. You must create questions and answers base on document's language. The returned JSON format should be in the form:
                    {
                        "questions": [
                            {
                                "question": "Question",
                                "options": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
                                "correct": 0
                            }
                        ]
                    }
                    
                    Document: ${extractedText}`
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate questions');
        }

        const data = await response.json();
        quizData2 = JSON.parse(data.choices[0].message.content).questions;

        loadingDiv2.style.display = 'none';
        quizSection2.style.display = 'block';
        dropArea.style.display = 'none';
        initializeQuiz2();
        showQuestion2();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the PDF. Please try again!');
        loadingDiv2.style.display = 'none';
        generateBtn2.style.display = 'block';
    }
}

function showQuestion2() {
    document.getElementById('current-question2').textContent = currentQuestion2 + 1;
    document.getElementById('total-questions2').textContent = quizData2.length;
    updateProgressBar2();
    
    const questionData = quizData2[currentQuestion2];
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');

    questionDiv.innerHTML = `
        <h2>${questionData.question}</h2>
        <div class="options">
            ${questionData.options.map((option, index) => `
                <div class="option ${isReviewing2 && index === questionData.correct ? 'correct' : ''}" data-index="${index}">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;

    const quiz2 = document.getElementById('quiz2');
    quiz2.innerHTML = '';
    quiz2.appendChild(questionDiv);

    if (!document.querySelector('.nav-btn2')) {
        setupNavigationButtons2();
    }

    if (!isReviewing2) {
        const submitBtn2 = document.getElementById('submit-btn2');
        submitBtn2.style.display = 'block';
        if (!answered2) {
            submitBtn2.textContent = 'Submit';
        }

        const options = questionDiv.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => selectOption2(option));
        });
    }
}

function selectOption2(selected) {
    if (answered2) return;
    
    document.querySelectorAll('#quiz2 .option').forEach(option => {
        option.classList.remove('selected');
    });
    selected.classList.add('selected');
}

function updateProgressBar2() {
    const progress = ((currentQuestion2 + 1) / quizData2.length) * 100;
    document.querySelector('.progress-bar-fill2').style.width = `${progress}%`;
}

function checkAnswer2() {
    const selected = document.querySelector('#quiz2 .option.selected');
    if (!selected && currentQuestion2 < quizData2.length) {
        alert('Please select an answer!');
        return;
    }

    answered2 = true;
    const selectedIndex = parseInt(selected.dataset.index);
    const correct = quizData2[currentQuestion2].correct;

    if (selectedIndex === correct) {
        score2++;
        selected.classList.add('correct');
    } else {
        selected.classList.add('wrong');
        document.querySelectorAll('#quiz2 .option')[correct].classList.add('correct');
    }

    currentQuestion2++;
    
    const submitBtn2 = document.getElementById('submit-btn2');
    if (currentQuestion2 < quizData2.length) {
        submitBtn2.textContent = 'Next Question';
    } else {
        submitBtn2.textContent = 'Finish';
    }
}

function nextQuestion2() {
    if (currentQuestion2 < quizData2.length) {
        answered2 = false;
        showQuestion2();
        document.getElementById('submit-btn2').textContent = 'Submit';
    } else {
        showResult2();
    }
}

function showResult2() {
    const percentage = (score2 / quizData2.length) * 100;
    let message = '';
    if (percentage >= 80) {
        message = 'Excellent! 🎉';
    } else if (percentage >= 60) {
        message = 'Very Well! 👍';
    } else {
        message = 'Keep Trying! 💪';
    }

    const resultDiv2 = document.getElementById('result2');
    resultDiv2.innerHTML = `
        <div class="result-score">${score2}/${quizData2.length}</div>
        <div class="result-message">${message}</div>
        <div class="result-percentage">${percentage}%</div>
        <button id="review-btn2" class="review-btn">Review</button>
        <button id="reset-btn2" class="reset-btn">Generate Again</button>
    `;
    
    document.getElementById('review-btn2').addEventListener('click', startReview2);
    document.getElementById('reset-btn2').addEventListener('click', resetQuiz2);
    prevBtn2.style.display = 'none';
    nextBtn2.style.display = 'none';
    generateBtn2.style.display = 'none';
    document.getElementById('submit-btn2').style.display = 'none';
}

function startReview2() {
    isReviewing2 = true;
    currentQuestion2 = 0;
    showQuestion2();
    document.getElementById('submit-btn2').style.display = 'none';
    document.querySelectorAll('.nav-btn2').forEach(btn => btn.style.display = 'block');
    document.getElementById('review-btn2').style.display = 'none';
    document.getElementById('reset-btn2').style.left = "50%";
}

function setupNavigationButtons2() {
    prevBtn2.innerHTML = '&larr;';
    nextBtn2.innerHTML = '&rarr;';
    prevBtn2.className = 'nav-btn prev-btn';
    nextBtn2.className = 'nav-btn next-btn';
    
    const quiz2 = document.getElementById('quiz2');
    quiz2.appendChild(prevBtn2);
    quiz2.appendChild(nextBtn2);
    
    prevBtn2.onclick = () => navigateQuestion2(-1);
    nextBtn2.onclick = () => navigateQuestion2(1);
    updateNavigationButtons2();
}

function updateNavigationButtons2() {
    prevBtn2.style.visibility = currentQuestion2 === 0 ? 'hidden' : 'visible';
    nextBtn2.style.visibility = currentQuestion2 === quizData2.length - 1 ? 'hidden' : 'visible';
}

function navigateQuestion2(direction) {
    currentQuestion2 = Math.max(0, Math.min(quizData2.length - 1, currentQuestion2 + direction));
    showQuestion2();
    updateNavigationButtons2();
}

function resetQuiz2() {
    fileInput.value = '';
    fileInfo.textContent = '';
    quizSection2.style.display = 'none';
    document.getElementById('result2').innerHTML = '';
    generateBtn2.style.display = 'block';
    isReviewing2 = false;
    dropArea.style.display = 'block';
}

// Event listeners
generateBtn2.addEventListener('click', generateQuestionsFromPDF);

document.getElementById('submit-btn2').addEventListener('click', () => {
    if (!answered2) {
        checkAnswer2();
    } else {
        nextQuestion2();
    }
});
