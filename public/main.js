// Chat system variables
let chatHistory = [];
let isLoading = false;

// System prompt for OpenAI
const SYSTEM_PROMPT = `You are Brandon Wong's portfolio assistant. You have access to the following information about Brandon:

EDUCATION:
- University of Southern California (USC), Los Angeles, CA
- Expected graduation: May 2026
- Master of Science, Applied Data Science (Major GPA: 4.0)
- Bachelor of Arts, Data Science
- Bachelor of Arts, Cognitive Science (AI Focus)
- Cumulative GPA: 3.8/4.0
- Honors: Dean's List (All semesters)

TECHNICAL SKILLS:
- Programming: Python, SQL, C++, Excel
- AI/ML: Generative AI, Local LLM, Ollama, Flowise, Neural Networks, NLP, Scikit-Learn, Pandas
- Data Tools: MLOps, Data Pipelines, Apache Spark, Tableau, Power BI, Git, GitHub, Jupyter
- Cloud/Databases: AWS EC2, DynamoDB, RDS, Snowflake, SAP HANA, MySQL, SAP BW/4HANA

CURRENT RESEARCH & WORK:
- Neural Networks Research Assistant/Data Scientist at USC (Fall 2023 - Present)
* Applied deep learning to model neurochemical responses to chronic stress
* Developed chemical pathway simulation models (22% accuracy improvement)
* Implemented MLOps pipelines for automated model retraining

- Data Analyst at USC (Fall 2023 - Present)
* Analyzed Air Quality Index and asthma rates using SAP HANA, Python, SQL
* Developed predictive models for public health impact assessment

INDUSTRY EXPERIENCE:
- Data Science Intern at Southern California Edison (May-Aug 2024)
* Built ML classification model on 100M+ smart meter readings (85% accuracy)
* Created Tableau/Power BI visualizations for stakeholder decision-making
* Reduced company expenditures by 24% through data analysis

- Data Science Intern at MarketCast (Jun-Aug 2023)
* Performed sentiment analysis on 10,000+ survey responses using NLP
* Built automated Python scripts (50% time reduction)
* Conducted A/B testing leading to 21% increase in ad retention

SPECIALIZATIONS:
- Generative AI and Local LLM implementation
- Neural networks and deep learning research
- MLOps and automated model deployment
- Environmental health data analytics

Always respond as Brandon's assistant, providing helpful information about his background. When relevant, mention which section of the portfolio contains more details. Keep responses conversational and engaging, but professional. If asked about specific projects or experiences, provide detailed information based on the data above.`;

// Portfolio data for card clicks
const portfolioData = {
    resume: {
        prompt: "Show me Brandon's resume and educational background",
        action: () => showContent('resume')
    },
    story: {
        prompt: "Tell me about Brandon's journey into data science and his career story",
        action: () => showContent('story')
    },
    projects: {
        prompt: "Show me Brandon's projects and research work",
        action: () => showContent('projects')
    }
};

// OpenAI API call function
async function callOpenAI(message) {
    try {
        const response = await axios.post('https://portfoliobackend-8l62.onrender.com/api/chat', {
            message: message,
            history: chatHistory
        });

        return response.data.reply;
    } catch (error) {
        console.error('API call error:', error);
        return "Sorry, I couldn’t connect to the server. Try again later.";
    }
}


function activateChatbot() {
    const startupPage = document.getElementById('startupPage');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotTab = document.getElementById('chatbotTab');
    const bottomPreview = document.querySelector('.bottom-preview');
    
    // Slide up the startup page
    startupPage.classList.add('slide-up');
    
    // Activate the chatbot container
    chatbotContainer.classList.add('active');
    
    // Hide the tab and bottom preview
    chatbotTab.style.display = 'none';
    bottomPreview.style.display = 'none';
    
    // Ensure we start in the correct state - main sidebar visible, chat hidden
    const chatSidebar = document.getElementById('chatSidebar');
    const mainContent = document.getElementById('mainContent');
    chatSidebar.style.display = 'none';
    chatSidebar.classList.remove('active');
    mainContent.classList.remove('with-chat');
    
    // Show welcome state
    showWelcomeState();
    
    // Allow scrolling after all animations complete
    setTimeout(() => {
        document.body.style.overflowY = 'auto';
        document.body.style.overflowX = 'hidden';
    }, 3000);
}

function handleCardClick(cardType) {
    const data = portfolioData[cardType];
    if (data) {
        // Show chat sidebar first
        showChatSidebar();
        
        // Auto-fill the prompt and send it
        document.getElementById('chatInput').value = data.prompt;
        sendMessage();
        
        // Show the corresponding content
        data.action();
    }
}

function showChatSidebar() {
    const chatSidebar = document.getElementById('chatSidebar');
    const mainContent = document.getElementById('mainContent');
    
    chatSidebar.style.display = 'flex';
    // Small delay to ensure display change takes effect before animation
    setTimeout(() => {
        chatSidebar.classList.add('active');
        mainContent.classList.add('with-chat');
    }, 10);
}

function hideChatSidebar() {
    const chatSidebar = document.getElementById('chatSidebar');
    const mainContent = document.getElementById('mainContent');
    
    chatSidebar.classList.remove('active');
    mainContent.classList.remove('with-chat');
    
    // Hide completely after transition
    setTimeout(() => {
        chatSidebar.style.display = 'none';
    }, 300);
}

function showContent(contentType) {
    // Hide welcome state
    document.getElementById('welcomeState').style.display = 'none';
    
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested content
    const targetSection = document.getElementById(contentType + 'Content');
    if (targetSection) {
        targetSection.classList.add('active');
        currentContent = contentType;
    }
}

