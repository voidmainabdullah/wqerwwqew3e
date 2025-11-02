// FileTransferDemo.tsx
import React, { useEffect, useState } from "react";
import {
  Upload,
  Lock,
  ShareNetwork,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    icon: <Upload size={40} className="text-blue-500" />,
    title: "File Uploaded",
    desc: "Your file begins its secure journey through our encrypted system.",
  },
  {
    icon: <Lock size={40} className="text-blue-500" />,
    title: "Encryption",
    desc: "Data is encrypted with 256-bit protection before leaving your device.",
  },
  {
    icon: <ShareNetwork size={40} className="text-blue-500" />,
    title: "Share Process",
    desc: "Encrypted link generated — ready to share instantly.",
  },
  {
    icon: <ShieldCheck size={40} className="text-blue-500" />,
    title: "Secured Transfer",
    desc: "Advanced protection ensures integrity during file transfer.",
  },
  {
    icon: <CheckCircle size={40} className="text-green-500" />,
    title: "Transfer Complete",
    desc: "Your file has safely reached its destination.",
  },
];

export default function FileTransferDemo() {
  const [activeStep, setActiveStep] = useState(-1);

  // Simulate step activation animation
  useEffect(() => {
    steps.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i);
      }, i * 1000);
    });
  }, []);

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white flex flex-col items-center justify-center overflow-hidden">
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="text-4xl sm:text-5xl font-bold text-blue-500 mb-3">
          Seamless File Transfer
        </h2>
        <p className="text-neutral-400 text-lg">
          Experience a professional end-to-end file journey — from upload to
          encryption and secure delivery.
        </p>
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center gap-12">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-20 h-20 rounded-full border transition-all duration-700 ${
                activeStep >= index
                  ? "border-blue-500 bg-blue-950/50 shadow-lg shadow-blue-800/40 scale-105"
                  : "border-zinc-700 bg-zinc-900 opacity-50"
              }`}
            >
              {step.icon}
            </div>

            {index !== steps.length - 1 && (
              <div
                className={`absolute top-[82px] left-1/2 w-[2px] h-12 transform -translate-x-1/2 transition-all duration-700 ${
                  activeStep > index
                    ? "bg-gradient-to-b from-blue-600 to-blue-800"
                    : "bg-zinc-700"
                }`}
              />
            )}

            <div
              className={`mt-4 text-center transition-all duration-700 ${
                activeStep >= index ? "opacity-100" : "opacity-40"
              }`}
            >
              <h3 className="text-xl font-semibold text-blue-400">
                {step.title}
              </h3>
              <p className="text-neutral-400 text-sm max-w-xs mx-auto mt-1">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* background glows */}
      <div className="absolute top-0 left-1/2 w-[400px] h-[400px] bg-blue-700/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-1/2 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-3xl translate-x-1/2" />
    </section>
  );
}
