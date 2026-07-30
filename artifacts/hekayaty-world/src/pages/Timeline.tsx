import React, { useState } from 'react';
import { timeline } from '@/data/mockData';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Timeline() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'War', 'Discovery', 'Birth', 'Cataclysm'];

  const filteredEvents = activeCategory === 'All' 
    ? timeline 
    : timeline.filter(e => e.category === activeCategory);

  const { scrollYProgress } = useScroll();
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-white mb-4">
          The <span className="gold-gradient">Timeline</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          The history of the realms spans millennia. Trace the events that shaped the universe.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(212,160,23,0.5)]' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Central Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2"></div>
        <motion.div 
          className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-primary md:-translate-x-1/2 origin-top"
          style={{ scaleY }}
        ></motion.div>

        <div className="space-y-12 pb-24">
          {filteredEvents.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`relative flex items-center justify-between md:justify-normal ${
                i % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
              } group`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary md:-translate-x-1/2 z-10 group-hover:scale-150 group-hover:bg-primary transition-all shadow-[0_0_10px_rgba(212,160,23,0.5)]"></div>

              {/* Content Box */}
              <div className={`ml-12 md:ml-0 w-full md:w-5/12 ${i % 2 === 0 ? 'md:pl-12 text-left' : 'md:pr-12 md:text-right'}`}>
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors">
                  <div className={`text-xl font-bold text-primary mb-1 font-cinzel ${i % 2 === 0 ? '' : 'md:justify-end'}`}>
                    {event.year}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
                  <div className={`flex gap-2 mb-4 ${i % 2 === 0 ? '' : 'md:justify-end'}`}>
                    <span className="px-2 py-1 text-[10px] uppercase tracking-wider rounded border border-white/20 text-white/50 bg-white/5">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-white/70 leading-relaxed text-sm">{event.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
