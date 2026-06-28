import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function AgentApplication() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Redirect if user is not logged in or is already an agent
  useEffect(() => {
    if (!state.user) {
      dispatch({ type: "OPEN_LOGIN_MODAL" });
      navigate("/", { replace: true });
    } else if (state.user.type === "agent") {
      navigate("/agent/dashboard", { replace: true });
    }
  }, [state.user, navigate, dispatch]);

  const [formData, setFormData] = useState({
    agency_name: "",
    business_type: "",
    pan_number: "",
    gstin: "",
    phone: state.user?.phone || "",
    website: "",
    experience: "",
    license_number: "",
    specialties: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.agency_name || !formData.pan_number || !formData.phone) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Backend validations require non-empty strings for website, licenceNumber, specialities.
      // We dynamically generate safe fallbacks if they are empty in the form.
      const safeWebsite = formData.website.trim() || `https://www.${formData.agency_name.replace(/\s+/g, "").toLowerCase()}.com`;
      const safeLicence = formData.license_number.trim() || `LIC${Math.floor(100000 + Math.random() * 900000)}`;
      const safeSpecialities = formData.specialties.trim() || "Tour Packages, Sightseeing";
      const parsedExperience = parseInt(formData.experience) || 0;

      const response = await fetch("http://localhost:3001/users/agent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.user.email,
          agencyName: formData.agency_name.trim(),
          website: safeWebsite,
          experience: parsedExperience,
          licenceNumber: safeLicence,
          panNumber: formData.pan_number.trim(),
          specialities: safeSpecialities,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.errorMessage || result.message || "Agent registration failed.");
      }
    } catch (err) {
      console.error("Agent registration error:", err);
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  if (!state.user) return null;

  if (isSubmitted) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-surface border border-outline-variant p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-[64px] text-green-600 mb-4">check_circle</span>
          <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            Your application to become a verified agent has been successfully submitted. It is now pending review by the Super Admin. You will be able to access the Agent Portal once your application is approved.
          </p>
          <button 
            onClick={() => navigate("/")} 
            className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/95 transition-colors cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopNavBar (Shared Component style) */}
      <header className="bg-surface-container-lowest dark:bg-primary-container border-b border-outline-variant dark:border-outline fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-2xl py-md">
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight">TOURIQ</span>
          <span className="hidden md:inline-block px-3 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface-variant ml-2">Verified Agent Portal</span>
        </div>
        <div className="flex items-center gap-md">
          <button aria-label="help" className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors cursor-pointer active:opacity-80 p-2 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined" data-icon="help">help</span>
          </button>
          <button aria-label="notifications" className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors cursor-pointer active:opacity-80 p-2 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant ml-2 flex-shrink-0 cursor-pointer">
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold">
              {state.user.name?.[0] || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Split Screen */}
      <main className="flex-grow flex mt-[73px] lg:mt-[73px]"> 
        {/* Left Panel: Visual/Brand */}
        <aside className="hidden lg:block lg:w-5/12 relative overflow-hidden bg-primary">
          <img alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" src="https://lh3.googleusercontent.com/aida/AP1WRLt7_fANxd4K73CBiQYRWvZpEcR5w90Py88GeSAlvcJzvK9r1jVZqyQvGG4Z1CLVmOfuh8jGb3o7ZimlVXm8xr86HvOE6Lt6txnsvOQK4uxWqN_cxWybqil2sxaeFJIGaf6op-yIn5IlYaiPsAmKzgW6XJPyoAbrzUEaNC-ib91PStM5XMO05CGSZHat_6IEjFU_p1-ncko57ZkFcO1HEudYzBJQ-wvl4WMaD1qp9gXr7a6fe2OoOTTP2A" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/20 flex flex-col justify-end p-2xl">
            <h1 className="font-headline-lg text-headline-lg text-on-primary mb-md">Partner with Excellence.</h1>
            <p className="font-body-lg text-body-lg text-inverse-primary max-w-md">Join the premier B2B marketplace for luxury Indian travel. Streamline your bookings, access exclusive inventory, and elevate your agency's offerings.</p>
          </div>
        </aside>

        {/* Right Panel: Form Area */}
        <section className="w-full lg:w-7/12 bg-surface-container-lowest overflow-y-auto px-margin-mobile py-2xl lg:px-24 xl:px-32 flex flex-col">
          <div className="max-w-2xl w-full mx-auto flex-grow flex flex-col">
            
            {/* Header */}
            <div className="mb-xl">
              <h2 className="font-headline-md text-headline-md text-primary mb-2">Business Details</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Provide your agency's legal details to unlock the marketplace.</p>
            </div>

            {error && (
              <div className="mb-md p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-2xl">
              
              {/* Section 1: Business Profile */}
              <div className="space-y-md">
                <h3 className="font-headline-md text-headline-md text-tertiary-container border-b border-surface-container-highest pb-2">Business Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="agency_name">Registered Agency Name <span className="text-error">*</span></label>
                    <input value={formData.agency_name} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="agency_name" placeholder="e.g. Wanderlust Travels Pvt Ltd" type="text" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="business_type">Legal Business Type <span className="text-error">*</span></label>
                    <div className="relative">
                      <select value={formData.business_type} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 pr-10 font-body-md text-body-md text-on-surface appearance-none focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="business_type" required>
                        <option disabled value="">Select Type</option>
                        <option value="sole">Sole Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="llp">LLP</option>
                        <option value="pvt_ltd">Private Limited</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="pan_number">PAN Number <span className="text-error">*</span></label>
                    <input value={formData.pan_number} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow uppercase" id="pan_number" placeholder="ABCDE1234F" type="text" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface flex justify-between" htmlFor="gstin">
                      <span className="">GSTIN Number</span>
                      <span className="text-on-surface-variant font-normal">Optional</span>
                    </label>
                    <input value={formData.gstin} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow uppercase" id="gstin" placeholder="22AAAAA0000A1Z5" type="text" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface flex justify-between" htmlFor="license_number">
                      <span className="">Trade License No.</span>
                      <span className="text-on-surface-variant font-normal">Optional</span>
                    </label>
                    <input value={formData.license_number} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow uppercase" id="license_number" placeholder="LIC123456" type="text" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="phone">Contact Phone <span className="text-error">*</span></label>
                    <input value={formData.phone} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="phone" placeholder="+91 9876543210" type="tel" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface flex justify-between" htmlFor="website">
                      <span className="">Website</span>
                      <span className="text-on-surface-variant font-normal">Optional</span>
                    </label>
                    <input value={formData.website} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="website" placeholder="https://youragency.com" type="url" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface flex justify-between" htmlFor="experience">
                      <span className="">Years of Experience</span>
                      <span className="text-on-surface-variant font-normal">Optional</span>
                    </label>
                    <input value={formData.experience} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="experience" placeholder="e.g. 5" type="number" />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface flex justify-between" htmlFor="specialties">
                      <span className="">Specialties</span>
                      <span className="text-on-surface-variant font-normal">Optional</span>
                    </label>
                    <input value={formData.specialties} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="specialties" placeholder="e.g. Luxury tours, Honeymoons, Corporate travel" type="text" />
                  </div>
                </div>
              </div>

              {/* Section 2: Registered Office Address */}
              <div className="space-y-md">
                <h3 className="font-headline-md text-headline-md text-tertiary-container border-b border-surface-container-highest pb-2">Registered Office Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="address">Building/Street Address <span className="text-error">*</span></label>
                    <textarea value={formData.address} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow resize-none" id="address" placeholder="Flat No., Building Name, Street..." rows="3" required></textarea>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="city">City <span className="text-error">*</span></label>
                    <input value={formData.city} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="city" placeholder="e.g. Mumbai" type="text" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="state">State <span className="text-error">*</span></label>
                    <div className="relative">
                      <select value={formData.state} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 pr-10 font-body-md text-body-md text-on-surface appearance-none focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="state" required>
                        <option disabled value="">Select State</option>
                        <option value="mh">Maharashtra</option>
                        <option value="dl">Delhi</option>
                        <option value="ka">Karnataka</option>
                        <option value="tn">Tamil Nadu</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="pincode">Pincode <span className="text-error">*</span></label>
                    <input value={formData.pincode} onChange={handleChange} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-shadow" id="pincode" placeholder="000000" type="number" required />
                  </div>
                </div>
              </div>

              {/* Spacer to push footer down if content is short */}
              <div className="flex-grow"></div>

              {/* Form Footer Actions */}
              <div className="mt-xl pt-md border-t border-surface-container-highest flex flex-col-reverse sm:flex-row justify-between items-center gap-md">
                <button onClick={handleBack} disabled={loading} className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-primary text-primary font-label-md text-label-md font-bold hover:bg-surface-container-low transition-colors text-center cursor-pointer disabled:opacity-50" type="button">
                  Back
                </button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold hover:bg-secondary hover:text-on-secondary transition-colors text-center cursor-pointer shadow-sm disabled:opacity-60">
                  {loading ? "Registering..." : "Save & Continue"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
