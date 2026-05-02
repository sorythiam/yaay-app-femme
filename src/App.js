import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

// =====================================================
// TRANSLATIONS
// =====================================================
const t = {
  fr: {
    welcome: 'Bienvenue',
    login: 'Se connecter',
    signup: 'Créer un compte',
    email: 'Email',
    password: 'Mot de passe',
    phone: 'Téléphone',
    firstName: 'Prénom',
    lastName: 'Nom',
    validate: 'Valider',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',
    setupProfile: 'Complétez votre profil',
    week: 'Semaine',
    weekShort: 'S',
    days: 'jours',
    today: "aujourd'hui",
    nextAppointment: 'Prochain rendez-vous',
    noAppointment: 'Aucun RDV planifié',
    riskLow: 'Grossesse normale',
    riskMedium: 'Suivi régulier',
    riskHigh: '⚠ Risque élevé',
    riskLowDesc: 'Suivi standard recommandé',
    riskHighDesc: 'Surveillance renforcée nécessaire',
    home: 'Accueil',
    carnet: 'Carnet',
    sos: 'SOS',
    more: 'Plus',
    myFollowUp: 'Mon suivi',
    trimester1: 'T1',
    trimester2: 'T2',
    trimester3: 'T3',
    medicalRecord: 'Mon carnet médical',
    noConsultations: 'Aucune consultation enregistrée',
    weight: 'Poids',
    bp: 'TA',
    uh: 'HU',
    bcf: 'BCF',
    upcomingAppointments: 'Rendez-vous à venir',
    logout: 'Se déconnecter',
    pregnancyComplete: 'Aucune grossesse en cours',
    helloName: 'Bonjour',
    howAreYou: 'comment vous sentez-vous ?',
    daysToBaby: "jusqu'à votre bébé",
    consultationFrom: 'CPN du',
    performedBy: 'par',
    waitingForFirstCPN:
      "Votre première consultation prénatale n'a pas encore été saisie. Elle apparaîtra ici dès que votre sage-femme l'aura enregistrée.",
  },
  wo: {
    welcome: 'Dalal ak diam',
    login: 'Dugg',
    signup: 'Sos kont',
    email: 'Email',
    password: 'Password',
    phone: 'Telefon',
    firstName: 'Tur',
    lastName: 'Sant',
    validate: 'Wonal',
    noAccount: 'Amul kont ?',
    hasAccount: 'Am nga kont ?',
    setupProfile: 'Mottali sa profil',
    week: 'Ayubés',
    weekShort: 'S',
    days: 'fan',
    today: 'tey',
    nextAppointment: 'RDV bi ñëw',
    noAppointment: 'Amul RDV',
    riskLow: 'Biir bu baax',
    riskMedium: 'Wuyool bu sax',
    riskHigh: '⚠ Mussiba ci kaw',
    riskLowDesc: 'Wuyool bu yor',
    riskHighDesc: 'Sosal wuyool bu metti',
    home: 'Kër',
    carnet: 'Karne',
    sos: 'Mussiba',
    more: 'Yeneen',
    myFollowUp: 'Sama wuyool',
    trimester1: 'T1',
    trimester2: 'T2',
    trimester3: 'T3',
    medicalRecord: 'Sama karne fajj',
    noConsultations: 'Amul consultation',
    weight: 'Diis',
    bp: 'Tension',
    uh: 'HU',
    bcf: 'BCF',
    upcomingAppointments: 'RDV yi ñëw',
    logout: 'Génn',
    pregnancyComplete: 'Amul biir',
    helloName: 'Asalaa Maleekum',
    howAreYou: 'naka nga def ?',
    daysToBaby: 'ngir sa doom',
    consultationFrom: 'CPN bu',
    performedBy: 'ko',
    waitingForFirstCPN:
      'Sa CPN bu njekk défuko. Dina feeñ fii bu sage-femme bi ko bind.',
  },
};

