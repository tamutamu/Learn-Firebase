import React, { useContext, useState, useEffect } from "react"
import { auth } from "../firebase"

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)

    function signup(email, password) {
        return auth.createUserWithEmailAndPassword(email, password)
    }

    function login(email, password) {
      return auth.signInWithEmailAndPassword(email, password)
    }

    function logout() {
      return auth.signOut()
    }

    const value = {
        currentUser,
        signup,
        login,
        logout
    }

    useEffect(() => {
        // Firebase Authのメソッド。ログイン状態が変化すると呼び出される
        auth.onAuthStateChanged(user => {
          setCurrentUser(user);
          setLoading(false)
        });
      }, []);

    return (
        <AuthContext.Provider value={value}>
           {!loading && children}
        </AuthContext.Provider>
    )
}    


