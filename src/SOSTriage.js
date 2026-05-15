// =====================================================
// YAAY — SOS TRIAGE IA (SOSTriage.js)
// Triage intelligent des urgences obstétricales
// À placer dans : yaay-app-femme/src/SOSTriage.js
// =====================================================

import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

// =====================================================
// SYMPTOM DATABASE — Classés par gravité obstétricale
// Basé sur protocoles OMS SONU + contexte sénégalais
// =====================================================
const SYMPTOMS = {
  fr: [
    // 🔴 CRITIQUES — score 10
    { id: 'hemorrhage', icon: '🩸', label: 'Saignement abondant', desc: 'Sang qui coule sans arrêt', severity: 'critical', score: 10, category: 'hemorrhage' },
    { id: 'convulsions', icon: '⚡', label: 'Convulsions', desc: 'Tremblements incontrôlables du corps', severity: 'critical', score: 10, category: 'eclampsia' },
    { id: 'unconscious', icon: '😵', label: 'Perte de connaissance', desc: 'Évanouissement ou confusion', severity: 'critical', score: 10, category: 'eclampsia' },
    { id: 'breathing', icon: '😮‍💨', label: 'Ne peut plus respirer', desc: 'Difficulté respiratoire sévère', severity: 'critical', score: 10, category: 'respiratory' },
    // 🟠 URGENTS — score 7
    { id: 'headache_vision', icon: '🤕', label: 'Maux de tête + vision trouble', desc: 'Céphalées sévères, points lumineux', severity: 'urgent', score: 7, category: 'preeclampsia' },
    { id: 'high_fever', icon: '🌡️', label: 'Fièvre très forte', desc: 'Température > 39°C, frissons', severity: 'urgent', score: 7, category: 'infection' },
    { id: 'no_movement', icon: '👶', label: 'Bébé ne bouge plus', desc: 'Aucun mouvement depuis des heures', severity: 'urgent', score: 7, category: 'fetal' },
    { id: 'preterm_contractions', icon: '⏱️', label: 'Contractions avant terme', desc: 'Contractions régulières < 37 SA', severity: 'urgent', score: 7, category: 'preterm' },
    { id: 'severe_abdomen', icon: '🤰', label: 'Douleurs abdominales intenses', desc: 'Douleur insupportable au ventre', severity: 'urgent', score: 7, category: 'abdomen' },
    // 🟡 MODÉRÉS — score 4
    { id: 'water_break', icon: '💧', label: 'Perte des eaux', desc: 'Liquide qui coule entre les jambes', severity: 'moderate', score: 4, category: 'labor' },
    { id: 'edema', icon: '🫲', label: 'Gonflement visage/mains', desc: 'Œdèmes soudains', severity: 'moderate', score: 4, category: 'preeclampsia' },
    { id: 'urinary', icon: '🔥', label: 'Brûlures urinaires + fièvre', desc: 'Douleur en urinant avec fièvre', severity: 'moderate', score: 4, category: 'infection' },
    { id: 'vomiting', icon: '🤢', label: 'Vomissements non-stop', desc: 'Impossible de garder eau/nourriture', severity: 'moderate', score: 4, category: 'gastro' },
    { id: 'abnormal_discharge', icon: '⚠️', label: 'Pertes vaginales anormales', desc: 'Pertes malodorantes ou colorées', severity: 'moderate', score: 4, category: 'infection' },
    // 🟢 LÉGERS — score 1
    { id: 'fatigue', icon: '😴', label: 'Fatigue extrême', desc: 'Épuisement inhabituel', severity: 'low', score: 1, category: 'general' },
    { id: 'nausea', icon: '😶', label: 'Nausées persistantes', desc: 'Nausées qui ne passent pas', severity: 'low', score: 1, category: 'gastro' },
    { id: 'back_pain', icon: '🦴', label: 'Douleurs dans le dos', desc: 'Douleurs lombaires', severity: 'low', score: 1, category: 'musculo' },
    { id: 'anxiety', icon: '💭', label: 'Anxiété / moral bas', desc: 'Inquiétude, tristesse, stress', severity: 'low', score: 1, category: 'mental' },
  ],
  wo: [
    // 🔴 CRITIQUES
    { id: 'hemorrhage', icon: '🩸', label: 'Deret bu bare', desc: 'Deret du tax noppi', severity: 'critical', score: 10, category: 'hemorrhage' },
    { id: 'convulsions', icon: '⚡', label: 'Dëmmiku', desc: 'Yaram bi mu ngi réer', severity: 'critical', score: 10, category: 'eclampsia' },
    { id: 'unconscious', icon: '😵', label: 'Rëdd / Réer', desc: 'Nelaw wala xamul dara', severity: 'critical', score: 10, category: 'eclampsia' },
    { id: 'breathing', icon: '😮‍💨', label: 'Mënul fóof', desc: 'Tëkke bu metti', severity: 'critical', score: 10, category: 'respiratory' },
    // 🟠 URGENTS
    { id: 'headache_vision', icon: '🤕', label: 'Métit boppu + gis gu baaxul', desc: 'Boppu mi dafa metti, gis gu dul baax', severity: 'urgent', score: 7, category: 'preeclampsia' },
    { id: 'high_fever', icon: '🌡️', label: 'Tangaay bu metti', desc: 'Yaram bi dafa tang lool', severity: 'urgent', score: 7, category: 'infection' },
    { id: 'no_movement', icon: '👶', label: 'Doom du yengu', desc: 'Doom bi yenguwul ba noppi', severity: 'urgent', score: 7, category: 'fetal' },
    { id: 'preterm_contractions', icon: '⏱️', label: 'Métit biir gu wàcc', desc: 'Wax wax gu weesu waxtu', severity: 'urgent', score: 7, category: 'preterm' },
    { id: 'severe_abdomen', icon: '🤰', label: 'Métit biir bu metti', desc: 'Biir mi dafa metti lool', severity: 'urgent', score: 7, category: 'abdomen' },
    // 🟡 MODÉRÉS
    { id: 'water_break', icon: '💧', label: 'Ndox mi daw', desc: 'Ndox mu ngi ci génn ci diggante tànk', severity: 'moderate', score: 4, category: 'labor' },
    { id: 'edema', icon: '🫲', label: 'Fuuf ci kanam ak loxo', desc: 'Fuufal bu gaaw', severity: 'moderate', score: 4, category: 'preeclampsia' },
    { id: 'urinary', icon: '🔥', label: 'Tang ci tëddëg + tangaay', desc: 'Metti su ngay tëddëg ak tangaay', severity: 'moderate', score: 4, category: 'infection' },
    { id: 'vomiting', icon: '🤢', label: 'Seqq bu des', desc: 'Mënul lekk dara, mënul naan', severity: 'moderate', score: 4, category: 'gastro' },
    { id: 'abnormal_discharge', icon: '⚠️', label: 'Lu génn lu dul baax', desc: 'Génn bu neex amal', severity: 'moderate', score: 4, category: 'infection' },
    // 🟢 LÉGERS
    { id: 'fatigue', icon: '😴', label: 'Sonnal bu yees', desc: 'Sonn bu dul baax', severity: 'low', score: 1, category: 'general' },
    { id: 'nausea', icon: '😶', label: 'Xel du neex', desc: 'Nit ki dafa néexul', severity: 'low', score: 1, category: 'gastro' },
    { id: 'back_pain', icon: '🦴', label: 'Métit ci ginnaaw', desc: 'Ginnaaw bi dafa metti', severity: 'low', score: 1, category: 'musculo' },
    { id: 'anxiety', icon: '💭', label: 'Yaakaar / Tiit', desc: 'Tiit, xol bu set', severity: 'low', score: 1, category: 'mental' },
  ]
}

