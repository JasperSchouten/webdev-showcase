// app/page.tsx

import Image from 'next/image';
import { Window } from '@/components/Window';

export default function HomePage() {
    const skills = [
        'Next.js',
        'React',
        'TypeScript',
        '.NET',
        'C#',
        'REST APIs',
    ];

    return (
        <main className="min-h-screen bg-[#008080] p-4 pb-24">
            <div className="relative mx-auto max-w-5xl space-y-6 lg:h-[600px]">
                <Window
                    title="about_me.exe"
                    className="lg:absolute lg:left-6 lg:w-[900px]"
                >
                    <div className="flex flex-col gap-6 md:flex-row">
                        <div className="mx-auto md:mx-0">
                            <div className="border-2 border-black bg-white p-2 shadow-win95-inset">
                                <Image
                                    src="/peppa.jpg"
                                    alt="Portrait photo"
                                    width={220}
                                    height={220}
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <header>
                                <h1 className="text-xl font-bold">Jasper Schouten</h1>
                                <p className="text-sm text-gray-700">
                                    Software Engineering student at Windehseim University of Applied Sciences
                                </p>
                            </header>

                            <section aria-labelledby="about-heading">
                                <h2 id="about-heading" className="mb-2 font-bold">
                                    About Me
                                </h2>

                                <p className="leading-relaxed">
                                    I am a developer focused on building modern web applications
                                    with clean architecture, accessibility, and responsive design.
                                    I enjoy working with React, Next.js, and backend APIs.
                                </p>
                            </section>

                            <section aria-labelledby="contact-heading">
                                <h2 id="contact-heading" className="mb-2 font-bold">
                                    Contact Information
                                </h2>

                                <ul className="flex flex-horizontal space-x-2 space-y-1">
                                    <li>
                                        <strong>Email:</strong> j.j.schout.bo@hotmail.com
                                    </li>
                                    <li>
                                        <strong>Phone:</strong> +31 6 12615334
                                    </li>
                                    <li>
                                        <strong>Location:</strong> Netherlands
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </Window>

                <Window
                    title="skills.dll"
                    className="lg:absolute lg:top-[280px] lg:w-[300px]"
                >
                    <section aria-labelledby="skills-heading">
                        <h2 id="skills-heading" className="mb-4 text-xl font-bold">
                            Skills
                        </h2>

                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                            {skills.map((skill) => (
                                <li
                                    key={skill}
                                    className="border-2 border-black bg-[#c0c0c0] px-3 py-2 shadow-win95"
                                >
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </section>
                </Window>

                <Window
                    title="projects.exe"
                    className="lg:absolute lg:bottom-2 lg:right-6 lg:w-[600px] lg:max-h-[320px]"
                >
                    <section className="space-y-3 overflow-y-auto max-h-[260px] pr-1">

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {/* Project tile */}
                            <a
                                href="/connectFour"
                                className="border-2 border-black bg-[#c0c0c0] shadow-win95 p-2 block hover:translate-y-[-2px] active:translate-y-[0px]"
                            >
                                <div className="border-2 border-black bg-white shadow-win95-inset p-2 ">
                                    <Image
                                        src="/ConnectFour.png"
                                        alt="Connect Four"
                                        width={150}
                                        height={80}
                                        className="object-cover"
                                    />
                                </div>

                                <p className="mt-2 font-bold">Connect Four</p>
                            </a>
                        </div>
                    </section>
                </Window>
            </div>
        </main>
    );
}