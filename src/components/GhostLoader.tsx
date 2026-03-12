import { motion } from 'motion/react';

export default function GhostLoader() {
  return (
    <div className="min-h-screen bg-bg-base overflow-hidden">
      {/* Top Banner Ghost */}
      <div className="h-10 md:h-12 bg-primary/5 animate-pulse" />
      
      {/* Navbar Ghost */}
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto h-14 bg-primary/5 rounded-full animate-pulse" />
      </div>

      <div className="space-y-16 pb-16">
        {/* Hero Ghost */}
        <section className="relative min-h-[70vh] flex items-center justify-center pt-32 md:pt-40">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-8 w-full">
            <div className="h-20 md:h-32 w-3/4 mx-auto bg-primary/5 rounded-2xl animate-pulse" />
            <div className="h-6 w-1/2 mx-auto bg-primary/5 rounded-lg animate-pulse" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="h-14 w-40 bg-primary/5 rounded-xl animate-pulse" />
              <div className="h-14 w-40 bg-primary/5 rounded-xl animate-pulse" />
            </div>
          </div>
        </section>

        {/* Featured Products Ghost */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 space-y-4">
            <div className="h-10 w-64 bg-primary/5 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-primary/5 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-primary/5 rounded-2xl animate-pulse" />
                <div className="h-4 w-3/4 bg-primary/5 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-primary/5 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