const ONSET_OPTIONS = {
  fr: [
    { id: 'now', label: 'Là maintenant', icon: '🔴', minutes: 0 },
    { id: 'hour', label: 'Depuis < 1h', icon: '🟠', minutes: 30 },
    { id: 'hours', label: 'Quelques heures', icon: '🟡', minutes: 180 },
    { id: 'yesterday', label: 'Depuis hier', icon: '🔵', minutes: 1440 },
    { id: 'days', label: 'Depuis plusieurs jours', icon: '⚪', minutes: 4320 },
  ],
  wo: [
    { id: 'now', label: 'Léegi léegi', icon: '🔴', minutes: 0 },
    { id: 'hour', label: '< 1 waxtu', icon: '🟠', minutes: 30 },
    { id: 'hours', label: 'Ay waxtu', icon: '🟡', minutes: 180 },
    { id: 'yesterday', label: 'Démb', icon: '🔵', minutes: 1440 },
    { id: 'days', label: 'Ay fan ci ginaaw', icon: '⚪', minutes: 4320 },
  ]
}

// =====================================================
// TRIAGE ENGINE — Algorithme déterministe + IA
// =====================================================

const TRIAGE_LEVELS = {
  critical: {
    level: 'critical',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: '🚨',
    label: { fr: 'URGENCE VITALE', wo: 'MUSSIBA BU MAG' },
    action: { 
      fr: 'Ambulance en route. Ne bougez pas. Aide arrive.',
      wo: 'Ambulans bi mu ngi ñëw. Bul yengu. Ndimbal mu ngi ñëw.' 
    },
    instructions: {
      fr: [
        'Restez allongée sur le côté gauche',
        'Ne mangez rien et ne buvez rien',
        'Gardez quelqu\'un près de vous',
        'L\'ambulance et votre sage-femme sont alertées'
      ],
      wo: [
        'Tëdd ci sa cammooñ',
        'Bul lekk dara, bul naan dara',
        'Am kenn ci sa wet',
        'Ambulans bi ak sa sage-femme yegle nañu'
      ]
    },
    autoSOS: true,
    notifyAmbulance: true
  },
  urgent: {
    level: 'urgent',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    icon: '🏥',
    label: { fr: 'URGENCE — Allez au centre de santé', wo: 'MUSSIBA — Dem ci dëkk bi' },
    action: {
      fr: 'Rendez-vous immédiatement à la structure de santé la plus proche.',
      wo: 'Dem léegi ci postu santé bi gëna jege.'
    },
    instructions: {
      fr: [
        'Faites-vous accompagner, ne partez pas seule',
        'Prenez votre carte Yaay / carte d\'identité',
        'Votre sage-femme est prévenue',
        'Si vous ne pouvez pas vous déplacer, appuyez sur SOS'
      ],
      wo: [
        'Yal na kenn yobbu la, bul dem sa kër',
        'Jël sa carte Yaay / carte identité',
        'Sa sage-femme xam na',
        'Soo mënul dem, bësal SOS bi'
      ]
    },
    autoSOS: false,
    notifyAmbulance: false
  },
  moderate: {
    level: 'moderate',
    color: '#CA8A04',
    bgColor: '#FEFCE8',
    icon: '📞',
    label: { fr: 'Contactez votre sage-femme', wo: 'Woo sa sage-femme' },
    action: {
      fr: 'Ce n\'est probablement pas grave mais consultez dans les prochaines heures.',
      wo: 'Mënul am lu metti waaye demël gis sa sage-femme tey.'
    },
    instructions: {
      fr: [
        'Appelez votre sage-femme pour lui décrire vos symptômes',
        'Si les symptômes s\'aggravent, revenez sur SOS',
        'Reposez-vous et surveillez l\'évolution',
        'Notez l\'heure de début et les changements'
      ],
      wo: [
        'Woo sa sage-femme wax ko lu la amee',
        'Soo seetee ni lu metti, dellusi ci SOS',
        'Nelaw te xool na mu dem',
        'Bind ban waxtu la tambali'
      ]
    },
    autoSOS: false,
    notifyAmbulance: false
  },
  low: {
    level: 'low',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    icon: '💚',
    label: { fr: 'Pas de danger immédiat', wo: 'Amul lu metti léegi' },
    action: {
      fr: 'Rassurez-vous. Mentionnez ces symptômes à votre prochaine consultation.',
      wo: 'Dal sa xol. Wax ko sa sage-femme ci sa rendez-vous bi ñëw.'
    },
    instructions: {
      fr: [
        'Ces symptômes sont fréquents pendant la grossesse',
        'Reposez-vous et hydratez-vous bien',
        'Si ça s\'aggrave ou si de nouveaux signes apparaissent, revenez ici',
        'Votre prochain rendez-vous est le bon moment pour en parler'
      ],
      wo: [
        'Yi symptôme yi day am ci biir',
        'Nelaw te naan ndox bu bari',
        'Su lu bees amee, dellusi fii',
        'Sa rendez-vous bi ñëw mooy waxtu wu baax'
      ]
    },
    autoSOS: false,
    notifyAmbulance: false
  }
}

