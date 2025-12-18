import Link from "next/link";

export default function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="relative">
          {/* Animated 404 number */}
          <div className="relative">
            <div className="text-[180px] font-bold text-gray-200 select-none md:text-[240px]">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-[180px] font-bold text-transparent md:text-[240px]">
                404
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative -mt-12 md:-mt-16">
            <div className="mb-6">
              <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Page Not Found
              </h1>
              <p className="mx-auto max-w-md text-lg text-gray-600">
                Oops! The page you're looking for seems to have wandered off
                into the digital wilderness.
              </p>
            </div>

            <div className="mx-auto max-w-sm space-y-4">
              {/* Navigation buttons */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex transform items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Back to Home
                </Link>

                <button
                  onClick={() => window.history.back()}
                  className="inline-flex transform items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-medium text-gray-800 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Go Back
                </button>
              </div>

              {/* Support link */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  Need help?{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-blue-600 underline transition-colors hover:text-blue-800 hover:no-underline"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="animate-blob absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-100 opacity-70 mix-blend-multiply blur-xl filter"></div>
          <div className="animate-blob animation-delay-2000 absolute -bottom-8 -left-10 h-40 w-40 rounded-full bg-purple-100 opacity-70 mix-blend-multiply blur-xl filter"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
