"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface CleanupResult {
  success: boolean;
  verified: boolean;
  points?: number;
  totalPoints?: number;
  reason?: string;
  feedback?: string;
  message?: string;
  breakdown?: {
    severity: number;
    areaSize: number;
    properDisposal: number;
    effectiveness: number;
  };
}

export default function CapturePage() {
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState<CleanupResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const startCamera = async () => {
    setCameraError("");

    const attachStream = (stream: MediaStream): Promise<void> => {
      return new Promise((resolve, reject) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          reject(new Error("Video element not found"));
          return;
        }
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => resolve())
            .catch(reject);
        };
      });
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      await attachStream(stream);
      setCameraActive(true);
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        await attachStream(stream);
        setCameraActive(true);
      } catch {
        setCameraError("Camera access denied. Please allow camera permission in browser settings.");
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = (type: "before" | "after") => {
    const video = videoRef.current;
    if (!video || video.readyState < video.HAVE_CURRENT_DATA) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    stopCamera();
    if (type === "before") {
      setBeforeImage(dataUrl);
      setStep(2);
    } else {
      setAfterImage(dataUrl);
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!beforeImage || !afterImage || !location) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cleanup", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beforeImage, afterImage, location }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, verified: false, message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Result Screen
  if (result) {
    const verified = result.verified;
    return (
      <div className="min-h-screen bg-[#f8faf6] flex flex-col items-center justify-center px-6 text-center">
        
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${verified ? "bg-[#EAF3DE]" : "bg-[#fff5ee]"}`}>
          <i className={`ti ${verified ? "ti-circle-check" : "ti-circle-x"} text-5xl ${verified ? "text-[#3B6D11]" : "text-orange-400"}`}></i>
        </div>

        <h2 className="text-[#27500A] text-2xl font-semibold mb-2">
          {verified ? "Cleanup Verified!" : "No Cleanup Detected"}
        </h2>
        <p className="text-[#888780] text-sm mb-6">{result.reason}</p>

        {/* Points Earned */}
        <div className={`border rounded-2xl p-5 mb-3 w-full max-w-xs ${verified ? "bg-white border-[#e0ead8]" : "bg-white border-[#ffe8d6]"}`}>
          <p className="text-[#888780] text-sm mb-1">Points Earned</p>
          <p className={`text-4xl font-semibold ${verified ? "text-[#3B6D11]" : "text-orange-400"}`}>
            +{result.points || 0}
          </p>
        </div>

        {/* Points Breakdown */}
        {verified && result.breakdown && (
          <div className="bg-white border border-[#e0ead8] rounded-2xl p-4 mb-3 w-full max-w-xs text-left">
            <p className="text-[#888780] text-xs font-medium uppercase tracking-widest mb-3">
              Points Breakdown
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Severity", icon: "ti-trash", value: result.breakdown.severity },
                { label: "Area Size", icon: "ti-arrows-maximize", value: result.breakdown.areaSize },
                { label: "Proper Disposal", icon: "ti-recycle", value: result.breakdown.properDisposal },
                { label: "Effectiveness", icon: "ti-sparkles", value: result.breakdown.effectiveness },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className={`ti ${item.icon} text-[#639922] text-sm`}></i>
                    <span className="text-[#5F5E5A] text-sm">{item.label}</span>
                  </div>
                  <span className="text-[#27500A] text-sm font-medium">+{item.value}</span>
                </div>
              ))}
              <div className="border-t border-[#e0ead8] pt-2 flex justify-between">
                <span className="text-[#27500A] text-sm font-semibold">Total</span>
                <span className="text-[#3B6D11] text-sm font-semibold">+{result.points}</span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {result.feedback && (
          <div className="bg-white border border-[#e0ead8] rounded-xl p-3 mb-6 w-full max-w-xs flex items-start gap-2">
            <i className="ti ti-bulb text-[#639922] text-sm mt-0.5"></i>
            <p className="text-[#5F5E5A] text-xs">{result.feedback}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => router.push("/home")}
            className="w-full bg-[#639922] hover:bg-[#3B6D11] text-white font-medium py-3 px-6 rounded-full transition-all"
          >
            Back to Home
          </button>
          {!verified && (
            <button
              onClick={() => {
                setResult(null);
                setStep(1);
                setBeforeImage(null);
                setAfterImage(null);
                setLocation("");
              }}
              className="w-full border border-[#e0ead8] text-[#888780] font-medium py-3 px-6 rounded-full hover:bg-white transition-all"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf6] px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => { stopCamera(); router.push("/home"); }}
          className="w-8 h-8 bg-white border border-[#e0ead8] rounded-lg flex items-center justify-center hover:bg-[#f4f9ef] transition-all"
        >
          <i className="ti ti-arrow-left text-[#3B6D11] text-sm"></i>
        </button>
        <h1 className="text-[#27500A] text-xl font-semibold">Start Cleanup</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? "bg-[#639922]" : "bg-[#e0ead8]"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-[#888780] mb-8 px-1">
        <span className={step >= 1 ? "text-[#639922] font-medium" : ""}>Before Photo</span>
        <span className={step >= 2 ? "text-[#639922] font-medium" : ""}>After Photo</span>
        <span className={step >= 3 ? "text-[#639922] font-medium" : ""}>Submit</span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#EAF3DE] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ti ti-camera text-[#3B6D11] text-2xl"></i>
            </div>
            <h2 className="text-[#27500A] text-xl font-semibold mb-1">Step 1 of 3</h2>
            <p className="text-[#888780] text-sm">Take a photo of the dirty area before cleaning</p>
          </div>

          {cameraError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-500 text-sm text-center flex items-center gap-2">
              <i className="ti ti-alert-circle text-sm"></i>
              {cameraError}
            </div>
          )}

          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-72 object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-6">
                <button
                  onClick={stopCamera}
                  className="bg-white/20 backdrop-blur text-white text-xs px-4 py-2 rounded-full border border-white/30"
                >
                  Cancel
                </button>
                <button
                  onClick={() => capturePhoto("before")}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-[#639922] active:scale-95 transition-transform shadow-lg"
                >
                  <div className="w-10 h-10 bg-[#639922] rounded-full" />
                </button>
                <div className="w-16" />
              </div>
            </div>
          ) : beforeImage ? (
            <div className="relative rounded-2xl overflow-hidden mb-4">
              <img src={beforeImage} alt="Before" className="w-full h-72 object-cover" />
              <button
                onClick={() => setBeforeImage(null)}
                className="absolute top-3 right-3 bg-white/90 text-[#27500A] text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm"
              >
                <i className="ti ti-refresh text-xs"></i>
                Retake
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-[#c0dda0] rounded-2xl p-12 text-center mb-4">
              <i className="ti ti-camera text-[#c0dda0] text-5xl"></i>
              <p className="text-[#639922] font-medium mt-3">Camera Preview</p>
              <p className="text-[#888780] text-sm mt-1">Click below to open camera</p>
            </div>
          )}

          {!cameraActive && (
            <button
              onClick={beforeImage ? () => setStep(2) : startCamera}
              className="w-full bg-[#639922] hover:bg-[#3B6D11] text-white font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2"
            >
              <i className={`ti ${beforeImage ? "ti-arrow-right" : "ti-camera"} text-sm`}></i>
              {beforeImage ? "Continue" : "Open Camera"}
            </button>
          )}
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#EAF3DE] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ti ti-sparkles text-[#3B6D11] text-2xl"></i>
            </div>
            <h2 className="text-[#27500A] text-xl font-semibold mb-1">Step 2 of 3</h2>
            <p className="text-[#888780] text-sm">Clean the area, then take an after photo</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <i className="ti ti-check text-[#639922] text-xs"></i>
                <p className="text-[#639922] text-xs font-medium">Before</p>
              </div>
              <img src={beforeImage!} alt="Before" className="w-full h-36 object-cover rounded-xl border border-[#e0ead8]" />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <i className="ti ti-clock text-[#888780] text-xs"></i>
                <p className="text-[#888780] text-xs font-medium">After</p>
              </div>
              {cameraActive ? (
                <div className="relative rounded-xl overflow-hidden h-36 bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-[#c0dda0] rounded-xl h-36 flex flex-col items-center justify-center">
                  <i className="ti ti-camera text-[#c0dda0] text-3xl"></i>
                  <span className="text-[#888780] text-xs mt-1">Pending</span>
                </div>
              )}
            </div>
          </div>

          {cameraActive ? (
            <div className="flex gap-3">
              <button
                onClick={stopCamera}
                className="flex-1 border border-[#e0ead8] text-[#888780] font-medium py-3 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={() => capturePhoto("after")}
                className="flex-1 bg-[#639922] hover:bg-[#3B6D11] text-white font-medium py-3 rounded-full transition-all"
              >
                Capture After Photo
              </button>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full bg-[#639922] hover:bg-[#3B6D11] text-white font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2"
            >
              <i className="ti ti-camera text-sm"></i>
              Open Camera
            </button>
          )}
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#EAF3DE] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ti ti-map-pin text-[#3B6D11] text-2xl"></i>
            </div>
            <h2 className="text-[#27500A] text-xl font-semibold mb-1">Step 3 of 3</h2>
            <p className="text-[#888780] text-sm">Add location and submit</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <i className="ti ti-check text-[#639922] text-xs"></i>
                <p className="text-[#639922] text-xs font-medium">Before</p>
              </div>
              <img src={beforeImage!} alt="Before" className="w-full h-36 object-cover rounded-xl border border-[#e0ead8]" />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <i className="ti ti-check text-[#639922] text-xs"></i>
                <p className="text-[#639922] text-xs font-medium">After</p>
              </div>
              <img src={afterImage!} alt="After" className="w-full h-36 object-cover rounded-xl border border-[#e0ead8]" />
            </div>
          </div>

          <div className="bg-[#EAF3DE] border border-[#c0dda0] rounded-xl p-3 mb-4 flex items-center gap-2">
            <i className="ti ti-check text-[#639922] text-sm"></i>
            <span className="text-[#3B6D11] text-sm font-medium">Photos captured successfully</span>
          </div>

          <div className="mb-6">
            <label className="text-[#5F5E5A] text-sm font-medium mb-2 block">
              Location
            </label>
            <div className="relative">
              <i className="ti ti-map-pin text-[#639922] text-sm absolute left-4 top-1/2 -translate-y-1/2"></i>
              <input
                type="text"
                placeholder="e.g. Connaught Place, New Delhi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-[#e0ead8] rounded-xl pl-10 pr-4 py-3 text-[#27500A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#639922] transition-colors text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!location || loading}
            className="w-full bg-[#639922] hover:bg-[#3B6D11] disabled:opacity-40 text-white font-medium py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="ti ti-loader-2 animate-spin text-sm"></i>
                Verifying with AI...
              </>
            ) : (
              <>
                <i className="ti ti-send text-sm"></i>
                Submit Cleanup
              </>
            )}
          </button>

          {loading && (
            <p className="text-[#888780] text-xs text-center mt-3">
              AI is analyzing your before & after photos...
            </p>
          )}
        </div>
      )}
    </div>
  );
}