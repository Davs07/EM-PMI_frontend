import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                                P
                            </div>
                            <span className="text-xl font-extrabold tracking-tight">
                                PMI<span className="text-primary">Events</span>
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Empoderando a las personas para convertir ideas en realidad. La autoridad líder mundial en gestión de proyectos.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Youtube className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Spacer for layout balance */}
                    <div className="hidden md:block"></div>
                    <div className="hidden md:block"></div>

                    {/* Support */}
                    <div className="flex justify-start md:justify-end">
                        <div className="text-left md:text-right">
                            <h3 className="font-bold text-lg mb-6">Soporte</h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><Link href="#" className="hover:text-primary transition-colors">Centro de Ayuda</Link></li>
                                <li><Link href="#" className="hover:text-primary transition-colors">Contacto</Link></li>
                                <li><Link href="#" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© 2024 Project Management Institute, Inc. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-white transition-colors">Términos</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
