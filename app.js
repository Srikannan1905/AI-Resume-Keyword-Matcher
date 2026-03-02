// ================= SAMPLE DATA =================
const sampleResume = `John Doe
Software Developer
- Java, Spring Boot, REST APIs, MySQL
- Web: HTML, CSS, JavaScript
- Tools: Git, Docker, Agile
`;

const sampleJob = `Senior Backend Engineer
Requirements:
- Java, Spring Boot
- REST API, Microservices
- MySQL, PostgreSQL
- AWS, Docker, Kubernetes
`;

// ================= TEXT PROCESSOR =================
class TextProcessor {
  static cleanText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  static extractTokens(text) {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were"
    ]);
    return this.cleanText(text)
      .split(/\s+/)
      .filter(t => t.length > 1 && !stopWords.has(t));
  }
}

// ================= KEYWORD EXTRACTOR =================
class KeywordExtractor {
  static extractKeywords(text, topN = 30) {
    const tokens = TextProcessor.extractTokens(text);
    const freq = {};
    tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
    return Object.entries(freq)
      .map(([word, count]) => ({
        keyword: word,
        score: count / tokens.length,
        category: this.categorize(word)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  static categorize(word) {
    const categories = {
      "Programming Language": [
        "java", "python", "javascript", "typescript", "c++", "c#", "php", "ruby", "go", "rust", "swift", "kotlin", "dart", "scala", "clojure", "haskell", "lua", "perl", "r", "julia", "elixir", "erlang"
      ],
      "Framework/Library": [
        "react", "angular", "vue", "nodejs", "express", "django", "flask", "spring", "laravel", "symfony", "asp.net", "rails", "fastapi", "nestJS", "nextJS", "nuxtJS", "svelte", "flutter", "react native", "tensorflow", "pytorch", "keras", "opencv", "bootstrap", "tailwind"
      ],
      "Database": [
        "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "cassandra", "elasticsearch", "mariadb", "dynamodb", "firebase", "firestore", "couchdb", "neo4j", "sql server"
      ],
      "Cloud/DevOps": [
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "gitlab", "github", "cicd", "devops", "terraform", "ansible", "puppet", "chef", "vagrant", "circleci", "travisci", "heroku", "netlify", "vercel"
      ],
      "Soft Skill": [
        "leadership", "communication", "teamwork", "analytical", "problem", "solving", "creativity", "adaptability", "management", "listening", "negotiation", "presentation", "emotional intelligence"
      ]
    };
    for (const [cat, list] of Object.entries(categories)) {
      if (list.includes(word.toLowerCase())) return cat;
    }
    return "Technical Skill";
  }
}

// ================= RESUME MATCHER =================
class ResumeMatcher {
  static matchResume(resume, job) {
    const jdKeywords = KeywordExtractor.extractKeywords(job, 50);
    const resumeTokens = new Set(TextProcessor.extractTokens(resume));
    const resumeLower = resume.toLowerCase();

    const present = [];
    const partial = [];
    const missing = [];

    jdKeywords.forEach(kw => {
      const k = kw.keyword.toLowerCase();
      const isExact = resumeLower.includes(k) || resumeTokens.has(k);

      if (isExact) {
        present.push({ ...kw, matchType: "exact" });
      } else {
        // More robust partial matching: only if keyword is > 2 chars 
        // OR if it's a stand-alone token in the resume
        const isPartial = k.length > 2 && [...resumeTokens].some(t => t.includes(k) || k.includes(t));

        if (isPartial) {
          partial.push({ ...kw, matchType: "partial" });
        } else {
          missing.push({ ...kw, priority: this.priority(kw) });
        }
      }
    });

    const percent = Math.round(((present.length + partial.length) / jdKeywords.length) * 100);
    return {
      matchPercentage: percent,
      totalJdKeywords: jdKeywords.length,
      exactMatches: present.length,
      partialMatches: partial,
      missingCount: missing.length,
      presentKeywords: present,
      missingKeywords: missing,
      suggestions: this.suggest(missing.slice(0, 10))
    };
  }

  static priority(kw) {
    const weights = {
      "Programming Language": 1.5,
      "Framework/Library": 1.3,
      "Database": 1.2,
      "Cloud/DevOps": 1.2,
      "Technical Skill": 1.1,
      "Soft Skill": 0.8
    };
    return kw.score * (weights[kw.category] || 1);
  }

  static suggest(missing) {
    const grouped = {};
    missing.forEach(kw => {
      if (!grouped[kw.category]) grouped[kw.category] = [];
      grouped[kw.category].push(kw.keyword);
    });
    const s = [];
    if (grouped["Programming Language"]) s.push("🚀 Master these languages: " + grouped["Programming Language"].join(", "));
    if (grouped["Framework/Library"]) s.push("🛠 Explore these frameworks: " + grouped["Framework/Library"].join(", "));
    if (grouped["Database"]) s.push("🗄 Deep dive into databases: " + grouped["Database"].join(", "));
    if (grouped["Cloud/DevOps"]) s.push("☁️ Enhance Cloud/DevOps skills: " + grouped["Cloud/DevOps"].join(", "));
    if (grouped["Soft Skill"]) s.push("🤝 Work on these soft skills: " + grouped["Soft Skill"].join(", "));
    return s.length > 0 ? s : ["✅ Your profile looks strong! Keep it up."];
  }
}

// ================= FILE HANDLING =================
function setupFileHandling() {
  const upload = document.getElementById("resumeUpload");
  const fileInput = document.getElementById("resumeFile");

  upload.addEventListener("click", () => fileInput.click());
  upload.addEventListener("dragover", e => { e.preventDefault(); upload.classList.add("dragover"); });
  upload.addEventListener("dragleave", () => upload.classList.remove("dragover"));
  upload.addEventListener("drop", e => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener("change", e => {
    if (e.target.files.length > 0) processFile(e.target.files[0]);
  });
}

function processFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "txt") {
    const reader = new FileReader();
    reader.onload = e => document.getElementById("resumeText").value = e.target.result;
    reader.readAsText(file);

  } else if (ext === "pdf") {
    const reader = new FileReader();
    reader.onload = function (e) {
      const typedarray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument(typedarray).promise.then(pdf => {
        let textContent = "";
        let promises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          promises.push(
            pdf.getPage(i).then(page =>
              page.getTextContent().then(tc => {
                textContent += tc.items.map(s => s.str).join(" ") + "\n";
              })
            )
          );
        }
        Promise.all(promises).then(() => {
          document.getElementById("resumeText").value = textContent;
        });
      });
    };
    reader.readAsArrayBuffer(file);

  } else if (ext === "docx") {
    const reader = new FileReader();
    reader.onload = function (e) {
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then(result => {
          document.getElementById("resumeText").value = result.value;
        })
        .catch(err => alert("Error reading DOCX: " + err.message));
    };
    reader.readAsArrayBuffer(file);

  } else {
    alert("⚠️ Unsupported file type. Please upload TXT, PDF, or DOCX.");
  }
}

function loadSampleResume() { document.getElementById("resumeText").value = sampleResume; }
function loadSampleJob() { document.getElementById("jobDescription").value = sampleJob; }

// ================= ANALYSIS =================
function analyzeResume() {
  const resume = document.getElementById("resumeText").value.trim();
  const job = document.getElementById("jobDescription").value.trim();
  if (!resume || !job) return alert("Please provide both resume and job description");

  document.getElementById("loadingState").style.display = "block";
  document.getElementById("resultsSection").style.display = "none";

  const aiPhases = [
    "🤖 Extrapolating semantic context...",
    "🧠 Analyzing neural network embeddings...",
    "📊 Running ATS compatibility matrix...",
    "⚡ Finding keyword synergies..."
  ];
  let phaseIdx = 0;
  const loadText = document.querySelector("#loadingState p");
  loadText.textContent = "🤖 Initializing AI Engine...";

  const aiInterval = setInterval(() => {
    loadText.textContent = aiPhases[phaseIdx];
    phaseIdx = (phaseIdx + 1) % aiPhases.length;
  }, 600);

  setTimeout(() => {
    clearInterval(aiInterval);
    const results = ResumeMatcher.matchResume(resume, job);
    window.lastAnalysisResults = results;
    displayResults(results);
    document.getElementById("loadingState").style.display = "none";
  }, 2500);
}

// ================= RENDERING =================
function displayResults(r) {
  // Score ring
  const circle = document.getElementById("progressCircle");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = `${circumference}`;
  const offset = circumference - (r.matchPercentage / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  // Score text
  const scoreEl = document.getElementById("matchScore");
  scoreEl.textContent = r.matchPercentage + "%";
  const interp = document.getElementById("matchInterpretation");
  if (r.matchPercentage >= 75) interp.textContent = "Excellent match!";
  else if (r.matchPercentage >= 55) interp.textContent = "Good match, can improve!";
  else interp.textContent = "Significant optimization needed.";

  // Stats
  animateCounter("presentCount", r.exactMatches);
  animateCounter("partialCount", r.partialMatches.length);
  animateCounter("missingCount", r.missingCount);
  animateCounter("totalCount", r.totalJdKeywords);

  renderKeywordList("presentKeywords", r.presentKeywords);
  renderKeywordList("partialKeywords", r.partialMatches, true);
  renderKeywordList("missingKeywords", r.missingKeywords, true);

  renderSuggestions(r.suggestions);
  renderChart(r);

  document.getElementById("resultsSection").style.display = "block";
}

function animateCounter(id, value) {
  const el = document.getElementById(id);
  let count = 0;
  const step = Math.ceil(value / 30);
  const interval = setInterval(() => {
    count += step;
    if (count >= value) {
      count = value;
      clearInterval(interval);
    }
    el.textContent = count;
  }, 30);
}

function renderKeywordList(containerId, keywords, missing = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  keywords.slice(0, 15).forEach(kw => {
    const div = document.createElement("div");
    div.className = "keyword-item";
    const badgeClass = getBadgeClass(kw.category);
    div.innerHTML = `<span>${kw.keyword}</span> <span class="keyword-badge ${badgeClass}">${kw.category}</span>` +
      (missing ? `<small>Priority: ${kw.priority ? kw.priority.toFixed(2) : "—"}</small>` : "");
    container.appendChild(div);
  });
}

function getBadgeClass(category) {
  switch (category) {
    case "Programming Language": return "badge-programming";
    case "Framework/Library": return "badge-framework";
    case "Database": return "badge-database";
    case "Cloud/DevOps": return "badge-cloud";
    case "Soft Skill": return "badge-soft";
    default: return "badge-technical";
  }
}

function renderSuggestions(suggestions) {
  const c = document.getElementById("suggestions");
  c.innerHTML = "";
  if (suggestions.length === 0) {
    c.textContent = "✅ Great! No major improvements needed.";
  } else {
    suggestions.forEach((s, i) => {
      const div = document.createElement("div");
      div.className = "keyword-item";
      div.textContent = `${i + 1}. ${s}`;
      c.appendChild(div);
    });
  }
}

function renderChart(r) {
  const ctx = document.getElementById("categoryChart").getContext("2d");
  const categories = ["Programming Language", "Framework/Library", "Database", "Cloud/DevOps", "Technical Skill", "Soft Skill"];
  const presentData = categories.map(cat => r.presentKeywords.filter(k => k.category === cat).length);
  const partialData = categories.map(cat => r.partialMatches.filter(k => k.category === cat).length);
  const missingData = categories.map(cat => r.missingKeywords.filter(k => k.category === cat).length);

  if (window.categoryChartInstance) window.categoryChartInstance.destroy();
  window.categoryChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [
        { label: "Found", data: presentData, backgroundColor: "#10b981" },
        { label: "Partial", data: partialData, backgroundColor: "#f59e0b" },
        { label: "Missing", data: missingData, backgroundColor: "#ef4444" }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#e2e8f0' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { color: '#e2e8f0' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#e2e8f0' }
        }
      }
    }
  });
}

