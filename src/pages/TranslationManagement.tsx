import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { getCollections, updateCollection, type Collection } from '../services/collections-api';
import { getCritics, updateCritic, type Critic } from '../services/critics-api';
import { getExhibitions, updateExhibition, type Exhibition } from '../services/exhibitions-api';
import { useToast } from '../components/Toast';
import { translateText } from '../services/translation-api';

const LANGUAGES = [
  { code: 'it', label: 'Italiano 🇮🇹', flag: '🇮🇹' },
  { code: 'en', label: 'English 🇬🇧', flag: '🇬🇧' },
  { code: 'es', label: 'Español 🇪🇸', flag: '🇪🇸' },
  { code: 'fr', label: 'Français 🇫🇷', flag: '🇫🇷' },
  { code: 'ja', label: '日本語 🇯🇵', flag: '🇯🇵' },
  { code: 'zh', label: '简体中文 🇨🇳', flag: '🇨🇳' },
  { code: 'zh_tw', label: '繁體中文 🇹🇼', flag: '🇹🇼' },
];

type TabType = 'collections' | 'critics' | 'exhibitions';

interface TranslationFormData {
  // Collections fields
  title_it?: string;
  title_en?: string;
  title_es?: string;
  title_fr?: string;
  title_ja?: string;
  title_zh?: string;
  title_zh_tw?: string;
  description_it?: string;
  description_en?: string;
  description_es?: string;
  description_fr?: string;
  description_ja?: string;
  description_zh?: string;
  description_zh_tw?: string;
  // Critics fields
  text_it?: string;
  text_en?: string;
  text_es?: string;
  text_fr?: string;
  text_ja?: string;
  text_zh?: string;
  text_zh_tw?: string;
  // Exhibitions fields
  subtitle_it?: string;
  subtitle_en?: string;
  subtitle_es?: string;
  subtitle_fr?: string;
  subtitle_ja?: string;
  subtitle_zh?: string;
  subtitle_zh_tw?: string;
  location_it?: string;
  location_en?: string;
  location_es?: string;
  location_fr?: string;
  location_ja?: string;
  location_zh?: string;
  location_zh_tw?: string;
  info_it?: string;
  info_en?: string;
  info_es?: string;
  info_fr?: string;
  info_ja?: string;
  info_zh?: string;
  info_zh_tw?: string;
}

const TranslationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [critics, setCritics] = useState<Critic[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Collection | Critic | Exhibition | null>(null);
  const [formData, setFormData] = useState<TranslationFormData>({});
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'collections') {
        const data = await getCollections(true);
        setCollections(data);
      } else if (activeTab === 'critics') {
        const data = await getCritics(true);
        setCritics(data);
      } else if (activeTab === 'exhibitions') {
        const data = await getExhibitions(true);
        setExhibitions(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dei dati', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: Collection | Critic | Exhibition) => {
    setEditingItem(item);

    if ('location' in item) {
      // It's an Exhibition
      setFormData({
        title_it: item.title_it || '',
        title_en: item.title_en || '',
        title_es: item.title_es || '',
        title_fr: item.title_fr || '',
        title_ja: item.title_ja || '',
        title_zh: item.title_zh || '',
        title_zh_tw: item.title_zh_tw || '',
        subtitle_it: item.subtitle_it || '',
        subtitle_en: item.subtitle_en || '',
        subtitle_es: item.subtitle_es || '',
        subtitle_fr: item.subtitle_fr || '',
        subtitle_ja: item.subtitle_ja || '',
        subtitle_zh: item.subtitle_zh || '',
        subtitle_zh_tw: item.subtitle_zh_tw || '',
        description_it: item.description_it || '',
        description_en: item.description_en || '',
        description_es: item.description_es || '',
        description_fr: item.description_fr || '',
        description_ja: item.description_ja || '',
        description_zh: item.description_zh || '',
        description_zh_tw: item.description_zh_tw || '',
        location_it: item.location_it || '',
        location_en: item.location_en || '',
        location_es: item.location_es || '',
        location_fr: item.location_fr || '',
        location_ja: item.location_ja || '',
        location_zh: item.location_zh || '',
        location_zh_tw: item.location_zh_tw || '',
        info_it: item.info_it || '',
        info_en: item.info_en || '',
        info_es: item.info_es || '',
        info_fr: item.info_fr || '',
        info_ja: item.info_ja || '',
        info_zh: item.info_zh || '',
        info_zh_tw: item.info_zh_tw || '',
      });
    } else if ('title' in item) {
      // It's a Collection
      setFormData({
        title_it: item.title_it || '',
        title_en: item.title_en || '',
        title_es: item.title_es || '',
        title_fr: item.title_fr || '',
        title_ja: item.title_ja || '',
        title_zh: item.title_zh || '',
        title_zh_tw: item.title_zh_tw || '',
        description_it: item.description_it || '',
        description_en: item.description_en || '',
        description_es: item.description_es || '',
        description_fr: item.description_fr || '',
        description_ja: item.description_ja || '',
        description_zh: item.description_zh || '',
        description_zh_tw: item.description_zh_tw || '',
      });
    } else {
      // It's a Critic
      setFormData({
        text_it: item.text_it || '',
        text_en: item.text_en || '',
        text_es: item.text_es || '',
        text_fr: item.text_fr || '',
        text_ja: item.text_ja || '',
        text_zh: item.text_zh || '',
        text_zh_tw: item.text_zh_tw || '',
      });
    }
  };

  const handleInputChange = (field: keyof TranslationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);

      if ('location' in editingItem) {
        // It's an Exhibition
        await updateExhibition(editingItem.id, formData);
      } else if ('title' in editingItem) {
        // It's a Collection
        await updateCollection(editingItem.id, formData);
      } else {
        // It's a Critic
        await updateCritic(editingItem.id, formData);
      }

      showToast('Traduzioni salvate con successo!', 'success');
      setEditingItem(null);
      loadData(); // Reload to show updated data
    } catch (error) {
      console.error('Error saving translations:', error);
      showToast('Errore nel salvataggio delle traduzioni', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!editingItem || translating) return;

    try {
      setTranslating(true);
      showToast('Traduzione automatica in corso...', 'info');

      // Determine which fields to translate based on item type
      let fieldsToTranslate: string[] = [];

      if ('location' in editingItem) {
        // Exhibition: title, subtitle, description, location, info
        fieldsToTranslate = ['title', 'subtitle', 'description', 'location', 'info'];
      } else if ('title' in editingItem) {
        // Collection: title, description
        fieldsToTranslate = ['title', 'description'];
      } else {
        // Critic: text
        fieldsToTranslate = ['text'];
      }

      // Get Italian (source) values
      const sourceValues: Record<string, string> = {};
      for (const field of fieldsToTranslate) {
        const itKey = `${field}_it` as keyof TranslationFormData;
        sourceValues[field] = (formData[itKey] || '') as string;
      }

      // Check if we have Italian source text
      const hasSourceText = fieldsToTranslate.some(field => sourceValues[field]);
      if (!hasSourceText) {
        showToast('Manca il testo italiano da tradurre', 'error');
        setTranslating(false);
        return;
      }

      // Translate for each target language (skip Italian)
      const targetLanguages = LANGUAGES.filter(lang => lang.code !== 'it');
      const newFormData = { ...formData };
      let translatedCount = 0;

      for (const lang of targetLanguages) {
        for (const field of fieldsToTranslate) {
          const targetKey = `${field}_${lang.code}` as keyof TranslationFormData;
          const sourceText = sourceValues[field];

          // Only translate if source text exists and target is empty
          if (sourceText && !formData[targetKey]) {
            try {
              const translated = await translateText(sourceText, lang.code, 'it');
              newFormData[targetKey] = translated as any;
              translatedCount++;
            } catch (error) {
              console.error(`Translation error for ${field} -> ${lang.code}:`, error);
              // Continue with other translations even if one fails
            }
          }
        }
      }

      setFormData(newFormData);
      showToast(`${translatedCount} traduzioni generate con successo!`, 'success');
    } catch (error) {
      console.error('Auto-translation error:', error);
      showToast('Errore nella traduzione automatica', 'error');
    } finally {
      setTranslating(false);
    }
  };

  const getTranslationStatus = (item: Collection | Critic | Exhibition): { missing: number; hasItalian: boolean; total: number } => {
    let missing = 0;
    let total = 0;
    let hasItalian = false;

    if ('location' in item) {
      // It's an Exhibition - check title, subtitle, description, location, and info for each language
      LANGUAGES.forEach(lang => {
        const titleKey = `title_${lang.code}` as keyof Exhibition;
        const subtitleKey = `subtitle_${lang.code}` as keyof Exhibition;
        const descKey = `description_${lang.code}` as keyof Exhibition;
        const locationKey = `location_${lang.code}` as keyof Exhibition;
        const infoKey = `info_${lang.code}` as keyof Exhibition;

        // Check if Italian (source) exists
        if (lang.code === 'it') {
          hasItalian = !!(item[titleKey] || item[descKey] || item[locationKey]);
        }

        total += 5; // title + subtitle + description + location + info
        if (!item[titleKey]) missing++;
        if (!item[subtitleKey]) missing++;
        if (!item[descKey]) missing++;
        if (!item[locationKey]) missing++;
        if (!item[infoKey]) missing++;
      });
    } else if ('title' in item) {
      // It's a Collection - check title and description for each language
      LANGUAGES.forEach(lang => {
        const titleKey = `title_${lang.code}` as keyof Collection;
        const descKey = `description_${lang.code}` as keyof Collection;

        // Check if Italian (source) exists
        if (lang.code === 'it') {
          hasItalian = !!(item[titleKey] || item[descKey]);
        }

        total += 2; // title + description
        if (!item[titleKey]) missing++;
        if (!item[descKey]) missing++;
      });
    } else {
      // It's a Critic - check text for each language
      LANGUAGES.forEach(lang => {
        const textKey = `text_${lang.code}` as keyof Critic;

        // Check if Italian (source) exists
        if (lang.code === 'it') {
          hasItalian = !!item[textKey];
        }

        total += 1;
        if (!item[textKey]) missing++;
      });
    }

    return { missing, hasItalian, total };
  };

  const getItemTitle = (item: Collection | Critic | Exhibition): string => {
    if ('location' in item) {
      return item.title;
    } else if ('title' in item) {
      return item.title;
    } else {
      return item.name;
    }
  };

  const getItemIdentifier = (item: Collection | Critic | Exhibition): string => {
    if ('location' in item) {
      return item.date;
    } else if ('title' in item) {
      return item.slug;
    } else {
      return item.role;
    }
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Traduzioni - Backoffice</title>
      </Helmet>

      <motion.div
        className="max-w-5xl mx-auto py-20 px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>Traduzioni</span>
          </h1>
          <p className="text-white/60 mt-2">
            Gestisci le traduzioni di tutti i contenuti del sito
          </p>
        </motion.div>

          {loading ? (
            <div className="min-h-[400px]" />
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="mb-6 flex gap-2 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`px-6 py-3 font-bold uppercase text-sm tracking-wide transition-colors border-b-2 ${
                    activeTab === 'collections'
                      ? 'text-white border-accent'
                      : 'text-white/50 hover:text-white border-transparent hover:border-white/20'
                  }`}
                >
                  Collezioni
                </button>
                <button
                  onClick={() => setActiveTab('critics')}
                  className={`px-6 py-3 font-bold uppercase text-sm tracking-wide transition-colors border-b-2 ${
                    activeTab === 'critics'
                      ? 'text-white border-accent'
                      : 'text-white/50 hover:text-white border-transparent hover:border-white/20'
                  }`}
                >
                  Critica
                </button>
                <button
                  onClick={() => setActiveTab('exhibitions')}
                  className={`px-6 py-3 font-bold uppercase text-sm tracking-wide transition-colors border-b-2 ${
                    activeTab === 'exhibitions'
                      ? 'text-white border-accent'
                      : 'text-white/50 hover:text-white border-transparent hover:border-white/20'
                  }`}
                >
                  Mostre
                </button>
              </div>

              <div className="bg-secondary border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/80 uppercase tracking-wider">
                    {activeTab === 'collections' ? 'Collezione' : activeTab === 'critics' ? 'Critico' : 'Mostra'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/80 uppercase tracking-wider">
                    {activeTab === 'collections' ? 'Slug' : activeTab === 'critics' ? 'Ruolo' : 'Data'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white/80 uppercase tracking-wider">
                    Traduzioni Mancanti
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white/80 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(activeTab === 'collections' ? collections : activeTab === 'critics' ? critics : exhibitions).map((item) => {
                  const status = getTranslationStatus(item);
                  const completionPercentage = Math.round(((status.total - status.missing) / status.total) * 100);

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {'image_url' in item && item.image_url && (
                            <img
                              src={item.image_url}
                              alt={getItemTitle(item)}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <span className="text-white font-medium">{getItemTitle(item)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/60 text-sm">{getItemIdentifier(item)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {status.missing === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                              ✓ Completo
                            </span>
                          ) : !status.hasItalian ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                              ⚠️ Base italiana mancante
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
                                {status.missing} mancanti
                              </span>
                              <span className="text-white/40 text-xs">
                                {completionPercentage}% completo
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="px-4 py-2 bg-accent text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity uppercase"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {status.missing === 0 ? 'Modifica' : status.hasItalian ? 'Completa Traduzioni' : 'Aggiungi Traduzioni'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

                {((activeTab === 'collections' && collections.length === 0) || (activeTab === 'critics' && critics.length === 0) || (activeTab === 'exhibitions' && exhibitions.length === 0)) && (
                  <div className="text-center py-12 text-white/60">
                    {activeTab === 'collections' ? 'Nessuna collezione trovata' : activeTab === 'critics' ? 'Nessun critico trovato' : 'Nessuna mostra trovata'}
                  </div>
                )}
              </div>
            </>
          )}
      </motion.div>

      {/* Translation Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="bg-secondary border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Traduzioni: {getItemTitle(editingItem)}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </h3>

                  <div className="space-y-4 pl-8">
                    {'location' in editingItem ? (
                      <>
                        {/* Exhibition Fields */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Titolo
                          </label>
                          <input
                            type="text"
                            value={formData[`title_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`title_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder={`Titolo in ${lang.label}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Sottotitolo
                          </label>
                          <input
                            type="text"
                            value={formData[`subtitle_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`subtitle_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder={`Sottotitolo in ${lang.label}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Descrizione
                          </label>
                          <textarea
                            value={formData[`description_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`description_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors resize-none"
                            rows={3}
                            placeholder={`Descrizione in ${lang.label}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Luogo
                          </label>
                          <input
                            type="text"
                            value={formData[`location_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`location_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder={`Luogo in ${lang.label}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Info
                          </label>
                          <textarea
                            value={formData[`info_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`info_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors resize-none"
                            rows={3}
                            placeholder={`Info in ${lang.label}`}
                          />
                        </div>
                      </>
                    ) : 'title' in editingItem ? (
                      <>
                        {/* Collection Fields */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Titolo
                          </label>
                          <input
                            type="text"
                            value={formData[`title_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`title_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder={`Titolo in ${lang.label}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Descrizione
                          </label>
                          <textarea
                            value={formData[`description_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`description_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors resize-none"
                            rows={3}
                            placeholder={`Descrizione in ${lang.label}`}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Critic Fields */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                            Testo
                          </label>
                          <textarea
                            value={formData[`text_${lang.code}` as keyof TranslationFormData] || ''}
                            onChange={(e) => handleInputChange(`text_${lang.code}` as keyof TranslationFormData, e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors resize-none"
                            rows={6}
                            placeholder={`Testo in ${lang.label}`}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={handleAutoTranslate}
                disabled={translating || saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity uppercase disabled:opacity-50 flex items-center gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {translating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                    </svg>
                    Traduzione...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                    </svg>
                    Auto-Traduci Mancanti
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg font-bold text-sm hover:bg-white/20 transition-colors uppercase"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || translating}
                  className="px-6 py-2 bg-accent text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity uppercase disabled:opacity-50"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {saving ? 'Salvataggio...' : 'Salva Traduzioni'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BackofficeLayout>
  );
};

export default TranslationManagement;
