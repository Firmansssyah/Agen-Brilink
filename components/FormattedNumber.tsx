import React from 'react';

interface FormattedNumberProps {
    value: number;
    formatFn: (amount: number) => string;
    className?: string;
}

/**
 * Komponen untuk menampilkan angka yang diformat.
 */
const FormattedNumber: React.FC<FormattedNumberProps> = ({ value, formatFn, className }) => {
    return (
        <span className={className}>
            {formatFn(value)}
        </span>
    );
};

export default FormattedNumber;
