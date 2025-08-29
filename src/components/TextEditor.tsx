'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Check, X, Loader2, Sun, Moon, Copy, FileText,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, IndentDecrease, IndentIncrease,
  Palette, MoveVertical
} from 'lucide-react';
import { generateContent } from '@/lib/gemini';
import { t } from '@/lib/translations';
import { ToolbarButton, ToolbarSeparator, Button } from '@/components/ui/index';
import { Suggestion, Category, Font, TextSize, LineSpacing, TooltipPosition } from '@/types';

const TextEditor: React.FC = () => {
  const [text, setText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<Suggestion | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0, isBelow: false });
  const editorRef = useRef<HTMLDivElement>(null);

  const categories: Category[] = [
    { id: 'all', label: t('all'), color: 'bg-purple-500' },
    { id: 'grammar', label: t('grammar'), color: 'bg-blue-500' },
    { id: 'spelling', label: t('spelling'), color: 'bg-red-500' },
    { id: 'punctuation', label: t('punctuation'), color: 'bg-yellow-500' },
    { id: 'style', label: t('style'), color: 'bg-green-500' },
    { id: 'clarity', label: t('clarity'), color: 'bg-indigo-500' }
  ];

  const sampleTexts = [
    'Human welfare is at the heart of our work at Aditi Consulting: our mission is to make sure that increasingly capable and sophisticated AI systems remain beneficial to humanity.\n\nBut as we build those AI systems, and as they begin to approximate or surpass many human qualities, another question arises. Should we also be concerned about the potential consciousness and experiences of the models themselves? Should we be concerned about *model welfare*, too?\n\nThis is an open question, and one that\'s both philosophically and scientifically difficult. But now that models can communicate, relate, plan, problem-solve, and pursue goals—along with very many more characteristics we associate with people—we think it\'s time to address it.\n\nTo that end, we recently started a research program to investigate, and prepare to navigate, model welfare.'
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  const fonts: Font[] = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' }
  ];

  const textSizes: TextSize[] = [
    { value: '13.33px', label: '10' },
    { value: '14.67px', label: '11' },
    { value: '16px', label: '12' },
    { value: '18.67px', label: '14' },
    { value: '21.33px', label: '16' },
    { value: '24px', label: '18' },
    { value: '32px', label: '24' },
    { value: '48px', label: '36' }
  ];

  const lineSpacings: LineSpacing[] = [
    { value: '1', label: '1.0' },
    { value: '1.15', label: '1.15' },
    { value: '1.5', label: '1.5' },
    { value: '2', label: '2.0' }
  ];

  // Execute formatting command with improved list handling
  const formatText = (command: string, value: string | null = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    if (command === 'fontSize') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      
      if (range.collapsed) {
        const allContent = editorRef.current.childNodes;
        allContent.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
            const span = document.createElement('span');
            span.style.fontSize = value || '16px';
            span.style.fontFamily = 'Arial';
            span.textContent = node.textContent;
            node.parentNode?.replaceChild(span, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            (node as HTMLElement).style.fontSize = value || '16px';
          }
        });
      } else {
        try {
          const contents = range.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = value || '16px';
          while (contents.firstChild) {
            span.appendChild(contents.firstChild);
          }
          range.insertNode(span);
          range.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          document.execCommand('fontSize', false, '7');
          const tempFonts = editorRef.current.querySelectorAll('font[size="7"]');
          tempFonts.forEach(font => {
            const span = document.createElement('span');
            span.style.fontSize = value || '16px';
            span.innerHTML = font.innerHTML;
            font.parentNode?.replaceChild(span, font);
          });
        }
      }
    } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // Improved list handling
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Check if we're already in a list
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode as Node;
        }
        
        const inList = (node as Element)?.closest('ul, ol');
        
        if (inList) {
          // Toggle off the list
          document.execCommand(command, false, undefined);
        } else {
          // Make sure we have a proper block element
          const block = (node as Element)?.closest('div, p');
          if (!block || block === editorRef.current) {
            document.execCommand('formatBlock', false, 'div');
          }
          
          // Now apply the list
          setTimeout(() => {
            document.execCommand(command, false, undefined);
            editorRef.current?.focus();
          }, 10);
        }
      }
    } else if (command === 'indent' || command === 'outdent') {
      // Handle indent/outdent
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode as Node;
        }
        
        // Check if we're in a list
        const listItem = (node as Element)?.closest('li');
        if (listItem) {
          document.execCommand(command, false, undefined);
        } else {
          // For non-list content, use margin
          const block = (node as Element)?.closest('div, p') || node;
          if (block && block !== editorRef.current) {
            const currentMargin = parseInt((block as HTMLElement).style.marginLeft || '0');
            if (command === 'indent') {
              (block as HTMLElement).style.marginLeft = `${currentMargin + 40}px`;
            } else if (currentMargin > 0) {
              (block as HTMLElement).style.marginLeft = `${Math.max(0, currentMargin - 40)}px`;
            }
          }
        }
      }
    } else {
      document.execCommand(command, false, value || undefined);
    }
    
    editorRef.current?.focus();
    updateContent();
  };

  // Handle click on highlighted text
  const handleHighlightClick = (e: React.MouseEvent, issueText: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the matching suggestion
    const matchingSuggestion = suggestions.find(s => s.issue === issueText);
    if (!matchingSuggestion) return;
    
    // Calculate tooltip position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return;
    
    // Position tooltip above the highlighted text by default
    let top = rect.top - editorRect.top - 10; // 10px above
    let left = rect.left - editorRect.left + (rect.width / 2); // Center horizontally
    let isBelow = false;
    
    // Ensure tooltip doesn't go above the editor
    if (top < 100) { // If too close to top, show below instead
      top = rect.bottom - editorRect.top + 10;
      isBelow = true;
    }
    
    // Ensure tooltip doesn't go outside horizontally
    const tooltipWidth = 300; // approximate width
    if (left - tooltipWidth/2 < 10) {
      left = tooltipWidth/2 + 10;
    } else if (left + tooltipWidth/2 > editorRect.width - 10) {
      left = editorRect.width - tooltipWidth/2 - 10;
    }
    
    setTooltipPosition({ top, left, isBelow });
    setActiveTooltip(matchingSuggestion);
  };

  // Apply highlights to text based on suggestions
  const applyHighlights = () => {
    if (!editorRef.current) return;
    
    // Get the current HTML content
    let content = editorRef.current.innerHTML;
    
    // Remove existing highlights
    content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
    
    // If no suggestions, just update the content without highlights
    if (suggestions.length === 0) {
      editorRef.current.innerHTML = content;
      return;
    }
    
    // Apply new highlights for each suggestion
    suggestions.forEach(suggestion => {
      const categoryColors = {
        grammar: 'rgba(59, 130, 246, 0.3)', // blue
        spelling: 'rgba(239, 68, 68, 0.3)', // red
        punctuation: 'rgba(245, 158, 11, 0.3)', // yellow
        style: 'rgba(34, 197, 94, 0.3)', // green
        clarity: 'rgba(99, 102, 241, 0.3)' // indigo
      };
      
      const color = categoryColors[suggestion.category] || 'rgba(147, 51, 234, 0.3)';
      
      // Escape special characters for HTML content matching
      const escapeHtml = (text: string) => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };
      
      // Try to find and highlight the issue text
      const issueText = suggestion.issue;
      const escapedIssue = escapeHtml(issueText);
      
      // Try multiple matching strategies
      const patterns = [
        issueText, // Original text
        escapedIssue, // HTML-escaped version
        issueText.replace(/"/g, '&quot;').replace(/'/g, '&#039;'), // Only escape quotes
        issueText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Regex escaped
      ];
      
      let highlighted = false;
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          content = content.replace(
            pattern,
            `<mark data-issue="${encodeURIComponent(issueText)}" style="background-color: ${color}; padding: 2px 0; border-radius: 2px; cursor: pointer; transition: filter 0.2s;" onmouseover="this.style.filter='brightness(0.85)'" onmouseout="this.style.filter='brightness(1)'">${pattern}</mark>`
          );
          highlighted = true;
          break;
        }
      }
      
      // If not found, try a more flexible approach
      if (!highlighted) {
        console.log(`Could not highlight: "${issueText}" in category ${suggestion.category}`);
      }
    });
    
    // Update the editor content
    editorRef.current.innerHTML = content;
  };

  // Handle paste events to clean formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    
    // Split by double line breaks to identify paragraphs
    const paragraphs = text.split(/\n\n+/);
    const cleanHTML = paragraphs
      .map(paragraph => {
        // Within each paragraph, convert single line breaks to <br>
        const lines = paragraph.split('\n');
        const paragraphHTML = lines
          .map(line => line.trim())
          .filter(line => line)
          .join('<br>');
        
        if (paragraphHTML) {
          return `<div style="font-family: Arial; font-size: 16px;">${paragraphHTML}</div>`;
        }
        return '';
      })
      .filter(html => html)
      .join('<div><br></div>'); // Empty div between paragraphs for spacing
    
    // Insert the cleaned HTML
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const fragment = range.createContextualFragment(cleanHTML);
    range.insertNode(fragment);
    
    // Move cursor to end of inserted content
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    updateContent();
  };

  // Handle copy events to remove highlights
  const handleCopy = (e: React.ClipboardEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const clonedSelection = range.cloneContents();
    
    // Create a temporary div to clean the content
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(clonedSelection);
    
    // Remove all mark tags but keep their content
    const marks = tempDiv.querySelectorAll('mark');
    marks.forEach(mark => {
      const span = document.createElement('span');
      span.innerHTML = mark.innerHTML;
      // Copy any font styling from the mark's parent or use defaults
      const parent = mark.parentElement;
      if (parent && (parent as HTMLElement).style.fontSize) {
        (span as HTMLElement).style.fontSize = (parent as HTMLElement).style.fontSize;
      }
      if (parent && (parent as HTMLElement).style.fontFamily) {
        (span as HTMLElement).style.fontFamily = (parent as HTMLElement).style.fontFamily;
      }
      mark.parentNode?.replaceChild(span, mark);
    });
    
    // Remove background styles from all elements
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      const element = el as HTMLElement;
      if (element.style) {
        element.style.backgroundColor = '';
        element.style.background = '';
        element.style.backgroundImage = '';
        element.style.backgroundClip = '';
        // Remove any webkit background clip that might affect text
        element.style.webkitBackgroundClip = '';
        element.style.webkitTextFillColor = '';
      }
    });
    
    // Set both plain text and HTML data
    e.clipboardData.setData('text/plain', tempDiv.textContent || '');
    e.clipboardData.setData('text/html', tempDiv.innerHTML);
    e.preventDefault();
  };

  // Handle link insertion
  const insertLink = () => {
    if (linkUrl) {
      formatText('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  const loadSampleText = () => {
    const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    if (editorRef.current) {
      // Convert newlines to properly formatted HTML with spacing between paragraphs
      const paragraphs = randomSample.split('\n\n').map(p => p.trim()).filter(p => p);
      const htmlContent = paragraphs
        .map(p => `<div style="font-family: Arial; font-size: 16px;">${p}</div>`)
        .join('<div><br></div>'); // Add empty div between paragraphs for spacing
      
      editorRef.current.innerHTML = htmlContent;
      
      // Add an empty div at the end for better cursor positioning
      const lastDiv = document.createElement('div');
      lastDiv.innerHTML = '<br>';
      editorRef.current.appendChild(lastDiv);
      
      updateContent();
    }
  };

  const copyText = () => {
    if (!editorRef.current) return;
    
    // Create a temporary element with the cleaned content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(tempDiv);
    
    // Remove all mark tags (highlights) but keep their content with proper styling
    const marks = tempDiv.querySelectorAll('mark');
    marks.forEach(mark => {
      const span = document.createElement('span');
      span.innerHTML = mark.innerHTML;
      // Preserve font styling
      const parent = mark.parentElement;
      if (parent && (parent as HTMLElement).style.fontSize) {
        (span as HTMLElement).style.fontSize = (parent as HTMLElement).style.fontSize;
      }
      if (parent && (parent as HTMLElement).style.fontFamily) {
        (span as HTMLElement).style.fontFamily = (parent as HTMLElement).style.fontFamily;
      }
      mark.parentNode?.replaceChild(span, mark);
    });
    
    // Remove any background styles
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      const element = el as HTMLElement;
      if (element.style) {
        element.style.backgroundColor = '';
        element.style.background = '';
        element.style.backgroundImage = '';
        element.style.backgroundClip = '';
        element.style.webkitBackgroundClip = '';
        element.style.webkitTextFillColor = '';
      }
    });
    
    // Select and copy the cleaned content
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    try {
      document.execCommand('copy');
      selection?.removeAllRanges();
      document.body.removeChild(tempDiv);
    } catch (err) {
      document.body.removeChild(tempDiv);
      // Fallback to plain text copy
      navigator.clipboard.writeText(text);
    }
  };

  const analyzeText = async () => {
    // Clear any existing highlights before analyzing
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
      editorRef.current.innerHTML = content;
      updateContent();
    }
    
    if (!text.trim()) {
      setError(t('pleaseEnterText'));
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuggestions([]);

    try {
      // Make sure we're sending the exact text including quotes
      const textToAnalyze = text;
      
      // Escape the text to prevent template string issues
      const escapedText = textToAnalyze
        .replace(/\\/g, '\\\\')  // Escape backslashes
        .replace(/`/g, '\\`')      // Escape backticks
        .replace(/\$/g, '\\$')     // Escape dollar signs
        .replace(/\n/g, '\\n')     // Escape newlines
        .replace(/\r/g, '\\r')     // Escape carriage returns
        .replace(/"/g, '\\"');     // Escape quotes
      
      const prompt = `Analyze the following text and provide specific suggestions for improvement. Focus on grammar, spelling, punctuation, style, and clarity. Please respond in English.

Text to analyze:
"${escapedText}"

IMPORTANT FORMATTING REQUIREMENTS:
1. When identifying issues, preserve the EXACT text including all quotation marks, apostrophes, and special characters.
2. Your response MUST be a valid JSON array only - no markdown, no code blocks, no explanatory text.
3. Do not wrap the response in \`\`\`json or \`\`\` blocks.
4. Start directly with [ and end with ].

Respond with a JSON array of suggestion objects. Each object should have:
- category: one of "grammar", "spelling", "punctuation", "style", or "clarity"
- issue: the EXACT text that needs improvement (including any quotes or special characters)
- suggestion: the corrected or improved version
- explanation: a brief explanation of why this change improves the text
- position: approximate starting position in the text (character index)

Only include actual issues that need correction. If the text is perfect, return an empty array [].

Example format:
[{"category":"grammar","issue":"text here","suggestion":"corrected text","explanation":"reason","position":0}]

Respond with only the JSON array, nothing else:`;

      const response = await generateContent(prompt);
      
      // Function to clean and extract JSON from various response formats
      const extractAndParseJSON = (rawResponse: string): any[] | null => {
        // Multiple cleaning strategies
        const cleaningStrategies = [
          // Strategy 1: Remove standard markdown code blocks
          (text: string) => {
            return text
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/, '')
              .replace(/\s*```$/, '')
              .trim();
          },
          
          // Strategy 2: Extract content between first [ and last ]
          (text: string) => {
            const firstBracket = text.indexOf('[');
            const lastBracket = text.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              return text.substring(firstBracket, lastBracket + 1);
            }
            return text;
          },
          
          // Strategy 3: Use regex to find JSON array pattern
          (text: string) => {
            const jsonMatch = text.match(/\[\s*(?:{[\s\S]*?}\s*,?\s*)*\s*\]/);
            return jsonMatch ? jsonMatch[0] : text;
          },
          
          // Strategy 4: Remove everything before first [ and after last ]
          (text: string) => {
            return text.replace(/^[^\[]*/, '').replace(/[^\]]*$/, '');
          }
        ];
        
        // Try each cleaning strategy
        for (let i = 0; i < cleaningStrategies.length; i++) {
          try {
            const cleaned = cleaningStrategies[i](rawResponse).trim();
            console.log(`Strategy ${i + 1} cleaned response:`, cleaned);
            
            if (cleaned && (cleaned.startsWith('[') || cleaned.startsWith('{'))) {
              const parsed = JSON.parse(cleaned);
              if (Array.isArray(parsed)) {
                return parsed;
              }
            }
          } catch (error) {
            console.log(`Strategy ${i + 1} failed:`, error);
            continue;
          }
        }
        
        return null;
      };
      
      try {
        console.log('Raw AI response:', response);
        
        const parsedSuggestions = extractAndParseJSON(response);
        
        if (parsedSuggestions) {
          setSuggestions(parsedSuggestions);
        } else {
          throw new Error('All JSON extraction strategies failed');
        }
      } catch (parseError) {
        console.error('All parsing strategies failed:', parseError);
        console.error('Raw response:', response);
        
        // Show more helpful error message
        const preview = response.length > 200 ? response.substring(0, 200) + '...' : response;
        setError(`${t('failedToParse')} Raw response: ${preview}`);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(t('failedToAnalyze'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initialize editor on mount
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = '<div><br></div>';
    }
  }, []);

  // Update highlights when suggestions change
  useEffect(() => {
    applyHighlights();
  }, [suggestions]);

  // Add click handler for highlights
  useEffect(() => {
    if (!editorRef.current) return;
    
    const handleEditorClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'MARK') {
        const issueText = decodeURIComponent(target.getAttribute('data-issue') || '');
        handleHighlightClick(e as any, issueText);
      }
    };
    
    editorRef.current.addEventListener('click', handleEditorClick);
    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('click', handleEditorClick);
      }
    };
  }, [suggestions]);

  // Close dropdowns and tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isColorPicker = target.closest('[data-dropdown="color"]');
      const isLineSpacing = target.closest('[data-dropdown="line-spacing"]');
      const isTooltip = target.closest('[data-tooltip]');
      const isHighlight = target.tagName === 'MARK';
      
      if (!isColorPicker) {
        setShowColorPicker(false);
      }
      if (!isLineSpacing) {
        setShowLineSpacing(false);
      }
      if (!isTooltip && !isHighlight) {
        setActiveTooltip(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applySuggestion = (suggestion: Suggestion) => {
    if (!editorRef.current) return;
    
    // Get the current content without highlights
    let content = editorRef.current.innerHTML;
    content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
    
    // Try to find and replace the suggestion
    const issueText = suggestion.issue;
    const replacementText = suggestion.suggestion;
    
    // Escape special characters for HTML
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    // Try multiple replacement strategies
    const patterns = [
      issueText, // Original text
      escapeHtml(issueText), // HTML-escaped version
      issueText.replace(/"/g, '&quot;').replace(/'/g, '&#039;') // Only escape quotes
    ];
    
    let replaced = false;
    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        content = content.replace(pattern, escapeHtml(replacementText));
        replaced = true;
        break;
      }
    }
    
    if (!replaced) {
      console.log(`Could not find text to replace: "${issueText}"`);
    }
    
    // Update the editor
    editorRef.current.innerHTML = content;
    updateContent();
    
    // Remove the applied suggestion
    setSuggestions(suggestions.filter(s => s !== suggestion));
    
    // Close tooltip if it was showing this suggestion
    if (activeTooltip && activeTooltip.issue === suggestion.issue) {
      setActiveTooltip(null);
    }
  };

  const filteredSuggestions = activeCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === activeCategory);

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  // Dismiss a suggestion
  const dismissSuggestion = (suggestion: Suggestion) => {
    setSuggestions(suggestions.filter(s => s !== suggestion));
    if (activeTooltip && activeTooltip.issue === suggestion.issue) {
      setActiveTooltip(null);
    }
  };
  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      
      // Close tooltip when editing
      setActiveTooltip(null);
      
      // Create a temporary element to extract text while preserving structure
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Remove only the mark tags but keep their content
      const marks = tempDiv.querySelectorAll('mark');
      marks.forEach(mark => {
        const textNode = document.createTextNode(mark.textContent || '');
        mark.parentNode?.replaceChild(textNode, mark);
      });
      
      // Convert <br> tags to newlines for proper text extraction
      tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');
      
      // Extract text content preserving quotes and special characters
      const plainText = tempDiv.textContent || '';
      setText(plainText);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('appTitle')}
            </h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className={`rounded-xl shadow-lg p-6 relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('yourText')}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={loadSampleText}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {t('sample')}
                </button>
                <button
                  onClick={copyText}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {t('copy')}
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className={`flex flex-wrap items-center gap-1 p-2 mb-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
            }`}>
              {/* Font Selection */}
              <select
                onChange={(e) => formatText('fontName', e.target.value)}
                defaultValue="Arial"
                className={`px-2 py-1 rounded text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                title={t('fontFamily')}
              >
                {fonts.map(font => (
                  <option key={font.value} value={font.value} style={{fontFamily: font.value}}>
                    {font.label}
                  </option>
                ))}
              </select>

              {/* Text Size */}
              <select
                onChange={(e) => formatText('fontSize', e.target.value)}
                defaultValue="16px"
                className={`px-2 py-1 rounded text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                title={t('fontSize')}
              >
                {textSizes.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>

              <ToolbarSeparator isDarkMode={isDarkMode} />

              <ToolbarButton icon={Bold} onClick={() => formatText('bold')} title={t('bold')} isDarkMode={isDarkMode} />
              <ToolbarButton icon={Italic} onClick={() => formatText('italic')} title={t('italic')} isDarkMode={isDarkMode} />
              <ToolbarButton icon={Underline} onClick={() => formatText('underline')} title={t('underline')} isDarkMode={isDarkMode} />
              
              <ToolbarSeparator isDarkMode={isDarkMode} />
              
              <div className="relative" data-dropdown="color">
                <ToolbarButton 
                  icon={Palette} 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }} 
                  title={t('textColor')} 
                  isDarkMode={isDarkMode}
                />
                {showColorPicker && (
                  <div className={`absolute top-10 left-0 p-2 rounded-lg shadow-lg z-10 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="grid grid-cols-5 gap-1">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            formatText('foreColor', color);
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-gray-400"
                          style={{backgroundColor: color}}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <ToolbarButton icon={Link} onClick={() => setShowLinkDialog(true)} title={t('addLink')} isDarkMode={isDarkMode} />
              
              <ToolbarSeparator isDarkMode={isDarkMode} />
              
              <ToolbarButton icon={AlignLeft} onClick={() => formatText('justifyLeft')} title={t('alignLeft')} isDarkMode={isDarkMode} />
              <ToolbarButton icon={AlignCenter} onClick={() => formatText('justifyCenter')} title={t('alignCenter')} isDarkMode={isDarkMode} />
              <ToolbarButton icon={AlignRight} onClick={() => formatText('justifyRight')} title={t('alignRight')} isDarkMode={isDarkMode} />
              
              <ToolbarSeparator isDarkMode={isDarkMode} />
              
              <div className="relative" data-dropdown="line-spacing">
                <ToolbarButton 
                  icon={MoveVertical} 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowLineSpacing(!showLineSpacing);
                  }} 
                  title={t('lineSpacing')} 
                  isDarkMode={isDarkMode}
                />
                {showLineSpacing && (
                  <div className={`absolute top-10 left-0 p-2 rounded-lg shadow-lg z-10 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex flex-col gap-1">
                      {lineSpacings.map(spacing => (
                        <button
                          key={spacing.value}
                          onClick={() => {
                            if (editorRef.current) {
                              editorRef.current.style.lineHeight = spacing.value;
                            }
                            setShowLineSpacing(false);
                          }}
                          className={`px-3 py-1 text-sm text-left rounded hover:bg-opacity-10 ${
                            isDarkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-black text-gray-700'
                          }`}
                        >
                          {spacing.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <ToolbarSeparator isDarkMode={isDarkMode} />
              
              <ToolbarButton 
                icon={List} 
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  formatText('insertUnorderedList');
                }} 
                title={t('bulletList')} 
                isDarkMode={isDarkMode}
              />
              <ToolbarButton 
                icon={ListOrdered} 
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  formatText('insertOrderedList');
                }} 
                title={t('numberedList')} 
                isDarkMode={isDarkMode}
              />
              <ToolbarButton icon={IndentDecrease} onClick={() => formatText('outdent')} title={t('decreaseIndent')} isDarkMode={isDarkMode} />
              <ToolbarButton icon={IndentIncrease} onClick={() => formatText('indent')} title={t('increaseIndent')} isDarkMode={isDarkMode} />
            </div>

            {/* Link Dialog */}
            {showLinkDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('addLinkTitle')}
                  </h3>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder={t('enterUrl')}
                    className={`w-64 px-3 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={insertLink}
                      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      {t('add')}
                    </button>
                    <button
                      onClick={() => {
                        setShowLinkDialog(false);
                        setLinkUrl('');
                      }}
                      className={`px-4 py-2 rounded ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Rich Text Editor with improved list styles */}
            <style 
              dangerouslySetInnerHTML={{ __html: `
              [contenteditable] {
                outline: none;
              }
              [contenteditable] ul,
              [contenteditable] ol {
                margin: 8px 0;
                padding-left: 24px;
                font-family: inherit;
                font-size: inherit;
              }
              [contenteditable] li {
                margin: 4px 0;
                font-family: inherit;
                font-size: inherit;
                list-style-position: outside;
              }
              [contenteditable] ul {
                list-style-type: disc;
              }
              [contenteditable] ol {
                list-style-type: decimal;
              }
              [contenteditable] ul ul {
                list-style-type: circle;
              }
              [contenteditable] ul ul ul {
                list-style-type: square;
              }
              [contenteditable]:empty:before {
                content: "";
                display: inline-block;
              }
              [contenteditable] div {
                font-family: inherit;
                font-size: inherit;
                margin: 0;
                padding: 0;
                min-height: 1.2em;
              }
              [contenteditable] li > div {
                display: inline;
              }
              ${isDarkMode ? `
                [contenteditable] li::marker {
                  color: #d1d5db;
                }
              ` : ''}
            `}} />
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={updateContent}
              onPaste={handlePaste}
              onCopy={handleCopy}
              className={`w-full h-96 p-4 rounded-lg border transition-colors overflow-y-auto focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700 text-white focus:ring-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-400'
              }`}
              style={{ 
                minHeight: '24rem',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                lineHeight: '1.5',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            />
            
            <div className="mt-4 flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {text.length} {t('characters')}
              </span>
              <button
                onClick={analyzeText}
                disabled={isAnalyzing || !text.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2 ${
                  isAnalyzing || !text.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t('analyzeText')}
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Suggestions Panel */}
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('suggestions')}
            </h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? `${category.color} text-white`
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  {suggestions.filter(s => category.id === 'all' || s.category === category.id).length > 0 && (
                    <span className="ml-1">
                      ({suggestions.filter(s => category.id === 'all' || s.category === category.id).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSuggestions.length === 0 ? (
                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {suggestions.length === 0 
                    ? t('clickAnalyzeText')
                    : t('noSuggestionsCategory')}
                </div>
              ) : (
                filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(suggestion.category)}`}>
                          {suggestion.category}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: {
                              grammar: 'rgba(59, 130, 246, 0.5)',
                              spelling: 'rgba(239, 68, 68, 0.5)',
                              punctuation: 'rgba(245, 158, 11, 0.5)',
                              style: 'rgba(34, 197, 94, 0.5)',
                              clarity: 'rgba(99, 102, 241, 0.5)'
                            }[suggestion.category] || 'rgba(147, 51, 234, 0.5)'
                          }}
                          title={t('textHighlightColor')}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          className="p-1 rounded hover:bg-green-500/20 text-green-500 transition-colors"
                          title={t('applySuggestion')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => dismissSuggestion(suggestion)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                          title={t('dismiss')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`line-through ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {suggestion.issue}
                        </span>
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
                        <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {suggestion.suggestion}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {suggestion.explanation}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {suggestions.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => {
                    if (!editorRef.current) return;
                    
                    // Get content without highlights
                    let content = editorRef.current.innerHTML;
                    content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
                    
                    // Escape special characters for HTML
                    const escapeHtml = (text: string) => {
                      return text
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    };
                    
                    // Apply all suggestions
                    suggestions.forEach(suggestion => {
                      const issueText = suggestion.issue;
                      const replacementText = suggestion.suggestion;
                      
                      // Try multiple patterns
                      const patterns = [
                        issueText,
                        escapeHtml(issueText),
                        issueText.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
                      ];
                      
                      for (const pattern of patterns) {
                        if (content.includes(pattern)) {
                          content = content.replace(pattern, escapeHtml(replacementText));
                          break;
                        }
                      }
                    });
                    
                    // Update editor
                    editorRef.current.innerHTML = content;
                    updateContent();
                    
                    // Clear all suggestions
                    setSuggestions([]);
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  {t('applyAllSuggestions')}
                </button>
              </div>
            )}

            {/* Suggestion Tooltip */}
            {activeTooltip && (
              <div
                data-tooltip
                className={`absolute z-20 p-3 rounded-lg shadow-xl border ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
                style={{
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                  transform: tooltipPosition.isBelow ? 'translateX(-50%)' : 'translate(-50%, -100%)',
                  maxWidth: '300px'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(activeTooltip.category)}`}>
                    {activeTooltip.category}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`line-through ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {activeTooltip.issue}
                    </span>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
                    <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {activeTooltip.suggestion}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {activeTooltip.explanation}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => applySuggestion(activeTooltip)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    {t('accept')}
                  </button>
                  <button
                    onClick={() => {
                      dismissSuggestion(activeTooltip);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    {t('reject')}
                  </button>
                  <button
                    onClick={() => setActiveTooltip(null)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('cancel')}
                  </button>
                </div>
                
                {/* Tooltip arrow */}
                <div 
                  className={`absolute w-3 h-3 transform rotate-45 ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  }`}
                  style={{
                    ...(tooltipPosition.isBelow ? {
                      top: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      borderLeft: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    } : {
                      bottom: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    })
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Credit Footer */}
      <div className={`mt-8 text-center py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-sm flex items-center justify-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Created with
          <span className="text-red-500 animate-pulse text-base">❤️</span>
          by
          <span className={`font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            Anubhav
          </span>
        </p>
      </div>
    </div>
  );
};

export default TextEditor;