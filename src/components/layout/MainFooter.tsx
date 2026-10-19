// components/MainFooter.tsx

export const MainFooter = () => {
  return (
    <footer aria-labelledby="footer-heading" className="bg-primary-dark w-full">
      <div className="container mx-auto px-4 py-12 md:px-8 md:py-24 lg:px-12">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="w-full md:w-1/2 lg:w-5/12">
            <h2
              id="footer-heading"
              className="text-3xl leading-tight font-semibold text-white md:text-5xl"
            >
              We’re here to answer all your questions
            </h2>
            <p className="mt-4 text-base text-neutral-200">
              Your journey’s important to us. Need help, resources, or just someone to talk to?
              We’re just a message away!
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <form className="flex flex-col gap-4" action="/api/contact" method="POST">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="w-full">
                  <label htmlFor="contact-name" className="sr-only">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    placeholder="Name"
                    type="text"
                    required
                    className="w-full rounded-md border border-neutral-600 bg-transparent px-4 py-3 text-white transition-colors placeholder:text-neutral-400 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="contact-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    placeholder="Email"
                    type="email"
                    required
                    className="w-full rounded-md border border-neutral-600 bg-transparent px-4 py-3 text-white transition-colors placeholder:text-neutral-400 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Message"
                  required
                  className="h-32 w-full resize-none rounded-md border border-neutral-600 bg-transparent px-4 py-3 text-white transition-colors placeholder:text-neutral-400 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:h-48"
                />
              </div>
              <div className="mt-2">
                <button
                  type="submit"
                  className="text-primary focus-visible:ring-offset-primary-dark rounded-md bg-white px-6 py-3 font-semibold transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Structural presentation divider */}
        <div className="mt-16 h-px w-full bg-neutral-700" role="presentation" />
        <div className="mt-12 text-center text-sm text-neutral-400">
          Copyright © {new Date().getFullYear()} • thejobapplicantperspective
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
