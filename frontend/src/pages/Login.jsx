import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
  const res = await api.post("/api/auth/google", {
  token: credentialResponse.credential,
});

      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/app/dashboard");

    } catch (err) {
      alert("Google login failed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-indigo-50 flex items-center justify-center p-6">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl shadow-indigo-200/50 border border-white/30 relative z-10">

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#6366F1] rounded-[1.5rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-500/20 ring-8 ring-indigo-500/5 transition-transform hover:scale-105 cursor-pointer">
            <Sparkles size={32} fill="currentColor" />
          </div>

          <h2 className="text-3xl font-black text-[#111322] uppercase tracking-tight">
            CareerPulse AI
          </h2>

          <p className="text-gray-400 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">
            Sign in to your intelligent portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />

              <input
                type="email"
                required
                className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />

              <input
                type="password"
                required
                className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>

        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-400 text-sm">OR</div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log("Login Failed")}
          />
        </div>

        <p className="text-center mt-8 text-sm font-medium text-gray-400">
          Don't have an account?
          <Link to="/signup" className="text-indigo-600 font-bold ml-1">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;