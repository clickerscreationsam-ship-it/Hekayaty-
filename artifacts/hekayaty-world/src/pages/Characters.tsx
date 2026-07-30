import React, { useState } from 'react';
import { characters, worlds } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Filter, Search, ChevronDown } from 'lucide-react';

export default function Characters() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const alignments = ['All', 'Hero', 'Villain', 'Antihero', 'Neutral'];

  const filteredCharacters = characters.filter(c => {
    const matchesFilter = filter === 'All' || c.alignment === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.alias.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-white mb-4">
          <span className="gold-gradient">Character</span> Database
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore the heroes, villains, and cosmic entities that shape the destiny of the realms.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 glass-card p-4 rounded-2xl">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {alignments.map(a => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                filter === a 
                  ? 'bg-primary text-black' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:border-primary outline-none transition-colors"
          />
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCharacters.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/characters/${char.id}`}>
              <div className="group relative h-[450px] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-primary/50 transition-colors">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                     style={{ background: char.image.startsWith('linear-gradient') ? char.image : `url(${char.image}) center/cover` }}>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                
                <div className="absolute top-4 right-4 flex gap-2">
                   <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border bg-black/50 backdrop-blur-md ${char.alignment === 'Hero' ? 'text-blue-400 border-blue-400' : char.alignment === 'Villain' ? 'text-red-400 border-red-400' : 'text-purple-400 border-purple-400'}`}>
                    {char.alignment}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-sm font-arabic text-primary mb-1">{char.arabicName}</div>
                  <h3 className="text-2xl font-cinzel font-bold text-white mb-1">{char.name}</h3>
                  <div className="text-sm text-white/50 mb-3">{char.alias}</div>
                  
                  <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {char.powers.slice(0, 2).map(power => (
                      <span key={power} className="text-xs px-2 py-1 bg-white/10 rounded text-white/80">
                        {power}
                      </span>
                    ))}
                    {char.powers.length > 2 && <span className="text-xs px-2 py-1 bg-white/10 rounded text-white/80">+{char.powers.length - 2}</span>}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {filteredCharacters.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No characters found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
