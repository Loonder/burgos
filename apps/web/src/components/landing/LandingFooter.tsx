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
                                    Praça Miguel Ortega, 36<br />
                                    Parque Assunção<br />
                                    Taboão da Serra - SP
                                </span>
                            </li>

                        </ul>
                        {/* Google Maps Embed */}
                        <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.9752460688915!2d-46.7620062!3d-23.605220699999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce543bd8d21343%3A0x6ef42e19f2bffbcb!2sPra%C3%A7a%20Miguel%20Ortega%2C%2036%20-%20Parque%20Assuncao%2C%20Tabo%C3%A3o%20da%20Serra%20-%20SP%2C%2006754-160!5e0!3m2!1spt-BR!2sbr!4v1769027748153!5m2!1spt-BR!2sbr"
                                width="100%"
                                height="180"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
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