function runTriage(selectedSymptoms, symptoms) {
  const selected = symptoms.filter(s => selectedSymptoms.includes(s.id))
  if (selected.length === 0) return null

  // Highest severity determines base level
  const maxScore = Math.max(...selected.map(s => s.score))
  const totalScore = selected.reduce((sum, s) => sum + s.score, 0)
  
  // Determine triage level
  let level
  if (maxScore >= 10) level = 'critical'
  else if (maxScore >= 7) level = 'urgent'
  else if (maxScore >= 4 || totalScore >= 8) level = 'moderate'
  else level = 'low'

  // Special escalation rules
  const categories = [...new Set(selected.map(s => s.category))]
  
  // Pre-eclampsia combo: headache + edema → escalate to urgent
  if (categories.includes('preeclampsia') && selected.length >= 2 && level === 'moderate') {
    level = 'urgent'
  }
  // Water break → always at least moderate, if preterm → urgent
  if (selectedSymptoms.includes('water_break') && selectedSymptoms.includes('preterm_contractions')) {
    level = 'urgent'
  }
  // Infection signs combo → escalate
  if (categories.filter(c => c === 'infection').length >= 1 && selectedSymptoms.includes('high_fever')) {
    if (level === 'moderate') level = 'urgent'
  }

  return {
    level,
    triage: TRIAGE_LEVELS[level],
    score: totalScore,
    maxScore,
    selectedSymptoms: selected,
    categories
  }
}

// =====================================================
// AI SUMMARY GENERATOR
// =====================================================
function generateLocalSummary(triageResult, onset, pregnancyWeeks, lang) {
  const symptoms = triageResult.selectedSymptoms.map(s => s.label).join(', ')
  const onsetLabel = onset?.label || '?'
  
  const summaryFr = `TRIAGE IA YAAY — ${triageResult.triage.label.fr}\n` +
    `Score: ${triageResult.score} | Niveau: ${triageResult.level.toUpperCase()}\n` +
    `Symptômes: ${symptoms}\n` +
    `Début: ${onsetLabel}\n` +
    `Grossesse: ${pregnancyWeeks || '?'} SA\n` +
    `Catégories: ${triageResult.categories.join(', ')}\n` +
    `---\n` +
    generateMedicalNotes(triageResult, pregnancyWeeks)

  return summaryFr
}

