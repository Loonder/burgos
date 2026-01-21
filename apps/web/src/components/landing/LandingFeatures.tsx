'use client';

export function LandingFeatures() {
    return (
        <section className="py-24 bg-burgos-dark relative z-10">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">O Que Nos Diferencia?</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon="🎭"
                        title="Visagismo Especializado"
                        description="Analisamos o formato do seu rosto e estilo de vida para criar o corte ideal que valoriza sua imagem."
                    />
                    <FeatureCard
                        icon="🔄"
                        title="Clube de Assinatura"
                        description="Mantenha o visual sempre em dia pagando um valor fixo mensal. Economia e praticidade para você."
                    />
                    <FeatureCard
                        icon="🧖‍♂️"
                        title="Barboterapia Premium"
                        description="Toalha quente, óleos essenciais e massagem facial. Um verdadeiro ritual de relaxamento."
                    />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
    return (
        <div className="bg-gradient-to-br from-white/5 to-transparent p-8 rounded-3xl border border-white/5 hover:border-burgos-primary/50 transition-all hover:-translate-y-2">
            <div className="text-5xl mb-6">{icon}</div>
            <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
            <p className="text-burgos-accent/60 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
