# 🎓 Project Viva Guide: AI Resume Keyword Matcher

## 📋 1. Project Overview
The **AI Resume Keyword Matcher** is a sophisticated web application designed to help job seekers bypass **Applicant Tracking Systems (ATS)**. It analyzes a user's resume against a specific job description, identifies missing critical keywords, and provides a "Compatibility Score" with actionable AI-powered recommendations.

---

## 🛠 2. Technical Stack (Languages & Tools)

| Component | Technology Used |
| :--- | :--- |
| **Frontend** | **HTML5** (Structure), **CSS3** (Glassmorphism & Neumorphism) |
| **Logic** | **JavaScript (ES6+)** - Pure Vanilla JS for high performance |
| **Data Visualization** | **Chart.js** - Used for the categorical skill distribution radar/bar charts |
| **PDF Parsing** | **PDF.js** (by Mozilla) - Extracts raw text from PDF files in-browser |
| **DOCX Parsing** | **Mammoth.js** - Converts (.docx) files into plain text |
| **Typography** | **Google Fonts (Outfit)** - For a premium, modern aesthetic |

---

## 🧠 3. The "AI" & Matching Model
The project uses a custom-built **Natural Language Processing (NLP) Lite** engine. Unlike heavy server-side models, this runs entirely in the browser for privacy and speed.

### Key Logic Phases:
1.  **Text Normalization**: Uses **Regular Expressions (Regex)** to clean the text, remove stop words (the, is, at), and handle special characters (e.g., converting "Java," to "java").
2.  **Tokenization**: Breaks the resume and job description into searchable "tokens".
3.  **Heuristic Categorization**: A rule-based classifier that maps keywords to specific domains like **Cloud/DevOps**, **Programming Languages**, or **Soft Skills**.
4.  **Compatibility Matrix**: 
    *   **Exact Match**: Direct string comparison.
    *   **Partial Match**: Contextual check (e.g., matching "React" if the JD says "React.js").
    *   **Priority Scoring**: Technical skills are weighted higher than soft skills in the final score calculation.

---

## 🚀 4. Workflow (How it Works)
1.  **Input**: User uploads a file (PDF/DOCX) or pastes text.
2.  **Parsing**: The system uses `pdf.js` or `mammoth.js` to extract text content.
3.  **Analysis**: The engine compares the resume tokens against keywords extracted from the Job Description.
4.  **Output**: 
    *   **Animated Score Ring**: Visual representation of the match.
    *   **Chart**: Categorical breakdown of skill gaps.
    *   **AI Suggestions**: Dynamically generated tips based on missing high-priority categories.

---

## 💡 5. Potential Viva Questions
*   **Why use Vanilla JS instead of a Framework?** *Answer: To keep the application lightweight, ensure zero-latency processing, and demonstrate core DOM manipulation skills.*
*   **How do you handle PDF parsing?** *Answer: Using PDF.js, we load the document into a typed array and iterate through pages to extract text items via the `getTextContent` API.*
*   **Is the data secure?** *Answer: Yes, all processing happens locally in the user's browser. No data is sent to a backend server.*
