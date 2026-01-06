import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MdOutlineTimeline,
  MdCheckCircle,
  MdAddTask,
  MdPeople,
} from "react-icons/md";

// --- Components ---

// 1. Professional Logos Component
const CompanyLogos = () => (
  <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
    {/* Google-ish */}
    <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
      <path d="M12.5,0C5.6,0,0,5.6,0,12.5S5.6,25,12.5,25c3.2,0,6.2-1.2,8.4-3.2v-2.8c-2,1.8-4.6,2.8-7.3,2.8c-4.8,0-8.7-3.9-8.7-8.7s3.9-8.7,8.7-8.7c2.3,0,4.4,0.8,6.1,2.1L21.8,4C19.3,1.5,16,0,12.5,0z M28,24h4V1h-4V24z M40,24h4V8h-4V24z" />
    </svg>
    {/* Amazon-ish */}
    <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
      <path d="M10,22c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S13.3,22,10,22z M30,22c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S33.3,22,30,22z M50,24h-4V1h4V24z" />
    </svg>
    {/* Microsoft-ish */}
    <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
      <rect x="0" y="0" width="10" height="10" />
      <rect x="12" y="0" width="10" height="10" />
      <rect x="0" y="12" width="10" height="10" />
      <rect x="12" y="12" width="10" height="10" />
      <rect x="30" y="0" width="4" height="22" />
    </svg>
    {/* Spotify-ish */}
    <svg className="h-9" viewBox="0 0 100 30" fill="currentColor">
      <circle cx="15" cy="15" r="12" />
      <rect x="35" y="8" width="4" height="14" />
      <rect x="45" y="5" width="4" height="17" />
      <rect x="55" y="10" width="4" height="12" />
    </svg>
  </div>
);