function generateMedicalNotes(triageResult, weeks) {
  const notes = []
  const cats = triageResult.categories
  
  if (cats.includes('hemorrhage')) {
    notes.push('⚠️ HÉMORRAGIE — Vérifier placenta praevia, HRP, rupture utérine. Groupage sanguin urgent. Voie veineuse. Oxytocine prête.')
  }
  if (cats.includes('eclampsia')) {
    notes.push('⚠️ ÉCLAMPSIE/PRÉ-ÉCLAMPSIE — TA urgente. Sulfate de magnésium prêt. Protéinurie. Réflexes ostéo-tendineux.')
  }
  if (cats.includes('preeclampsia')) {
    notes.push('⚠️ SIGNES PRÉ-ÉCLAMPSIE — Prendre TA. Rechercher protéinurie. Surveiller réflexes. Bilan hépatique/rénal.')
  }
  if (cats.includes('fetal')) {
    const w = weeks || 0
    notes.push(`⚠️ SOUFFRANCE FŒTALE — RCF urgent. ${w >= 34 ? 'Extraction envisageable si anomalies.' : 'Corticothérapie si < 34 SA.'}`)
  }
  if (cats.includes('preterm')) {
    notes.push('⚠️ MENACE D\'ACCOUCHEMENT PRÉMATURÉ — Tocolyse ? Corticothérapie si < 34 SA. Transfert si niveau inadapté.')
  }
  if (cats.includes('infection')) {
    notes.push('⚠️ INFECTION — Hémocultures, ECBU, NFS, CRP. Antibiothérapie probabiliste si sepsis.')
  }
  if (cats.includes('labor')) {
    notes.push('ℹ️ RUPTURE MEMBRANES — Vérifier couleur liquide (clair/teinté/méconial). Monitoring fœtal. Délai rupture-accouchement.')
  }
  
  if (notes.length === 0) {
    notes.push('ℹ️ Symptômes non spécifiques. Évaluation clinique recommandée au prochain RDV.')
  }
  
  return 'NOTES CLINIQUES AUTO:\n' + notes.join('\n')
}

// Optional: Call Supabase Edge Function for Claude AI enrichment
async function callAITriage(triageResult, onset, pregnancy, profile) {
  try {
    const { data, error } = await supabase.functions.invoke('sos-triage', {
      body: {
        symptoms: triageResult.selectedSymptoms.map(s => ({ id: s.id, label: s.label, severity: s.severity, category: s.category })),
        onset: onset?.id,
        triageLevel: triageResult.level,
        score: triageResult.score,
        pregnancyWeeks: pregnancy?.last_period_date ? Math.floor((new Date() - new Date(pregnancy.last_period_date)) / (1000 * 60 * 60 * 24 * 7)) : null,
        riskLevel: pregnancy?.risk_level,
        antecedents: {
          parity: profile?.parity,
          previousHemorrhage: profile?.previous_hemorrhage,
          previousCesarean: profile?.previous_cesarean,
          previousPreeclampsia: profile?.previous_preeclampsia,
          sickleCell: profile?.sickle_cell,
          hiv: profile?.hiv_status,
          bloodType: profile?.blood_type
        }
      }
    })
    if (error) throw error
    return data?.aiSummary || null
  } catch (err) {
    console.warn('AI triage unavailable, using local summary:', err.message)
    return null
  }
}

