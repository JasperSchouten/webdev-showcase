import Image from 'next/image';

type Win95IconProps = {
    src: string;
    alt: string;
    size?: number;
};

export function Win95Icon({
    src,
    alt,
    size = 24
}: Win95IconProps) {
    return (
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
        />
    );
}