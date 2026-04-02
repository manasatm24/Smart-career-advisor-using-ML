/* script.js - robust, safe version
   Replace your existing script.js with this entire file.
*/





  document.addEventListener("DOMContentLoaded", () => {
  // --- Elements (safe queries) ---
  const careerForm = document.getElementById("careerForm");
  const yearsGroup = document.getElementById("yearsGroup"); // may be null if not present
  const resultsSection = document.getElementById("resultsSection");
  const careersDiv = document.getElementById("careerResults");
  const jobsDiv = document.getElementById("jobResults");

  // If the form isn't present, nothing to do.
  if (!careerForm) {
    console.warn("careerForm not found in DOM. Aborting script.");
    return;
  }

  // --- Toggle years input for Fresher / Experienced ---
  function updateYearsVisibility() {
    const expSelected = document.querySelector('input[name="expType"]:checked')?.value || "Fresher";
    if (yearsGroup) {
      if (expSelected === "Experienced") yearsGroup.classList.remove("hidden");
      else yearsGroup.classList.add("hidden");
    }
  }

  // Attach listeners to experience radios (if present)
  document.querySelectorAll('input[name="expType"]').forEach(r => {
    r.addEventListener("change", updateYearsVisibility);
  });
  // initial visibility
  updateYearsVisibility();

  // Optional role -> show company suggestion if you have an element with id "roleCompanyMsg"
  const preferredRoleEl = document.getElementById("preferredRole");
  const roleMsgEl = document.getElementById("roleCompanyMsg"); // may be absent
  if (preferredRoleEl && roleMsgEl) {
    preferredRoleEl.addEventListener("change", () => {
      const role = preferredRoleEl.value;
      const companies = {
        "Software Developer": "TCS, Infosys, Accenture, Wipro",
        "Data Analyst": "Google, Amazon, Deloitte",
        "AI Engineer": "Microsoft, NVIDIA, OpenAI",
        "Cybersecurity Analyst": "Cisco, Palo Alto Networks",
        "Cloud Engineer": "AWS, Azure, IBM",
        "Web Developer": "Zoho, Flipkart, Swiggy",
        "Embedded Systems Engineer": "Bosch, Qualcomm, L&T",
        "Project Manager": "Accenture, Cognizant, Capgemini",
        "System Administrator": "IBM, HCL, Wipro"
      };
      roleMsgEl.textContent = role ? `${role} roles are available at companies such as: ${companies[role] || "various companies"}.` : "";
    });
  }

  // --- helpers to gather multi-select checkboxes ---
  function gatherCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
  }

  // --- caching for datasets ---
  let careersData = null;
  let jobsData = null;

  async function loadDatasets() {
    if (careersData && jobsData) return { careersData, jobsData };

    try {
      const [cRes, jRes] = await Promise.all([
        fetch("data/careers.json"),
        fetch("data/jobs.json")
      ]);
      if (!cRes.ok) throw new Error("Failed to fetch careers.json (status " + cRes.status + ")");
      if (!jRes.ok) throw new Error("Failed to fetch jobs.json (status " + jRes.status + ")");

      // parse
      careersData = await cRes.json();
      jobsData = await jRes.json();
      return { careersData, jobsData };
    } catch (err) {
      // show friendly message in UI and rethrow so callers know
      console.error("Error loading datasets:", err);
      careersDiv.innerHTML = `<div class="card"><div style="color:#ffb3b3">Error loading data: ${err.message}</div></div>`;
      jobsDiv.innerHTML = "";
      throw err;
    }
  }

  // --- simple career recommendation logic (flexible to different careers.json shapes) ---
  function recommendCareers(profile) {
    const branchKey = (profile.branch || "").toUpperCase();
    const interestedLower = (profile.interested || []).map(s => s.toLowerCase());
    const learnedLower = (profile.learned || []).map(s => s.toLowerCase());
    let matches = [];

    if (!careersData) return [];

    // If careersData is an object mapping branch->array (string list or objects)
    if (!Array.isArray(careersData) && typeof careersData === "object") {
      const branchList = careersData[profile.branch] || careersData[branchKey] || [];
      // branchList might be array of strings or objects
      branchList.forEach(item => {
        if (typeof item === "string") matches.push({ career: item, reason: [] });
        else {
          matches.push({ career: item.career || item.title || JSON.stringify(item), reason: item.skills || [] });
        }
      });
    } else if (Array.isArray(careersData)) {
      // array of objects: [{branch:"CSE", career:"Software Engineer", skills:[..]}, ...]
      careersData.forEach(c => {
        const cBranch = (c.branch || "").toUpperCase();
        if (cBranch === branchKey) {
          // compute simple score based on skill overlap
          const required = (c.skills || []).map(s => s.toLowerCase());
          const overlap = required.filter(r => interestedLower.includes(r) || learnedLower.includes(r));
          matches.push({ career: c.career || c.title || "Role", reason: overlap });
        }
      });
    }
    // Sort by length of reason (more overlap first)
    matches.sort((a, b) => (b.reason?.length || 0) - (a.reason?.length || 0));
    // Return up to 8 unique career names
    const uniq = Array.from(new Set(matches.map(m => m.career))).slice(0, 8);
    return uniq;
  }

  // --- job matching (flexible) ---
  function matchJobs(profile, recommendedRoles) {
    const branchKey = (profile.branch || "").toUpperCase();
    const interestedLower = (profile.interested || []).map(s => s.toLowerCase());
    const learnedLower = (profile.learned || []).map(s => s.toLowerCase());
    const preferredRole = (profile.preferredRole || "").toLowerCase();
    const preferredLocation = (profile.preferredLocation || "").toLowerCase();

    if (!jobsData) return [];

    let results = [];

    // jobsData might be a list of companies with job_roles or a mapping.
    if (Array.isArray(jobsData)) {
      // example shape: [{company:"X", industry:"Y", job_roles:[{role:"...", skills:[..], seniority:"..." ,location:"..."}]}]
      jobsData.forEach(company => {
        const companyName = company.company || company.name || "Company";
        const industry = company.industry || "";
        const roles = company.job_roles || company.jobs || company.positions || [];
        roles.forEach(job => {
          // branch optional check: some job entries may include branch or eligibleDegrees
          const jobBranch = (job.branch || "").toUpperCase();
          // simple branch filter: either branch matches or no branch field present
          if (jobBranch && jobBranch !== branchKey) return;

          // skill match count
          const jobSkills = (job.skills || []).map(s => (s || "").toLowerCase());
          const skillMatches = jobSkills.filter(s => learnedLower.includes(s) || interestedLower.includes(s));
          // role match flag
          const roleMatch = recommendedRoles.some(r => (job.role || "").toLowerCase().includes(r.toLowerCase())) ||
            (preferredRole && (job.role || "").toLowerCase().includes(preferredRole));

          // location match
          const locMatch = !preferredLocation || ((job.location || "").toLowerCase().includes(preferredLocation));

          // experience/seniority match (if job.seniority exists, we can do minimal mapping)
          let seniorityOk = true;
          if (profile.experienceType === "Fresher") {
            seniorityOk = !(job.seniority || "").toLowerCase().includes("senior") && !(job.seniority || "").toLowerCase().includes("lead") && !(job.seniority || "").toLowerCase().includes("manager");
          } else {
            // Experienced: allow most job types
            seniorityOk = true;
          }

          // Simple threshold rule: at least 1 skill match OR roleMatch must be true
          if ((skillMatches.length >= 1 || roleMatch) && locMatch && seniorityOk) {
            results.push({
              company: companyName,
              role: job.role || "Role",
              location: job.location || "",
              seniority: job.seniority || "",
              employment_type: job.employment_type || "",
              industry,
              matchCount: skillMatches.length,
              matchedSkills: skillMatches
            });
          }
        });
      });
    } else if (typeof jobsData === "object") {
      // jobsData could be mapping branch->list
      const list = jobsData[profile.branch] || jobsData[branchKey] || [];
      list.forEach(j => {
        const jobSkills = (j.skills || []).map(s => s.toLowerCase());
        const skillMatches = jobSkills.filter(s => learnedLower.includes(s) || interestedLower.includes(s));
        const locMatch = !preferredLocation || ((j.location || "").toLowerCase().includes(preferredLocation));
        const roleMatch = recommendedRoles.some(r => (j.role || "").toLowerCase().includes(r.toLowerCase())) || (preferredRole && (j.role || "").toLowerCase().includes(preferredRole));
        if ((skillMatches.length >= 1 || roleMatch) && locMatch) {
          results.push({
            company: j.company || j.employer || "Company",
            role: j.role || "Role",
            location: j.location || "",
            seniority: j.experience || j.seniority || "",
            industry: j.industry || "",
            matchCount: skillMatches.length,
            matchedSkills: skillMatches
          });
        }
      });
    }

    // sort by matchCount descending
    results.sort((a, b) => b.matchCount - a.matchCount);
    return results.slice(0, 12);
  }

  // --- render functions ---
  function renderCareers(list) {
    if (!careersDiv) return;
    if (!list || list.length === 0) {
      careersDiv.innerHTML = `<div class="card"><div class="small-muted">No career suggestions found for your profile.</div></div>`;
      return;
    }
    let html = `<h3>Recommended Career Paths</h3>`;
    list.forEach(item => {
      html += `<div class="card"><strong>${item}</strong><div class="small-muted">Suggested based on your branch and skills.</div></div>`;
    });
    careersDiv.innerHTML = html;
  }

  function renderJobs(list) {
    if (!jobsDiv) return;
    if (!list || list.length === 0) {
      jobsDiv.innerHTML = `<div class="card"><div class="small-muted">No matching job vacancies found at the moment.</div></div>`;
      return;
    }
    let html = `<h3>Matching Job Vacancies</h3>`;
    list.forEach(j => {
      html += `<div class="card job-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>${escapeHtml(j.role)}</strong> <div class="small-muted">${escapeHtml(j.company)}</div>
            <div class="small-muted">Skills: ${j.matchedSkills && j.matchedSkills.length ? j.matchedSkills.join(", ") : "—"}</div>
          </div>
          <div style="text-align:right;">
            <div class="small-muted">${escapeHtml(j.location)}</div>
            <div class="small-muted">${escapeHtml(j.seniority)}</div>
          </div>
        </div>
      </div>`;
    });
    jobsDiv.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  // --- form submit handler ---
  careerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // collect profile safely
    const profile = {
      branch: document.getElementById("branch")?.value || "",
      interested: gatherCheckedValues("interestedSkill"),
      learned: gatherCheckedValues("learnedSkill"),
      experienceType: document.querySelector('input[name="expType"]:checked')?.value || "Fresher",
      years: document.getElementById("years")?.value || "",
      preferredRole: document.getElementById("preferredRole")?.value || "",
      preferredLocation: document.getElementById("preferredLocation")?.value || ""
    };

    // basic validation
    if (!profile.branch) {
      alert("Please select your academic branch.");
      return;
    }

    // show loading state
    if (careersDiv) careersDiv.innerHTML = `<div class="card"><div class="small-muted">Loading recommendations...</div></div>`;
    if (jobsDiv) jobsDiv.innerHTML = "";

    try {
      await loadDatasets(); // may throw and be caught below

      // compute recommendations
      const recommendedRoles = recommendCareers(profile);
      const matchedJobs = matchJobs(profile, recommendedRoles);

      // render
      renderCareers(recommendedRoles);
      renderJobs(matchedJobs);

      // show results area
      if (resultsSection) resultsSection.classList.remove("hidden");
      resultsSection?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      console.error("Error during recommendation flow:", err);
      if (careersDiv) careersDiv.innerHTML = `<div class="card"><div style="color:#ffb3b3">Error: ${err.message}</div></div>`;
    }
  });

}); // DOMContentLoaded end



