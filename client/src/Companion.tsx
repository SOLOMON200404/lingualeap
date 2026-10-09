import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Apple, Sparkles } from 'lucide-react';
import { PetAvatar, petAbility } from './PetArt';
import { api } from './api';
import './pet.css';

export default function Companion() {
  const [pet, setPet] = useState<any>();
  const [name, setName] = useState('Pip');
  const [color, setColor] = useState('amber');
  const [accessory, setAccessory] = useState('none');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const result = await api('/pet');
      setPet(result);
      setName(result.name);
      setColor(result.color);
      setAccessory(result.accessory);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  async function save() {
    setBusy(true); setError(''); setNotice('');
    try {
      const updated = await api('/pet', { method: 'PATCH', body: JSON.stringify({ name, color, accessory }) });
      setPet(updated); setNotice('Your companion’s new look is saved!');
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function feed() {
    setBusy(true); setError(''); setNotice('');
    try {
      const updated = await api('/pet/feed', { method: 'POST' });
      setPet(updated); setNotice(`${updated.name} enjoyed a berry!`);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (loading && !pet) return <main className="page companion-page"><section className="pet-signin"><PetAvatar/><h1>Finding your companion…</h1><p>Your learning buddy is getting ready.</p></section></main>;
  if (!pet && (error === 'Please sign in' || error.includes('401'))) return <main className="page companion-page"><section className="pet-signin"><PetAvatar/><h1>Your companion is waiting</h1><p>Sign in to meet and grow your learning buddy.</p><Link className="primary" to="/login">Log in <ArrowRight size={17}/></Link></section></main>;
  if (!pet) return <main className="page companion-page"><section className="pet-signin"><PetAvatar/><h1>We couldn’t load your companion</h1><p>{error || 'Check your connection and try again.'}</p><button className="primary" onClick={()=>void refresh()}>Try again <ArrowRight size={17}/></button></section></main>;

  const nextLevel = pet.level * 240;
  const progress = Math.min(100, Math.round(((pet.xp % 240) / 240) * 100));
  const colorCost = color !== pet.color ? 5 : 0;
  const accessoryCost = accessory !== pet.accessory && accessory !== 'none' ? 8 : 0;

  return <main className="page companion-page">
    <div className="pagetop"><div><span className="eyebrow">YOUR LEARNING COMPANION</span><h1>A little buddy for every big leap.</h1><p className="muted">Learn together, earn berries, and help your companion grow.</p></div><Link to="/learn" className="outline">Back to learning <ArrowRight size={16}/></Link></div>
    <section className={`pet-hero color-${pet.color}`}>
      <div className="pet-hero-art"><div className="pet-aura"/><PetAvatar color={pet.color} accessory={pet.accessory} className="pet-large"/><span className="pet-sparkle">✦</span></div>
      <div className="pet-hero-info"><span className="pet-level">LEVEL {pet.level} · {petAbility(pet.level)}</span><h2>{pet.name}</h2><p>Your companion grows as you practise new words and complete lessons.</p>
        <div className="pet-xp-label"><span>Growth XP</span><b>{pet.xp} XP</b></div><div className="pet-xp-track"><i style={{ width: `${progress}%` }}/></div><small>{Math.max(0, nextLevel - pet.xp)} XP to the next level</small>
        <div className="pet-resources"><span><Apple size={17}/> {pet.berries} berries</span><span><span aria-hidden="true">💚</span> {pet.happiness}% happiness</span></div>
        <button className="primary pet-feed" disabled={busy || pet.berries < 1} onClick={feed}><Apple size={18}/> Feed 1 berry</button>
      </div>
    </section>
    <section className="pet-customise"><div><span className="eyebrow">MAKE IT YOURS</span><h2>Customise your companion</h2><p>Changing the name is free. New colours cost 5 berries; accessories cost 8.</p></div>
      <label className="pet-name-field">Companion name<input value={name} maxLength={18} onChange={e=>setName(e.target.value)} aria-label="Companion name"/></label>
      <div className="pet-choices"><fieldset><legend>Fur colour <small>5 berries to change</small></legend><div className="pet-swatches">{[['amber','Amber'],['mint','Mint'],['sky','Sky'],['rose','Rose']].map(([id,label])=><button key={id} type="button" className={`swatch swatch-${id} ${color===id?'active':''}`} aria-label={`${label} fur`} aria-pressed={color===id} onClick={()=>setColor(id)}><span/>{label}</button>)}</div></fieldset>
        <fieldset><legend>Accessory <small>8 berries to unlock</small></legend><div className="pet-swatches">{[['none','None'],['scarf','Scarf 🧣'],['flower','Flower 🌼'],['crown','Crown 👑']].map(([id,label])=><button key={id} type="button" className={`accessory-choice ${accessory===id?'active':''}`} aria-pressed={accessory===id} onClick={()=>setAccessory(id)}>{label}</button>)}</div></fieldset></div>
      <button className="primary pet-save" disabled={busy || !name.trim()} onClick={save}><Sparkles size={17}/> Save changes · {colorCost+accessoryCost} berries</button>
    </section>
    {error&&<p className="pet-message pet-error" role="alert">{error}</p>}{notice&&<p className="pet-message" role="status">{notice}</p>}
    <section className="pet-unlocks"><span className="eyebrow">GROWING TOGETHER</span><h2>Abilities unlock as your pet levels up</h2><div className="unlock-grid">{[[1,'Curious Scout','Your adventure begins here.'],[2,'Word Finder','Reveals one answer pattern per lesson.'],[3,'Phrase Weaver','Adds one bonus heart to each lesson.'],[4,'Culture Keeper','Blocks the first wrong-answer heart loss in a lesson.']].map(([level,title,desc]:any)=><article className={pet.level>=level?'unlocked':''} key={level}><b>LEVEL {level}</b><h3>{title}</h3><p>{desc}</p></article>)}</div><p className="pet-footnote">Each first-time lesson completion earns 3 berries and pet XP based on correct answers.</p></section>
  </main>;
}
