import React from 'react';
import { Link } from 'react-router-dom';
import lineQr from '../assets/LINEQR.JPG';

export default function Contact() {
  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-[#F0F5F2] font-sans">
      <div className="bg-white rounded-[2rem] p-[48px] max-w-[480px] w-[90%] shadow-[0_4px_24px_rgba(0,0,0,0.08)] text-center flex flex-col items-center">
        {/* VERDIFY LOGO */}
        <div className="font-bold tracking-tight text-[#2E4036] text-[16px] mb-[24px]">
          VERDIFY.
        </div>

        {/* HEADING */}
        <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-[8px]">
          Book a Free Sustainability Audit
        </h1>

        {/* SUBHEADING */}
        <p className="text-[15px] text-[#666666] font-sans mb-[32px]">
          We'll track your next event and generate<br/>
          a full ESG report — at no cost.
        </p>

        {/* DIVIDER */}
        <div className="w-full h-px bg-[#E0E0E0] mb-[32px]" />

        {/* LINE QR CODE SECTION */}
        <div className="text-[10px] font-mono uppercase text-[#2E4036] tracking-[2px] mb-[16px] font-bold">
          Scan to add on Line
        </div>

        <div className="mb-[16px]">
          {lineQr ? (
            <img 
              src={lineQr} 
              alt="LINE QR Code" 
              className="w-[200px] h-[200px] rounded-xl border-2 border-[#E0E0E0] object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{ display: lineQr ? 'none' : 'flex' }} className="w-[200px] h-[200px] bg-[#F0F5F2] border-2 border-dashed border-[#2E4036] rounded-xl flex items-center justify-center mx-auto">
            <span className="text-[12px] font-mono text-[#2E4036]">QR Code</span>
          </div>
        </div>

        {/* LINE ID */}
        <div className="text-[14px] font-mono font-bold text-[#2E4036] mt-[16px]">
          Line ID: @ashwin1234
        </div>

        {/* OR DIVIDER */}
        <div className="w-full flex items-center justify-center my-[24px]">
          <div className="flex-1 h-px bg-[#E0E0E0]" />
          <span className="px-[8px] text-[11px] text-[#888888]">or</span>
          <div className="flex-1 h-px bg-[#E0E0E0]" />
        </div>

        {/* EMAIL FALLBACK */}
        <div className="text-[12px] text-[#888888] mb-[4px]">
          Prefer email?
        </div>
        <a href="mailto:Chandashwin77@gmail.com" className="text-[13px] font-bold text-[#2E4036] hover:underline">
          Chandashwin77@gmail.com
        </a>

        {/* BACK LINK */}
        <Link to="/" className="mt-[32px] text-[11px] font-mono text-[#888888] hover:text-[#2E4036] transition-colors">
          &larr; Back to Verdify
        </Link>
      </div>
    </div>
  );
}
