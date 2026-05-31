import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useStore } from "../store/useStore";

export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setUser, showToast } = useStore();

  const handleSubmit = async () => {
    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      setUser(userCredential.user);
      showToast("Login Successful!", "success");
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(10px)"
      }}
    >
      <div
        style={{
          width: "420px",
          background: "rgba(5,10,20,0.95)",
          border: "1px solid rgba(0,210,255,0.3)",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 0 40px rgba(0,210,255,0.15)"
        }}
      >
        <h2
          style={{
            color: "#00d2ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700"
          }}
        >
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "white",
            outline: "none"
          }}
        />

        <div style={{ position: "relative", width: "100%", marginBottom: "20px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              paddingRight: "50px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "white",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "#00d2ff",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0"
            }}
            title={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px",
            background: "#00d2ff",
            border: "none",
            borderRadius: "10px",
            color: "black",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          LOGIN
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "white",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}