document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("careerForm");
  const resultsDiv = document.getElementById("careerResults");
  const jobResultsDiv = document.getElementById("jobResults");

  const BACKEND_URL = "http://127.0.0.1:5000"; // Flask backend address

  // 🟩 When the user submits the form
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop form refresh

    // Collect user data
    const branch = document.getElementById("branch").value;
    const learnedSkill = document.querySelector('input[name="learnedSkill"]:checked')?.value || "";
    const expType = document.querySelector('input[name="expType"]:checked')?.value || "Fresher";
    const years = document.getElementById("years").value;
    const preferredRole = document.getElementById("preferredRole").value;
    const preferredLocation = document.getElementById("preferredLocation").value;

    const interestedSkills = Array.from(document.querySelectorAll('input[name="interestedSkill"]:checked')).map(
      (cb) => cb.value
    );

    // 🧠 Combine all form data into one object
    const formData = {
      branch,
      learnedSkill,
      expType,
      years,
      interestedSkills,
      preferredRole,
      preferredLocation,
    };

    resultsDiv.innerHTML = "<p>🔄 Fetching your career recommendations...</p>";
    jobResultsDiv.innerHTML = "";

    try {
      // 🚀 Send data to backend (Flask API)
      const response = await fetch(`${BACKEND_URL}/api/jobs/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: learnedSkill || "learnedSkill", // send learnedSkill as skill
          location: preferredLocation || "Bengaluru",


          
        }),
      });
      

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const jobs = await response.json();

      resultsDiv.innerHTML = `<h3>✅ Based on your details, here are some matching job roles:</h3>`;

      if (!Array.isArray(jobs) || jobs.length === 0) {
        jobResultsDiv.innerHTML = "<p>No jobs found for your search.</p>";
      } else {
        jobResultsDiv.innerHTML = jobs
          .map(
            (job) => `
            <div class="job-card">
              <h4>${job.title || "Job Title Not Available"}</h4>
              <p><b>Company:</b> ${job.company || "Unknown"}</p>
              <p><b>Location:</b> ${job.location || "Not Mentioned"}</p>
              <a href="${job.url}" target="_blank" class="apply-btn">Apply Now</a>
            </div>
          `
          )
          .join("");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      resultsDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    }
  });

  // Optional: Handle the “Fresher / Experienced” toggle
  const expRadios = document.querySelectorAll('input[name="expType"]');
  const yearsGroup = document.getElementById("yearsGroup");

  expRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "Experienced") yearsGroup.classList.remove("hidden");
      else yearsGroup.classList.add("hidden");
    });
  });
});








document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !message) {
        alert("⚠ Please fill all fields!");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:5000/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await res.json();

        if (res.ok) {
          showPopup("✅ Feedback sent successfully!");
          form.reset();
        } else {
          showPopup("❌ " + (data.error || "Failed to send feedback."));
        }
      } catch (err) {
        showPopup("🚫 Error connecting to server!");
      }
    });
  }

  function showPopup(msg) {
    const popup = document.createElement("div");
    popup.textContent = msg;
    popup.style.position = "fixed";
    popup.style.bottom = "20px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.background = "rgba(0,0,0,0.8)";
    popup.style.color = "white";
    popup.style.padding = "12px 24px";
    popup.style.borderRadius = "8px";
    popup.style.zIndex = "9999";
    popup.style.fontWeight = "bold";
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
  }
});