// 2. Feature Section (The "Ads")
const FeatureSection = ({
  title,
  description,
  badge,
  align = "left",
  color = "indigo",
}: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`flex flex-col md:flex-row items-center gap-12 py-24 px-6 max-w-7xl mx-auto ${
        align === "right" ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Text Side */}
      <div className="flex-1 space-y-6">
        <span
          className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase bg-${color}-100 text-${color}-600 rounded-full shadow-sm`}
        >
          {badge}
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          {title}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
        <div className="pt-4">
          <Link
            to="/auth/register"
            className={`group inline-flex items-center gap-2 text-${color}-600 font-bold hover:text-${color}-700 transition-colors`}
          >
            Learn more
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Visual Side */}
      <div className="flex-1 w-full perspective-1000">
        <motion.div
          whileHover={{ rotateY: align === "left" ? 5 : -5, rotateX: 5 }}
          transition={{ type: "spring", stiffness: 100 }}
          className={`aspect-video rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-${color}-50 to-white border-4 border-white ring-1 ring-gray-100 p-8 flex items-center justify-center relative`}
        >
          {/* Abstract UI Mockup */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>
          <div className="relative bg-white w-full h-full rounded-xl shadow-xl border border-gray-100 p-5 flex flex-col gap-4">
            <div className="w-1/3 h-5 bg-gray-100 rounded-md animate-pulse"></div>
            <div className="flex gap-4 h-full">
              <div className="flex-1 bg-blue-50/50 rounded-lg border border-dashed border-blue-200 p-2 space-y-2">
                <div className="h-16 bg-white rounded shadow-sm"></div>
                <div className="h-16 bg-white rounded shadow-sm opacity-60"></div>
              </div>
              <div className="flex-1 bg-purple-50/50 rounded-lg border border-dashed border-purple-200 p-2">
                <div className="h-20 bg-white rounded shadow-sm"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Main Landing Page ---

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  // If user is logged in, redirect them to dashboard
  const { user } = useSelector((state: any) => state.auth);
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  // Handle Navbar Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- NEW: Scroll To Top Function ---
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 overflow-x-hidden">
      {/* --- Sticky Navbar --- */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo with Scroll Action */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={scrollToTop}
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              <MdOutlineTimeline size={32} />
            </div>

            <span className="text-xl font-bold tracking-tight text-gray-900">
              Samwise
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/auth/login"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors hidden sm:block"
            >
              Log in
            </Link>
            <Link to="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-xl"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div
          style={{ y: y1, x: -50 }}
          className="absolute top-20 left-0 w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"
        ></motion.div>
        <motion.div
          style={{ y: y2, x: 50 }}
          className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"
        ></motion.div>

        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-6">
              Manage projects <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                like a Wizard.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-medium"
          >
            The AI-powered workspace that plans, tracks, and automates your
            work. Stop juggling apps and start shipping.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-6"
          >
            <Link to="/auth/register" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-400/50">
                Start for Free
              </button>
            </Link>
          </motion.div>
        </div>

        {/* --- 3D Dashboard Preview --- */}
        <div className="mt-20 max-w-6xl mx-auto relative perspective-2000">
          {/* Floating Elements / Decorators */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-12 -left-8 md:top-10 md:-left-12 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100"
          >
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <MdCheckCircle size={24} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase">
                Status
              </div>
              <div className="font-bold text-gray-800">Project Shipped 🚀</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-40 -right-4 md:top-20 md:-right-16 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100"
          >
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <MdPeople size={24} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase">
                Team
              </div>
              <div className="font-bold text-gray-800">5 Members Active</div>
            </div>
          </motion.div>

          {/* Main 3D Image */}
          <motion.div
            initial={{ rotateX: 20, opacity: 0, y: 100 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, type: "spring" }}
            style={{ perspective: 1000 }}
            className="relative z-10 rounded-xl bg-gray-900 p-2 shadow-2xl ring-1 ring-gray-900/10"
          >
            <div className="rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
              <img
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                alt="App Dashboard"
                className="w-full opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Logos Section --- */}
      <section className="py-12 border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
            Trusted by modern teams
          </p>
          <CompanyLogos />
        </div>
      </section>

      {/* --- Feature Ads Section --- */}
      <section className="bg-white py-10 overflow-hidden">
        <FeatureSection
          title="Visualize your workflow."
          description="Build the perfect workflow for every project. Track tasks with flexible Kanban boards that keep your team moving forward."
          badge="KANBAN BOARDS"
          align="left"
          color="blue"
        />

        <FeatureSection
          title="Your AI Project Manager."
          description="Meet Samwise Assistant. It writes emails, summarizes tasks, and helps you brainstorm ideas without ever leaving your board."
          badge="AI ASSISTANT"
          align="right"
          color="purple"
        />

        <FeatureSection
          title="Collaborate in real-time."
          description="See who's viewing tasks, leave comments, and get instant updates. Working together has never been this synchronized."
          badge="COLLABORATION"
          align="left"
          color="green"
        />
      </section>

      {/* --- Bottom CTA --- */}
      <section className="py-32 px-6 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        {/* Glowing Orbs in Footer */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Ready to work <span className="text-indigo-400">smarter?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of teams already using Samwise to ship faster. It's
            free to get started.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-gray-900 text-xl font-bold rounded-2xl hover:bg-gray-100 transition-colors shadow-xl"
              >
                Get Started Now
              </motion.button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 pt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 px-6 bg-gray-50 border-t border-gray-200 text-center md:text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-600">
          <div>
            <div
              className="flex items-center gap-2 mb-4 justify-center md:justify-start cursor-pointer"
              onClick={scrollToTop}
            >
              <div className="group-hover:scale-110 transition-transform duration-200">
                <MdOutlineTimeline size={32} />
              </div>

              <span className="font-bold text-gray-900 text-lg">Samwise</span>
            </div>
            <p className="text-sm text-gray-500">
              The collaborative workspace for <br /> modern teams.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm hover:text-gray-900 cursor-pointer">
              <li>Features</li>
              <li>Pricing</li>
              <li>Enterprise</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm hover:text-gray-900 cursor-pointer">
              <li>Guide</li>
              <li>API</li>
              <li>Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm hover:text-gray-900 cursor-pointer">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
