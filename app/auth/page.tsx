// app/components/Hero.tsx

import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      <Image
        src="https://plus.unsplash.com/premium_photo-1723433351547-e20b3b4322cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Cloutinet city technology"
        fill
        priority
        quality={85}
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">

        <div className="max-w-5xl">

          <p className="mb-4 text-sm uppercase tracking-[4px] text-gray-300">
            Cloutinet
          </p>

          <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
            Every Business.
            <br />
            Discoverable.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-gray-300">
            The digital visibility platform helping businesses create their
            online presence, showcase products, and reach more customers.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">

            <a
              href="/signup"
              className="rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-gray-200"
            >
              Create Free Business Page
            </a>

            <a
              href="/businesses"
              className="rounded-full border border-white px-8 py-4 font-bold text-white transition hover:bg-white hover:text-black"
            >
              Explore Businesses
            </a>

          </div>

        </div>

      </div>

    </section>
    /** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
}

module.exports = nextConfig
  )
}
