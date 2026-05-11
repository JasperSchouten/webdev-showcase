// components/Taskbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Win95Icon } from '@/components/Win95Icon';

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
                    <Win95Icon
                        src="/Home.png"
                        alt="Home icon"
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
                    <Win95Icon
                        src="/Phone.png"
                        alt="phone icon"
                    />
                    <span>contact.exe</span>
                </Link>

                <Link
                    href="/login"
                    className={`win95-button ${pathname === '/contact'
                        ? 'shadow-win95-inset'
                        : ''
                        }`}
                >
                    <Win95Icon
                        src="/Key.png"
                        alt="Key icon"
                    />
                    <span>login.exe</span>
                </Link>
            </div>
        </nav>
    );
}