
import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-50 py-12 lg:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg mx-auto text-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: October 15, 2025</p>

          <p>
            FormaNew LLC (“FormaNew,” “we,” “our,” or “us”) respects your privacy and is committed to protecting the
            personal information you share with us. This Privacy Policy explains how we collect, use, and disclose
            information when you use our platform, websites, and services (collectively, the “Services”).
          </p>

          <p>
            By accessing or using our Services, you agree to the terms of this Privacy Policy. If you do not agree,
            please discontinue use of the Services.
          </p>

          <h2 className="mt-8 text-2xl font-semibold text-gray-800">1. Information We Collect</h2>
          <p>We collect information in the following ways:</p>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">1.1 Information You Provide</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Account Information:</strong> Name, email address, password, and billing information when you
              register for an account.
            </li>
            <li>
              <strong>Business Information:</strong> Company name, address, incorporation details, EIN, and other legal
              formation data you provide.
            </li>
            <li>
              <strong>Content You Create:</strong> Contracts, forms, uploaded files, and documents you store or sign
              through the platform.
            </li>
            <li>
              <strong>Payment Information:</strong> When you make purchases or pay fees through FormaNew, we process
              payments via secure third-party processors (e.g., Stripe). We do not store your full payment card
              details.
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">1.2 Information Collected Automatically</h3>
          <p>When you use the Services, we may automatically collect:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Device and Usage Data:</strong> IP address, browser type, operating system, referring URLs, and
              activity logs.
            </li>
            <li>
              <strong>Cookies and Tracking:</strong> Cookies or similar technologies to improve user experience, remember
              login sessions, and analyze usage.
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">1.3 Information from Third Parties</h3>
          <p>We may receive information from:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Business partners such as registered agents, payment processors, or domain registrars.</li>
            <li>Public records or other data sources when verifying company or identity information.</li>
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-gray-800">2. How We Use Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Provide, maintain, and improve the FormaNew platform and Services</li>
            <li>Facilitate company formation, filings, and compliance</li>
            <li>Process payments and issue invoices</li>
            <li>Host storefronts, websites, and digital content through Nanomarket</li>
            <li>Enable digital signatures and contract management</li>
            <li>Communicate updates, promotions, or legal notices</li>
            <li>Detect, prevent, and address security or technical issues</li>
          </ul>
          <p>We may use aggregated or anonymized data for analytics and product development.</p>

          <h2 className="mt-8 text-2xl font-semibold text-gray-800">3. How We Share Information</h2>
          <p>We do not sell your personal information. We may share data as follows:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Service Providers:</strong> With trusted vendors who help operate our platform (e.g., hosting,
              payments, registered agent services).
            </li>
            <li>
              <strong>Legal Compliance:</strong> When required by law, subpoena, or governmental request.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of company assets.
            </li>
            <li>
              <strong>Your Consent:</strong> When you explicitly authorize us to share information with third parties.
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-gray-800">4. Data Retention</h2>
          <p>
            We retain personal information as long as necessary to provide our Services, comply with legal obligations,
            resolve disputes, and enforce agreements.
          </p>
          <p>You may request deletion of your data by contacting us (see Section 9).</p>

          <h2 className="mt-8 text-2xl font-semibold text-gray-800">5. Data Security</h2>
          <p>
            We implement reasonable technical and organizational measures to protect your data, including encryption,
            secure hosting, and limited employee access. However, no method of transmission over the Internet or
            electronic storage is 100% secure.
          </p>

          <h2 className="mt-8 text-2xl font-semibold text-gray-800">6. Your Rights and Choices</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Access, correct, or delete your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>Request data portability</li>
            <li>Withdraw consent to processing (where applicable)</li>
          </ul>
          <p>To exercise these rights, email us at privacy@formanew.llc</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
