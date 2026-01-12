import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Heart,
  Code,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const FooterComponent = () => {
  const developers = [
    { name: "Savindu Abeywickrama", role: "Full Stack Developer" },
    { name: "Anjana Kaluarachchi", role: "Frontend Developer" },
    { name: "Hirudini Gimhani", role: "UI/UX Designer" },
    { name: "Pasindu Rasanga", role: "Backend Developer" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 inline-block">
              CarePlus
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transforming healthcare with digital innovation. Seamlessly
              connecting patients, doctors, and emergency services for a safer,
              healthier tomorrow.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="hover:text-blue-400 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:text-pink-500 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>
                  123 , Careplus Home ,
                  <br />
                  Colombo , Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>support@careplus.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Developers & Copyright Section */}
      <div className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            &copy; {currentYear} CarePlus Inc. All rights reserved.
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <Code className="w-3 h-3" /> Developed by:
            </span>
            <div className="flex flex-wrap justify-center gap-3">
              {developers.map((dev, index) => (
                <span
                  key={index}
                  className="hover:text-slate-400 transition-colors cursor-default"
                >
                  {dev.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
