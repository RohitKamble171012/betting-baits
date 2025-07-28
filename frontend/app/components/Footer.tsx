"use client";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-6 border-t-4 border-orange-500 bottom-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm md:text-base">
              &copy; {new Date().getFullYear()} BettingBaits. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          

          {/* Powered By */}
          <div className="flex items-center">
            <p className="text-sm md:text-base">
              Powered by{" "}
              <span className="font-semibold bg-orange-800/50 px-2 py-1 rounded-md">
                1o
              </span>
            </p>
          </div>
        </div>

        {/* Additional Links */}
        
      </div>
    </footer>
  );
};

export default Footer;