// =====================================================
// MAIN APP
// =====================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    if (data?.preferred_language) setLang(data.preferred_language);
    setLoading(false);
  }

  return (
    <div style={appBgStyle}>
      <PhoneFrame>
        {loading ? (
          <LoadingScreen tr={t[lang]} />
        ) : !session ? (
          <AuthScreen tr={t[lang]} lang={lang} setLang={setLang} />
        ) : !profile ? (
          <ProfileSetupScreen
            tr={t[lang]}
            userId={session.user.id}
            email={session.user.email}
            onComplete={() => loadProfile(session.user.id)}
          />
        ) : profile.role !== 'femme' ? (
          <WrongRoleScreen profile={profile} />
        ) : (
          <MobileApp
            profile={profile}
            session={session}
            tr={t[lang]}
            lang={lang}
            setLang={setLang}
          />
        )}
      </PhoneFrame>
    </div>
  );
}

// =====================================================
// PHONE FRAME (effet smartphone même sur ordinateur)
// =====================================================
function PhoneFrame({ children }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        height: 844,
        maxHeight: 'calc(100vh - 48px)',
        background: '#FAF6F0',
        borderRadius: 44,
        overflow: 'hidden',
        boxShadow:
          '0 60px 100px -20px rgba(0,0,0,0.6), 0 0 0 12px #1a0e08, 0 0 0 14px #2a1810',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: 44,
          background: '#FAF6F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          fontSize: 14,
          fontWeight: 600,
          color: '#2a1810',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 8,
            transform: 'translateX(-50%)',
            width: 90,
            height: 28,
            background: '#1a0e08',
            borderRadius: 20,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11 }}>📶</span>
          <div
            style={{
              width: 24,
              height: 12,
              border: '1.5px solid #2a1810',
              borderRadius: 3,
              padding: 1,
            }}
          >
            <div
              style={{
                width: '70%',
                height: '100%',
                background: '#2a1810',
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// =====================================================
// LOADING & AUTH
// =====================================================
function LoadingScreen({ tr }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FAF6F0',
          fontSize: 32,
          marginBottom: 16,
        }}
      >
        ♥
      </div>
      <div
        style={{ fontSize: 32, fontFamily: 'Georgia, serif', fontWeight: 600 }}
      >
        Yaay
      </div>
    </div>
  );
}

function AuthScreen({ tr, lang, setLang }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(135deg, #C44536 0%, #8B2E26 50%, #2D5F5D 100%)',
        color: '#FAF6F0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        {['fr', 'wo'].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              background: lang === l ? '#FAF6F0' : 'rgba(255,255,255,0.2)',
              color: lang === l ? '#2a1810' : '#FAF6F0',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 22,
            background: 'rgba(244,228,193,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            fontSize: 36,
            color: '#C44536',
          }}
        >
          ♥
        </div>
        <div
          style={{
            fontSize: 40,
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          Yaay
        </div>
        <div
          style={{
            fontSize: 12,
            opacity: 0.85,
            marginTop: 8,
            fontStyle: 'italic',
          }}
        >
          {tr.welcome}
        </div>

        <div
          style={{
            marginTop: 32,
            background: '#FAF6F0',
            color: '#2a1810',
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontFamily: 'Georgia, serif',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {mode === 'signup' ? tr.signup : tr.login}
          </h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label style={mLabelStyle}>{tr.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={mInputStyle}
              />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={mLabelStyle}>{tr.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={mInputStyle}
              />
            </div>
            {error && <div style={mErrorStyle}>⚠️ {error}</div>}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...mPrimaryButtonStyle,
                marginTop: 20,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : mode === 'signup' ? tr.signup : tr.login}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 16,
              fontSize: 12,
              color: '#5D4037',
            }}
          >
            {mode === 'signup' ? tr.hasAccount : tr.noAccount}{' '}
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError(null);
              }}
              style={mLinkStyle}
            >
              {mode === 'signup' ? tr.login : tr.signup}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSetupScreen({ tr, userId, email, onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'femme',
      phone: '+221' + phone,
      date_of_birth: dob || null,
      preferred_language: 'fr',
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else onComplete();
  }

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FAF6F0',
          fontSize: 24,
          marginBottom: 20,
        }}
      >
        ♥
      </div>
      <h1
        style={{
          fontSize: 26,
          fontFamily: 'Georgia, serif',
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {tr.setupProfile}
      </h1>
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div>
          <label style={mLabelStyle}>{tr.firstName}</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={mInputStyle}
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={mLabelStyle}>{tr.lastName}</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={mInputStyle}
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={mLabelStyle}>{tr.phone}</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              borderRadius: 12,
              border: '2px solid rgba(42,24,16,0.08)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                padding: '12px 14px',
                fontWeight: 600,
                borderRight: '1px solid rgba(42,24,16,0.1)',
              }}
            >
              🇸🇳 +221
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="77 123 45 67"
              required
              style={{ ...mInputStyle, border: 'none' }}
            />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={mLabelStyle}>Date de naissance</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            style={mInputStyle}
          />
        </div>
        {error && <div style={mErrorStyle}>⚠️ {error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...mPrimaryButtonStyle,
            marginTop: 24,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '...' : tr.validate}
        </button>
      </form>
    </div>
  );
}

