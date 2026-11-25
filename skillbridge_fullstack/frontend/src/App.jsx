
import React, { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("skillbridge_token"));
  const [username, setUsername] = useState(localStorage.getItem("skillbridge_user") || "");
  const [page, setPage] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    available_jobs: 0,
    my_applications: 0,
    shortlisted: 0
  });
  const [profile, setProfile] = useState({
    phone: "",
    education: "",
    skills: "",
    bio: ""
  });
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({
    username: "",
    email: "",
    password: ""
  });

  const flash = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  };

  async function loadDashboard() {
    try {
      const [s, j, a, p] = await Promise.all([
        api.get("dashboard/"),
        api.get("jobs/"),
        api.get("applications/"),
        api.get("profile/")
      ]);

      setStats(s.data);
      setJobs(j.data.results || j.data);
      setApplications(a.data.results || a.data);
      setProfile(p.data);

    } catch (error) {
      console.log(error.response?.data || error);
      flash("Could not load data. Check Django server.");
    }
  }

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  async function submitAuth(e) {
    e.preventDefault();

    try {
      const endpoint = authMode === "login" ? "login/" : "register/";
      const response = await api.post(endpoint, auth);

      localStorage.setItem("skillbridge_token", response.data.token);
      localStorage.setItem("skillbridge_user", response.data.username);

      setToken(response.data.token);
      setUsername(response.data.username);

      flash(
        authMode === "login"
          ? "Welcome back!"
          : "Account created successfully!"
      );

    } catch (err) {
      flash(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data || "Unable to authenticate")
      );
    }
  }

  function logout() {
    localStorage.removeItem("skillbridge_token");
    localStorage.removeItem("skillbridge_user");

    setToken(null);
    setUsername("");
    setPage("dashboard");
    setJobs([]);
    setApplications([]);
    setSelectedJob(null);
  }

  async function searchJobs(e) {
    e?.preventDefault();

    try {
      const response = await api.get(
        `jobs/?search=${encodeURIComponent(search)}`
      );

      setJobs(response.data.results || response.data);
      setPage("jobs");

    } catch (error) {
      console.log(error);
      flash("Unable to search jobs.");
    }
  }

  function viewJob(job) {
    setSelectedJob(job);
    setPage("job-details");
  }

  async function apply(jobId) {
    try {
      await api.post(`jobs/${jobId}/apply/`);

      flash("Application submitted!");
      loadDashboard();

    } catch (err) {
      flash(
        err.response?.data?.detail ||
        "Please login before applying."
      );
    }
  }

  async function saveProfile(e) {
    e.preventDefault();

    try {
      await api.put("profile/", profile);
      flash("Profile saved successfully.");

    } catch (error) {
      console.log(error);
      flash("Could not save profile.");
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-mark mb-3">
            <i className="bi bi-mortarboard-fill"></i>
          </div>

          <h2 className="fw-bold">SkillBridge</h2>
          <p className="text-secondary">
            Connect your skills to your next opportunity.
          </p>

          <div className="btn-group w-100 mb-4">
            <button
              className={`btn ${
                authMode === "login"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>

            <button
              className={`btn ${
                authMode === "register"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={submitAuth}>
            <label className="form-label">Username</label>

            <input
              className="form-control mb-3"
              required
              value={auth.username}
              onChange={e =>
                setAuth({ ...auth, username: e.target.value })
              }
            />

            {authMode === "register" && (
              <>
                <label className="form-label">Email</label>

                <input
                  type="email"
                  className="form-control mb-3"
                  required
                  value={auth.email}
                  onChange={e =>
                    setAuth({ ...auth, email: e.target.value })
                  }
                />
              </>
            )}

            <label className="form-label">Password</label>

            <input
              type="password"
              minLength="8"
              className="form-control mb-4"
              required
              value={auth.password}
              onChange={e =>
                setAuth({ ...auth, password: e.target.value })
              }
            />

            <button className="btn btn-primary w-100 py-2">
              {authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {message && (
            <div className="alert alert-info mt-3 mb-0">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">

      <aside className="sidebar">
        <div className="brand">
          <i className="bi bi-mortarboard-fill"></i> SkillBridge
        </div>

        <div className="small text-uppercase text-secondary mt-5 mb-2">
          Workspace
        </div>

        {[
          ["dashboard", "grid"],
          ["jobs", "briefcase"],
          ["applications", "file-earmark-text"],
          ["profile", "person-circle"]
        ].map(([key, icon]) => (
          <button
            key={key}
            className={`side-link ${
              page === key ? "active" : ""
            }`}
            onClick={() => setPage(key)}
          >
            <i className={`bi bi-${icon}`}></i>{" "}
            {key[0].toUpperCase() + key.slice(1)}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="small text-secondary mb-2">
            Signed in as
          </div>

          <strong>{username}</strong>

          <button
            className="btn btn-outline-secondary btn-sm w-100 mt-3"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div>
            <span className="text-secondary small">
              STUDENT PORTAL
            </span>

            <h4 className="mb-0 fw-bold">
              {page === "job-details"
                ? "Job Details"
                : page[0].toUpperCase() + page.slice(1)}
            </h4>
          </div>

          <div className="avatar">
            {username.slice(0, 1).toUpperCase()}
          </div>
        </header>

        {message && (
          <div className="alert alert-info alert-dismissible">
            {message}

            <button
              className="btn-close"
              onClick={() => setMessage("")}
            ></button>
          </div>
        )}

        {/* Dashboard */}
        {page === "dashboard" && (
          <section>

            <div className="welcome-panel mb-4">
              <div>
                <span className="badge text-bg-light mb-2">
                  YOUR CAREER JOURNEY
                </span>

                <h2 className="fw-bold">
                  Welcome, {username}!
                </h2>

                <p className="mb-0">
                  Discover opportunities and keep your applications moving.
                </p>
              </div>

              <i className="bi bi-rocket-takeoff display-3"></i>
            </div>

            <div className="row g-3 mb-4">
              {[
                ["Available jobs", stats.available_jobs, "briefcase"],
                ["My applications", stats.my_applications, "file-earmark-check"],
                ["Shortlisted", stats.shortlisted, "trophy"]
              ].map(([label, value, icon]) => (
                <div className="col-md-4" key={label}>
                  <div className="stat-card">
                    <div>
                      <p className="text-secondary mb-1">
                        {label}
                      </p>

                      <h2 className="fw-bold mb-0">
                        {value}
                      </h2>
                    </div>

                    <i className={`bi bi-${icon} stat-icon`}></i>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-heading">
              <div>
                <h5 className="fw-bold mb-1">
                  Latest opportunities
                </h5>

                <p className="text-secondary mb-0">
                  Explore jobs that match your interests.
                </p>
              </div>

              <button
                className="btn btn-outline-primary"
                onClick={() => setPage("jobs")}
              >
                View all
              </button>
            </div>

            <div className="row g-3">
              {jobs.slice(0, 3).map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  apply={apply}
                  viewJob={viewJob}
                />
              ))}
            </div>

            {jobs.length === 0 && (
              <p className="text-secondary mt-3">
                No jobs available currently.
              </p>
            )}

          </section>
        )}

        {/* Jobs */}
        {page === "jobs" && (
          <section>

            <div className="section-heading">
              <div>
                <h5 className="fw-bold">
                  Find your opportunity
                </h5>

                <p className="text-secondary">
                  Search by role, company or skill.
                </p>
              </div>
            </div>

            <form
              className="search-box mb-4"
              onSubmit={searchJobs}
            >
              <input
                className="form-control"
                placeholder="e.g. Python, frontend, developer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <button className="btn btn-primary">
                <i className="bi bi-search me-2"></i>
                Search
              </button>
            </form>

            <div className="row g-3">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  apply={apply}
                  viewJob={viewJob}
                />
              ))}
            </div>

            {jobs.length === 0 && (
              <p className="text-secondary">
                No jobs found. Add jobs using Django admin.
              </p>
            )}

          </section>
        )}

        {/* Job Details */}
        {page === "job-details" && selectedJob && (
          <section>
            <button
              className="btn btn-outline-secondary mb-4"
              onClick={() => setPage("jobs")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Jobs
            </button>

            <div className="job-card">
              <span className="badge text-bg-primary mb-3">
                Job Opportunity
              </span>

              <h3 className="fw-bold">
                {selectedJob.title}
              </h3>

              <h5 className="text-primary mb-3">
                {selectedJob.company}
              </h5>

              <hr />

              <p>
                <i className="bi bi-geo-alt me-2"></i>
                <strong>Location:</strong> {selectedJob.location}
              </p>

              <p>
                <i className="bi bi-clock me-2"></i>
                <strong>Job Type:</strong> {selectedJob.job_type}
              </p>

              <h5 className="fw-bold mt-4">
                Job Description
              </h5>

              <p>{selectedJob.description}</p>

              <h5 className="fw-bold mt-4">
                Required Skills
              </h5>

              <p>
                {selectedJob.required_skills || "Not specified"}
              </p>

              <button
                className="btn btn-primary mt-3"
                onClick={() => apply(selectedJob.id)}
              >
                Apply Now
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </section>
        )}

        {/* Applications */}
        {page === "applications" && (
          <section>
            <h5 className="fw-bold mb-3">
              My applications
            </h5>

            <div className="table-responsive bg-white rounded-4 shadow-sm">
              <table className="table align-middle mb-0">

                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map(a => (
                    <tr key={a.id}>
                      <td className="fw-semibold">
                        {a.job_title}
                      </td>

                      <td>{a.company}</td>
                      <td>{a.location}</td>

                      <td>
                        <span className="badge text-bg-primary">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {applications.length === 0 && (
              <p className="text-secondary mt-3">
                You have not applied to any jobs yet.
              </p>
            )}
          </section>
        )}

        {/* Profile */}
        {page === "profile" && (
          <section>
            <div className="form-panel">

              <h5 className="fw-bold mb-1">
                Your student profile
              </h5>

              <p className="text-secondary mb-4">
                Keep your details up to date.
              </p>

              <form onSubmit={saveProfile}>

                <label className="form-label">Phone</label>

                <input
                  className="form-control mb-3"
                  value={profile.phone || ""}
                  onChange={e =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />

                <label className="form-label">Education</label>

                <input
                  className="form-control mb-3"
                  placeholder="e.g. B.Sc Computer Science"
                  value={profile.education || ""}
                  onChange={e =>
                    setProfile({ ...profile, education: e.target.value })
                  }
                />

                <label className="form-label">
                  Skills (comma separated)
                </label>

                <input
                  className="form-control mb-3"
                  placeholder="HTML, CSS, JavaScript, Python"
                  value={profile.skills || ""}
                  onChange={e =>
                    setProfile({ ...profile, skills: e.target.value })
                  }
                />

                <label className="form-label">About you</label>

                <textarea
                  className="form-control mb-4"
                  rows="4"
                  value={profile.bio || ""}
                  onChange={e =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                ></textarea>

                <button className="btn btn-primary">
                  Save profile
                </button>

              </form>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

function JobCard({ job, apply, viewJob }) {
  return (
    <div className="col-lg-6">
      <div className="job-card h-100">

        <div className="d-flex justify-content-between gap-2">
          <div>
            <h5 className="fw-bold mb-1">
              {job.title}
            </h5>

            <p className="text-secondary mb-2">
              {job.company}
            </p>
          </div>

          <span className="job-symbol">
            <i className="bi bi-building"></i>
          </span>
        </div>

        <div className="d-flex flex-wrap gap-3 small text-secondary mb-3">
          <span>
            <i className="bi bi-geo-alt me-1"></i>
            {job.location}
          </span>

          <span>
            <i className="bi bi-clock me-1"></i>
            {job.job_type}
          </span>
        </div>

        <p className="job-description">
          {job.description}
        </p>

        <div className="small text-secondary mb-3">
          Skills: {job.required_skills || "Not specified"}
        </div>

        <button
          className="btn btn-outline-primary btn-sm me-2"
          onClick={() => viewJob(job)}
        >
          View Details
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => apply(job.id)}
        >
          Apply now
          <i className="bi bi-arrow-right ms-1"></i>
        </button>

      </div>
    </div>
  );
}

export default App;
