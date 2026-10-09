import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Heart, Volume2, Apple } from 'lucide-react';
import { PetAvatar, petAbility } from './PetArt';
import { api } from './api';

function say(text: string, lang: string, setError: (error: string) => void) {
  if (!('speechSynthesis' in window)) { setError('Audio is not available in this browser.'); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || 'en-US';
  utterance.onstart = () => setError('');
  utterance.onerror = () => setError(`Could not play ${lang || 'language'} audio on this device.`);
  window.speechSynthesis.speak(utterance);
}

export default function LessonPlayer() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>();
  const [pet, setPet] = useState<any>();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [tileIndexes, setTileIndexes] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<any>();
  const [hearts, setHearts] = useState(5);
  const [maxHearts, setMaxHearts] = useState(5);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hint, setHint] = useState('');
  const [hintBusy, setHintBusy] = useState(false);
  const [complete, setComplete] = useState<any>();
  const [audioError, setAudioError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/lessons/${id}`).then(setLesson).catch(e => setError(e.message));
    api('/pet').then((companion:any) => { setPet(companion); const max=companion.level>=3?6:5; setMaxHearts(max); setHearts(max); }).catch(()=>{});
  }, [id]);
  const exercise = lesson?.exercises?.[index];
  const courseCode = lesson?.unit?.course?.code || 'en-US';
  const tileAnswer = exercise?.type === 'tiles' ? tileIndexes.map((tileIndex:number) => exercise.options[tileIndex]).join(' ') : '';
  const currentAnswer = exercise?.type === 'tiles' ? tileAnswer : answer;

  function playWord() { if (exercise) say(exercise.audioText || exercise.prompt, courseCode, setAudioError); }
  function playQuestion() { if (exercise) say(exercise.prompt, 'en-US', setAudioError); }

  async function check() {
    if (!exercise || !currentAnswer || busy) return;
    setBusy(true); setError('');
    try {
      const result = await api(`/exercises/${exercise.id}/check`, { method: 'POST', body: JSON.stringify({ answer: currentAnswer }) });
      setAnswers(previous => ({ ...previous, [exercise.id]: currentAnswer }));
      const protectedByCompanion = !result.correct && pet?.level >= 4 && !shieldUsed;
      setFeedback({ ...result, shieldSaved: protectedByCompanion });
      if (protectedByCompanion) setShieldUsed(true);
      else if (!result.correct) setHearts(value => Math.max(0, value - 1));
    } catch (e:any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function askForHint() {
    if (!exercise || hintUsed || hintBusy) return;
    setHintBusy(true); setError('');
    try { const result=await api(`/exercises/${exercise.id}/hint`,{method:'POST'}); setHint(result.hint); setHintUsed(true); }
    catch(e:any){setError(e.message)} finally{setHintBusy(false)}
  }

  async function next() {
    setError('');
    if (index < lesson.exercises.length - 1) { setFeedback(null); setAnswer(''); setTileIndexes([]); setHint(''); setIndex(value => value + 1); return; }
    setBusy(true);
    try {
      const result = await api(`/lessons/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: lesson.exercises.map((item:any) => ({ exerciseId: item.id, answer: answers[item.id] || '' })) }),
      });
      setComplete(result);
    } catch (e:any) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (error === 'Please sign in') return <main className="page"><h1>Sign in to start this lesson</h1><Link className="primary" to="/login">Log in <ArrowRight/></Link></main>;
  if (!lesson) return <main className="page"><p>{error || 'Loading lesson…'}</p></main>;
  if (hearts === 0) return <main className="auth"><section className="authcard"><span className="bigemoji">💚</span><h1>Time to recharge</h1><p>Practise a few words and come back with full hearts.</p><Link to="/practice" className="primary">Practice now <ArrowRight size={17}/></Link></section></main>;
  if (complete) return <main className="auth"><section className="authcard celebration">
    <div className="confetti" aria-hidden="true">🎉 ✨ 🎊</div>
    {complete.pet && <PetAvatar color={complete.pet.color} accessory={complete.pet.accessory} className="pet-complete-avatar"/>}
    <h1>Lesson complete!</h1><p>You earned <b>+{complete.xp} XP</b> with {Math.round(complete.accuracy * 100)}% accuracy.</p>
    <div className="lesson-pet-reward"><Apple size={18}/><span><b>+{complete.berriesEarned} berries</b><small>{complete.firstCompletion ? `${complete.pet.name} is growing with you!` : 'Replay completed — no duplicate rewards this time.'}</small></span></div>
    <p className="pet-unlock-note">{complete.pet.name} · Level {complete.pet.level} · {petAbility(complete.pet.level)}</p>
    <Link to="/companion" className="outline">Visit your companion <ArrowRight size={16}/></Link>
    <Link to="/learn" className="primary lesson-complete-next">Keep learning <ArrowRight size={17}/></Link>
  </section></main>;

  return <main className="lesson">
    <div className="lessonbar"><Link to="/learn" aria-label="Exit lesson">×</Link><div className="progress" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={lesson.exercises.length} aria-valuenow={index}><i style={{ width: `${(index / lesson.exercises.length) * 100}%` }}/></div><div className="hearts" aria-label={`${hearts} of ${maxHearts} hearts remaining`}>{Array.from({ length: maxHearts }, (_, i) => <Heart key={i} size={19} fill={i < hearts ? '#ef6b67' : 'none'} color={i < hearts ? '#ef6b67' : '#adbdb8'}/>)}</div></div>
    <section className="exercise"><span className="eyebrow">{lesson.unit.title} · {index + 1} OF {lesson.exercises.length}</span><h1>{exercise.prompt}</h1>
      <div className="exercise-audio"><button className="sound" aria-label="Play target language audio" onClick={playWord}><Volume2 size={20}/> Listen to the phrase <span>{courseCode}</span></button><button className="sound sound-prompt" aria-label="Read the question aloud" onClick={playQuestion}><Volume2 size={18}/> Hear question</button></div>
      {audioError && <div className="audio-error" role="status">{audioError}</div>}
      {pet?.level>=2&&!hintUsed&&<button type="button" className="pet-hint-button" onClick={()=>void askForHint()} disabled={hintBusy}>{hintBusy?'Finding a clue…':`${pet.name} can find a word clue`}</button>}{hint&&<div className="pet-hint" role="status"><b>Word Finder clue:</b> {hint}</div>}
      {exercise.type === 'fill' ? <label className="tile-answer-label">Your answer<input className="response" aria-label="Type your answer" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !feedback) void check(); }} placeholder="Type the English meaning"/></label>
        : exercise.type === 'tiles' ? <div className="tile-exercise"><p className="tile-hint">Tap the tiles in order to build your translation.</p><div className="tile-answer" aria-live="polite">{tileIndexes.map((tileIndex:number, position:number)=><button type="button" className="word-tile selected-tile" key={`${tileIndex}-${position}`} aria-label={`Remove ${exercise.options[tileIndex]}`} onClick={()=>setTileIndexes(values=>values.filter((_,i)=>i!==position))}>{exercise.options[tileIndex]}</button>)}</div><div className="tile-bank">{exercise.options.map((word:string,tileIndex:number)=><button type="button" className="word-tile" key={`${word}-${tileIndex}`} disabled={tileIndexes.includes(tileIndex)} onClick={()=>setTileIndexes(values=>[...values,tileIndex])}>{word}</button>)}</div></div>
          : <div className="options">{exercise.options.map((option:string, optionIndex:number)=><button type="button" className={answer===option?'chosen':''} key={`${option}-${optionIndex}`} onClick={()=>setAnswer(option)}>{option}</button>)}</div>}
      {feedback && <div className={feedback.correct?'correct':'incorrect'} role="status">{feedback.correct?'Correct!':feedback.shieldSaved?`Your Culture Keeper shield saved a heart! The answer is “${feedback.answer}”`:`Not quite — the answer is “${feedback.answer}”`}</div>}
      {error && <div className="error" role="alert">{error}</div>}
    </section><div className="lessonbottom">{feedback ? <button className="primary" disabled={busy} onClick={()=>void next()}>{busy?'Saving…':'Continue'} <ArrowRight size={17}/></button> : <button disabled={!currentAnswer || busy} className="primary" onClick={()=>void check()}>{busy?'Checking…':'Check'} <ArrowRight size={17}/></button>}</div>
  </main>;
}
