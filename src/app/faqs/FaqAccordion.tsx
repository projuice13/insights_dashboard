'use client';

import { useState } from 'react';

interface Faq {
  question: string;
  answer: string;
}

interface FaqSection {
  heading: string;
  faqs: Faq[];
}

const SECTIONS: FaqSection[] = [
  {
    heading: 'Website & Ordering',
    faqs: [
      {
        question: 'How do I know that Projuice received my online order?',
        answer: "Once your order is placed, you'll receive an email confirmation. This may take up to 5 minutes to come through. Please check your spam / junk email if you haven't received it.",
      },
      {
        question: "I've placed an order, when can I find out my delivery ETA?",
        answer: 'Your delivery ETA depends on the products ordered and location within the UK. Standard delivery details appear on your order confirmation and the delivery information page. Staff will contact you the day before delivery to confirm.',
      },
      {
        question: "Why does my order say 'Processing' in my account?",
        answer: "If you've gone into your account, your order status might be 'Processing'. This means that the order has been received from our side and no further action is needed from you.",
      },
      {
        question: 'How do I set up an account?',
        answer: "You can create an account two ways: select the 'Create an account' checkbox during checkout, or visit the Register/Log in page and follow the prompts under 'Register'.",
      },
      {
        question: 'How do I reset my password?',
        answer: "Visit the lost password page and you'll receive an email with a reset link (check spam folders). Click the link and follow the prompts.",
      },
      {
        question: "I've tried resetting my password, but nothing has come through",
        answer: "If you don't receive an email, it's possible that you don't have an account registered with that email address. You may have used that email address previously to place an order, but if you didn't actively select the 'create account' option whilst checking out, an account wouldn't have been created for you.",
      },
    ],
  },
  {
    heading: 'Checkout & Payments',
    faqs: [
      {
        question: 'What does Projuice do to keep my transaction secure?',
        answer: 'Security is a top priority for us. Transactions on our website are processed on a secure page hosted by Lloyds Bank. This provides the security of a leading bank and means that none of your card details are stored on the Projuice website.',
      },
      {
        question: 'What type of payment methods are accepted?',
        answer: 'Accepted methods include Visa Debit, Visa Credit, Mastercard Debit, Mastercard Credit, Maestro, Apple Pay, and Google Pay.',
      },
      {
        question: "I've tried entering my card details, but payment has failed...why?",
        answer: 'Several issues may prevent payment: 3D Secure authentication (most common — approve via your bank app/text), expired payment links (contact Projuice for a new one), temporary system outages (wait and retry), card limits, or browser/device issues (clear cache or try different devices).',
      },
      {
        question: "I can't seem to get to the basket - why is that?",
        answer: 'In early 2026, we made some improvements to our website. As a result, some returning customers may experience issues accessing their basket. We recommend clearing your browser cache and then trying again.',
      },
      {
        question: "Seeing a '504 Gateway Timeout' or '500 Internal Server Error' message?",
        answer: "This error usually means our servers are taking longer than expected to respond. It's often temporary and can happen during periods of high traffic or maintenance. Please wait a minute or two and refresh the page.",
      },
    ],
  },
  {
    heading: 'Delivery',
    faqs: [
      {
        question: 'When can I expect my delivery?',
        answer: 'For frozen or mixed products, delivery depends on their delivery schedule. For ambient-only orders placed before noon, next-working-day delivery applies via DHL with a one-hour timeslot notification.',
      },
      {
        question: 'What are the delivery costs?',
        answer: 'Frozen products offer free delivery on 12+ boxes. Ambient-only orders cost £5.75+VAT. A 6-box pricelist with free delivery on 6+ boxes exists but requires email or phone ordering.',
      },
      {
        question: 'How will my order be delivered?',
        answer: 'Frozen/mixed orders use our refrigerated fleet; occasional splits with DHL occur. Ambient-only orders ship via courier DHL.',
      },
      {
        question: 'Do you deliver nationwide?',
        answer: 'We try our hardest to offer nationwide delivery for our frozen products however there are some areas of the country that we cannot reach on our refrigerated vehicles.',
      },
    ],
  },
  {
    heading: 'Smoothies',
    faqs: [
      {
        question: 'How do I make a smoothie?',
        answer: "It couldn't be simpler – empty the sachet into a blender, add juice and blend!",
      },
      {
        question: 'What is the cost of a smoothie and what should I charge?',
        answer: 'Sachets cost 65p–87p depending on flavour and pricelist. Finished products (with juice, cup, lid, straw) cost £1–£1.20. The RRP is £3.45, offering large profit margins.',
      },
      {
        question: 'How do your smoothies come?',
        answer: 'Smoothies arrive in 150g sachets with 15 or 30 sachets per shipping box.',
      },
      {
        question: 'Which are your top-selling smoothies?',
        answer: 'The top five are: Raspberry Heaven, Pineapple Sunset, Berry Burst, Green Reviver, and Acai Kick.',
      },
      {
        question: 'How do I promote the smoothies?',
        answer: 'We offer a range of FREE promotional material including counter cards, posters and table talkers. Looking for a different size or a bespoke design? Our in-house marketing department are more than happy to help.',
      },
    ],
  },
  {
    heading: 'Milkshakes',
    faqs: [
      {
        question: 'How do I make a milkshake?',
        answer: "It couldn't be simpler – empty the tub into a blender, add milk and blend!",
      },
      {
        question: 'What is the cost of a milkshake and what should I charge?',
        answer: 'Tubs cost 74p–87p depending on flavour and pricelist. Finished products (with milk, cup, lid, straw) cost £1–£1.20. The RRP is £3.95, providing large profit margins.',
      },
      {
        question: 'How do your milkshakes come?',
        answer: 'Milkshakes are supplied in 250ml tubs with 18 tubs per box.',
      },
      {
        question: 'Which are your top-selling milkshakes?',
        answer: 'The top five milkshakes are: Chocolate Chip, Strawberry, Vanilla, Banana, and Salted Caramel.',
      },
      {
        question: 'How do I promote the milkshakes?',
        answer: 'We offer a range of FREE promotional material including counter cards, posters and table talkers. Looking for a different size or a bespoke design? Our in-house marketing department are more than happy to help.',
      },
    ],
  },
  {
    heading: 'One Shot Ice Cream',
    faqs: [
      {
        question: 'How do I make One Shot Ice Cream?',
        answer: 'One Shot Ice Cream is a premium dessert served from a dispenser. Simply choose a flavour, pop the capsule into the dispenser and push the button.',
      },
      {
        question: 'What is the cost of a One Shot Ice Cream and what should I charge?',
        answer: 'After the initial dispenser cost (from £995+VAT, including 216 free portions), expect 88p–£1.01 per capsule. Finished products cost £1.05–£1.20. The RRP is £3.45.',
      },
      {
        question: 'How does your One Shot Ice Cream come?',
        answer: 'Ice cream arrives in 160ml capsules with 18 capsules per shipping box. Four ice cream flavours, three frozen yogurt flavours, and one vegan sorbet are available.',
      },
      {
        question: 'What is the difference between the dispensers?',
        answer: 'We offer two dispensers, the OS7 and the OS8. The OS8 is the latest model and requires no self assembly – just plug in and play – it also includes a self-cleaning piston head.',
      },
      {
        question: 'How do I promote the One Shot Ice Cream?',
        answer: 'We offer a range of FREE promotional material including counter cards, posters and table talkers. Looking for a different size or a bespoke design? Our in-house marketing department are more than happy to help.',
      },
    ],
  },
  {
    heading: 'Problend 950 Blender',
    faqs: [
      {
        question: 'Is the blender noisy when blending?',
        answer: 'The blade could be blunt or the drive socket could be damaged.',
      },
      {
        question: 'Are the jugs dishwasher safe?',
        answer: 'No. Unfortunately the ProBlend jugs are not dishwasher safe.',
      },
    ],
  },
];

export default function FaqAccordion() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            {section.heading}
          </h2>
          <div className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white">
            {section.faqs.map((faq) => {
              const key = `${section.heading}::${faq.question}`;
              const isOpen = openKey === key;
              return (
                <div key={key}>
                  <button
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#F9FAFB]"
                  >
                    <span className="pr-6 text-sm font-medium text-[#111827]">{faq.question}</span>
                    <svg
                      className={`h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 16 16" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M3 6l5 5 5-5" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-relaxed text-[#6B7280]">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
