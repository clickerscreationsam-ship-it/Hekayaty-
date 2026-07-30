import React from 'react';
import { useRoute, Link } from 'wouter';
import { comics, characters } from '@/data/mockData';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, Plus, Share2, PenTool } from 'lucide-react';

export default function ComicDetail() {
  const [match, params] = useRoute('/comics/:id');
  const comic = comics.find(c => c.id === params?.id);

  if (!comic) {
    return <div className="min-h-screen flex items-center justify-center text-white">Comic not found</div>;
  }

  const featuredCharacters = characters.filter(c => comic.characters.includes(c.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Blurred background layer */}
      <div className="absolute top-0 w-full h-[50vh] opacity-20 pointer-events-none z-0">
         <div className="absolute inset-0 bg-cover bg-center blur-3xl" style={{ backgroundImage: comic.coverImage.startsWith('linear-gradient') ? 'none' : `url(${comic.coverImage})`, background: comic.coverImage.startsWith('linear-gradient') ? comic.coverImage : '' }}></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <Link href="/comics">
          <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" /> Back to Library
          </button>
        </Link>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Cover Art */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 lg:w-1/4 shrink-0"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: comic.coverImage.startsWith('linear-gradient') ? 'none' : `url(${comic.coverImage})`, background: comic.coverImage.startsWith('linear-gradient') ? comic.coverImage : '' }}></div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider">{comic.series}</span>
              <span className="text-primary font-bold">Issue #{comic.issueNumber}</span>
              <span className="text-white/50">{comic.year}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white mb-6">{comic.title}</h1>
            
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-white font-bold">{comic.rating}</span>
              </div>
              <div className="flex gap-2">
                {comic.genre.map(g => (
                  <span key={g} className="px-2 py-1 text-xs border border-white/20 rounded text-white/70">{g}</span>
                ))}
              </div>
            </div>

            <p className="text-lg text-white/80 leading-relaxed mb-8">
              {comic.synopsis}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href={`/comics/${comic.id}/read`}>
                <button className="px-8 py-4 bg-primary text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(212,160,23,0.3)]">
                  <BookOpen className="w-5 h-5" /> Read Now
                </button>
              </Link>
              <button className="px-6 py-4 bg-white/5 text-white font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add to Collection
              </button>
              <button className="p-4 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Credits */}
            <div className="grid grid-cols-2 gap-8 mb-12 bg-black/40 p-6 rounded-2xl border border-white/5">
              <div>
                <h4 className="text-xs font-cinzel text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><PenTool className="w-3 h-3" /> Writer</h4>
                <p className="text-white font-bold">{comic.writer}</p>
              </div>
              <div>
                <h4 className="text-xs font-cinzel text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><PenTool className="w-3 h-3" /> Artist</h4>
                <p className="text-white font-bold">{comic.artist}</p>
              </div>
            </div>
            
            {/* Featured Characters */}
            {featuredCharacters.length > 0 && (
              <div>
                <h3 className="text-xl font-cinzel font-bold text-white mb-6 uppercase tracking-widest">Featured Characters</h3>
                <div className="flex flex-wrap gap-4">
                  {featuredCharacters.map(char => (
                    <Link key={char.id} href={`/characters/${char.id}`}>
                      <div className="flex items-center gap-3 bg-white/5 pr-4 rounded-full border border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: char.image.startsWith('linear-gradient') ? 'none' : `url(${char.image})`, background: char.image.startsWith('linear-gradient') ? char.image : '' }}></div>
                        <span className="text-sm font-bold text-white">{char.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
