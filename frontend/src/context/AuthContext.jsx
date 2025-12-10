import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
            // If no profile exists, create one
            await createProfile(userId)
        } finally {
            setLoading(false)
        }
    }

    const createProfile = async (userId) => {
        try {
            const { data: userData } = await supabase.auth.getUser()
            const { data, error } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    email: userData.user.email,
                    username: userData.user.email.split('@')[0],
                    ai_credits: 200,
                    total_ai_requests: 0
                })
                .select()
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error creating profile:', error)
        }
    }

    const signUp = async (email, password, userData) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        })
        if (error) throw error
        return data
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setProfile(null)
    }

    const updateCredits = async (amount) => {
        if (!profile) return

        const newCredits = profile.ai_credits + amount
        const { error } = await supabase
            .from('users')
            .update({
                ai_credits: newCredits,
                total_ai_requests: profile.total_ai_requests + 1
            })
            .eq('id', user.id)

        if (error) throw error
        setProfile({ ...profile, ai_credits: newCredits, total_ai_requests: profile.total_ai_requests + 1 })
    }

    const deductCredits = async (cost) => {
        if (!profile || profile.ai_credits < cost) {
            throw new Error('Insufficient credits')
        }
        await updateCredits(-cost)
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateCredits,
        deductCredits,
        refreshProfile: () => user && fetchProfile(user.id)
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
