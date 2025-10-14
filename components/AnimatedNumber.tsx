import React from 'react';

interface AnimatedNumberProps {
    value: number;
    formatFn: (amount: number) => string;
    className?: string;
}

/**
 * Komponen yang menampilkan angka yang diformat.
 * Efek animasi sorot telah dihapus sesuai permintaan.
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, formatFn, className }) => {
    return (
        <span className={className}>
            {formatFn(value)}
        </span>
    );
};

export default AnimatedNumber;
