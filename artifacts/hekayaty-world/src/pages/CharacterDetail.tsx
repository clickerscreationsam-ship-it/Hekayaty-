import React from 'react';
import { useRoute, Link } from 'wouter';
import { characters, worlds, comics } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Shield, Map, Sword, BookOpen, ArrowLeft } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function CharacterDetail() {
  const [match, params] = useRoute('/characters/:id');
  const character = characters.find(c => c.id === params?.id);

  if (!character) {
    return <div className="min-h-screen flex items-center justify-center text-white">Character not found</div>;
  }

  const world = worlds.find(w => w.id === character.worldId);
  const relatedComics = comics.filter(c => c.characters.includes(character.id));

  const statsData = [
    { subject: 'Strength', A: character.stats.strength, fullMark: 100 },
    { subject: 'Speed', A: character.stats.speed, fullMark: 100 },
    { subject: 'Durability', A: character.stats.durability, fullMark: 100 },
    { subject: 'Magic', A: character.stats.magic, fullMark: 100 },
    { subject: 'Combat', A: character.stats.combat, fullMark: 100 },
    { subject: 'Intel', A: character.stats.intelligence, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-[60vh] min-h-[500px] w-full">
        <div className="absolute inset-0" style={{ background: character.image.startsWith('linear-gradient') ? character.image : `url(${character.image}) center/20%` }}></div>
        {/* If it's a real image, we want it to cover differently or use a blur backing, since it's a portrait. For now, cover is okay. Let's adjust background size */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" style={{ backgroundImage: character.image.startsWith('linear-gradient') ? 'none' : `url(${character.image})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
        
        <div className="absolute top-8 left-8 z-10">
          <Link href="/characters">
            <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Database
            </button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-4">
               <span className={`px-4 py-1 text-sm font-bold uppercase tracking-widest rounded-full border bg-black/50 backdrop-blur-md ${character.alignment === 'Hero' ? 'text-blue-400 border-blue-400' : character.alignment === 'Villain' ? 'text-red-400 border-red-400' : 'text-purple-400 border-purple-400'}`}>
                {character.alignment}
              </span>
              <span className="text-xl font-arabic text-primary">{character.arabicName}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-cinzel font-bold text-white mb-2 drop-shadow-lg">{character.name}</h1>
            <p className="text-2xl text-white/70 font-light drop-shadow-md">{character.alias}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-cinzel font-bold text-white mb-6 border-b border-white/10 pb-4">Biography</h2>
              <p className="text-lg text-white/80 leading-relaxed mb-6">{character.fullBio}</p>
              <h3 className="text-xl font-bold text-white mb-3">Origin Story</h3>
              <p className="text-white/70 leading-relaxed">{character.originStory}</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-cinzel font-bold text-primary mb-4 flex items-center gap-2">
                  <Sword className="w-5 h-5" /> Abilities
                </h3>
                <ul className="space-y-3">
                  {character.powers.map(power => (
                    <li key={power} className="flex items-center gap-3 text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {power}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-cinzel font-bold text-destructive mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Weaknesses
                </h3>
                <ul className="space-y-3">
                  {character.weaknesses.map(weak => (
                    <li key={weak} className="flex items-center gap-3 text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                      {weak}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-cinzel font-bold text-white mb-6 border-b border-white/10 pb-4">Featured In</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedComics.map(comic => (
                  <Link key={comic.id} href={`/comics/${comic.id}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 mb-2">
                        <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: comic.coverImage.startsWith('linear-gradient') ? 'none' : `url(${comic.coverImage})`, background: comic.coverImage.startsWith('linear-gradient') ? comic.coverImage : '' }}></div>
                      </div>
                      <div className="text-sm font-bold text-white group-hover:text-primary line-clamp-1">{comic.title}</div>
                      <div className="text-xs text-muted-foreground">Issue #{comic.issueNumber}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-2xl border-t-4 border-t-primary">
              <h3 className="text-lg font-cinzel font-bold text-white mb-6 text-center uppercase tracking-widest">Power Metrics</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={character.name}
                      dataKey="A"
                      stroke="#D4A017"
                      strokeWidth={2}
                      fill="#D4A017"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-cinzel font-bold text-white mb-4 uppercase tracking-widest">Affiliations</h3>
              <div className="flex flex-wrap gap-2">
                {character.affiliations.map(affil => (
                  <span key={affil} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/80">
                    {affil}
                  </span>
                ))}
              </div>
            </div>

            {world && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-cinzel font-bold text-white mb-4 uppercase tracking-widest">Homeworld</h3>
                <Link href={`/worlds/${world.id}`}>
                  <div className="group cursor-pointer">
                    <div className="aspect-video rounded-lg overflow-hidden mb-3 relative">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: world.image.startsWith('linear-gradient') ? 'none' : `url(${world.image})`, background: world.image.startsWith('linear-gradient') ? world.image : '' }}></div>
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                      <Map className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/70" />
                    </div>
                    <div className="font-bold text-primary group-hover:text-white transition-colors">{world.name}</div>
                    <div className="text-sm text-muted-foreground">{world.arabicName}</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
