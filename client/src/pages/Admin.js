import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ModeToggle } from "../components/ModeToggle";
import { ArrowLeft, Plus, Youtube, Trash2, Edit, Check } from "lucide-react";

function Admin() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [solutionLinks, setSolutionLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [editYoutubeLink, setEditYoutubeLink] = useState("");
  const [activeTab, setActiveTab] = useState("add-solution");

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/contests");
        setContests(response.data.contests || []);
        setSolutionLinks(response.data.solutionLinks || []);
      } catch (error) {
        console.error("Error fetching contests:", error.message);
        setContests([]);
        setSolutionLinks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const handleAddSolutionLink = async (e) => {
    e.preventDefault();
    if (!selectedContest || !youtubeLink) {
      alert("Please select a contest and enter a YouTube link.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/contests/solution-link", {
        contestId: selectedContest,
        platform: contests.find((c) => c._id === selectedContest)?.platform || "unknown",
        youtubeLink,
      });

      setSolutionLinks([...solutionLinks, response.data]);
      setYoutubeLink("");
      alert("Solution link added successfully!");
    } catch (error) {
      console.error("Error adding solution link:", error.message);
      alert("Failed to add solution link.");
    }
  };

  const handleEditSolution = (solution) => {
    setEditingLink(solution._id);
    setEditYoutubeLink(solution.youtubeLink);
  };

  const handleSaveEdit = async (solutionId) => {
    try {
      await axios.put(`http://localhost:5000/api/contests/solution-link/${solutionId}`, {
        youtubeLink: editYoutubeLink,
      });

      setSolutionLinks(
        solutionLinks.map((link) =>
          link._id === solutionId ? { ...link, youtubeLink: editYoutubeLink } : link,
        ),
      );

      setEditingLink(null);
      setEditYoutubeLink("");
    } catch (error) {
      console.error("Error updating solution link:", error.message);
      alert("Failed to update solution link.");
    }
  };

  const handleDeleteSolution = async (solutionId) => {
    if (!window.confirm("Are you sure you want to delete this solution link?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/contests/solution-link/${solutionId}`);

      setSolutionLinks(solutionLinks.filter((link) => link._id !== solutionId));
    } catch (error) {
      console.error("Error deleting solution link:", error.message);
      alert("Failed to delete solution link.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <code className="text-primary">&lt;/&gt;</code>
            <span>Contest Tracker</span>
            <span className="text-sm font-normal text-muted-foreground ml-2">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium flex items-center gap-1 text-foreground hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            {/* Tabs */}
            <div className="grid w-full max-w-md grid-cols-2 border-b border-border">
              <button
                onClick={() => setActiveTab("add-solution")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "add-solution"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Add Solution
              </button>
              <button
                onClick={() => setActiveTab("manage-solutions")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "manage-solutions"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Manage Solutions
              </button>
            </div>

            {/* Add Solution Tab */}
            {activeTab === "add-solution" && (
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-card rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold">Add Solution Link</h2>
                    <p className="text-muted-foreground mt-1">
                      Add a YouTube solution link to a completed contest
                    </p>
                  </div>
                  <div className="p-6 pt-0 space-y-6">
                    <form onSubmit={handleAddSolutionLink} className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="contest" className="block text-sm font-medium">
                          Select Contest
                        </label>
                        <select
                          id="contest"
                          value={selectedContest}
                          onChange={(e) => setSelectedContest(e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        >
                          <option value="">Select a contest</option>
                          {contests
                            .filter((c) => new Date(c.startTime) <= new Date())
                            .map((contest) => (
                              <option key={contest._id} value={contest._id}>
                                {contest.name} ({contest.platform})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="youtube-link" className="block text-sm font-medium">
                          YouTube Solution Link
                        </label>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <input
                            id="youtube-link"
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors gap-2 justify-center"
                      >
                        <Youtube className="h-4 w-4" />
                        Add Solution Link
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Manage Solutions Tab */}
            {activeTab === "manage-solutions" && (
              <div className="mt-6">
                <div className="bg-card rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold">Manage Solutions</h2>
                    <p className="text-muted-foreground mt-1">
                      View, edit, and delete solution links for contests
                    </p>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Existing Solutions</h3>
                        <button
                          onClick={() => setActiveTab("add-solution")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add New
                        </button>
                      </div>
                      {solutionLinks.length === 0 ? (
                        <p className="text-muted-foreground">No solution links available.</p>
                      ) : (
                        <div className="rounded-md border border-border">
                          {solutionLinks.map((link) => {
                            const contest = contests.find((c) => c._id === link.contestId);
                            return (
                              <div key={link._id} className="p-4 border-b border-border last:border-b-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">
                                      {contest?.name || `Contest ID: ${link.contestId}`}
                                    </h4>
                                    {editingLink === link._id ? (
                                      <div className="flex mt-1 gap-2">
                                        <input
                                          value={editYoutubeLink}
                                          onChange={(e) => setEditYoutubeLink(e.target.value)}
                                          className="flex-1 px-3 py-1.5 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                        />
                                        <button
                                          onClick={() => handleSaveEdit(link._id)}
                                          className="inline-flex items-center px-3 py-1.5 border border-border rounded-md hover:bg-secondary transition-colors"
                                        >
                                          <Check className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        <a
                                          href={link.youtubeLink}
                                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Youtube className="h-3.5 w-3.5" />
                                          {link.youtubeLink}
                                        </a>
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    {editingLink !== link._id && (
                                      <>
                                        <button
                                          onClick={() => handleEditSolution(link)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm hover:bg-secondary transition-colors"
                                        >
                                          <Edit className="h-4 w-4" />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSolution(link._id)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;