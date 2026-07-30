import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, ArrowRight, Clock, Flame } from 'lucide-react';
import { Link } from 'wouter';
import { characters, comics, worlds } from '@/data/mockData';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [searchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  const searchResults = React.useMemo(() => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();
    
    return {
      characters: characters.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.alias.toLowerCase().includes(lowerQuery)).slice(0, 3),
      comics: comics.filter(c => c.title.toLowerCase().includes(lowerQuery)).slice(0, 3),
      worlds: worlds.filter(w => w.name.toLowerCase().includes(lowerQuery)).slice(0, 3)
    };
  }, [query]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col p-4 sm:p-8 md:p-16"
        >
          <div className="absolute top-6 right-6">
            <button
              onClick={() => setSearchOpen(false)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full max-w-4xl mx-auto mt-10 md:mt-20">
            <div className="relative">
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-primary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search heroes, worlds, comics..."
                className="w-full bg-white/5 border-2 border-white/10 focus:border-primary rounded-2xl py-6 pl-20 pr-8 text-2xl md:text-4xl font-light text-white outline-none placeholder:text-white/20 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              />
            </div>

            {!query && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-sm font-cinzel font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Recent Searches
                  </h3>
                  <div className="flex flex-col gap-3">
                    {['Zayed Al-Dhahabi', 'Origins of Light Issue 1', 'Al-Sama Al-Hamra'].map((term) => (
                      <button key={term} onClick={() => setQuery(term)} className="text-left text-lg text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-cinzel font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Trending
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {['Shadow Emperor', 'Cosmic Magic', 'Chronos Falls', 'Zayed vs Farhan'].map((tag) => (
                      <button key={tag} onClick={() => setQuery(tag)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/10 text-sm text-white/80 transition-colors">
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {searchResults && (
              <div className="mt-12 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                {searchResults.characters.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-sm font-cinzel font-bold text-muted-foreground uppercase tracking-widest mb-4">Characters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {searchResults.characters.map((char) => (
                        <Link key={char.id} href={`/characters/${char.id}`}>
                          <div onClick={() => setSearchOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ background: char.image }}></div>
                            <div>
                              <div className="font-bold text-white group-hover:text-primary transition-colors">{char.name}</div>
                              <div className="text-xs text-muted-foreground">{char.alias}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.comics.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-sm font-cinzel font-bold text-muted-foreground uppercase tracking-widest mb-4">Comics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {searchResults.comics.map((comic) => (
                        <Link key={comic.id} href={`/comics/${comic.id}`}>
                          <div onClick={() => setSearchOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer group">
                            <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0" style={{ background: comic.coverImage }}></div>
                            <div>
                              <div className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{comic.title}</div>
                              <div className="text-xs text-muted-foreground">Issue #{comic.issueNumber}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.characters.length === 0 && searchResults.comics.length === 0 && searchResults.worlds.length === 0 && (
                  <div className="text-center py-20">
                    <SearchIcon className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white/50">No results found for "{query}"</h2>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
