import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  adminListApplications,
  adminUpdateApplicationStatus,
  adminDeleteApplication
} from "@/lib/cms.functions";
import { Trash2, Eye, Search, Filter, RefreshCw, X, ArrowUpRight, Archive, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/applications")({
  component: ApplicationsAdmin,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

type Application = {
  id: string;
  application_number: number;
  full_name: string;
  email: string;
  artist_name: string;
  spotify_link: string | null;
  campaign_details: string | null;
  status: "Pending" | "Reviewed" | "Reviewing" | "Approved" | "Rejected" | "Archived";
  submitted_at: string;
  artist_photo_url: string | null;
  epk_url: string | null;
};

function ApplicationsAdmin() {
  const listFn = useServerFn(adminListApplications);
  const updateStatusFn = useServerFn(adminUpdateApplicationStatus);
  const deleteFn = useServerFn(adminDeleteApplication);
  const qc = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adm-applications"],
    queryFn: () => listFn(),
    refetchInterval: 30000,
  });

  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (data?.applications) {
      const currentCount = data.applications.length;
      if (prevCountRef.current !== null && currentCount > prevCountRef.current) {
        const diff = currentCount - prevCountRef.current;
        toast.success(`${diff} New Application${diff > 1 ? 's' : ''} Received`, {
          description: "The dossier queue has been automatically synced.",
          style: {
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            color: 'white',
            backdropFilter: 'blur(10px)',
          }
        });
      }
      prevCountRef.current = currentCount;
    }
  }, [data?.applications]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  
  // Custom states for A&R Archive System
  const [viewTab, setViewTab] = useState<"active" | "archived">("active");

  // Trigger direct file download locally as blob to avoid tab redirecting
  const triggerFileDownload = async (url: string, filename: string, type: "photo" | "pdf", id: string) => {
    if (type === "photo") setDownloadingPhotoId(id);
    else setDownloadingPdfId(id);
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Direct download failed, falling back to open in tab:", err);
      window.open(url, "_blank");
    } finally {
      if (type === "photo") setDownloadingPhotoId(null);
      else setDownloadingPdfId(null);
    }
  };

  const handleStatusChange = async (id: string, status: "Pending" | "Reviewed" | "Reviewing" | "Approved" | "Rejected") => {
    setUpdatingId(id);
    try {
      await updateStatusFn({ data: { id, status } });
      qc.invalidateQueries({ queryKey: ["adm-applications"] });
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await updateStatusFn({ data: { id, status: "Archived" } });
      qc.invalidateQueries({ queryKey: ["adm-applications"] });
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status: "Archived" });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to archive application.");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await updateStatusFn({ data: { id, status: "Pending" } });
      qc.invalidateQueries({ queryKey: ["adm-applications"] });
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status: "Pending" });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to restore application.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await deleteFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["adm-applications"] });
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to permanently delete application.");
    }
  };

  // Filter and search logic
  const applications = (data?.applications ?? []) as Application[];

  // Dynamic real-time status counters for both Active and Archived dossiers
  const countPending = applications.filter(a => a.status === "Pending").length;
  const countReviewed = applications.filter(a => a.status === "Reviewed" || a.status === "Reviewing").length;
  const countApproved = applications.filter(a => a.status === "Approved").length;
  const countRejected = applications.filter(a => a.status === "Rejected").length;
  const countArchived = applications.filter(a => a.status === "Archived").length;
  const countActive = applications.filter(a => a.status !== "Archived").length;

  // Debug Logging for Supabase Integration Audit
  if (typeof window !== "undefined" && applications.length > 0) {
    console.log("=== SUPABASE INTEGRATION AUDIT: CLIENT-SIDE SUBMISSION LOG ===");
    applications.forEach((app) => {
      console.log(`artist id: ${app.id}`);
      console.log(`artist_photo_url: ${app.artist_photo_url}`);
      console.log(`generated image url: ${app.artist_photo_url || "NONE"}`);
      console.log("-----------------------------------------");
    });
    console.log("==============================================================");
  }

  const filtered = applications.filter((app) => {
    // 1. Partition based on viewTab
    if (viewTab === "active" && app.status === "Archived") return false;
    if (viewTab === "archived" && app.status !== "Archived") return false;

    // 2. Search query matches
    const matchesSearch =
      app.full_name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.artist_name.toLowerCase().includes(search.toLowerCase()) ||
      (app.campaign_details || "").toLowerCase().includes(search.toLowerCase());

    // 3. Category status filter matches
    let matchesStatus = true;
    if (statusFilter !== "All" && statusFilter !== "Archived") {
      if (statusFilter === "Reviewing" || statusFilter === "Reviewed") {
        matchesStatus = app.status === "Reviewed" || app.status === "Reviewing";
      } else {
        matchesStatus = app.status === statusFilter;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-400 bg-green-500/10 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
      case "Rejected":
        return "text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      case "Reviewed":
      case "Reviewing":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
      case "Archived":
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30 shadow-[0_0_10px_rgba(161,161,170,0.1)]";
      default:
        return "text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]";
    }
  };

  return (
    <AdminShell title="Artist Applications">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 w-full">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, artist..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/50 text-white font-mono transition-all duration-300 placeholder:text-white/20 shadow-inner"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-56">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/50 text-white font-mono appearance-none cursor-pointer transition-all duration-300 shadow-inner"
            >
              {viewTab === "active" ? (
                <>
                  <option value="All">All Active ({countActive})</option>
                  <option value="Pending">Pending ({countPending})</option>
                  <option value="Reviewing">Reviewing ({countReviewed})</option>
                  <option value="Approved">Approved ({countApproved})</option>
                  <option value="Rejected">Rejected ({countRejected})</option>
                </>
              ) : (
                <option value="Archived">Archived ({countArchived})</option>
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs font-mono text-muted-foreground">
            {filtered.length} of {viewTab === "active" ? countActive : countArchived} filtered
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`group relative flex items-center gap-2 px-5 py-2.5 border rounded-lg transition-all duration-300 cursor-pointer overflow-hidden ${
              isFetching 
                ? "border-[#FFD700]/50 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)] scale-95"
                : "border-white/10 hover:border-[#FFD700]/80 bg-white/[0.02] hover:bg-[#FFD700]/10 hover:shadow-[0_0_25px_rgba(255,215,0,0.25)] hover:scale-[1.02] text-muted-foreground hover:text-[#FFD700]"
            }`}
            title="Refresh Dossiers"
          >
            <RefreshCw className={`h-4 w-4 transition-transform duration-700 ${isFetching ? "animate-spin text-[#FFD700]" : "group-hover:rotate-180"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {isFetching ? "Syncing..." : "Sync"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          </button>
        </div>
      </div>

      {/* Luxury A&R Sub-Navigation Tabs */}
      <div className="flex border-b border-white/10 mb-6 md:mb-8 font-mono text-[10px] relative z-10 w-full overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => { setViewTab("active"); setStatusFilter("All"); }}
          className={`px-8 py-3.5 border-b-2 transition-all duration-300 cursor-pointer uppercase tracking-widest ${
            viewTab === "active"
              ? "border-[#FFD700] text-[#FFD700] font-bold shadow-[0_4px_15px_-3px_rgba(255,215,0,0.25)] bg-gradient-to-t from-[#FFD700]/10 to-transparent"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          Active Queue ({countActive})
        </button>
        <button
          onClick={() => { setViewTab("archived"); setStatusFilter("Archived"); }}
          className={`px-8 py-3.5 border-b-2 transition-all duration-300 cursor-pointer uppercase tracking-widest ${
            viewTab === "archived"
              ? "border-[#FFD700] text-[#FFD700] font-bold shadow-[0_4px_15px_-3px_rgba(255,215,0,0.25)] bg-gradient-to-t from-[#FFD700]/10 to-transparent"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          Archived Dossiers ({countArchived})
        </button>
      </div>

      {/* Main Grid: Table (Left) + Selected application details panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column: Applications Table */}
        <div className={`bg-white/[0.01] rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl ${selectedApp ? "lg:col-span-8" : "lg:col-span-12"}`}>
          {isLoading ? (
            <div className="p-16 text-center text-muted-foreground font-mono text-[10px] uppercase tracking-[0.3em]">
              <div className="w-6 h-6 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
              Fetching applications dossier...
            </div>
          ) : (
            <div className="w-full">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.03] text-[9px] uppercase tracking-[0.3em] font-mono font-semibold text-white/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5">Submission Date</th>
                      <th className="px-6 py-5">Artist Name</th>
                      <th className="px-6 py-5">Applicant</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-light">
                    {filtered.map((app) => (
                      <tr
                        key={app.id}
                        className={`hover:bg-white/[0.04] transition-all duration-200 group ${
                          selectedApp?.id === app.id ? "bg-white/[0.06] border-l-2 border-[#FFD700]" : "border-l-2 border-transparent"
                        }`}
                      >
                        <td className="px-6 py-5 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                          {new Date(app.submitted_at).toLocaleDateString()} <span className="opacity-50 ml-1">{new Date(app.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {app.artist_photo_url ? (
                              <div className="h-10 w-10 rounded-md overflow-hidden border border-white/10 shrink-0 bg-zinc-900 shadow-md">
                                <img src={app.artist_photo_url} alt={app.artist_name} className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-md border border-white/5 bg-zinc-950/50 flex items-center justify-center shrink-0 font-mono text-[9px] text-zinc-600">
                                NO IMG
                              </div>
                            )}
                            <div>
                              <span className="font-display font-medium text-lux-white text-sm uppercase block leading-tight">{app.artist_name}</span>
                              {app.spotify_link && (
                                <a
                                  href={app.spotify_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-0.5 text-accent hover:underline text-[9px] font-mono block mt-0.5"
                                >
                                  Spotify Link <ArrowUpRight className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-semibold text-white tracking-wide">{app.full_name}</div>
                          <div className="text-muted-foreground text-[10px] font-mono mt-1">{app.email}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold border uppercase tracking-widest ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-md transition-all duration-200 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {viewTab === "active" ? (
                            <button
                              onClick={() => handleArchive(app.id)}
                              className="text-[#FFD700]/70 hover:text-[#FFD700] hover:bg-white/5 p-2 rounded transition-colors cursor-pointer"
                              title="Archive Submission"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(app.id)}
                                className="text-green-400/70 hover:text-green-400 hover:bg-white/5 p-2 rounded transition-colors cursor-pointer"
                                title="Restore Submission"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemove(app.id)}
                                className="text-red-500/70 hover:text-red-500 hover:bg-white/5 p-2 rounded transition-colors cursor-pointer"
                                title="Permanently Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground font-mono">
                          No applications matched filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden flex flex-col divide-y divide-white/5">
                {filtered.map((app) => (
                  <div 
                    key={app.id} 
                    className={`p-5 flex flex-col gap-5 transition-all duration-200 ${
                      selectedApp?.id === app.id ? "bg-white/[0.06] border-l-2 border-[#FFD700]" : "border-l-2 border-transparent hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold border uppercase tracking-widest ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {app.artist_photo_url ? (
                        <div className="h-14 w-14 rounded-md overflow-hidden border border-white/10 shrink-0 bg-zinc-900 shadow-md">
                          <img src={app.artist_photo_url} alt={app.artist_name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-md border border-white/5 bg-zinc-950/50 flex items-center justify-center shrink-0 font-mono text-[9px] text-zinc-600">
                          NO IMG
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-display font-medium text-lux-white text-base uppercase block leading-tight truncate">{app.artist_name}</span>
                        {app.spotify_link && (
                          <a
                            href={app.spotify_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-accent hover:underline text-[9px] font-mono mt-1"
                          >
                            Spotify Link <ArrowUpRight className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/[0.02] rounded-lg p-3.5 border border-white/5">
                      <div className="font-semibold text-white tracking-wide text-xs truncate">{app.full_name}</div>
                      <div className="text-muted-foreground text-[10px] font-mono mt-1 truncate">{app.email}</div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-white hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-all duration-200 cursor-pointer flex-1 flex justify-center items-center"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {viewTab === "active" ? (
                        <button
                          onClick={() => handleArchive(app.id)}
                          className="text-[#FFD700] bg-[#FFD700]/5 hover:bg-[#FFD700]/10 p-3 rounded-lg transition-colors cursor-pointer flex-1 flex justify-center items-center"
                          title="Archive Submission"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(app.id)}
                            className="text-green-400 bg-green-500/5 hover:bg-green-500/10 p-3 rounded-lg transition-colors cursor-pointer flex-1 flex justify-center items-center"
                            title="Restore Submission"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(app.id)}
                            className="text-red-500 bg-red-500/5 hover:bg-red-500/10 p-3 rounded-lg transition-colors cursor-pointer flex-1 flex justify-center items-center"
                            title="Permanently Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground font-mono text-xs">
                    No applications matched filters.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Application Panel */}
        {selectedApp && (
          <div className="lg:col-span-4 border border-white/10 bg-white/[0.02] p-8 rounded-2xl space-y-7 relative overflow-hidden shadow-2xl backdrop-blur-xl">
            
            {/* Tech Corner Brackets */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#FFD700]/30" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#FFD700]/30" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#FFD700]/30" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#FFD700]/30" />

            {/* Header / Dismiss */}
            <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-widest text-[#FFD700] border-b border-[#FFD700]/10 pb-3">
              <span>DOSSIER DETECTOR // FULL INFO</span>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-muted-foreground hover:text-accent p-1 hover:bg-white/5 rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Roster Candidate Profile Preview Card */}
            {selectedApp.artist_photo_url && (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg group bg-zinc-950 mb-6">
                <img 
                  src={selectedApp.artist_photo_url} 
                  alt={selectedApp.artist_name} 
                  className="w-full h-full object-cover filter brightness-[0.9] group-hover:scale-102 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border border-[#E5D5C0]/35 bg-black/60 text-[#E5D5C0] mb-2">
                    ROSTER CANDIDATE
                  </span>
                  <h4 className="font-display text-xl uppercase font-black text-white">{selectedApp.artist_name}</h4>
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                    <span>{selectedApp.status}</span>
                    <span>{new Date(selectedApp.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Title / Identity */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#FFD700]">STAGE IDENTITY</span>
              <h3 className="font-display text-3xl uppercase text-white font-black tracking-tight">{selectedApp.artist_name}</h3>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">{selectedApp.application_number ? selectedApp.application_number.toString() : selectedApp.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4 font-mono text-[10px] uppercase text-muted-foreground border-y border-white/5 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-white/30 text-[8px]">FULL APPLICANT NAME</span>
                <span className="text-white font-semibold">{selectedApp.full_name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white/30 text-[8px]">ELECTRONIC EMAIL</span>
                <a href={`mailto:${selectedApp.email}`} className="text-[#FFD700] hover:underline font-semibold block">
                  {selectedApp.email}
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white/30 text-[8px]">SUBMITTED DATE</span>
                <span className="text-white">{new Date(selectedApp.submitted_at).toLocaleString()}</span>
              </div>
              {selectedApp.spotify_link && (
                <div className="flex flex-col gap-1">
                  <span className="text-white/30 text-[8px]">SPOTIFY AUDIO COORDINATES</span>
                  <a
                    href={selectedApp.spotify_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFD700] hover:underline font-semibold flex items-center gap-1"
                  >
                    {selectedApp.spotify_link.substring(0, 40)}...
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              )}
              {selectedApp.epk_url && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-white/30 text-[8px]">ELECTRONIC PRESS KIT (EPK)</span>
                  <a
                    href={selectedApp.epk_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFD700] hover:underline font-semibold flex items-center gap-1 font-mono uppercase text-[9px] tracking-wider"
                  >
                    Download EPK (PDF)
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Campaign Directives (Bio/Message) */}
            <div className="space-y-3">
              <h4 className="font-display text-sm uppercase text-lux-white tracking-wide">Campaign Details</h4>
              <p className="text-xs text-white/70 leading-loose font-light bg-black/60 border border-white/5 p-5 rounded-lg h-40 overflow-y-auto whitespace-pre-wrap select-text scrollbar-none font-sans shadow-inner">
                {selectedApp.campaign_details || "No campaign directives entered."}
              </p>
            </div>

            {/* Administration Directives (Status Select) */}
            {viewTab === "active" && (
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-white/30">ADMINISTRATION STATUS ACTION</h4>
                
                <div className="grid grid-cols-2 gap-3 font-mono text-[9px]">
                  {["Pending", "Reviewing", "Approved", "Rejected"].map((st) => (
                    <button
                      key={st}
                      disabled={updatingId !== null}
                      onClick={() => handleStatusChange(selectedApp.id, st as any)}
                      className={`px-3 py-2.5 border rounded-lg uppercase tracking-wider text-center cursor-pointer transition-all duration-300 ${
                        (selectedApp.status === st || (selectedApp.status === "Reviewed" && st === "Reviewing"))
                          ? "bg-[#FFD700] text-black border-[#FFD700] font-bold shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                          : "bg-black/40 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      {updatingId === selectedApp.id && (selectedApp.status === st || (selectedApp.status === "Reviewed" && st === "Reviewing")) ? "Saving..." : st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dossier Media Packages & Action Directives */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#FFD700]">DOSSIER ACTION DIRECTIVES</h4>
              <div className="flex flex-col gap-2">
                {selectedApp.artist_photo_url && (
                  <button
                    onClick={() => triggerFileDownload(
                      selectedApp.artist_photo_url!, 
                      `${selectedApp.artist_name.replace(/\s+/g, "_")}_Press_Photo.jpg`,
                      "photo",
                      selectedApp.id
                    )}
                    disabled={downloadingPhotoId !== null}
                    className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-[#FFD700]/40 bg-black/40 hover:bg-[#FFD700]/5 text-white hover:text-[#FFD700] py-2.5 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all cursor-pointer"
                  >
                    <span>{downloadingPhotoId === selectedApp.id ? "DOWNLOADING..." : "📥 DOWNLOAD PHOTO"}</span>
                  </button>
                )}

                {selectedApp.epk_url && (
                  <button
                    onClick={() => triggerFileDownload(
                      selectedApp.epk_url!, 
                      `${selectedApp.artist_name.replace(/\s+/g, "_")}_EPK.pdf`,
                      "pdf",
                      selectedApp.id
                    )}
                    disabled={downloadingPdfId !== null}
                    className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-[#FFD700]/40 bg-black/40 hover:bg-[#FFD700]/5 text-white hover:text-[#FFD700] py-2.5 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all cursor-pointer"
                  >
                    <span>{downloadingPdfId === selectedApp.id ? "DOWNLOADING..." : "📥 DOWNLOAD EPK PDF"}</span>
                  </button>
                )}

                {viewTab === "active" ? (
                  <button
                    onClick={() => handleArchive(selectedApp.id)}
                    className="w-full flex items-center justify-center gap-2 border border-[#FFD700]/20 bg-[#FFD700]/5 hover:bg-[#FFD700]/10 text-[#FFD700] py-2.5 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all cursor-pointer"
                  >
                    <Archive className="h-3 w-3" />
                    <span>📁 ARCHIVE SUBMISSION</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleRestore(selectedApp.id)}
                      className="w-full flex items-center justify-center gap-2 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-400 py-2.5 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>🔄 RESTORE TO ACTIVE</span>
                    </button>
                    <button
                      onClick={() => handleRemove(selectedApp.id)}
                      className="w-full flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 py-2.5 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all cursor-pointer"
                    >
                      <span>🗑 PERMANENTLY DELETE</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminShell>
  );
}
