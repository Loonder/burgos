interface ServiceCardProps {
    title: string;
    price: string;
    duration: string;
    selected: boolean;
    onClick: () => void;
    image?: string | null;
    // Discount props
    originalPrice?: string;
    discountedPrice?: string;
    isFree?: boolean;
    discountLabel?: string;
}

export function ServiceCard({
    title,
    price,
    duration,
    selected,
    onClick,
    image,
    originalPrice,
    discountedPrice,
    isFree,
    discountLabel
}: ServiceCardProps) {
    const hasDiscount = isFree || (originalPrice && discountedPrice && originalPrice !== discountedPrice);

    return (
        <div
            onClick={onClick}
            className={`
                relative p-6 rounded-xl border transition-all duration-300 cursor-pointer group hover:scale-[1.02] overflow-hidden
                ${selected
                    ? 'bg-burgos-primary text-white border-burgos-primary shadow-[0_0_15px_rgba(255,159,28,0.4)]'
                    : 'glass-dark border-burgos-secondary hover:border-burgos-primary/50 text-burgos-accent'
                }
            `}
        >
            {/* VIP Badge */}
            {hasDiscount && (
                <div className="absolute top-2 right-2 z-20">
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${isFree
                        ? 'bg-green-500 text-white animate-pulse'
                        : 'bg-yellow-500 text-black'
                        }`}>
                        {isFree ? '🥷 VIP' : discountLabel || 'VIP'}
                    </span>
                </div>
            )}

            {image ? (
                <div className="absolute inset-0 z-0 transition-opacity duration-300">
                    <img src={image} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80" />
                    <div className={`absolute inset-0 ${selected ? 'bg-burgos-primary/40' : 'bg-black/50'}`} />
                </div>
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            )}

            <div className="relative z-10 flex justify-between items-start mb-4">
                <h3 className={`text-xl font-bold font-display ${selected ? 'text-white' : 'text-burgos-primary'} drop-shadow-md`}>
                    {title}
                </h3>
                {selected && (
                    <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="relative z-10 flex justify-between items-end">
                <div>
                    {/* Price Display */}
                    {isFree ? (
                        <>
                            <span className="block text-sm line-through text-gray-400 drop-shadow-md">{originalPrice || price}</span>
                            <span className="block text-2xl font-bold text-green-400 drop-shadow-md">R$ 0,00</span>
                        </>
                    ) : hasDiscount ? (
                        <>
                            <span className="block text-sm line-through text-gray-400 drop-shadow-md">{originalPrice}</span>
                            <span className="block text-2xl font-bold drop-shadow-md">{discountedPrice}</span>
                        </>
                    ) : (
                        <span className="block text-2xl font-bold drop-shadow-md">{price}</span>
                    )}
                    <span className={`text-sm ${selected ? 'text-white/80' : 'text-burgos-accent/80'} drop-shadow-md`}>
                        {duration}
                    </span>
                </div>
            </div>
        </div>
    );
}

