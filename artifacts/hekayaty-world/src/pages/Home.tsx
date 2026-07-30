import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from 'framer-motion';
import { Link } from 'wouter';
import { characters, comics, worlds, news } from '@/data/mockData';
import { ArrowRight, ChevronRight, BookOpen, Users, Map, Star } from 'lucide-react';
import heroBg from '@assets/generated_images/hero_bg.jpg';

// Reusable Counter component
function AnimatedCounter({ value, label, icon: Icon }: { value: number, label: string, icon: any }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.onChange((v) => {
      setDisplayValue(Math.floor(v));
    });
  }, [springValue]);

  return (
    <div ref={ref} className="flex flex-col items-center p-6 glass-card rounded-2xl border-t border-primary/30 relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
      <Icon className="w-8 h-8 text-primary mb-4" />
      <div className="text-4xl md:text-5xl font-cinzel font-bold text-white mb-2">{displayValue}+</div>
      <div className="text-sm text-muted-foreground uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: y1, opacity }}
        >
          {heroBg ? (
            <img src={heroBg} alt="Hero Background" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </motion.div>

        {/* Particles placeholder */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none flex justify-around items-end">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-primary rounded-full"
              initial={{ y: '100vh', opacity: 0 }}
              animate={{ 
                y: '-10vh', 
                opacity: [0, 1, 0],
                x: Math.random() * 100 - 50
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: 'linear'
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-cinzel font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              ENTER THE <span className="gold-gradient">ARABIC</span><br />SUPERHERO UNIVERSE
            </h1>
            <p className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
              Discover a world where ancient magic, lost empires, and futuristic technology collide. Read the comics, explore the lore, and join the legend.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/comics">
                <button className="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(212,160,23,0.5)] transition-all flex items-center gap-2">
                  Start Reading <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/characters">
                <button className="px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-full border border-white/20 hover:bg-white/20 transition-all backdrop-blur-md">
                  Explore Heroes
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-white/50 animate-bounce"
          style={{ opacity }}
        >
          <span className="text-sm uppercase tracking-widest mb-2 font-cinzel">Discover</span>
          <ChevronRight className="w-6 h-6 rotate-90" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative z-20 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedCounter value={45} label="Heroes & Villains" icon={Users} />
            <AnimatedCounter value={120} label="Comics Published" icon={BookOpen} />
            <AnimatedCounter value={12} label="Realms" icon={Map} />
            <AnimatedCounter value={50000} label="Community Members" icon={Star} />
          </div>
        </div>
      </section>

      {/* Featured Characters */}
      <section className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-white mb-4">Legends <span className="gold-gradient">Awakened</span></h2>
              <p className="text-muted-foreground max-w-2xl text-lg">Meet the central figures shaping the fate of the realms.</p>
            </div>
            <Link href="/characters" className="hidden md:flex text-primary hover:text-white transition-colors items-center gap-2 font-cinzel font-bold uppercase tracking-wider text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {characters.slice(0, 3).map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
              >
                <Link href={`/characters/${char.id}`}>
                  <div className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-primary/50 transition-colors">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                         style={{ background: char.image.startsWith('linear-gradient') ? char.image : `url(${char.image}) center/cover` }}>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${char.alignment === 'Hero' ? 'text-blue-400 border-blue-400' : char.alignment === 'Villain' ? 'text-red-400 border-red-400' : 'text-purple-400 border-purple-400'}`}>
                          {char.alignment}
                        </span>
                        <span className="text-sm font-arabic text-primary">{char.arabicName}</span>
                      </div>
                      <h3 className="text-3xl font-cinzel font-bold text-white mb-2">{char.name}</h3>
                      <p className="text-white/70 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {char.shortBio}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Comics Carousel (Simplified Grid for now) */}
      <section className="py-24 relative z-20 bg-secondary/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-white mb-4">Latest <span className="gold-gradient">Issues</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Immerse yourself in the ongoing saga. Read the latest releases instantly.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {comics.map((comic, i) => (
              <motion.div
                key={comic.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative cursor-pointer"
              >
                <Link href={`/comics/${comic.id}`}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-xl border border-white/10 group-hover:border-primary/50 transition-colors">
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                         style={{ background: comic.coverImage.startsWith('linear-gradient') ? comic.coverImage : `url(${comic.coverImage}) center/cover` }}>
                    </div>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                      Issue #{comic.issueNumber}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{comic.title}</h3>
                  <p className="text-sm text-muted-foreground">{comic.series}</p>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/comics">
              <button className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-black transition-all">
                Browse Entire Library
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Worlds */}
      <section className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-white mb-6">Explore The <span className="gold-gradient">Realms</span></h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  From the shimmering spires of Al-Dhahab to the terrifying abyss of Sawad Al-Alam, the Hekayaty universe is vast and deeply connected. Every location holds secrets, ancient artifacts, and forgotten histories.
                </p>
                <ul className="space-y-4 mb-10">
                  {worlds.slice(0,3).map(w => (
                    <li key={w.id} className="flex items-center gap-4 text-white/80">
                      <div className="w-2 h-2 bg-primary rotate-45"></div>
                      <span className="font-bold">{w.name}</span> - <span className="text-muted-foreground text-sm">{w.arabicName}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/worlds">
                  <button className="flex items-center gap-2 text-primary font-cinzel font-bold uppercase tracking-widest hover:text-white transition-colors group">
                    Open The Atlas <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
              </motion.div>
            </div>
            
            <div className="flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(212,160,23,0.15)] group cursor-pointer"
              >
                <Link href="/worlds">
                  <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
                       style={{ background: worlds[0].image.startsWith('linear-gradient') ? worlds[0].image : `url(${worlds[0].image}) center/cover` }}>
                  </div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Map className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* News & Updates */}
      <section className="py-24 relative z-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white mb-12 text-center">Universe <span className="gold-gradient">Updates</span></h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {news.map((item, i) => (
               <motion.div 
                 key={item.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="flex flex-col sm:flex-row gap-6 glass-card p-4 rounded-2xl hover:border-primary/40 transition-colors group cursor-pointer"
               >
                 <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0" style={{ background: item.image }}></div>
                 <div className="flex flex-col justify-center">
                   <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{item.category} • {item.date}</div>
                   <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">{item.title}</h3>
                   <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>
      </section>
    </div>
  );
}
