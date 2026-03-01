import React, { useState } from 'react';
import { DynamicFormSchema } from '../types';
import { Button, Card, Input, Select, Checkbox, Textarea } from './ui';
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, File as FileIcon, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { verifyAndExtractDocument } from '../services/geminiService';
import { extractXFAFromPdf } from '../utils/pdfExtractor';

interface DynamicFormProps {
  schema: DynamicFormSchema;
  processedFiles?: { type: 'pdf' | 'xfa', content: string, name: string }[];
  onReset: () => void;
}

export function DynamicForm({ schema, processedFiles = [], onReset }: DynamicFormProps) {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<Record<string, File | null>>({});
  const [docStatus, setDocStatus] = useState<Record<string, { loading: boolean; error?: string; success?: string }>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const steps = [];
  if (schema.documents && schema.documents.length > 0) {
    steps.push({
      id: 'documents',
      title: t('step_documents'),
      description: t('documents_desc', 'Please upload the required documents first. We will analyze them to auto-fill the rest of your form.'),
      fields: []
    });
  }
  steps.push(...schema.steps);
  steps.push({
    id: 'review',
    title: t('step_review'),
    description: t('review_desc'),
    fields: []
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData, documents);
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  const updateField = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
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

  const handleFileChange = async (docId: string, docTitle: string, docDesc: string, file: File | null) => {
    if (!file) {
      setDocuments(prev => ({ ...prev, [docId]: null }));
      setDocStatus(prev => ({ ...prev, [docId]: { loading: false } }));
      return;
    }

    setDocStatus(prev => ({ ...prev, [docId]: { loading: true, error: undefined, success: undefined } }));

    try {
      const base64 = await fileToBase64(file);
      
      let fileData: { type: 'pdf' | 'xfa' | 'image', content: string, mimeType: string } = {
        type: file.type === 'application/pdf' ? 'pdf' : 'image',
        content: base64,
        mimeType: file.type
      };

      if (file.type === 'application/pdf') {
        const xfaData = await extractXFAFromPdf(base64);
        if (xfaData) {
          fileData = { type: 'xfa', content: xfaData, mimeType: file.type };
        }
      }

      const result = await verifyAndExtractDocument(fileData, docTitle, docDesc, schema, i18n.language);

      if (result.isValid) {
        setDocuments(prev => ({ ...prev, [docId]: file }));
        setDocStatus(prev => ({ ...prev, [docId]: { loading: false, success: result.reason } }));
        
        if (result.extractedData && Object.keys(result.extractedData).length > 0) {
          setFormData(prev => ({ ...prev, ...result.extractedData }));
        }
      } else {
        setDocuments(prev => ({ ...prev, [docId]: null }));
        setDocStatus(prev => ({ ...prev, [docId]: { loading: false, error: result.reason } }));
        // Reset the file input so they can try again
        const input = document.getElementById(`file-${docId}`) as HTMLInputElement;
        if (input) input.value = '';
      }
    } catch (err) {
      console.error(err);
      setDocuments(prev => ({ ...prev, [docId]: null }));
      setDocStatus(prev => ({ ...prev, [docId]: { loading: false, error: t('upload_error', 'Failed to analyze document. Please try again.') } }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('success_title')}</h2>
          <p className="text-slate-600 mb-8">
            {t('success_desc')}
          </p>
          <Button onClick={onReset} className="w-full">
            {t('start_new')}
          </Button>
        </Card>
      </div>
    );
  }

  const renderField = (field: any) => {
    const value = formData[field.id] || '';
    switch (field.type) {
      case 'text':
      case 'date':
      case 'number':
        return (
          <Input 
            key={field.id} 
            type={field.type} 
            label={field.label} 
            value={value} 
            onChange={e => updateField(field.id, e.target.value)} 
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea 
            key={field.id} 
            label={field.label} 
            value={value} 
            onChange={e => updateField(field.id, e.target.value)} 
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select 
            key={field.id} 
            label={field.label} 
            value={value} 
            onChange={e => updateField(field.id, e.target.value)} 
            options={field.options || []}
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <Checkbox 
            key={field.id} 
            label={field.label} 
            checked={!!formData[field.id]} 
            onChange={e => updateField(field.id, e.target.checked)} 
          />
        );
      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="md:w-64 shrink-0">
        <nav className="sticky top-24">
          <ul className="space-y-2">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              return (
                <li key={step.id}>
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : isPast
                          ? 'text-slate-600 hover:bg-slate-100'
                          : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isActive ? 'bg-indigo-600 text-white' : isPast ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    {step.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Form Content */}
      <div className="flex-1">
        <Card className="p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{currentStepData.title}</h2>
            {currentStepData.description && <p className="text-slate-500 mt-1">{currentStepData.description}</p>}
          </div>

          <div className="min-h-[400px]">
            {currentStepData.id === 'documents' ? (
              <div className="grid grid-cols-1 gap-6">
                {schema.documents.map((doc) => {
                  const file = documents[doc.id];
                  const status = docStatus[doc.id] || { loading: false };
                  
                  return (
                    <div key={doc.id} className={`flex flex-col p-5 bg-white rounded-xl border shadow-sm gap-4 transition-colors ${status.error ? 'border-red-300 bg-red-50/30' : status.success ? 'border-green-300 bg-green-50/30' : 'border-slate-200'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{doc.title}</h4>
                          <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                        </div>
                        <div className="shrink-0">
                          <input
                            type="file"
                            id={`file-${doc.id}`}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(doc.id, doc.title, doc.description, e.target.files?.[0] || null)}
                          />
                          {status.loading ? (
                            <Button variant="outline" disabled className="w-[140px]">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('analyzing', 'Analyzing...')}
                            </Button>
                          ) : file ? (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg max-w-[200px] truncate border border-indigo-100">
                                <FileIcon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button variant="outline" onClick={() => handleFileChange(doc.id, doc.title, doc.description, null)} className="px-2 py-1.5 h-auto">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" onClick={() => document.getElementById(`file-${doc.id}`)?.click()} className="w-[140px]">
                              <Upload className="w-4 h-4 mr-2" /> {t('upload_btn')}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {status.error && (
                        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>{status.error}</p>
                        </div>
                      )}
                      
                      {status.success && (
                        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>{status.success}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : currentStepData.id === 'review' ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('review_title')}</h3>
                  <div className="space-y-6">
                    {schema.steps.map(step => (
                      <div key={step.id}>
                        <h4 className="font-medium text-slate-700 mb-2 border-b border-slate-200 pb-1">{step.title}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                          {step.fields.map(field => (
                            <React.Fragment key={field.id}>
                              <div className="text-slate-500">{field.label}</div>
                              <div className="font-medium text-slate-900">
                                {field.type === 'checkbox' 
                                  ? (formData[field.id] ? 'Yes' : 'No') 
                                  : (formData[field.id] || '-')}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentStepData.fields.map(field => (
                  <div key={field.id} className={field.type === 'textarea' || field.type === 'checkbox' ? 'md:col-span-2' : ''}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrev} 
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> {t('btn_back')}
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit}>
                {t('btn_submit')} <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {t('btn_continue')} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
