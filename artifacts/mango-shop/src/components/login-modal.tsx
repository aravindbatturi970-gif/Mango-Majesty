import { useState } from "react";
import { useUserAuth } from "@/contexts/user-auth";
import { X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoginModal() {
  const { showLoginModal, closeLoginModal, login } = useUserAuth();
  const [step, setStep] = useState<"phone" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");

  function resetAndClose() {
    closeLoginModal();
    setTimeout(() => {
      setStep("phone");
      setPhone("");
      setName("");
      setPhoneError("");
      setNameError("");
    }, 300);
  }

  function handleContinue() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!accepted) {
      setPhoneError("Please accept the terms to continue");
      return;
    }
    setPhoneError("");
    setStep("name");
  }

  function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Please enter your name");
      return;
    }
    setNameError("");
    login({ name: trimmed, phone: phone.replace(/\D/g, "") });
  }

  return (
    <AnimatePresence>
      {showLoginModal && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#fdf8f0] rounded-t-3xl shadow-2xl max-w-md mx-auto"
          >
            <div className="px-6 pt-5 pb-10">
              {/* Handle bar */}
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />

              {/* Back / Close */}
              <div className="flex items-center justify-between mb-4">
                {step === "name" ? (
                  <button
                    onClick={() => setStep("phone")}
                    className="p-1 text-gray-500"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div />
                )}
                <button onClick={resetAndClose} className="p-1 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Logo + title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 mb-4">
                  <span className="text-3xl">🌿</span>
                </div>
                <h2 className="text-xl font-extrabold text-amber-600 tracking-widest uppercase">
                  {step === "phone" ? "Login" : "Your Name"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {step === "phone"
                    ? "Enter your mobile number to continue"
                    : "What should we call you?"}
                </p>
              </div>

              {step === "phone" ? (
                <div className="space-y-5">
                  {/* Phone input */}
                  <div className="border-b-2 border-gray-300 focus-within:border-amber-500 transition-colors flex items-center gap-3 pb-2">
                    <span className="text-gray-700 font-semibold text-base shrink-0">
                      +91
                    </span>
                    <div className="w-px h-5 bg-gray-300" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        setPhoneError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                      placeholder="Enter your phone number"
                      className="flex-1 bg-transparent outline-none text-gray-800 text-base placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-500">{phoneError}</p>
                  )}

                  <button
                    onClick={handleContinue}
                    disabled={phone.length < 10}
                    className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
                  >
                    Continue
                  </button>

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-0.5 accent-amber-500 w-4 h-4 shrink-0"
                    />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      By Clicking, I accept the{" "}
                      <span className="text-amber-600 font-medium">
                        Terms &amp; Conditions
                      </span>{" "}
                      &amp;{" "}
                      <span className="text-amber-600 font-medium">
                        Privacy Policy
                      </span>
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="border-b-2 border-gray-300 focus-within:border-amber-500 transition-colors pb-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                      placeholder="Enter your full name"
                      className="w-full bg-transparent outline-none text-gray-800 text-base placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                  {nameError && (
                    <p className="text-xs text-red-500">{nameError}</p>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={!name.trim()}
                    className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
