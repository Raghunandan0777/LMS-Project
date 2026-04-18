import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("eduflow_user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch (e) {
      localStorage.removeItem("lms_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("eduflow_token");
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("eduflow_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("eduflow_token");
          localStorage.removeItem("eduflow_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("eduflow_token", res.data.token);
    localStorage.setItem("eduflow_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.data.token) {
      localStorage.setItem("eduflow_token", res.data.token);
      localStorage.setItem("eduflow_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("eduflow_token");
    localStorage.removeItem("eduflow_user");
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("eduflow_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
