import { useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Contact() {
  useDocumentTitle('NIZALIAH — Contact')
  const root = useScrollReveal()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div ref={root} className="bg-[#F8F4EE] text-[#3E2E22]">
      <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-28 md:grid-cols-2 md:gap-20 md:pt-36">
        <div>
          <p
            data-reveal
            className="mb-4 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]"
          >
            CONTACT NIZALIAH
          </p>
          <h1
            data-reveal
            className="font-display text-[clamp(2.8rem,6vw,4.5rem)] font-light leading-[0.95]"
          >
            Write to the house
          </h1>
          <p
            data-reveal
            className="mt-6 max-w-md font-sans text-sm font-light leading-relaxed text-[#3E2E22]/85"
          >
            For fragrance inquiries, press, and boutique collaborations — we
            read every note.
          </p>

          <div
            data-reveal
            className="mt-12 space-y-5 font-sans text-sm font-light"
          >
            <div>
              <p className="text-[10px] tracking-[0.28em] text-[#7B5E3B]">
                EMAIL
              </p>
              <a
                href="mailto:hello@nizaliah.com"
                className="mt-1 block text-[#3E2E22] no-underline"
              >
                hello@nizaliah.com
              </a>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.28em] text-[#7B5E3B]">
                PHONE
              </p>
              <p className="mt-1">+1 (212) 555-0148</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.28em] text-[#7B5E3B]">
                SOCIAL
              </p>
              <p className="mt-1 tracking-wide">Instagram · Pinterest</p>
            </div>
          </div>
        </div>

        <div
          data-reveal
          className="border border-[#3E2E22]/12 bg-[#F4DEDF] p-8 md:p-10"
        >
          {sent ? (
            <div className="flex min-h-[320px] flex-col justify-center">
              <p className="font-sans text-[10px] tracking-[0.3em] text-[#D4AF37]">
                RECEIVED
              </p>
              <h2 className="mt-4 font-display text-3xl font-light">
                Thank you.
              </h2>
              <p className="mt-4 max-w-sm font-sans text-sm font-light text-[#3E2E22]/80">
                Your message has been noted. This is a frontend preview — no
                email was sent.
              </p>
              <button
                type="button"
                className="mt-8 w-fit border-b border-[#3E2E22]/40 pb-1 font-sans text-[10px] tracking-[0.28em]"
                onClick={() => {
                  setSent(false)
                  setForm({ name: '', email: '', message: '' })
                }}
              >
                SEND ANOTHER
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              {[
                { id: 'name', label: 'NAME', type: 'text' },
                { id: 'email', label: 'EMAIL', type: 'email' },
              ].map((field) => (
                <label key={field.id} className="block">
                  <span className="font-sans text-[10px] tracking-[0.28em] text-[#7B5E3B]">
                    {field.label}
                  </span>
                  <input
                    required
                    type={field.type}
                    value={form[field.id]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field.id]: e.target.value }))
                    }
                    className="mt-2 w-full border-0 border-b border-[#3E2E22]/25 bg-transparent py-2 font-sans text-sm text-[#3E2E22] outline-none transition-colors focus:border-[#D4AF37]"
                  />
                </label>
              ))}
              <label className="block">
                <span className="font-sans text-[10px] tracking-[0.28em] text-[#7B5E3B]">
                  MESSAGE
                </span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  className="mt-2 w-full resize-none border-0 border-b border-[#3E2E22]/25 bg-transparent py-2 font-sans text-sm text-[#3E2E22] outline-none transition-colors focus:border-[#D4AF37]"
                />
              </label>
              <button
                type="submit"
                className="mt-4 self-start border border-[#3E2E22] bg-[#3E2E22] px-8 py-3 font-sans text-[10px] tracking-[0.32em] text-[#F8F4EE] transition-colors hover:bg-transparent hover:text-[#3E2E22]"
              >
                SEND MESSAGE
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
