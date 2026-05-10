// components/Taskbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function Taskbar() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Main navigation"
            className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-black bg-[#c0c0c0] p-2"
        >
            <div className="flex items-center gap-2">
                <Link
                    href="/"
                    className="win95-button font-bold"
                >
                    <Image
                        src="/Home.png"
                        alt="Home icon"
                        width={16}
                        height={16}
                    />

                    <span>Start</span>
                </Link>

                <Link
                    href="/contact"
                    className={`win95-button ${pathname === '/contact'
                            ? 'shadow-win95-inset'
                            : ''
                        }`}
                >
                    contact.exe
                </Link>
            </div>
        </nav>
    );
}