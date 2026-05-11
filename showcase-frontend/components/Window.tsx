// components/Window.tsx
import { ReactNode } from 'react';

type WindowProps = {
    title: string;
    children: ReactNode;
};

export function Window({ title, children }: WindowProps) {
    return (
        <section className="border-2 border-black bg-[#c0c0c0] shadow-win95">
            <header className="flex items-center justify-between bg-[#000080] px-2 py-1 text-white">
                <span className="font-bold">{title}</span>

                <button
                    aria-label="Close window"
                    className="border-2 border-black bg-[#c0c0c0] px-2 text-black shadow-win95"
                >
                    X
                </button>
            </header>

            <div className="p-4">{children}</div>
        </section>
    );
}