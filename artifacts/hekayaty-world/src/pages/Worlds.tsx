import React from 'react';
import { characters, worlds } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Map, ArrowRight } from 'lucide-react';

export default function Worlds() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-white mb-4">
          The <span className="gold-gradient">Realms</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The Hekayaty Universe spans multiple dimensions, from shimmering utopias to nightmarish wastelands. 
          Explore the atlas of reality.
        </p>
      </div>

      <div className="space-y-24">
        {worlds.map((world, index) => (
          <motion.div 
            key={world.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <Link href={`/worlds/${world.id}`}>
                <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-primary/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors">
                  <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
                       style={{ background: world.image.startsWith('linear-gradient') ? world.image : `url(${world.image}) center/cover` }}>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full glass-card flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Map className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Info */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-arabic text-primary">{world.arabicName}</span>
                <div className="h-px bg-white/20 flex-1"></div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-white">{world.name}</h2>
              <p className="text-lg text-white/70 leading-relaxed">{world.description}</p>
              
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/10">
                <div>
                  <div className="text-xs font-cinzel text-muted-foreground uppercase tracking-widest mb-1">Current Ruler</div>
                  <div className="text-white font-bold">{world.ruler}</div>
                </div>
                <div>
                  <div className="text-xs font-cinzel text-muted-foreground uppercase tracking-widest mb-1">Key Locations</div>
                  <div className="text-white font-bold">{world.notableLocations.length} Regions</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-cinzel font-bold text-white uppercase tracking-widest mb-4">Native Characters</h4>
                <div className="flex gap-3">
                  {characters.filter(c => c.worldId === world.id).slice(0, 4).map(char => (
                    <Link key={char.id} href={`/characters/${char.id}`}>
                      <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:border-primary transition-colors" title={char.name}>
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: char.image.startsWith('linear-gradient') ? 'none' : `url(${char.image})`, background: char.image.startsWith('linear-gradient') ? char.image : '' }}></div>
                      </div>
                    </Link>
                  ))}
                  {characters.filter(c => c.worldId === world.id).length === 0 && (
                     <span className="text-sm text-white/50">Data classified</span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Link href={`/worlds/${world.id}`}>
                  <button className="flex items-center gap-2 text-primary font-bold hover:text-white transition-colors group">
                    Explore Region <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