function WrongRoleScreen({ profile }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }
  return (
    <div
      style={{
        flex: 1,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
      <h2
        style={{ fontSize: 22, fontFamily: 'Georgia, serif', marginBottom: 12 }}
      >
        Accès réservé aux patientes
      </h2>
      <p
        style={{
          fontSize: 13,
          color: '#5D4037',
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        Cette application est dédiée aux femmes enceintes. Votre compte est
        enregistré comme « {profile.role} ».
      </p>
      <p style={{ fontSize: 12, color: '#8B6F5C', marginBottom: 24 }}>
        Pour accéder au dashboard professionnel, utilisez Yaay Pro.
      </p>
      <button onClick={handleLogout} style={mPrimaryButtonStyle}>
        Se déconnecter
      </button>
    </div>
  );
}

// =====================================================
// MOBILE APP - Routeur de vues
// =====================================================
function MobileApp({ profile, session, tr, lang, setLang }) {
  const [tab, setTab] = useState('home');
  const [pregnancy, setPregnancy] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Realtime : écouter les changements sur les consultations de cette grossesse
  useEffect(() => {
    if (!pregnancy) return;
    const channel = supabase
      .channel('consultations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
          filter: `pregnancy_id=eq.${pregnancy.id}`,
        },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pregnancies',
          filter: `id=eq.${pregnancy.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [pregnancy?.id]);

  async function loadData() {
    const { data: preg } = await supabase
      .from('pregnancies')
      .select('*')
      .eq('woman_id', profile.id)
      .eq('status', 'en_cours')
      .maybeSingle();
    setPregnancy(preg);

    if (preg) {
      const { data: cpns } = await supabase
        .from('consultations')
        .select(
          '*, performed_by_profile:profiles!consultations_performed_by_fkey(first_name, last_name)'
        )
        .eq('pregnancy_id', preg.id)
        .order('consultation_date', { ascending: false });
      setConsultations(cpns || []);

      const { data: apps } = await supabase
        .from('appointments')
        .select('*')
        .eq('pregnancy_id', preg.id)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true });
      setAppointments(apps || []);
    }
    setLoading(false);
  }

  if (loading) return <LoadingScreen tr={tr} />;

  return (
    <>
      <TopBar profile={profile} lang={lang} setLang={setLang} />
      <div style={{ flex: 1, overflowY: 'auto', background: '#FAF6F0' }}>
        {tab === 'home' && (
          <HomeView
            profile={profile}
            pregnancy={pregnancy}
            appointments={appointments}
            tr={tr}
          />
        )}
        {tab === 'carnet' && (
          <CarnetView
            pregnancy={pregnancy}
            consultations={consultations}
            tr={tr}
          />
        )}
        {tab === 'sos' && <SOSView tr={tr} />}
        {tab === 'more' && <MoreView profile={profile} tr={tr} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} tr={tr} />
    </>
  );
}

function TopBar({ profile, lang, setLang }) {
  return (
    <div
      style={{
        padding: '8px 20px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(42,24,16,0.06)',
        background: '#FAF6F0',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FAF6F0',
            fontSize: 18,
            boxShadow: '0 4px 12px rgba(196,69,54,0.3)',
          }}
        >
          ♥
        </div>
        <div>
          <div
            style={{
              fontSize: 20,
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              color: '#2a1810',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Yaay
          </div>
          <div
            style={{
              fontSize: 10,
              color: '#8B6F5C',
              marginTop: 2,
              fontWeight: 500,
            }}
          >
            {profile.first_name}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {['fr', 'wo'].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              background: lang === l ? '#2a1810' : 'rgba(42,24,16,0.06)',
              color: lang === l ? '#FAF6F0' : '#2a1810',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// HOME VIEW
// =====================================================
function HomeView({ profile, pregnancy, appointments, tr }) {
  if (!pregnancy) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70%',
        }}
      >
        <div style={{ fontSize: 60, marginBottom: 16 }}>🤰</div>
        <h2
          style={{
            fontSize: 22,
            fontFamily: 'Georgia, serif',
            marginBottom: 12,
          }}
        >
          {tr.pregnancyComplete}
        </h2>
        <p style={{ fontSize: 13, color: '#5D4037', lineHeight: 1.5 }}>
          Demandez à votre sage-femme de créer votre dossier de grossesse dans
          Yaay.
        </p>
      </div>
    );
  }

  const weeks = Math.floor(
    (new Date() - new Date(pregnancy.last_period_date)) /
      (1000 * 60 * 60 * 24 * 7)
  );
  const daysToTerm = Math.floor(
    (new Date(pregnancy.expected_delivery_date) - new Date()) /
      (1000 * 60 * 60 * 24)
  );
  const progress = Math.min(100, (weeks / 40) * 100);
  const nextApp = appointments[0];
  const isHighRisk =
    pregnancy.current_risk_level === 'eleve' ||
    pregnancy.current_risk_level === 'tres_eleve';

  return (
    <div style={{ padding: '20px 18px 100px' }}>
      <div>
        <div
          style={{
            fontSize: 11,
            color: '#8B6F5C',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {tr.helloName}
        </div>
        <div
          style={{
            fontSize: 26,
            fontFamily: 'Georgia, serif',
            fontWeight: 600,
            color: '#2a1810',
            marginTop: 4,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {profile.first_name},<br />
          <span style={{ color: '#C44536', fontStyle: 'italic' }}>
            {tr.howAreYou}
          </span>
        </div>
      </div>

      {/* Hero card grossesse */}
      <div
        style={{
          marginTop: 20,
          background: 'linear-gradient(135deg, #2D5F5D 0%, #1F4341 100%)',
          borderRadius: 28,
          padding: '24px 22px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -15px rgba(45,95,93,0.5)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(244,228,193,0.15) 0%, transparent 70%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(244,228,193,0.7)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {tr.weekShort}
              {weeks} · {tr.myFollowUp}
            </div>
            <div
              style={{
                fontSize: 46,
                fontFamily: 'Georgia, serif',
                fontWeight: 600,
                color: '#FAF6F0',
                marginTop: 4,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {daysToTerm > 0 ? daysToTerm : 0}
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: 'rgba(244,228,193,0.6)',
                  marginLeft: 6,
                }}
              >
                {tr.days}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'rgba(244,228,193,0.85)',
                marginTop: 4,
              }}
            >
              {tr.daysToBaby}
            </div>
          </div>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(244,228,193,0.12)',
              border: '2px solid rgba(244,228,193,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
            }}
          >
            👶
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div
            style={{
              height: 6,
              background: 'rgba(244,228,193,0.15)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #F4E4C1 0%, #D4A574 100%)',
                borderRadius: 3,
                boxShadow: '0 0 12px rgba(212,165,116,0.6)',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 10,
              color: 'rgba(244,228,193,0.6)',
              fontWeight: 500,
            }}
          >
            <span>S0</span>
            <span style={{ color: '#F4E4C1', fontWeight: 700 }}>
              {weeks <= 13
                ? tr.trimester1
                : weeks <= 27
                ? `${tr.trimester2} ✓`
                : `${tr.trimester3} ✓`}
            </span>
            <span>S40</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            background: isHighRisk
              ? 'rgba(196,69,54,0.2)'
              : 'rgba(244,228,193,0.12)',
            border: `1px solid ${
              isHighRisk ? 'rgba(196,69,54,0.4)' : 'rgba(244,228,193,0.2)'
            }`,
            borderRadius: 14,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isHighRisk ? '#FF6B6B' : '#7FB069',
              boxShadow: `0 0 10px ${
                isHighRisk ? 'rgba(255,107,107,0.8)' : 'rgba(127,176,105,0.8)'
              }`,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#FAF6F0', fontWeight: 600 }}>
              {isHighRisk ? tr.riskHigh : tr.riskLow}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(244,228,193,0.65)',
                marginTop: 1,
              }}
            >
              {isHighRisk ? tr.riskHighDesc : tr.riskLowDesc}
            </div>
          </div>
        </div>
      </div>

      {/* Prochain RDV */}
      {nextApp ? (
        <div
          style={{
            marginTop: 14,
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 4px 20px rgba(42,24,16,0.06)',
            border: '1px solid rgba(42,24,16,0.04)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #F4E4C1 0%, #E8D5A8 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#8B6F5C',
                letterSpacing: '0.05em',
              }}
            >
              {new Date(nextApp.appointment_date)
                .toLocaleDateString('fr-FR', { month: 'short' })
                .toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 22,
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                color: '#2a1810',
                lineHeight: 1,
              }}
            >
              {new Date(nextApp.appointment_date).getDate()}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                color: '#8B6F5C',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {tr.nextAppointment}
            </div>
            <div
              style={{
                fontSize: 15,
                color: '#2a1810',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {nextApp.type === 'cpn' ? 'Consultation prénatale' : nextApp.type}
            </div>
            <div style={{ fontSize: 11, color: '#5D4037', marginTop: 2 }}>
              {Math.ceil(
                (new Date(nextApp.appointment_date) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              jours
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: 14,
            padding: 16,
            background: 'rgba(212,165,116,0.1)',
            borderRadius: 14,
            fontSize: 12,
            color: '#8B6F5C',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          {tr.noAppointment}
        </div>
      )}

      {/* Statut connexion */}
      <div
        style={{
          marginTop: 16,
          padding: '10px 14px',
          background: 'rgba(127,176,105,0.1)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: '#4A6741',
          fontWeight: 500,
        }}
      >
        ✓ Carnet synchronisé en temps réel
      </div>
    </div>
  );
}

// =====================================================
// CARNET VIEW
// =====================================================
function CarnetView({ pregnancy, consultations, tr }) {
  if (!pregnancy) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
          minHeight: '70%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
        <p style={{ fontSize: 13, color: '#5D4037' }}>{tr.pregnancyComplete}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 18px 100px' }}>
      <div
        style={{
          fontSize: 11,
          color: '#8B6F5C',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {tr.medicalRecord}
      </div>
      <div
        style={{
          fontSize: 26,
          fontFamily: 'Georgia, serif',
          fontWeight: 600,
          color: '#2a1810',
          marginTop: 2,
          letterSpacing: '-0.02em',
        }}
      >
        Mon carnet
      </div>

      {consultations.length === 0 ? (
        <div
          style={{
            marginTop: 24,
            padding: 24,
            background: '#FFFFFF',
            borderRadius: 16,
            textAlign: 'center',
            border: '1px solid rgba(42,24,16,0.04)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>👩🏾‍⚕️</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#2a1810',
              marginBottom: 8,
            }}
          >
            {tr.noConsultations}
          </div>
          <div style={{ fontSize: 12, color: '#5D4037', lineHeight: 1.5 }}>
            {tr.waitingForFirstCPN}
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {consultations.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                border: '1px solid rgba(42,24,16,0.04)',
                boxShadow: '0 2px 8px rgba(42,24,16,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: '#2a1810' }}
                  >
                    {tr.consultationFrom}{' '}
                    {new Date(c.consultation_date).toLocaleDateString('fr-FR')}
                  </div>
                  <div style={{ fontSize: 10, color: '#8B6F5C', marginTop: 2 }}>
                    {tr.weekShort}
                    {c.gestational_age_weeks || '—'} · {tr.performedBy}{' '}
                    {c.performed_by_profile?.first_name?.[0] || '—'}.{' '}
                    {c.performed_by_profile?.last_name || '—'}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 9,
                    padding: '3px 8px',
                    background: '#DDEBE9',
                    color: '#1F4341',
                    borderRadius: 6,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  CPN n°{c.cpn_number || '—'}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                }}
              >
                <MiniVital
                  label={tr.weight}
                  value={c.weight_kg || '—'}
                  unit="kg"
                />
                <MiniVital
                  label={tr.bp}
                  value={
                    c.blood_pressure_systolic && c.blood_pressure_diastolic
                      ? `${c.blood_pressure_systolic}/${c.blood_pressure_diastolic}`
                      : '—'
                  }
                  unit=""
                />
                <MiniVital
                  label={tr.uh}
                  value={c.uterine_height_cm || '—'}
                  unit="cm"
                />
                <MiniVital
                  label={tr.bcf}
                  value={c.fetal_heart_rate || '—'}
                  unit="bpm"
                />
              </div>

              {c.observations && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    background: '#F5F1EB',
                    borderRadius: 10,
                    fontSize: 11,
                    color: '#5D4037',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                  }}
                >
                  « {c.observations} »
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniVital({ label, value, unit }) {
  return (
    <div
      style={{
        background: '#F5F1EB',
        borderRadius: 10,
        padding: 8,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: '#8B6F5C',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 2,
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            color: '#2a1810',
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 9, color: '#8B6F5C' }}>{unit}</span>}
      </div>
    </div>
  );
}

// =====================================================
// SOS VIEW (visuel uniquement pour le moment)
// =====================================================
function SOSView({ tr }) {
  return (
    <div
      style={{
        flex: 1,
        padding: 24,
        background: 'linear-gradient(180deg, #FAF6F0 0%, #FFE8E2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontFamily: 'Georgia, serif',
          fontWeight: 600,
          marginTop: 20,
        }}
      >
        Bouton d'urgence
      </h2>
      <p
        style={{
          fontSize: 12,
          color: '#5D4037',
          marginTop: 8,
          maxWidth: 280,
          lineHeight: 1.4,
        }}
      >
        En cas d'urgence, votre sage-femme et votre famille seront alertées.
      </p>

      <div style={{ marginTop: 50, position: 'relative' }}>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, #E85D4D 0%, #C44536 50%, #8B2E26 100%)',
            color: '#FAF6F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(196,69,54,0.5)',
            border: '6px solid #FAF6F0',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div
            style={{
              fontSize: 24,
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            SOS
          </div>
        </div>
      </div>

      <p
        style={{
          marginTop: 24,
          fontSize: 13,
          color: '#8B2E26',
          fontWeight: 600,
        }}
      >
        Maintenez 3 secondes pour activer
      </p>
      <p
        style={{
          marginTop: 4,
          fontSize: 11,
          color: '#8B6F5C',
          fontStyle: 'italic',
        }}
      >
        (Fonctionnalité en cours de finalisation)
      </p>
    </div>
  );
}

// =====================================================
// MORE VIEW
// =====================================================
function MoreView({ profile, tr }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }
  return (
    <div style={{ padding: '20px 18px 100px' }}>
      <div
        style={{
          fontSize: 26,
          fontFamily: 'Georgia, serif',
          fontWeight: 600,
          color: '#2a1810',
          letterSpacing: '-0.02em',
        }}
      >
        Mon compte
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid rgba(42,24,16,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)',
              color: '#FAF6F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {profile.first_name?.[0]}
            {profile.last_name?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2a1810' }}>
              {profile.first_name} {profile.last_name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#8B6F5C',
                marginTop: 2,
                fontFamily: 'monospace',
              }}
            >
              {profile.ipu}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(42,24,16,0.06)',
            fontSize: 12,
            color: '#5D4037',
            lineHeight: 1.6,
          }}
        >
          <div>{profile.phone}</div>
          <div>{profile.email}</div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          width: '100%',
          padding: 14,
          background: '#F5F1EB',
          color: '#8B2E26',
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {tr.logout}
      </button>

      <div
        style={{
          marginTop: 28,
          textAlign: 'center',
          fontSize: 10,
          color: '#B8A89A',
          lineHeight: 1.5,
        }}
      >
        Yaay · v1.0 MVP
        <br />
        Données hébergées au Sénégal · Conformité CDP
      </div>
    </div>
  );
}

// =====================================================
// BOTTOM NAVIGATION
// =====================================================
function BottomNav({ tab, setTab, tr }) {
  const items = [
    { id: 'home', icon: '🏠', label: tr.home },
    { id: 'carnet', icon: '📋', label: tr.carnet },
    { id: 'sos', icon: '⚠️', label: tr.sos, primary: true },
    { id: 'more', icon: '☰', label: tr.more },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(250,246,240,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(42,24,16,0.08)',
        padding: '10px 12px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      {items.map((item) => {
        const active = tab === item.id;
        if (item.primary) {
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: active
                  ? 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)'
                  : 'linear-gradient(135deg, #E85D4D 0%, #C44536 100%)',
                color: '#FAF6F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 8px 24px rgba(196,69,54,0.4)',
                marginTop: -20,
                border: '4px solid #FAF6F0',
                cursor: 'pointer',
              }}
            >
              {item.icon}
            </button>
          );
        }
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              flex: 1,
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: active ? '#C44536' : '#8B6F5C',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================
const appBgStyle = {
  minHeight: '100vh',
  background:
    'radial-gradient(ellipse at top, #2a1810 0%, #1a0e08 60%, #0f0805 100%)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '24px 16px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
};
const mLabelStyle = {
  fontSize: 11,
  color: '#8B6F5C',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
};
const mInputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14,
  fontWeight: 500,
  color: '#2a1810',
  background: '#FFFFFF',
  border: '2px solid rgba(42,24,16,0.08)',
  borderRadius: 12,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
const mPrimaryButtonStyle = {
  width: '100%',
  padding: 13,
  background: 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)',
  color: '#FAF6F0',
  borderRadius: 14,
  fontSize: 14,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(196,69,54,0.3)',
  fontFamily: 'inherit',
};
const mLinkStyle = {
  color: '#C44536',
  fontWeight: 700,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  fontSize: 12,
  fontFamily: 'inherit',
};
const mErrorStyle = {
  marginTop: 12,
  padding: 10,
  background: '#FFE8E2',
  borderRadius: 10,
  fontSize: 11,
  color: '#8B2E26',
  fontWeight: 500,
};
