import React, { useState, useRef, useEffect } from 'react';
import { DynamicFormSchema } from './types';
import { DynamicForm } from './components/DynamicForm';
import { Button, Card } from './components/ui';
import { FileText, Globe, UploadCloud, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { analyzeImmigrationForm, translateSchema } from './services/geminiService';

import { hashString } from './utils/hash';
import { extractXFAFromPdf } from './utils/pdfExtractor';

export default function App() {
  const { t, i18n } = useTranslation();
  const [schema, setSchema] = useState<DynamicFormSchema | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<{ type: 'pdf' | 'xfa', content: string, name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const changeLanguage = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    
    if (schema && currentHash) {
      setIsTranslating(true);
      try {
        // Check cache first
        try {
          const cacheRes = await fetch(`/api/cache/${currentHash}/${newLang}`);
          if (cacheRes.ok) {
            const cacheData = await cacheRes.json();
            if (cacheData.found && cacheData.schema) {
              setSchema(cacheData.schema);
              setIsTranslating(false);
              return;
            }
          }
        } catch (cacheErr) {
          console.warn("Cache read failed, falling back to API", cacheErr);
        }

        const translatedSchema = await translateSchema(schema, newLang);
        setSchema(translatedSchema);

        // Save to cache
        try {
          await fetch('/api/cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hash: currentHash, language: newLang, schema: translatedSchema })
          });
        } catch (cacheErr) {
          console.warn("Cache write failed", cacheErr);
        }

      } catch (err) {
        console.error("Failed to translate schema", err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type === 'application/pdf');
    if (validFiles.length !== files.length) {
      setError(t('invalid_pdf', 'Please upload only valid PDF files.'));
    } else {
      setError(null);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerateForm = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const base64Promises = selectedFiles.map(file => fileToBase64(file));
      const base64Pdfs = await Promise.all(base64Promises);
      
      // Create a hash of all PDFs combined to use as cache key
      const combinedBase64 = base64Pdfs.join('');
      const hash = await hashString(combinedBase64);
      const lang = i18n.language;
      setCurrentHash(hash);

      // Check cache first
      try {
        const cacheRes = await fetch(`/api/cache/${hash}/${lang}`);
        if (cacheRes.ok) {
          const cacheData = await cacheRes.json();
          if (cacheData.found && cacheData.schema) {
            setSchema(cacheData.schema);
            setIsAnalyzing(false);
            return;
          }
        }
      } catch (cacheErr) {
        console.warn("Cache read failed, falling back to API", cacheErr);
      }
      
      // Extract XFA data if present
      const processedFilesData = await Promise.all(base64Pdfs.map(async (base64, index) => {
        const xfaData = await extractXFAFromPdf(base64);
        if (xfaData) {
          return { type: 'xfa' as const, content: xfaData, name: selectedFiles[index].name };
        }
        return { type: 'pdf' as const, content: base64, name: selectedFiles[index].name };
      }));
      
      setProcessedFiles(processedFilesData);
      const generatedSchema = await analyzeImmigrationForm(processedFilesData, lang);
      setSchema(generatedSchema);

      // Save to cache
      try {
        await fetch('/api/cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash, language: lang, schema: generatedSchema })
        });
      } catch (cacheErr) {
        console.warn("Cache write failed", cacheErr);
      }

    } catch (err) {
      console.error(err);
      setError(t('upload_error', 'Failed to analyze the PDFs. Please try again.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 leading-tight">
                {schema ? schema.title : t('app_title')}
              </h1>
              <p className="text-xs text-slate-500">
                {schema ? schema.subtitle : t('app_subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <select 
              className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
              value={i18n.language}
              onChange={changeLanguage}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="zh">中文</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full relative">
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-slate-700 font-medium">{t('translating', 'Translating form...')}</p>
            </div>
          </div>
        )}
        {!schema ? (
          <div className="h-full flex items-center justify-center min-h-[600px]">
            <Card className="max-w-lg w-full p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('upload_title', 'Upload Immigration Forms')}</h2>
              <p className="text-slate-600 mb-8">
                {t('upload_desc', 'Upload one or more Canadian immigration PDF forms (IMM or FO). We will analyze them, combine duplicate fields, and generate a simple, guided questionnaire for you to fill out.')}
              </p>
              
              <input 
                type="file" 
                accept=".pdf" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  className="w-full py-4 text-base border-dashed border-2 hover:bg-slate-50" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  <FileText className="w-5 h-5 mr-3 text-slate-400" />
                  {t('select_pdf', 'Select PDF Forms')}
                </Button>

                {selectedFiles.length > 0 && (
                  <div className="text-left space-y-2 mt-4">
                    <h3 className="text-sm font-medium text-slate-700">Selected Files:</h3>
                    <ul className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                          <span className="text-sm text-slate-600 truncate mr-2">{file.name}</span>
                          <button 
                            onClick={() => removeFile(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            disabled={isAnalyzing}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedFiles.length > 0 && (
                  <Button 
                    className="w-full py-4 text-base mt-6" 
                    onClick={handleGenerateForm}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        {t('analyzing', 'Analyzing PDFs...')}
                      </>
                    ) : (
                      <>
                        {t('generate_form', 'Generate Combined Form')}
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {error && (
                <p className="text-red-500 text-sm mt-4">{error}</p>
              )}
            </Card>
          </div>
        ) : (
          <DynamicForm 
            schema={schema} 
            processedFiles={processedFiles}
            onReset={() => { setSchema(null); setSelectedFiles([]); setCurrentHash(null); setProcessedFiles([]); }} 
          />
        )}
      </main>
    </div>
  );
}
