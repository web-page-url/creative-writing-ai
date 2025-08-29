const TRANSLATIONS = {
  "en-US": {
    "appTitle": "Creative Writing AI Assistant",
    "yourText": "Your Text",
    "sample": "Sample",
    "copy": "Copy",
    "fontFamily": "Font Family",
    "fontSize": "Font Size",
    "bold": "Bold",
    "italic": "Italic",
    "underline": "Underline",
    "textColor": "Text Color",
    "addLink": "Add Link",
    "alignLeft": "Align Left",
    "alignCenter": "Align Center",
    "alignRight": "Align Right",
    "lineSpacing": "Line Spacing",
    "bulletList": "Bullet List",
    "numberedList": "Numbered List",
    "decreaseIndent": "Decrease Indent",
    "increaseIndent": "Increase Indent",
    "addLinkTitle": "Add Link",
    "enterUrl": "Enter URL",
    "add": "Add",
    "cancel": "Cancel",
    "characters": "characters",
    "analyzeText": "Analyze Text",
    "analyzing": "Analyzing...",
    "suggestions": "Suggestions",
    "all": "All",
    "grammar": "Grammar",
    "spelling": "Spelling",
    "punctuation": "Punctuation",
    "style": "Style",
    "clarity": "Clarity",
    "clickAnalyzeText": "Click 'Analyze Text' to get suggestions",
    "noSuggestionsCategory": "No suggestions in this category",
    "applySuggestion": "Apply suggestion",
    "dismiss": "Dismiss",
    "textHighlightColor": "Text highlight color",
    "applyAllSuggestions": "Apply All Suggestions",
    "pleaseEnterText": "Please enter some text to analyze",
    "failedToAnalyze": "Failed to analyze text. Please try again.",
    "failedToParse": "Failed to parse suggestions. Please try again.",
    "reject": "Reject",
    "accept": "Accept"
  },
  "es-ES": {
    "appTitle": "Asistente de Escritura Creativa con IA",
    "yourText": "Tu Texto",
    "sample": "Muestra",
    "copy": "Copiar",
    "fontFamily": "Familia de Fuente",
    "fontSize": "Tamaño de Fuente",
    "bold": "Negrita",
    "italic": "Cursiva",
    "underline": "Subrayado",
    "textColor": "Color de Texto",
    "addLink": "Agregar Enlace",
    "alignLeft": "Alinear a la Izquierda",
    "alignCenter": "Centrar",
    "alignRight": "Alinear a la Derecha",
    "lineSpacing": "Espaciado de Línea",
    "bulletList": "Lista con Viñetas",
    "numberedList": "Lista Numerada",
    "decreaseIndent": "Disminuir Sangría",
    "increaseIndent": "Aumentar Sangría",
    "addLinkTitle": "Agregar Enlace",
    "enterUrl": "Ingresa URL",
    "add": "Agregar",
    "cancel": "Cancelar",
    "characters": "caracteres",
    "analyzeText": "Analizar Texto",
    "analyzing": "Analizando...",
    "suggestions": "Sugerencias",
    "all": "Todas",
    "grammar": "Gramática",
    "spelling": "Ortografía",
    "punctuation": "Puntuación",
    "style": "Estilo",
    "clarity": "Claridad",
    "clickAnalyzeText": "Haz clic en 'Analizar Texto' para obtener sugerencias",
    "noSuggestionsCategory": "No hay sugerencias en esta categoría",
    "applySuggestion": "Aplicar sugerencia",
    "dismiss": "Descartar",
    "textHighlightColor": "Color de resaltado de texto",
    "applyAllSuggestions": "Aplicar Todas las Sugerencias",
    "pleaseEnterText": "Por favor ingresa algún texto para analizar",
    "failedToAnalyze": "Error al analizar el texto. Por favor intenta de nuevo.",
    "failedToParse": "Error al procesar las sugerencias. Por favor intenta de nuevo.",
    "reject": "Rechazar",
    "accept": "Aceptar"
  }
};

// Get locale from environment or browser
const getLocale = (): string => {
  // First try to get from environment variable
  const appLocale = process.env.APP_LOCALE;
  if (appLocale && appLocale !== 'APP_LOCALE' && TRANSLATIONS[appLocale as keyof typeof TRANSLATIONS]) {
    return appLocale;
  }

  // Fallback to browser locale (client-side only)
  if (typeof window !== 'undefined') {
    const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
    return findMatchingLocale(browserLocale);
  }

  return 'en-US';
};

const findMatchingLocale = (locale: string): string => {
  if (TRANSLATIONS[locale as keyof typeof TRANSLATIONS]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};

const locale = getLocale();

export const t = (key: string): string => {
  const translations = TRANSLATIONS[locale as keyof typeof TRANSLATIONS];
  return translations?.[key as keyof typeof translations] || 
         TRANSLATIONS['en-US'][key as keyof typeof TRANSLATIONS['en-US']] || 
         key;
};

export { locale, TRANSLATIONS };