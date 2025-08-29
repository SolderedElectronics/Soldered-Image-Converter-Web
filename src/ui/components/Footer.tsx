import React from "react";

function ExternalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5 inline-block"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5h6m0 0v6m0-6L10 14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14h14v-4" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-[#5B2379] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="font-bold mb-3 uppercase">About</h3>
          <ul className="space-y-2">
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/" target="_blank" rel="noreferrer">
                Homepage <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/about-us/" target="_blank" rel="noreferrer">
                About Soldered Electronics <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/why-soldered-products/" target="_blank" rel="noreferrer">
                Why Soldered products? <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/contact/" target="_blank" rel="noreferrer">
                Contact us <ExternalIcon />
              </a>
            </li>
          </ul>
        </div>

        {/* Soldered Product Documentation */}
        <div>
          <h3 className="font-bold mb-3 uppercase">Product Documentation</h3>
          <ul className="space-y-2">
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/" target="_blank" rel="noreferrer">
                Soldered Documentation <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://github.com/SolderedElectronics" target="_blank" rel="noreferrer">
                Soldered Electronics GitHub <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/qwiic/" target="_blank" rel="noreferrer">
                Qwiic/easyC <ExternalIcon />
              </a>
            </li>
          </ul>
        </div>

        {/* Inkplate Documentation */}
        <div>
          <h3 className="font-bold mb-3 uppercase">Inkplate Documentation</h3>
          <ul className="space-y-2">
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://docs.inkplate.com/" target="_blank" rel="noreferrer">
                Inkplate Documentation Home <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://github.com/SolderedElectronics/Inkplate-Arduino-library" target="_blank" rel="noreferrer">
                Inkplate Arduino Library <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://github.com/SolderedElectronics/Inkplate-micropython" target="_blank" rel="noreferrer">
                Inkplate MicroPython Library <ExternalIcon />
              </a>
            </li>
          </ul>
        </div>

        {/* Getting Started (4th column) */}
        <div>
          <h3 className="font-bold mb-3 uppercase">Getting Started with Inkplate</h3>
          <ul className="space-y-2">
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/inkplate/10/quick-start-guide/" target="_blank" rel="noreferrer">
                Inkplate 10 <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/inkplate/6/quick-start-guide/" target="_blank" rel="noreferrer">
                Inkplate 6 <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/inkplate/6flick/quick-start-guide/" target="_blank" rel="noreferrer">
                Inkplate 6FLICK <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/inkplate/6motion/quick-start-guide/" target="_blank" rel="noreferrer">
                Inkplate 6MOTION <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/inkplate/5v2/quick-start-guide/" target="_blank" rel="noreferrer">
                Inkplate 5v2 <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/inkplate/4tempera/quick-start-guide/" target="_blank" rel="noreferrer">
                Inkplate 4TEMPERA <ExternalIcon />
              </a>
            </li>
            <li>
              <a className="flex items-center gap-1 hover:underline" href="https://soldered.com/documentation/inkplate/2/quick-start-guide/" target="_blank" rel="noreferrer">
                Inkplate 2 <ExternalIcon />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom logo + copyright */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex flex-col items-center space-y-3">
        <a
          href="https://soldered.com/"
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 cursor-pointer"
          aria-label="Go to Soldered homepage"
        >
          <img
            src="/img/Soldered-logo-color.png"
            alt="Soldered logo"
            className="h-10 object-contain opacity-50 hover:opacity-100"
          />
        </a>
        <span className="text-sm">Copyright © 2025 Soldered. All rights reserved.</span>
      </div>

      {/* Version bottom-right */}
      <span className="absolute bottom-2 right-4 text-s text-gray-500">v1.0.0</span>
    </footer>
  );
}
