import React from 'react';

interface Props {
    onBack: () => void;
}

export function TermsPage({ onBack }: Props) {
    return (
        <div className="h-screen bg-surface text-on-surface overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 md:px-10 py-12">
                {/* Back button */}
                <button
                    onClick={onBack}
                    className="font-pixel text-primary hover:underline mb-8 tracking-widest text-sm"
                >
                    &larr; Back
                </button>

                {/* Header */}
                <h1 className="font-pixel text-3xl md:text-4xl font-bold mb-2 tracking-wide">Terms of Service</h1>
                <p className="font-body text-on-surface-variant text-sm mb-8">Last updated: June 2026</p>

                {/* Content */}
                <div className="space-y-6 font-body text-on-surface leading-relaxed">
                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">1. Acceptance of Terms</h2>
                        <p className="text-on-surface-variant">
                            By using Jars, you agree to abide by these Terms of Service. If you do not agree, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">2. User Responsibilities</h2>
                        <p className="text-on-surface-variant">
                            As a user, you agree to:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li>Use this service only for lawful purposes</li>
                            <li>Not post content that is illegal, obscene, defamatory, or harmful</li>
                            <li>Not harass, threaten, or abuse other users</li>
                            <li>Respect the intellectual property rights of others</li>
                            <li>Not attempt to gain unauthorized access to the system</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">3. Content Ownership</h2>
                        <p className="text-on-surface-variant">
                            <strong>You own the content you create.</strong> By creating a jar, you grant Jars the right to:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li>Store and display your content (if marked public)</li>
                            <li>Display your name and avatar as the creator</li>
                            <li>Analyze usage patterns (anonymously)</li>
                        </ul>
                        <p className="text-on-surface-variant mt-3">
                            You may delete your jars at any time. Deletion is permanent.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">4. Content Moderation</h2>
                        <p className="text-on-surface-variant">
                            We reserve the right to:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li>Remove content that violates these Terms</li>
                            <li>Suspend or ban users who repeatedly violate these Terms</li>
                            <li>Moderate content at our discretion for legal or safety reasons</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">5. Limitation of Liability</h2>
                        <p className="text-on-surface-variant">
                            Jars is provided "as is" without warranties. We are not liable for:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li>Loss of data or content</li>
                            <li>Service interruptions or downtime</li>
                            <li>Indirect or consequential damages</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">6. Account Termination</h2>
                        <p className="text-on-surface-variant">
                            We reserve the right to suspend or terminate accounts that violate these Terms. Users may disconnect their account at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">7. Changes to These Terms</h2>
                        <p className="text-on-surface-variant">
                            We may update these Terms at any time. Continued use of Jars after changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">8. Contact</h2>
                        <p className="text-on-surface-variant">
                            For questions about these Terms, please contact us at <strong>reloimiguel@gmail.com</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
