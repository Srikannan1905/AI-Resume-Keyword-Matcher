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
      .replace(/[^\w\s\.\,\-\+\#]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  static extractTokens(text) {
    const stopWords = new Set([
      "the","a","an","and","or","but","in","on","at","to","for","of","with","by","is","are","was","were"
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
      "Programming Language": ["java","python","javascript","typescript","c++","c#","php","ruby","go","rust","swift","kotlin"],
      "Framework/Library": ["react","angular","vue","nodejs","express","django","flask","spring","laravel"],
      "Database": ["mysql","postgresql","mongodb","redis","sqlite","oracle","cassandra","elasticsearch"],
      "Cloud/DevOps": ["aws","azure","gcp","docker","kubernetes","jenkins","git","gitlab","cicd","devops"],
      "Soft Skill": ["leadership","communication","teamwork","analytical","problem","solving"]
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
      if (resumeLower.includes(k) || resumeTokens.has(k)) {
        present.push({ ...kw, matchType: "exact" });
      } else if ([...resumeTokens].some(t => t.includes(k) || k.includes(t))) {
        partial.push({ ...kw, matchType: "partial" });
      } else {
        missing.push({ ...kw, priority: this.priority(kw) });
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
    if (grouped["Programming Language"]) s.push("Add languages: " + grouped["Programming Language"].join(", "));
    if (grouped["Framework/Library"]) s.push("Include frameworks: " + grouped["Framework/Library"].join(", "));
    if (grouped["Cloud/DevOps"]) s.push("Highlight cloud/DevOps: " + grouped["Cloud/DevOps"].join(", "));
    return s;
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
    reader.onload = function(e) {
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
    reader.onload = function(e) {
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

  setTimeout(() => {
    const results = ResumeMatcher.matchResume(resume, job);
    window.lastAnalysisResults = results;
    displayResults(results);
    document.getElementById("loadingState").style.display = "none";
  }, 1000);
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
  switch(category) {
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
  const categories = ["Programming Language","Framework/Library","Database","Cloud/DevOps","Technical Skill","Soft Skill"];
  const data = categories.map(cat => 
    r.presentKeywords.filter(k => k.category === cat).length +
    r.missingKeywords.filter(k => k.category === cat).length +
    r.partialMatches.filter(k => k.category === cat).length
  );

  if (window.categoryChartInstance) window.categoryChartInstance.destroy();
  window.categoryChartInstance = new Chart(ctx, {
    type: "bar",
    data: { 
      labels: categories, 
      datasets: [{ 
        data, 
        backgroundColor: ["#2563eb","#f59e0b","#16a34a","#0ea5e9","#9333ea","#db2777"] 
      }] 
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
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
  if (!results) return alert("No results to export");

  let content = `
  AI Resume Keyword Matcher Report

  Match Score: ${results.matchPercentage}%
  Total Keywords: ${results.totalJdKeywords}
  Found: ${results.exactMatches}
  Partial Matches: ${results.partialMatches.length}
  Missing: ${results.missingCount}

  ----------------------
  Missing Keywords:
  ${results.missingKeywords.map(kw => `- ${kw.keyword} (${kw.category}) Priority: ${kw.priority.toFixed(2)}`).join("\n")}

  ----------------------
  AI Recommendations:
  ${results.suggestions.map((s, i) => `${i+1}. ${s}`).join("\n")}
  `;

  const blob = new Blob([`\ufeff${content}`], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume_analysis_${new Date().toISOString().slice(0,10)}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
function setTheme(theme) {
  const body = document.body;
  body.classList.remove("theme-teal", "theme-orange", "theme-indigo", "theme-dark");
  body.classList.add(theme);
}
const themes = ["theme-teal", "theme-orange", "theme-indigo", "theme-dark"];
let currentTheme = 0;

function cycleTheme() {
  const body = document.body;
  body.classList.remove(...themes);
  currentTheme = (currentTheme + 1) % themes.length;
  body.classList.add(themes[currentTheme]);
}


// ================= INIT =================
document.addEventListener("DOMContentLoaded", setupFileHandling);
