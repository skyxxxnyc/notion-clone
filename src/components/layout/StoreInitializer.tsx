"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store";
import { createClient } from "@/lib/supabase";

export function StoreInitializer() {
    const { initialize, setCurrentUser } = useAppStore();
    const supabase = createClient();

    useEffect(() => {
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    setCurrentUser({
                        id: session.user.id,
                        email: session.user.email!,
                        name: session.user.user_metadata.full_name || session.user.email!.split("@")[0],
                        createdAt: session.user.created_at,
                        updatedAt: session.user.updated_at || session.user.created_at,
                    });
                    initialize();
                } else {
                    setCurrentUser(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [initialize, setCurrentUser, supabase.auth]);

    return null;
}
