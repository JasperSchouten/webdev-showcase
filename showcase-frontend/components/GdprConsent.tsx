// components/GdprConsent.tsx
'use client';

import { useEffect, useState } from 'react';

const COOKIE_NAME = 'gdpr-consent';

export function GdprConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = document.cookie.includes(
            `${COOKIE_NAME}=accepted`
        );

        if (!consent) {
            setVisible(true);
        }
    }, []);

    const acceptConsent = () => {
        document.cookie = `${COOKIE_NAME}=accepted; path=/; max-age=31536000; SameSite=Lax`;

        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed bottom-16 left-4 right-4 z-50 border-2 border-black bg-[#c0c0c0] p-4 shadow-win95 md:left-auto md:right-4 md:w-[420px]">
            <div className="mb-2 flex items-center justify-between bg-[#000080] px-2 py-1 text-white">
                <span className="font-bold">
                    privacy_notice.exe
                </span>

                <div className="border-2 border-black bg-[#c0c0c0] px-2 text-black">
                    X
                </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed">
                This site uses cookies to remember your GDPR
                preferences in line with GDPR ASVS v8.3.
            </p>

            <button
                onClick={acceptConsent}
                className="win95-button"
            >
                Accept
            </button>
        </div>
    );
}