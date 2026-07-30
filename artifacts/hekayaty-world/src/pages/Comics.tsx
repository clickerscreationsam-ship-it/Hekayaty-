import React, { useState } from 'react';
import { comics } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Search, Filter, BookOpen } from 'lucide-react';

export default function Comics() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const filteredComics = comics.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.series.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sort === 'newest') return b.year - a.year;
    if (sort === 'oldest') return a.year - b.year;
    return 0; // rating or az could be added
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-white mb-4">
          <span className="gold-gradient">Comics</span> Library
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Dive into the epic narratives that define the Hekayaty Universe. Read issues instantly or add them to your collection.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 glass-card p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary cursor-pointer w-full md:w-auto appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredComics.map((comic, i) => (
          <motion.div
            key={comic.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <Link href={`/comics/${comic.id}`}>
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4 border border-white/10 group-hover:border-primary/50 transition-colors shadow-lg cursor-pointer">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: comic.coverImage.startsWith('linear-gradient') ? 'none' : `url(${comic.coverImage})`, background: comic.coverImage.startsWith('linear-gradient') ? comic.coverImage : '' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                  {comic.year}
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <button className="w-full py-2 bg-primary text-black font-bold rounded flex items-center justify-center gap-2 hover:bg-white transition-colors">
                    <BookOpen className="w-4 h-4" /> Read
                  </button>
                </div>
              </div>
              <div className="cursor-pointer">
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">{comic.title}</h3>
                <div className="text-sm text-muted-foreground flex justify-between items-center">
                  <span>{comic.series}</span>
                  <span>#{comic.issueNumber}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {filteredComics.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No comics found.</p>
        </div>
      )}
    </div>
  );
}
