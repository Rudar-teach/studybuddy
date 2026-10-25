import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#082336]">
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-teal-300 hover:text-teal-200 text-sm mb-8 inline-block">
          Back to home
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-10">Last updated: October 25, 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What We Collect</h2>
            <p>
              When you create an account, we store your name, email address, and a
              hashed password. Profile fields you choose to share (subjects, skills,
              availability, goals, bio, major, year) are stored so we can compute
              matches. All of this lives in a database you can access, export, or
              delete at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Authentication</h2>
            <p>
              Authentication is handled by Firebase Auth. Passwords are stored and
              verified by Firebase, not by us. Your session is a signed ID token;
              we verify it server-side on every authenticated request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal data with third parties.
              Your profile is visible to other registered users on the platform,
              because that is the point of a matching service, but only the fields
              you have filled in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Retention &amp; Deletion</h2>
            <p>
              You may delete your account and associated data at any time. Data is
              retained only as long as your account is active.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Cookies &amp; Storage</h2>
            <p>
              We use localStorage to keep your session alive between visits. No
              third-party tracking cookies are set.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Security</h2>
            <p>
              Data is transmitted over HTTPS. API keys used by the frontend are
              intentionally scoped to your project's public data. Server-side
              verification uses your Firebase project's REST API key, which
              is a low-privilege credential. Admin tokens are server-only
              and never exposed to the browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              For privacy questions or a data deletion request, contact the
              site owner through the contact channel listed on the site.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
