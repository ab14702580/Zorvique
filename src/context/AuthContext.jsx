import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../../firebase.init";
import api from "../api/axios";

export const AuthContext = createContext(null);

// ── Save / upsert user in MongoDB ─────────────────────────────────────────────
const saveUserToDB = async ({ email, displayName, photoURL, role }) => {
  await api.put(`/users/${encodeURIComponent(email)}`, {
    email,
    displayName,
    photoURL: photoURL || "",
    role: role || "user",
  });
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);  // Firebase user object
  const [dbUser, setDbUser] = useState(null);             // MongoDB user object (has role)
  const [loading, setLoading] = useState(true);

  // ── Fetch MongoDB user by email ───────────────────────────────────────────
  const fetchDbUser = async (email) => {
    try {
      const res = await api.get(`/users/${encodeURIComponent(email)}`);
      setDbUser(res.data);
      return res.data;
    } catch {
      setDbUser(null);
      return null;
    }
  };

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser?.email) {
        await fetchDbUser(firebaseUser.email);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Email / Password Register ─────────────────────────────────────────────
  const register = async (formData) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const displayName = `${formData.firstName} ${formData.lastName}`;
    await updateProfile(userCredential.user, { displayName });
    await saveUserToDB({
      email:       formData.email,
      displayName,
      photoURL:    formData.photoURL || "",
      role:        "user",
    });
    await fetchDbUser(formData.email);
    return userCredential;
  };

  // ── Email / Password Login ────────────────────────────────────────────────
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchDbUser(email);
    return result;
  };

  // ── Google Sign-In (works for both login and register) ───────────────────
  const googleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const { email, displayName, photoURL } = result.user;

    // Check if user already exists in MongoDB
    let existingUser = null;
    try {
      const res = await api.get(`/users/${encodeURIComponent(email)}`);
      existingUser = res.data;
    } catch {
      // 404 = new user
    }

    if (existingUser) {
      // User exists — just refresh local state, DON'T overwrite role
      setDbUser(existingUser);
    } else {
      // New user via Google — save to MongoDB with role: 'user'
      await saveUserToDB({
        email,
        displayName: displayName || '',
        photoURL:    photoURL    || '',
        role:        'user',
      });
      await fetchDbUser(email);
    }

    return result;
  };

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setDbUser(null);
  };

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isAuthenticated = !!currentUser;
  const role            = dbUser?.role || null;
  const isAdmin         = role === "admin";

  const value = {
    currentUser,
    dbUser,
    loading,
    isAuthenticated,
    role,
    isAdmin,
    register,
    login,
    googleSignIn,
    logout,
    fetchDbUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
