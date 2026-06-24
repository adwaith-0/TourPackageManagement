import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"

export default function LoginModal() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  const [prevIsOpen, setPrevIsOpen] = useState(false)
  const [view, setView] = useState("login")

  if (state.loginModal.isOpen && !prevIsOpen) {
    setPrevIsOpen(true)
    setView(state.loginModal.view || "login")
  } else if (!state.loginModal.isOpen && prevIsOpen) {
    setPrevIsOpen(false)
  }

  useEffect(() => {
    if (state.loginModal.isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [state.loginModal.isOpen])

  const close = () => dispatch({ type: "CLOSE_LOGIN_MODAL" })

  // Clear errors on view change
  useEffect(() => {
    dispatch({ type: "CLEAR_AUTH_ERROR" })
  }, [view, dispatch])

  if (!state.loginModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={close} />

      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden flex z-10 animate-scale-in max-h-[90vh]">
        <button onClick={close} className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-[20px] text-white">close</span>
        </button>

        <LeftPanel view={view} />

        <div className="w-full md:w-[55%] p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Logo */}
          <div className="text-center mb-5 text-2xl font-bold">
            <span className="text-primary">TOUR</span><span className="text-accent">IQ</span>
          </div>

          {/* Auth Error */}
          {state.authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {state.authError}
            </div>
          )}

          {view === "login" && <LoginForm setView={setView} navigate={navigate} />}
          {view === "signup" && <SignupForm setView={setView} navigate={navigate} />}
          {view === "forgot" && <ForgotPasswordForm setView={setView} />}
        </div>
      </div>
    </div>
  )
}

