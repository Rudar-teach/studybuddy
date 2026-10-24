import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#082336]">
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-teal-300 hover:text-teal-200 text-sm mb-8 inline-block">
          Back to home
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-slate-400 mb-10">Last updated: October 25, 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Acceptance</h2>
            <p>
              By creating an account or using the service, you agree to these terms.
              If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">The Service</h2>
            <p>
              The service matches students and collaborators by subject, skills,
              availability, and goals. It also provides group chat, session
              scheduling, resource sharing, and progress check-ins.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Account</h2>
            <p>
              You are responsible for keeping your credentials secure. You may not
              create accounts for others or share your account. You must be at
              least 13 years old to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Acceptable Use</h2>
            <p>
              You agree not to use the service to harass, spam, or deceive other
              users; to scrape the platform; to post illegal content; or to
              interfere with the service&apos;s operation. Accounts that violate
              these rules may be suspended or terminated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Content You Post</h2>
            <p>
              You retain ownership of content you post (messages, resources,
              session details). By posting, you grant the service a license to
              store and display that content to other members of the same group.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Disclaimer</h2>
            <p>
              The service is provided as-is, without warranty of any kind. Matching
              is a heuristic; we do not guarantee that any two users will be a
              compatible study partner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the service and its operators
              are not liable for indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes</h2>
            <p>
              We may update these terms. Material changes will be announced on the
              site before they take effect. Continued use after changes means
              acceptance.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
