"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { PMIHeader } from "../pmi-header"
import Image from "next/image"
import Logo from "./logo"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white  dark:bg-black/95 dark:border-border/40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Logo />



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
