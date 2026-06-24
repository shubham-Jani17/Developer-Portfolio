import { useState, useRef, useEffect } from "react";
import { checkAdminSession, updateAdminPassword, updateAdminEmail, uploadHeroPortrait, uploadResume } from "../api/client";
import { resolveHeroImage } from "../utils/heroImage";
import useAdminPortfolio from "../hooks/useAdminPortfolio";
import {
  AdminCard,
  AdminField,
  AdminPage,
  AdminSaveBar,
  adminInputClass,
} from "../components/AdminUi";

export default function SettingsPage() {
  const { portfolio, loading, saving, message, error, setPortfolio, save, reload } =
    useAdminPortfolio();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  // Email change state
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [showEmailCurrent, setShowEmailCurrent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");

  useEffect(() => {
    checkAdminSession()
      .then((data) => {
        if (data && data.email) {
          setCurrentAdminEmail(data.email);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch admin session details:", err);
      });
  }, []);

  // Media uploads references
  const portraitFileRef = useRef(null);
  const resumeFileRef = useRef(null);
  const [portraitUploading, setPortraitUploading] = useState(false);
  const [portraitUploadError, setPortraitUploadError] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState("");
  const [previewKey, setPreviewKey] = useState(0);

  if (loading || !portfolio) return <p className="text-muted-foreground">Loading settings…</p>;

  const { site = {}, hero = {}, social = [] } = portfolio;

  // State update helpers
  const updateSite = (patch) => {
    setPortfolio((p) => ({
      ...p,
      site: { ...p.site, ...patch },
    }));
  };

  const updateHero = (patch) => {
    setPortfolio((p) => ({
      ...p,
      hero: { ...p.hero, ...patch },
    }));
  };

  const updateSocialLink = (index, patch) => {
    const next = [...social];
    next[index] = { ...next[index], ...patch };
    setPortfolio((p) => ({ ...p, social: next }));
  };

  const addSocialLink = () => {
    const next = [...social, { label: "New Link", href: "https://", icon: "mail" }];
    setPortfolio((p) => ({ ...p, social: next }));
  };

  const deleteSocialLink = (index) => {
    const next = social.filter((_, i) => i !== index);
    setPortfolio((p) => ({ ...p, social: next }));
  };

  // Password strength check
  const hasLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;

  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!isPasswordValid) {
      setPwdError("New password does not meet complexity requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirm password do not match.");
      return;
    }

    setPwdLoading(true);
    try {
      await updateAdminPassword(currentPassword, newPassword);
      setPwdSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdError(err.message || "Failed to update password.");
    } finally {
      setPwdLoading(false);
    }
  };

  // Handle email submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!newAdminEmail.trim()) {
      setEmailError("New email address is required.");
      return;
    }

    setEmailLoading(true);
    try {
      await updateAdminEmail(emailCurrentPassword, newAdminEmail.trim());
      setEmailSuccess("Login email updated successfully!");
      setCurrentAdminEmail(newAdminEmail.trim());
      setEmailCurrentPassword("");
      setNewAdminEmail("");
    } catch (err) {
      setEmailError(err.message || "Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  // Media upload handlers
  const handlePortraitUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      setPortraitUploadError("Please choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPortraitUploadError("Image must be under 5MB.");
      return;
    }

    setPortraitUploading(true);
    setPortraitUploadError("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });

      const { image } = await uploadHeroPortrait(dataUrl);
      updateHero({ image });
      setPreviewKey(Date.now());
      window.dispatchEvent(new Event("portfolio-updated"));
      try {
        const bc = new BroadcastChannel("portfolio-channel");
        bc.postMessage("updated");
        bc.close();
      } catch (e) {}
      await reload();
    } catch (err) {
      setPortraitUploadError(err.message || "Upload failed");
    } finally {
      setPortraitUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      setResumeUploadError("Please choose a PDF document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumeUploadError("Document must be under 10MB.");
      return;
    }

    setResumeUploading(true);
    setResumeUploadError("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });

      const { resumeUrl } = await uploadResume(dataUrl, file.name);
      updateSite({ resumeUrl });
      window.dispatchEvent(new Event("portfolio-updated"));
      try {
        const bc = new BroadcastChannel("portfolio-channel");
        bc.postMessage("updated");
        bc.close();
      } catch (e) {}
      await reload();
    } catch (err) {
      setResumeUploadError(err.message || "Upload failed");
    } finally {
      setResumeUploading(false);
    }
  };

  const portraitPreview = resolveHeroImage(hero.image);
  const portraitUrl = portraitPreview ? `${portraitPreview}${portraitPreview.includes("?") ? "&" : "?"}v=${previewKey}` : "";

  return (
    <AdminPage
      title="Settings"
      subtitle="Manage profile identity, contact links, resume documents, and account credentials."
    >
      <div className="max-w-3xl space-y-6">
        
        {/* Profile Identity Card */}
        <AdminCard title="Profile Identity">
          <p className="text-xs text-muted-foreground mb-4">
            Manage your public location details, active contact email address, and profile visuals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Mail ID" hint="Used for contact forms & direct mail links.">
              <input
                type="email"
                className={adminInputClass}
                value={site.email ?? ""}
                onChange={(e) => updateSite({ email: e.target.value })}
                required
              />
            </AdminField>

            <AdminField label="Location" hint="Displayed in the contact section.">
              <input
                type="text"
                className={adminInputClass}
                value={site.location ?? ""}
                onChange={(e) => updateSite({ location: e.target.value })}
                required
              />
            </AdminField>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile photo block */}
            <div className="space-y-4">
              <span className="contact-label">Profile Portrait Photo</span>
              <div className="flex gap-4 items-center mt-1.5">
                <div className="w-20 h-24 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                  {portraitUrl ? (
                    <img
                      src={portraitUrl}
                      alt="Portrait preview"
                      className="h-full w-full object-cover"
                      onError={(ev) => {
                        ev.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground p-2 text-center">
                      No Photo
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={portraitFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePortraitUpload}
                  />
                  <button
                    type="button"
                    disabled={portraitUploading}
                    onClick={() => portraitFileRef.current?.click()}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-60 cursor-pointer"
                  >
                    {portraitUploading ? "Uploading…" : "Upload Photo"}
                  </button>
                  {portraitUploadError && <p className="text-xs text-destructive">{portraitUploadError}</p>}
                </div>
              </div>
              <AdminField label="Photo URL Path" hint="Direct path or external URL for the hero image.">
                <input
                  type="text"
                  className={adminInputClass}
                  value={hero.image ?? ""}
                  onChange={(e) => updateHero({ image: e.target.value })}
                />
              </AdminField>
            </div>

            {/* Resume upload block */}
            <div className="space-y-4">
              <span className="contact-label">Resume Document (PDF)</span>
              <div className="mt-1.5 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={resumeFileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                  <button
                    type="button"
                    disabled={resumeUploading}
                    onClick={() => resumeFileRef.current?.click()}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-60 cursor-pointer"
                  >
                    {resumeUploading ? "Uploading…" : "Upload PDF"}
                  </button>
                  {site.resumeUrl && (
                    <a
                      href={site.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      View Current PDF
                    </a>
                  )}
                </div>
                {resumeUploadError && <p className="text-xs text-destructive">{resumeUploadError}</p>}
              </div>
              <AdminField label="Resume URL Path" hint="Path or URL to the downloadable PDF file.">
                <input
                  type="text"
                  className={adminInputClass}
                  value={site.resumeUrl ?? ""}
                  onChange={(e) => updateSite({ resumeUrl: e.target.value })}
                />
              </AdminField>
            </div>
          </div>
        </AdminCard>

        {/* Social Links Card */}
        <AdminCard title="Social Links">
          <p className="text-xs text-muted-foreground mb-4">
            Manage your presence across Github, LinkedIn, and general contact buttons. These links display in the follow sidebar and contact section.
          </p>

          <div className="space-y-3">
            {social.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.5fr_3fr_auto] items-end gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <div>
                  <label className="text-[10px] uppercase font-mono-display tracking-wider text-muted-foreground block mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    className={adminInputClass}
                    value={item.label}
                    placeholder="e.g. GitHub"
                    onChange={(e) => updateSocialLink(idx, { label: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono-display tracking-wider text-muted-foreground block mb-1">
                    Icon Name
                  </label>
                  <select
                    className={`${adminInputClass} bg-slate-950 text-white cursor-pointer`}
                    value={item.icon}
                    onChange={(e) => updateSocialLink(idx, { icon: e.target.value })}
                  >
                    <option value="github" className="bg-slate-950 text-white">GitHub Icon</option>
                    <option value="linkedin" className="bg-slate-950 text-white">LinkedIn Icon</option>
                    <option value="mail" className="bg-slate-950 text-white">Mail / Envelope Icon</option>
                    <option value="youtube" className="bg-slate-950 text-white">YouTube Icon</option>
                    <option value="instagram" className="bg-slate-950 text-white">Instagram Icon</option>
                    <option value="snapchat" className="bg-slate-950 text-white">Snapchat Icon</option>
                    <option value="x" className="bg-slate-950 text-white">X (Twitter) Icon</option>
                    <option value="reddit" className="bg-slate-950 text-white">Reddit Icon</option>
                    <option value="discord" className="bg-slate-950 text-white">Discord Icon</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono-display tracking-wider text-muted-foreground block mb-1">
                    Link URL (href)
                  </label>
                  <input
                    type="url"
                    className={adminInputClass}
                    value={item.href}
                    placeholder="https://"
                    onChange={(e) => updateSocialLink(idx, { href: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => deleteSocialLink(idx)}
                  className="rounded-full px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors border border-destructive/10 sm:mb-0.5"
                >
                  Remove
                </button>
              </div>
            ))}

            {social.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No social links added yet.</p>
            )}

            <button
              type="button"
              onClick={addSocialLink}
              className="w-full rounded-xl border border-dashed border-white/10 hover:border-cyan-500/30 bg-white/[0.02] hover:bg-white/[0.04] p-3 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              + Add New Social Link
            </button>
          </div>
        </AdminCard>

        {/* Change Admin Login Email Card */}
        <form onSubmit={handleEmailSubmit}>
          <AdminCard title="Change Admin Login Email">
            <p className="text-xs text-muted-foreground mb-6">
              Update the login email address for this admin panel. This is the email you use to sign in.
            </p>

            <AdminField label="Current Login Email" hint="Your active admin login email address.">
              <input
                type="email"
                className={`${adminInputClass} opacity-60 cursor-not-allowed`}
                value={currentAdminEmail || "Loading..."}
                disabled
              />
            </AdminField>

            <AdminField label="Current Password" hint="Verify your identity.">
              <div className="relative">
                <input
                  type={showEmailCurrent ? "text" : "password"}
                  className={`${adminInputClass} pr-12`}
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEmailCurrent(!showEmailCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                >
                  {showEmailCurrent ? "Hide" : "Show"}
                </button>
              </div>
            </AdminField>

            <AdminField label="New Login Email" hint="Enter your new active email address.">
              <input
                type="email"
                className={adminInputClass}
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
            </AdminField>

            {emailError && (
              <div className="mt-4 p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
                {emailError}
              </div>
            )}

            {emailSuccess && (
              <div className="mt-4 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-sm font-medium">
                {emailSuccess}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={emailLoading}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/95 disabled:opacity-60 transition-opacity cursor-pointer"
              >
                {emailLoading ? "Updating email…" : "Update email"}
              </button>
            </div>
          </AdminCard>
        </form>

        {/* Change Admin Password Card */}
        <form onSubmit={handlePasswordSubmit}>
          <AdminCard title="Change Admin Password">
            <p className="text-xs text-muted-foreground mb-6">
              Update the login password for this admin panel. Choose a strong, secure password.
            </p>

            <AdminField label="Current Password" hint="Verify your identity.">
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  className={`${adminInputClass} pr-12`}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                >
                  {showCurrent ? "Hide" : "Show"}
                </button>
              </div>
            </AdminField>

            <AdminField label="New Password" hint="Must meet all complexity requirements listed below.">
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className={`${adminInputClass} pr-12`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>

              {newPassword && (
                <div className="mt-3 space-y-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-xs transition-all duration-300">
                  <p className="font-semibold text-muted-foreground mb-2">Password Requirements:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className={`flex items-center gap-2 transition-all duration-300 ${hasLength ? "text-cyan-400 font-medium scale-[1.01]" : "text-muted-foreground"}`}>
                      {hasLength ? (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>At least 8 characters ({newPassword.length}/8)</span>
                    </div>

                    <div className={`flex items-center gap-2 transition-all duration-300 ${hasUppercase ? "text-cyan-400 font-medium scale-[1.01]" : "text-muted-foreground"}`}>
                      {hasUppercase ? (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>One uppercase letter (A-Z)</span>
                    </div>

                    <div className={`flex items-center gap-2 transition-all duration-300 ${hasLowercase ? "text-cyan-400 font-medium scale-[1.01]" : "text-muted-foreground"}`}>
                      {hasLowercase ? (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>One lowercase letter (a-z)</span>
                    </div>

                    <div className={`flex items-center gap-2 transition-all duration-300 ${hasDigit ? "text-cyan-400 font-medium scale-[1.01]" : "text-muted-foreground"}`}>
                      {hasDigit ? (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>One number (0-9)</span>
                    </div>

                    <div className={`flex items-center gap-2 transition-all duration-300 ${hasSpecial ? "text-cyan-400 font-medium scale-[1.01]" : "text-muted-foreground"}`}>
                      {hasSpecial ? (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 shrink-0 stroke-[2.5] text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}
            </AdminField>

            <AdminField label="Confirm New Password" hint="Re-type your new password.">
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className={`${adminInputClass} pr-12`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </AdminField>

            {pwdError && (
              <div className="mt-4 p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
                {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="mt-4 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-sm font-medium">
                {pwdSuccess}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={pwdLoading}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/95 disabled:opacity-60 transition-opacity cursor-pointer"
              >
                {pwdLoading ? "Updating password…" : "Update password"}
              </button>
            </div>
          </AdminCard>
        </form>

      </div>

      {/* Global save bar for profile settings & social links */}
      <AdminSaveBar
        onSave={() => save("settings")}
        saving={saving}
        message={message}
        error={error}
      />
    </AdminPage>
  );
}