// =====================================================
// MAIN COMPONENT — SOSTriageView
// =====================================================
export function SOSTriageView({ profile, pregnancy, activeAlert, emergencyContacts, midwives, tr, lang, onAlertChange }) {
  const [step, setStep] = useState('idle') // idle | symptoms | onset | analyzing | result | sending | active | error
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [selectedOnset, setSelectedOnset] = useState(null)
  const [triageResult, setTriageResult] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [error, setError] = useState(null)
  const [sosStep, setSosStep] = useState(null) // for SOS sub-flow: locating | sending | sent

  const langKey = lang === 'wo' ? 'wo' : 'fr'
  const symptoms = SYMPTOMS[langKey]
  const onsetOptions = ONSET_OPTIONS[langKey]

  // Pregnancy context
  const weeksPregnant = pregnancy?.last_period_date 
    ? Math.floor((new Date() - new Date(pregnancy.last_period_date)) / (1000 * 60 * 60 * 24 * 7))
    : null

  useEffect(() => {
    if (activeAlert) setStep('active')
    else if (step === 'active') setStep('idle')
  }, [activeAlert])

  // ---- TRIAGE FLOW ----
  function toggleSymptom(id) {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function runAnalysis() {
    setStep('analyzing')
    
    const result = runTriage(selectedSymptoms, symptoms)
    if (!result) { setStep('symptoms'); return }
    
    setTriageResult(result)
    
    // Generate local summary immediately
    const localSummary = generateLocalSummary(result, onsetOptions.find(o => o.id === selectedOnset), weeksPregnant, langKey)
    
    // Try AI enrichment (non-blocking)
    const aiResult = await callAITriage(result, onsetOptions.find(o => o.id === selectedOnset), pregnancy, profile)
    setAiSummary(aiResult || localSummary)
    
    // Auto-SOS for critical cases
    if (result.triage.autoSOS) {
      await triggerSOSWithTriage(result, aiResult || localSummary)
    } else {
      setStep('result')
    }
  }

  async function triggerSOSWithTriage(result, summary) {
    setSosStep('locating')
    setStep('sending')
    setError(null)
    
    if (!navigator.geolocation) {
      // Still create alert without GPS
      await createTriageAlert(result, summary, null, null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setSosStep('sending')
        await createTriageAlert(result, summary, latitude, longitude, accuracy)
      },
      async (geoError) => {
        console.warn('GPS failed:', geoError.message)
        setSosStep('sending')
        await createTriageAlert(result, summary, null, null)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  async function createTriageAlert(result, summary, latitude, longitude, accuracy) {
    try {
      const symptomIds = result.selectedSymptoms.map(s => s.id)
      const symptomLabels = result.selectedSymptoms.map(s => s.label)
      
      const { error: insertError } = await supabase.from('alerts').insert({
        woman_id: profile.id,
        pregnancy_id: pregnancy?.id || null,
        type: 'sos',
        status: 'active',
        latitude: latitude || null,
        longitude: longitude || null,
        gps_accuracy: accuracy || null,
        message: `[TRIAGE IA] ${result.triage.label.fr}`,
        triage_level: result.level,
        triage_score: result.score,
        triage_symptoms: symptomIds,
        triage_symptom_labels: symptomLabels,
        triage_onset: selectedOnset,
        triage_ai_summary: summary,
        triage_categories: result.categories,
        husband_notified: emergencyContacts.length > 0,
        midwife_notified: midwives.length > 0,
        ambulance_notified: result.triage.notifyAmbulance
      })
      
      if (insertError) throw insertError
      
      // Also create a notification for linked midwives
      if (midwives.length > 0) {
        for (const mw of midwives) {
          await supabase.from('notifications').insert({
            woman_id: profile.id,
            type: 'sos_triage',
            title: `🚨 ${result.triage.label.fr}`,
            message: `${profile.first_name} ${profile.last_name} — ${symptomLabels.join(', ')}`,
            metadata: { triage_level: result.level, score: result.score, symptoms: symptomIds },
            created_by: profile.id
          }).catch(() => {}) // non-blocking
        }
      }

      setTimeout(() => onAlertChange(), 500)
    } catch (err) {
      setError(err.message)
      setStep('error')
    }
  }

  async function manualSOS() {
    if (!triageResult) return
    const summary = aiSummary || generateLocalSummary(triageResult, onsetOptions.find(o => o.id === selectedOnset), weeksPregnant, langKey)
    await triggerSOSWithTriage(triageResult, summary)
  }

  async function cancelAlert() {
    if (!activeAlert) return
    if (!confirm(langKey === 'wo' ? 'Bayyi alert bi ?' : 'Annuler l\'alerte ?')) return
    await supabase.from('alerts').update({ status: 'resolue', resolved_at: new Date().toISOString() }).eq('id', activeAlert.id)
    setStep('idle')
    setSelectedSymptoms([])
    setTriageResult(null)
    setAiSummary(null)
    onAlertChange()
  }

  function reset() {
    setStep('idle')
    setSelectedSymptoms([])
    setSelectedOnset(null)
    setTriageResult(null)
    setAiSummary(null)
    setError(null)
    setSosStep(null)
  }

  // =====================================================
  // RENDERS
  // =====================================================
  
  const T = {
    fr: {
      title: "Bouton d'urgence",
      subtitle: "Dites-nous ce qui se passe pour vous orienter au mieux",
      startTriage: "J'ai un problème",
      directSOS: "SOS direct (sans triage)",
      whatHappening: "Que se passe-t-il ?",
      selectSymptoms: "Touchez tous les symptômes que vous avez",
      next: "Suivant →",
      since: "Depuis quand ?",
      analyze: "Analyser →",
      analyzing: "Analyse en cours...",
      analyzingDesc: "Notre IA médicale évalue votre situation",
      result: "Résultat du triage",
      whatToDo: "Que faire maintenant",
      sendSOS: "🚨 Envoyer SOS + ambulance",
      callMidwife: "📞 Appeler ma sage-femme",
      backHome: "← Retour à l'accueil",
      alertActive: "ALERTE ACTIVE",
      cancelAlert: "Annuler l'alerte",
      yourLocation: "Votre position",
      helpComing: "Aide en route. Ne bougez pas.",
      sentToTeam: "Votre dossier médical a été transmis à l'équipe d'urgence.",
      viewOnMaps: "Voir sur Maps →",
      error: "Erreur",
      retry: "Réessayer",
      locating: "Localisation en cours...",
      sending: "Envoi de l'alerte enrichie...",
      symptomsSelected: "symptômes sélectionnés",
      or: "ou",
      whenToUse: "Quand utiliser le SOS",
      cases: [
        "Saignements importants",
        "Maux de tête sévères avec vision trouble",
        "Convulsions ou perte de connaissance",
        "Bébé ne bouge plus",
        "Douleurs abdominales intenses"
      ]
    },
    wo: {
      title: "Buton mussiba",
      subtitle: "Wax nu lu la amee ngir nu la indil ndimbal bu baax",
      startTriage: "Amuma baax",
      directSOS: "SOS direct (sans triage)",
      whatHappening: "Lu la amee ?",
      selectSymptoms: "Bësal yi symptôme yu la amee",
      next: "Yeggsi →",
      since: "Ban waxtu la ?",
      analyze: "Saytu →",
      analyzing: "Saytu mu ngi dem...",
      analyzingDesc: "Sama IA fajj mu ngi saytu sa yaram",
      result: "Lu génn ci saytu",
      whatToDo: "Lan la war def",
      sendSOS: "🚨 Yónnëe SOS + ambulans",
      callMidwife: "📞 Woo sama sage-femme",
      backHome: "← Dellusi kër",
      alertActive: "ALERT BU DËKK",
      cancelAlert: "Bayyi alert bi",
      yourLocation: "Sa fan",
      helpComing: "Ndimbal mu ngi ñëw. Bul yengu.",
      sentToTeam: "Sa dossier médical yónnëe nañu ko ci équipe bi.",
      viewOnMaps: "Xool ci Maps →",
      error: "Erreur",
      retry: "Jéemaat",
      locating: "Mu ngi gisé fan nga nekk...",
      sending: "Mu ngi yónnëe alert bi...",
      symptomsSelected: "symptôme",
      or: "wala",
      whenToUse: "Ban saa la war jëfandikoo SOS",
      cases: [
        "Deret bu bare",
        "Métit boppu ak gis gu dul baax",
        "Dëmmiku wala rëdd",
        "Doom du yengu",
        "Métit biir bu metti"
      ]
    }
  }
  const tx = T[langKey]

  // ---- ACTIVE ALERT ----
  if (step === 'active' && activeAlert) {
    return (
      <div style={{ flex: 1, background: 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)', color: '#FAF6F0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(244,228,193,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🚨 {tx.alertActive}</div>
          <button onClick={cancelAlert} style={{ padding: '8px 14px', background: '#FAF6F0', color: '#991B1B', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✕ {tx.cancelAlert}</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Triage badge */}
          {activeAlert.triage_level && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                {TRIAGE_LEVELS[activeAlert.triage_level]?.icon} {TRIAGE_LEVELS[activeAlert.triage_level]?.label[langKey]}
              </div>
            </div>
          )}
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(244,228,193,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '3px solid #FAF6F0', fontSize: 36 }}>✓</div>
            <div style={{ fontSize: 26, fontFamily: 'Georgia, serif', fontWeight: 600, marginTop: 16 }}>{tx.helpComing}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>{tx.sentToTeam}</div>
          </div>

          {/* Symptoms sent */}
          {activeAlert.triage_symptom_labels && activeAlert.triage_symptom_labels.length > 0 && (
            <div style={{ background: 'rgba(244,228,193,0.1)', borderRadius: 14, padding: 14, marginTop: 16, border: '1px solid rgba(244,228,193,0.15)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, opacity: 0.7 }}>Symptômes signalés</div>
              {activeAlert.triage_symptom_labels.map((s, i) => (
                <div key={i} style={{ fontSize: 12, padding: '3px 0' }}>• {s}</div>
              ))}
            </div>
          )}
          
          {/* Location */}
          {activeAlert.latitude && (
            <div style={{ background: 'rgba(244,228,193,0.95)', color: '#2a1810', borderRadius: 16, padding: 14, marginTop: 16 }}>
              <div style={{ fontSize: 10, color: '#8B6F5C', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>📍 {tx.yourLocation}</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{activeAlert.latitude?.toFixed(6)}, {activeAlert.longitude?.toFixed(6)}</div>
              <a href={`https://www.google.com/maps?q=${activeAlert.latitude},${activeAlert.longitude}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 8, padding: '8px 12px', background: '#2D5F5D', color: '#FAF6F0', borderRadius: 8, fontSize: 11, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>{tx.viewOnMaps}</a>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- ANALYZING / SENDING ----
  if (step === 'analyzing' || step === 'sending') {
    return (
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #FAF6F0 0%, #FEE2E2 100%)' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: step === 'sending' ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' : 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)', color: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, animation: 'pulse 1s infinite' }}>
          {step === 'analyzing' ? '🧠' : sosStep === 'locating' ? '📍' : '📡'}
        </div>
        <div style={{ marginTop: 24, fontSize: 18, fontFamily: 'Georgia, serif', color: '#2a1810', textAlign: 'center' }}>
          {step === 'analyzing' ? tx.analyzing : sosStep === 'locating' ? tx.locating : tx.sending}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#8B6F5C', textAlign: 'center' }}>
          {step === 'analyzing' ? tx.analyzingDesc : ''}
        </div>
      </div>
    )
  }

  // ---- ERROR ----
  if (step === 'error') {
    return (
      <div style={{ flex: 1, padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 22, fontFamily: 'Georgia, serif', marginBottom: 12, color: '#991B1B' }}>{tx.error}</h2>
        <p style={{ fontSize: 13, color: '#5D4037', marginBottom: 24 }}>{error}</p>
        <button onClick={reset} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)', color: '#FAF6F0', borderRadius: 14, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{tx.retry}</button>
      </div>
    )
  }

  // ---- TRIAGE RESULT ----
  if (step === 'result' && triageResult) {
    const t = triageResult.triage
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: t.bgColor }}>
        {/* Header badge */}
        <div style={{ padding: '20px 18px', textAlign: 'center', background: `linear-gradient(180deg, ${t.color}15 0%, ${t.bgColor} 100%)` }}>
          <div style={{ fontSize: 50, marginBottom: 8 }}>{t.icon}</div>
          <div style={{ fontSize: 20, fontFamily: 'Georgia, serif', fontWeight: 700, color: t.color }}>{t.label[langKey]}</div>
          <div style={{ fontSize: 13, color: '#5D4037', marginTop: 8, lineHeight: 1.5 }}>{t.action[langKey]}</div>
        </div>

        {/* Instructions */}
        <div style={{ padding: '0 18px 18px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 14, padding: 16, marginTop: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{tx.whatToDo}</div>
            {t.instructions[langKey].map((inst, i) => (
              <div key={i} style={{ fontSize: 13, padding: '6px 0', color: '#2a1810', display: 'flex', gap: 8, lineHeight: 1.4 }}>
                <span style={{ color: t.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span>{inst}</span>
              </div>
            ))}
          </div>

          {/* Symptoms recap */}
          <div style={{ background: '#FFFFFF', borderRadius: 14, padding: 14, marginTop: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8B6F5C', textTransform: 'uppercase', marginBottom: 8 }}>Symptômes déclarés</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {triageResult.selectedSymptoms.map(s => (
                <span key={s.id} style={{ fontSize: 11, padding: '4px 10px', background: `${t.color}15`, color: t.color, borderRadius: 8, fontWeight: 600 }}>
                  {s.icon} {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {triageResult.level !== 'low' && (
              <button onClick={manualSOS} style={{ width: '100%', padding: 15, background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', color: '#FAF6F0', borderRadius: 14, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 16px rgba(220,38,38,0.3)' }}>
                {tx.sendSOS}
              </button>
            )}
            <button onClick={reset} style={{ width: '100%', padding: 14, background: 'rgba(42,24,16,0.05)', color: '#5D4037', borderRadius: 14, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {tx.backHome}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- ONSET SELECTION ----
  if (step === 'onset') {
    return (
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: 'linear-gradient(180deg, #FAF6F0 0%, #FFE8E2 100%)' }}>
        <button onClick={() => setStep('symptoms')} style={{ background: 'none', border: 'none', color: '#8B6F5C', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>← retour</button>
        
        <h2 style={{ fontSize: 22, fontFamily: 'Georgia, serif', fontWeight: 600, color: '#2a1810', marginBottom: 4 }}>{tx.since}</h2>
        
        {/* Selected symptoms recap */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {selectedSymptoms.map(id => {
            const s = symptoms.find(x => x.id === id)
            return s ? <span key={id} style={{ fontSize: 11, padding: '3px 8px', background: '#C4453620', color: '#C44536', borderRadius: 6, fontWeight: 600 }}>{s.icon} {s.label}</span> : null
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {onsetOptions.map(opt => (
            <button key={opt.id} onClick={() => setSelectedOnset(opt.id)} style={{
              padding: '16px 18px', background: selectedOnset === opt.id ? '#C44536' : '#FFFFFF',
              color: selectedOnset === opt.id ? '#FAF6F0' : '#2a1810',
              borderRadius: 14, border: selectedOnset === opt.id ? '2px solid #C44536' : '2px solid rgba(42,24,16,0.08)',
              fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
              boxShadow: selectedOnset === opt.id ? '0 4px 12px rgba(196,69,54,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <span style={{ fontSize: 24 }}>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <button onClick={runAnalysis} disabled={!selectedOnset} style={{
          width: '100%', padding: 15, marginTop: 20,
          background: selectedOnset ? 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)' : 'rgba(42,24,16,0.1)',
          color: selectedOnset ? '#FAF6F0' : '#8B6F5C',
          borderRadius: 14, fontSize: 15, fontWeight: 700, border: 'none', cursor: selectedOnset ? 'pointer' : 'default',
          fontFamily: 'inherit', boxShadow: selectedOnset ? '0 6px 16px rgba(196,69,54,0.3)' : 'none'
        }}>{tx.analyze}</button>
      </div>
    )
  }

  // ---- SYMPTOM SELECTION ----
  if (step === 'symptoms') {
    const groups = [
      { severity: 'critical', label: langKey === 'wo' ? '🔴 Bu metti lool' : '🔴 Très grave' },
      { severity: 'urgent', label: langKey === 'wo' ? '🟠 Bu metti' : '🟠 Grave' },
      { severity: 'moderate', label: langKey === 'wo' ? '🟡 Lu am solo' : '🟡 Important' },
      { severity: 'low', label: langKey === 'wo' ? '🟢 Lu woyof' : '🟢 Moins grave' },
    ]
    
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(180deg, #FAF6F0 0%, #FFE8E2 100%)' }}>
        <div style={{ padding: '16px 18px 0' }}>
          <button onClick={reset} style={{ background: 'none', border: 'none', color: '#8B6F5C', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>← retour</button>
          <h2 style={{ fontSize: 22, fontFamily: 'Georgia, serif', fontWeight: 600, color: '#2a1810', marginBottom: 4 }}>{tx.whatHappening}</h2>
          <p style={{ fontSize: 12, color: '#8B6F5C', marginBottom: 16 }}>{tx.selectSymptoms}</p>
        </div>

        <div style={{ padding: '0 18px 100px' }}>
          {groups.map(group => {
            const groupSymptoms = symptoms.filter(s => s.severity === group.severity)
            return (
              <div key={group.severity} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8B6F5C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 2 }}>{group.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {groupSymptoms.map(s => {
                    const selected = selectedSymptoms.includes(s.id)
                    return (
                      <button key={s.id} onClick={() => toggleSymptom(s.id)} style={{
                        padding: '12px 10px', background: selected ? '#C44536' : '#FFFFFF',
                        color: selected ? '#FAF6F0' : '#2a1810',
                        borderRadius: 14, border: selected ? '2px solid #C44536' : '2px solid rgba(42,24,16,0.06)',
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        boxShadow: selected ? '0 4px 12px rgba(196,69,54,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s ease'
                      }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{s.label}</div>
                        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, lineHeight: 1.3 }}>{s.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Floating next button */}
        {selectedSymptoms.length > 0 && (
          <div style={{ position: 'fixed', bottom: 80, left: 0, right: 0, padding: '12px 18px', background: 'linear-gradient(180deg, transparent 0%, #FAF6F0 30%)' }}>
            <button onClick={() => setStep('onset')} style={{
              width: '100%', padding: 15,
              background: 'linear-gradient(135deg, #C44536 0%, #8B2E26 100%)',
              color: '#FAF6F0', borderRadius: 14, fontSize: 15, fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(196,69,54,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <span>{selectedSymptoms.length} {tx.symptomsSelected}</span>
              <span>→</span>
              <span>{tx.next}</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // ---- IDLE / HOME ----
  return (
    <div style={{ flex: 1, padding: 20, background: 'linear-gradient(180deg, #FAF6F0 0%, #FFE8E2 100%)', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontFamily: 'Georgia, serif', fontWeight: 600, color: '#2a1810' }}>{tx.title}</h2>
        <p style={{ fontSize: 12, color: '#5D4037', marginTop: 6, lineHeight: 1.5 }}>{tx.subtitle}</p>
      </div>

      {/* Main triage button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button onClick={() => setStep('symptoms')} style={{
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #E85D4D 0%, #C44536 50%, #8B2E26 100%)',
          color: '#FAF6F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 50px rgba(196,69,54,0.5)', border: '6px solid #FAF6F0',
          cursor: 'pointer', fontFamily: 'inherit'
        }}>
          <div style={{ fontSize: 44 }}>⚠️</div>
          <div style={{ fontSize: 22, fontFamily: 'Georgia, serif', fontWeight: 700, marginTop: 4 }}>SOS</div>
        </button>
      </div>
      <p style={{ marginTop: 16, fontSize: 14, color: '#C44536', fontWeight: 700, textAlign: 'center' }}>{tx.startTriage}</p>

      {/* When to use */}
      <div style={{ marginTop: 24, background: '#FFFFFF', borderRadius: 14, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 11, color: '#8B6F5C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>⚠️ {tx.whenToUse}</div>
        {tx.cases.map((c, i) => (
          <div key={i} style={{ fontSize: 12, padding: '5px 0', color: '#2a1810' }}>
            <span style={{ color: '#C44536', fontWeight: 700 }}>• </span>{c}
          </div>
        ))}
      </div>

      {/* Pregnancy context if available */}
      {weeksPregnant && (
        <div style={{ marginTop: 12, background: '#FFFFFF', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 24 }}>🤰</div>
          <div>
            <div style={{ fontSize: 11, color: '#8B6F5C', fontWeight: 600 }}>{langKey === 'wo' ? 'Sa biir' : 'Votre grossesse'}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2a1810' }}>{weeksPregnant} SA</div>
          </div>
          {pregnancy?.risk_level === 'high' && (
            <div style={{ marginLeft: 'auto', padding: '4px 10px', background: '#FEE2E2', color: '#DC2626', borderRadius: 8, fontSize: 10, fontWeight: 700 }}>⚠️ Risque élevé</div>
          )}
        </div>
      )}
    </div>
  )
}