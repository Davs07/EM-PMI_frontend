"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white  dark:bg-black/95 dark:border-border/40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                            P
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-foreground">
                            PMI<span className="text-primary">Events</span>
                        </span>
                    </Link>
                </div>


                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        Iniciar Sesión
                    </Button>
                    <Button className="font-semibold">
                        Registrarse
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-6 h-6" />
                </Button>
            </div>
        </header>
    )
}
