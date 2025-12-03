
import React, { useEffect } from 'react';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';

interface LegalDocsProps {
  initialTab: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalDocs: React.FC<LegalDocsProps> = ({ initialTab, onBack }) => {
  const [activeTab, setActiveTab] = React.useState<'privacy' | 'terms'>(initialTab);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">👋</span>
              Say HI Africa
            </span>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'terms' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'privacy' ? 'bg-white shadow text-green-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Privacy Policy (POPIA)
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {activeTab === 'terms' ? (
          <div className="prose prose-slate max-w-none">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-slate-900 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 m-0">Terms and Conditions</h1>
                <p className="text-slate-500 mt-1">Last Updated: November 1, 2024</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Introduction & Scope</h3>
                <p>
                  Welcome to Say HI Africa ("the Platform"). By accessing our website, WhatsApp chatbot, or purchasing a ticket, you agree to these Terms and Conditions. 
                  These terms constitute a legally binding agreement between you ("the User") and Say HI Africa Pty Ltd ("the Company").
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. The Platform as an Agent</h3>
                <p>
                  Say HI Africa acts solely as a ticketing agent and technology provider. We are not the organizer, promoter, or producer of the events listed on our Platform. 
                  We sell tickets on behalf of Event Organizers ("Promoters").
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-2">
                  <li>The Promoter is solely responsible for the production, safety, and quality of the event.</li>
                  <li>Any disputes regarding the event itself (venue changes, lineup changes, quality) must be directed to the Promoter.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Ticket Purchases & Delivery</h3>
                <p>
                  Tickets are delivered digitally via WhatsApp (QR Code). It is your responsibility to provide a correct WhatsApp-enabled mobile number.
                  Say HI Africa is not responsible for lost tickets due to incorrect phone numbers provided during checkout.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">4. Refunds and Cancellations</h3>
                <p className="font-medium">All ticket sales are final.</p>
                <p>
                  In accordance with standard industry practice in South Africa:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-2">
                  <li><strong>No Refunds:</strong> Tickets are non-refundable except in the specific instance of event cancellation.</li>
                  <li><strong>Event Cancellation:</strong> If an event is cancelled, the Promoter is responsible for authorizing refunds. Say HI Africa will process refunds only upon receipt of funds from the Promoter. Service fees are non-refundable as they cover the cost of the transaction processing.</li>
                  <li><strong>Postponement:</strong> If an event is postponed, your ticket will automatically be valid for the new date.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">5. Right of Admission</h3>
                <p>
                  The venue and the Promoter reserve the Right of Admission. The Platform is not liable if you are denied entry due to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-2">
                    <li>Failure to produce a valid ID matching the ticket information.</li>
                    <li>Intoxication or disorderly conduct.</li>
                    <li>Possession of prohibited items (weapons, illegal substances, etc.).</li>
                    <li>Late arrival after entry gates have closed.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">6. Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by South African law, Say HI Africa shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">7. Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of South Africa.
                </p>
              </section>
            </div>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
             <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-500 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 m-0">Privacy Policy</h1>
                <p className="text-green-700 font-medium mt-1">Compliance: POPIA (South Africa)</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note for South African Users:</strong> This policy is drafted in compliance with the <strong>Protection of Personal Information Act (POPIA)</strong>. 
                  We are committed to lawful, transparent, and secure processing of your personal information.
                </p>
              </div>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h3>
                <p>
                  To provide our WhatsApp ticketing service, we collect the following "Personal Information" as defined in POPIA:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                  <li><strong>Contact Information:</strong> Mobile phone number (for WhatsApp delivery), Email address, and Full Name.</li>
                  <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of tickets you have purchased. Note: We do not store full credit card numbers; payments are processed by Payfast.</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, and interaction logs with our WhatsApp bot.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h3>
                <p>We process your information for the following specific purposes:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-2">
                  <li>To process ticket orders and deliver QR codes via WhatsApp.</li>
                  <li>To facilitate entry management at the event venue.</li>
                  <li>To provide customer support and resolve payment queries.</li>
                  <li>To send important event updates (e.g., venue changes, time changes).</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Sharing of Information (Third Parties)</h3>
                <p>
                  We do not sell your data. However, strictly for the purpose of fulfilling our contract with you, we share data with:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                  <li><strong>Event Organizers (Promoters):</strong> The organizer of the specific event you purchased tickets for receives your name and contact details for guest list management and security purposes.</li>
                  <li><strong>Payment Gateways (Payfast):</strong> To securely process your payment.</li>
                  <li><strong>WhatsApp (Meta):</strong> As our primary delivery infrastructure.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">4. Marketing & Consent</h3>
                <p>
                  In accordance with POPIA, we will only send you direct marketing communications (e.g., upcoming events) if:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-2">
                    <li>You are an existing customer who has previously bought tickets.</li>
                    <li>You have explicitly opted-in to receive such communications.</li>
                </ul>
                <p className="mt-2">You may opt-out (unsubscribe) from marketing messages at any time by replying "STOP" on WhatsApp.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">5. Data Security</h3>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or alteration. 
                  This includes encryption of data in transit and strict access controls for our staff.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights</h3>
                <p>Under POPIA, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-2">
                    <li>Request access to the personal information we hold about you.</li>
                    <li>Request correction of inaccurate information.</li>
                    <li>Request deletion of your personal information (subject to legal retention requirements).</li>
                </ul>
                <p className="mt-4 p-4 bg-slate-100 rounded-lg text-sm">
                  <strong>Information Officer Contact:</strong><br/>
                  To exercise these rights, please contact our Information Officer at:<br/>
                  <span className="text-green-600 font-medium">legal@sayhi.africa</span>
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
