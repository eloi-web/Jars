import React from 'react';

interface Props {
    onBack: () => void;
}

export function PrivacyPage({ onBack }: Props) {
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
                <h1 className="font-pixel text-3xl md:text-4xl font-bold mb-2 tracking-wide">Privacy Policy</h1>
                <p className="font-body text-on-surface-variant text-sm mb-8">Last updated: June 2026</p>

                {/* Content */}
                <div className="space-y-6 font-body text-on-surface leading-relaxed">
                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">1. What Data We Collect</h2>
                        <p className="text-on-surface-variant">
                            When you sign in with Google, we collect and store:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li><strong>Email address</strong> — used for account identification</li>
                            <li><strong>Full name</strong> — displayed as the author of your jars</li>
                            <li><strong>Profile picture (avatar)</strong> — shown on jar cards and in headers</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">2. How We Use Your Data</h2>
                        <p className="text-on-surface-variant">
                            Your data is used solely to:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li>Authenticate your account and maintain your session</li>
                            <li>Display your name and avatar on your jar creations</li>
                            <li>Allow other users to see who created public jars</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">3. Data Storage</h2>
                        <p className="text-on-surface-variant">
                            All data is securely stored in <strong>MongoDB Atlas</strong> (MongoDB's cloud database service). Your data is encrypted both in transit (HTTPS) and at rest.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">4. Data Sharing</h2>
                        <p className="text-on-surface-variant">
                            We <strong>do not</strong> sell, trade, or share your personal data with third parties, except:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li><strong>Google</strong> — for authentication only (via OAuth 2.0)</li>
                            <li><strong>Public jar visibility</strong> — your name and avatar are visible to anyone who views a public jar</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">5. Your Rights</h2>
                        <p className="text-on-surface-variant">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-1 ml-2">
                            <li>Access your data</li>
                            <li>Request deletion of your account and associated jars</li>
                            <li>Disconnect your Google account at any time</li>
                        </ul>
                        <p className="text-on-surface-variant mt-3">
                            Contact us at <strong>reloimiguel@gmail.com</strong> for any data requests.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">6. Analytics</h2>
                        <p className="text-on-surface-variant">
                            We use <strong>Vercel Analytics</strong> to track page views and performance metrics. This does not collect personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">7. Changes to This Policy</h2>
                        <p className="text-on-surface-variant">
                            We may update this policy at any time. Changes will be posted on this page with an updated date.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-pixel text-xl font-bold mb-3 tracking-wide">8. Contact</h2>
                        <p className="text-on-surface-variant">
                            For privacy concerns, please reach out to us at <strong>reloimiguel@gmail.com</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