function showWelcomeState() {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show welcome state
    document.getElementById('welcomeState').style.display = 'flex';
    currentContent = 'welcome';
}

function addMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = content; // Using innerHTML to support markdown-like formatting
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addLoadingMessage() {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot loading-message';
    messageDiv.id = 'loading-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = '• • •';
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add typing animation
    let dots = 0;
    const interval = setInterval(() => {
        dots = (dots + 1) % 4;
        messageContent.innerHTML = '• '.repeat(dots || 1);
    }, 500);
    
    return interval;
}

function removeLoadingMessage(interval) {
    if (interval) clearInterval(interval);
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

async function sendMessage() {
    if (isLoading) return;
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        isLoading = true;
        
        // Add user message
        addMessage(message, true);
        chatHistory.push({ content: message, isUser: true });
        
        // Clear input
        input.value = '';
        
        // Show loading animation
        const loadingInterval = addLoadingMessage();
        
        try {
            // Get AI response
            const response = await callOpenAI(message);
            
            // Remove loading message
            removeLoadingMessage(loadingInterval);
            
            // Add bot response
            addMessage(response, false);
            chatHistory.push({ content: response, isUser: false });
            
            // Auto-navigate based on response content
            autoNavigateContent(response);
            
        } catch (error) {
            removeLoadingMessage(loadingInterval);
            addMessage("I'm having trouble responding right now. Please try again!", false);
        }
        
        isLoading = false;
    }
}

function autoNavigateContent(response) {
    const lowerResponse = response.toLowerCase();
    
    // Auto-navigate based on AI response content
    if (lowerResponse.includes('resume') || lowerResponse.includes('education') || lowerResponse.includes('graduation')) {
        if (currentContent !== 'resume') {
            setTimeout(() => showContent('resume'), 500);
        }
    } else if (lowerResponse.includes('project') || lowerResponse.includes('research') || lowerResponse.includes('neural network')) {
        if (currentContent !== 'projects') {
            setTimeout(() => showContent('projects'), 500);
        }
    } else if (lowerResponse.includes('journey') || lowerResponse.includes('story') || lowerResponse.includes('background')) {
        if (currentContent !== 'story') {
            setTimeout(() => showContent('story'), 500);
        }
    }
}

function sendMainMessage() {
    const input = document.getElementById('mainInput');
    const message = input.value.trim();
    
    if (message) {
        // Show chat sidebar first
        showChatSidebar();
        
        // Transfer to chat input and send
        document.getElementById('chatInput').value = message;
        input.value = '';
        sendMessage();
    }
}

function showIntroPage() {
    const startupPage = document.getElementById('startupPage');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotTab = document.getElementById('chatbotTab');
    const bottomPreview = document.querySelector('.bottom-preview');
    
    // First, immediately hide the chatbot container to prevent flash
    chatbotContainer.style.transition = 'none';
    chatbotContainer.classList.remove('active');
    
    // Wait a brief moment, then restore transition and reset startup page
    setTimeout(() => {
        chatbotContainer.style.transition = '';
        startupPage.classList.remove('slide-up');
        chatbotTab.style.display = 'flex';
        bottomPreview.style.display = 'flex';
    }, 50);
    
    // Hide chat sidebar and reset content
    hideChatSidebar();
    showWelcomeState();
    
    // Reset navigation
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    // Reset body overflow
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'hidden';
    
    // Clear any chat history
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    chatHistory = [];
}

function startNewConversation() {
    // Clear chat history
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    chatHistory = [];
    
    // Hide chat sidebar and show welcome state
    hideChatSidebar();
    showWelcomeState();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Add click handlers for navigation items
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const mainInput = document.getElementById('mainInput');
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    mainInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMainMessage();
        }
    });
    
    // Add click handlers for navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
            
            // Handle navigation based on item text
            const itemText = this.querySelector('span').textContent.toLowerCase();
            if (itemText.includes('introduction')) {
                showIntroPage();
            } else if (itemText.includes('home')) {
                showWelcomeState();
                hideChatSidebar();
            } else if (itemText.includes('experience')) {
                showChatSidebar();
                document.getElementById('chatInput').value = "Tell me about Brandon's work experience and internships";
                sendMessage();
            } else if (itemText.includes('projects')) {
                showChatSidebar();
                document.getElementById('chatInput').value = "Show me Brandon's projects and research work";
                sendMessage();
            } else if (itemText.includes('skills')) {
                showChatSidebar();
                document.getElementById('chatInput').value = "What are Brandon's technical skills and expertise?";
                sendMessage();
            }
        });
    });
});

// Mobile responsiveness
function updateMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (!mobileBtn || !sidebar) return; // prevent error if either doesn't exist

    if (window.innerWidth <= 1024) {
        mobileBtn.style.display = 'flex';
    } else {
        mobileBtn.style.display = 'none';
        sidebar.classList.remove('open');
    }
}


window.addEventListener('resize', updateMobileMenu);
updateMobileMenu();

// Parallax effects
document.addEventListener('mousemove', (e) => {
    const profileGlow = document.querySelector('.profile-glow');
    const starGlow = document.querySelector('.star-glow');
    
    if (profileGlow) {
        const x = (e.clientX / window.innerWidth) * 20 - 10;
        const y = (e.clientY / window.innerHeight) * 20 - 10;
        
        profileGlow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
    
    if (starGlow) {
        const x = (e.clientX / window.innerWidth) * 20 - 10;
        const y = (e.clientY / window.innerHeight) * 20 - 10;
        
        starGlow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
});