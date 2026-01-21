'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, MessageCircle, Instagram, Clock, Mail } from 'lucide-react';

export function LandingFooter() {
    return (
        <footer id="localizacao" className="bg-burgos-dark pt-24 pb-12 border-t border-white/5 relative">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/">
                            <Image
                                src="/logo-dbb.png"
                                alt="Burgos Barber"
                                width={120}
                                height={70}
                                className="h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <p className="text-burgos-accent/60 text-sm leading-relaxed">
                            Resgatando a tradição da barbearia clássica com a sofisticação que o homem moderno merece.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Instagram size={20} />} />
                            <SocialLink href="#" icon={<MessageCircle size={20} />} />
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contato</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="https://wa.me/5511979504525" className="flex items-center gap-3 text-burgos-accent/70 hover:text-burgos-primary transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-burgos-primary/20">
                                        <MessageCircle size={14} />
                                    </div>
                                    (11) 97950-4525
                                </a>
                            </li>
                            <li>
                                <a href="tel:11979504525" className="flex items-center gap-3 text-burgos-accent/70 hover:text-burgos-primary transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-burgos-primary/20">
                                        <Phone size={14} />
                                    </div>
                                    (11) 97950-4525
                                </a>
                            </li>
                            <li>
                                <a href="mailto:contato@burgosbarber.com.br" className="flex items-center gap-3 text-burgos-accent/70 hover:text-burgos-primary transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-burgos-primary/20">
                                        <Mail size={14} />
                                    </div>
                                    contato@burgosbarber.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Location */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Localização</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-burgos-accent/70">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                                    <MapPin size={14} />
                                </div>
                                <span>
                                    Av. Dr. José Maciel, 500<br />
                                    Jardim Maria Rosa<br />
                                    Taboão da Serra - SP
                                </span>
                            </li>
                            <li className="pt-2">
                                <a
                                    href="https://maps.google.com"
                                    target="_blank"
                                    className="text-xs font-bold uppercase tracking-wider text-burgos-primary hover:text-white border-b border-burgos-primary pb-0.5"
                                >
                                    Abrir no Mapa
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Hours */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Horários</h4>
                        <ul className="space-y-3">
                            <li className="flex justify-between text-sm">
                                <span className="text-burgos-accent/60">Segunda</span>
                                <span className="text-white font-medium">10:00 - 16:00</span>
                            </li>
                            <li className="flex justify-between text-sm">
                                <span className="text-burgos-accent/60">Terça a Sexta</span>
                                <span className="text-white font-medium">10:00 - 20:00</span>
                            </li>
                            <li className="flex justify-between text-sm">
                                <span className="text-burgos-accent/60">Sábado</span>
                                <span className="text-white font-medium">08:00 - 18:00</span>
                            </li>
                            <li className="flex justify-between text-sm pt-2 border-t border-white/5 mt-2">
                                <span className="text-burgos-accent/60">Domingo</span>
                                <span className="text-red-400 font-medium">Fechado</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-burgos-accent/40">
                    <p>&copy; {new Date().getFullYear()} Barbearia Burgos. Todos os direitos reservados.</p>
                    <div className="flex gap-4">
                        <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
                        <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon }: { href: string, icon: any }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-burgos-primary hover:-translate-y-1 transition-all duration-300"
        >
            {icon}
        </a>
    );
}
