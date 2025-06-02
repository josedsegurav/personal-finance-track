import Link from "next/link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen bg-ghost-white">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-100 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-glaucous">
                  <Link href="/"><span className="text-bittersweet">Finance</span> Tracker</Link>
                </h1>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="/sign-in"
                  className="bg-bittersweet text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Sign In
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Link
                  href="/sign-in"
                  className="bg-bittersweet text-white px-4 py-2 rounded-lg text-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl flex flex-col gap-12 items-center">
          {children}
        </div>
        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold text-glaucous mb-4">
                  <span className="text-bittersweet">Finance</span> Tracker
                </h3>
                <p className="text-paynes-gray opacity-70 mb-6 max-w-md">
                  Empowering individuals to make better financial decisions
                  through intuitive tracking and insightful analytics.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-paynes-gray hover:text-bittersweet transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-paynes-gray hover:text-bittersweet transition-colors"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>

              {/* Support */}
              <div className="md:col-start-4">
                <h4 className="font-bold text-paynes-gray mb-4">Support</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors"
                    >
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-12 pt-8 text-center">
              <p className="text-paynes-gray opacity-70">
                © 2025 Finance Tracker. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
