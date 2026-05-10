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
            <div className="mx-auto max-w-5xl space-y-6">
                <Window title="about_me.exe">
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
                                <h1 className="text-3xl font-bold">Jasper Schouten</h1>
                                <p className="text-sm text-gray-700">
                                    Software Engineering student at Windehseim University of Applied Sciences
                                </p>
                            </header>

                            <section aria-labelledby="about-heading">
                                <h2 id="about-heading" className="mb-2 text-lg font-bold">
                                    About Me
                                </h2>

                                <p className="leading-relaxed">
                                    I am a developer focused on building modern web applications
                                    with clean architecture, accessibility, and responsive design.
                                    I enjoy working with React, Next.js, and backend APIs.
                                </p>
                            </section>

                            <section aria-labelledby="contact-heading">
                                <h2 id="contact-heading" className="mb-2 text-lg font-bold">
                                    Contact Information
                                </h2>

                                <ul className="space-y-1">
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

                <Window title="skills.dll">
                    <section aria-labelledby="skills-heading">
                        <h2 id="skills-heading" className="mb-4 text-xl font-bold">
                            Skills
                        </h2>

                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
            </div>
        </main>
    );
}