// ─── Left Panel ──────────────────────────────────────────────────────────────
function LeftPanel({ view }) {
  const benefits = [
    { icon: "flight_takeoff", text: "Browse curated tour packages" },
    { icon: "favorite", text: "Save & track your inquiries" },
    { icon: "chat", text: "Direct WhatsApp with providers" },
  ]

  return (
    <div className="hidden md:flex w-[45%] relative min-h-[480px] flex-col justify-center p-8 bg-primary overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=60")`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-primary/80" />
      <div className="relative z-10 text-white">
        <div className="mb-3">
          <span className="font-display-lg font-bold text-[24px]">TOUR<span className="text-accent">IQ</span></span>
        </div>
        <h2 className="text-xl font-bold mb-8">
          {view === "signup" ? "Create your account" : view === "forgot" || view === "reset" ? "Reset your password" : "Welcome back!"}
        </h2>
        <div className="space-y-6">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
              </div>
              <p className="text-sm font-medium pt-2">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Login Form ──────────────────────────────────────────────────────────────
function LoginForm({ setView, navigate }) {
  const { state, dispatch } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    dispatch({ type: "LOGIN", payload: { email: email.trim(), password } })
  }

  // Watch for successful login
  useEffect(() => {
    if (state.user) {
      if (state.user.type === "superadmin") {
        navigate("/admin/dashboard")
      } else if (state.user.type === "agent") {
        navigate("/agent/dashboard")
      } else {
        navigate("/")
      }
    }
  }, [state.user, navigate])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-primary">Sign In</h3>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
        <div className="relative">
          <span className="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" required />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
        <div className="relative">
          <span className="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">lock</span>
          <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-12 pl-10 pr-12 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" required />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined text-[18px]">{showPass ? "visibility_off" : "visibility"}</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => setView("forgot")} className="text-xs text-accent font-semibold hover:underline">Forgot Password?</button>
      </div>

      <button type="submit" className="w-full bg-primary text-white font-bold h-13 py-3 rounded-lg uppercase tracking-wider hover:bg-primary/90 transition-colors cta-glow">
        Sign In
      </button>

      <div className="flex items-center my-3">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 text-xs text-gray-400">or</span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      <p className="text-sm text-center text-gray-500">
        Don't have an account?{" "}
        <button type="button" onClick={() => setView("signup")} className="text-accent font-bold hover:underline">Sign Up</button>
      </p>
    </form>
  )
}

// ─── Signup Form ─────────────────────────────────────────────────────────────
function SignupForm({ setView, navigate }) {
  const { state, dispatch } = useApp()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [localErr, setLocalErr] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalErr("")
    if (!name.trim()) { setLocalErr("Name is required"); return }
    if (!email.trim() || !email.includes("@")) { setLocalErr("Valid email required"); return }
    if (!phone.trim() || phone.length < 10) { setLocalErr("Valid phone number required"); return }
    if (password.length < 6) { setLocalErr("Password must be at least 6 characters"); return }
    if (password !== confirmPass) { setLocalErr("Passwords do not match"); return }

    setLoading(true)
    setTimeout(() => {
      dispatch({
        type: "SIGNUP",
        payload: { email: email.trim(), password, name: name.trim(), phone: phone.trim(), type: "personal" },
      })
      setLoading(false)
    }, 300)
  }

  useEffect(() => {
    if (state.user) {
      navigate(state.user.type === "agent" ? "/agent/dashboard" : "/")
    }
  }, [state.user, navigate])

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-lg font-bold text-primary">Create Account</h3>

      {localErr && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>{localErr}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile Number</label>
        <div className="flex border border-gray-300 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden">
          <div className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-600">+91</div>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter mobile number" className="flex-1 px-4 h-11 bg-transparent border-none outline-none text-sm" required />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
        <div className="relative">
          <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <span className="material-symbols-outlined text-[18px]">{showPass ? "visibility_off" : "visibility"}</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm Password</label>
        <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm your password" className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-accent text-white font-bold h-12 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors cta-glow disabled:opacity-60 mt-2">
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-sm text-center text-gray-500 mt-2">
        Already have an account?{" "}
        <button type="button" onClick={() => setView("login")} className="text-primary font-bold hover:underline">Sign In</button>
      </p>

      <p className="text-[10px] text-gray-400 text-center">By signing up, you agree to our <a href="#" className="text-primary underline">Terms</a> and <a href="#" className="text-primary underline">Privacy Policy</a></p>
    </form>
  )
}

// ─── Reset Password (Direct — No OTP) ────────────────────────────────────────
function ForgotPasswordForm({ setView }) {
  const { state, dispatch } = useApp()
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [localErr, setLocalErr] = useState("")
  const [success, setSuccess] = useState(false)

  const handleReset = (e) => {
    e.preventDefault()
    setLocalErr("")
    dispatch({ type: "CLEAR_AUTH_ERROR" })

    if (!email.trim() || !email.includes("@")) { setLocalErr("Please enter a valid email"); return }
    if (newPassword.length < 6) { setLocalErr("Password must be at least 6 characters"); return }
    if (newPassword !== confirmPass) { setLocalErr("Passwords do not match"); return }

    // Check if user exists
    const userExists = state.users.find((u) => u.email === email.trim())
    if (!userExists) { setLocalErr("No account found with this email"); return }

    dispatch({
      type: "DIRECT_RESET_PASSWORD",
      payload: { email: email.trim(), newPassword },
    })
    setSuccess(true)
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <h3 className="text-lg font-bold text-primary">Reset Password</h3>
      <p className="text-sm text-gray-500">Enter your email and set a new password.</p>

      {localErr && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>{localErr}
        </div>
      )}

      {success && !localErr ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <span className="material-symbols-outlined text-[40px] text-green-500 mb-2">check_circle</span>
          <p className="text-sm text-green-700 font-semibold">Password reset successfully!</p>
          <button type="button" onClick={() => setView("login")} className="mt-3 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
            Sign In Now
          </button>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your registered email" className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm New Password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm password" className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
          </div>
          <button type="submit" className="w-full bg-accent text-white font-bold h-12 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors cta-glow">
            Reset Password
          </button>
        </>
      )}

      <p className="text-sm text-center text-gray-500">
        <button type="button" onClick={() => setView("login")} className="text-primary font-semibold hover:underline">← Back to Sign In</button>
      </p>
    </form>
  )
}