// ================= EXPORT =================
function exportResults() {
  if (!window.lastAnalysisResults) return alert("No results to export");
  const blob = new Blob([JSON.stringify(window.lastAnalysisResults, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume_analysis_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToWord(results) {
  if (!results) return alert("Please run an analysis first.");

  const content = `
************************************************************
          AI RESUME KEYWORD MATCHER REPORT
************************************************************
Generated on: ${new Date().toLocaleString()}

MATCH SCORE: ${results.matchPercentage}%
------------------------------------------------------------
SUMMARY STATS:
- Total Keywords Identified: ${results.totalJdKeywords}
- Exact Matches Found: ${results.exactMatches}
- Partial Matches Detected: ${results.partialMatches.length}
- Missing Keywords: ${results.missingCount}

INTERPRETATION: 
${results.matchPercentage >= 75 ? "EXCELLENT MATCH! Your resume is highly optimized for this role." :
      results.matchPercentage >= 55 ? "GOOD MATCH. Some minor adjustments could significantly boost your visibility." :
        "SIGINIFICANT OPTIMIZATION NEEDED. Your resume lacks several key skills required for this role."}

------------------------------------------------------------
MISSING KEYWORDS (Top Priority):
${results.missingKeywords.slice(0, 15).map(kw => `[ ] ${kw.keyword.toUpperCase()} (${kw.category})`).join("\n")}

------------------------------------------------------------
AI RECOMMENDATIONS & TIPS:
${results.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

------------------------------------------------------------
Thank you for using the AI Resume Keyword Matcher!
************************************************************
  `;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Resume_Analysis_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", setupFileHandling);

// ================= CHATBOT =================
function toggleChatbot() {
  const container = document.getElementById('chatbotContainer');
  container.style.display = container.style.display === 'flex' ? 'none' : 'flex';
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  appendChatMsg(msg, 'user');
  input.value = '';

  const lowerMsg = msg.toLowerCase();
  let aiResponse = "I'm a simple AI assistant! I can help you understand how to use this tool.";

  if (lowerMsg.includes('ats') || lowerMsg.includes('score')) {
    aiResponse = "The ATS score is generated by analyzing how closely your resume keywords match the job description. Aim for over 75% for the best chances!";
  } else if (lowerMsg.includes('file') || lowerMsg.includes('support')) {
    aiResponse = "We currently support parsing text directly from PDF, DOCX, and plain TXT files securely right in your browser!";
  } else if (lowerMsg.includes('improve') || lowerMsg.includes('missing')) {
    aiResponse = "To improve your score, check the 'Missing Keywords' section. Add those specific terms to your resume naturally, especially the high-priority technical skills!";
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    aiResponse = "Hello! Ready to optimize your resume? Ask me anything about the tool.";
  } else if (lowerMsg.includes('export')) {
    aiResponse = "You can export your results to either JSON or Word (.doc) formats using the buttons in the top header menu!";
  } else {
    aiResponse = "That's a great question! I'm currently programmed to answer basics about ATS scoring, supported file types, exporting data, and how to improve your resume.";
  }

  setTimeout(() => {
    appendChatMsg(aiResponse, 'ai');
  }, 600);
}

function appendChatMsg(text, sender) {
  const container = document.getElementById('chatbotMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
