import React, { useRef } from 'react';
import { FormData } from '../types';
import { Input, Select, Checkbox, Button, Textarea } from './ui';
import { Plus, Trash2, Upload, File as FileIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function PersonalInfo({ data, updateData }: StepProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('identity_info')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t('family_name')} value={data.lastName} onChange={e => updateData({ lastName: e.target.value })} />
          <Input label={t('given_name')} value={data.firstName} onChange={e => updateData({ firstName: e.target.value })} />
          <Select label={t('gender')} value={data.gender} onChange={e => updateData({ gender: e.target.value })} options={[{ value: 'Female', label: 'Female' }, { value: 'Male', label: 'Male' }, { value: 'Other', label: 'Other' }]} />
          <Input label={t('dob')} type="date" value={data.dob} onChange={e => updateData({ dob: e.target.value })} />
          <Input label={t('passport_num')} value={data.passportNumber} onChange={e => updateData({ passportNumber: e.target.value })} />
          <Input label={t('citizenship')} value={data.citizenship} onChange={e => updateData({ citizenship: e.target.value })} />
          <Input label={t('passport_issue')} type="date" value={data.passportIssueDate} onChange={e => updateData({ passportIssueDate: e.target.value })} />
          <Input label={t('passport_expiry')} type="date" value={data.passportExpiryDate} onChange={e => updateData({ passportExpiryDate: e.target.value })} />
          <Input label={t('national_id')} value={data.nationalId} onChange={e => updateData({ nationalId: e.target.value })} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('place_of_birth')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label={t('city')} value={data.birthCity} onChange={e => updateData({ birthCity: e.target.value })} />
          <Input label={t('state')} value={data.birthState} onChange={e => updateData({ birthState: e.target.value })} />
          <Input label={t('country')} value={data.birthCountry} onChange={e => updateData({ birthCountry: e.target.value })} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('contact_residence')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label={t('phone')} type="tel" value={data.phone} onChange={e => updateData({ phone: e.target.value })} />
          <Input label={t('email')} type="email" value={data.email} onChange={e => updateData({ email: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t('street')} className="md:col-span-2" value={data.residenceAddress} onChange={e => updateData({ residenceAddress: e.target.value })} />
          <Input label={t('city')} value={data.residenceCity} onChange={e => updateData({ residenceCity: e.target.value })} />
          <Input label={t('state')} value={data.residenceState} onChange={e => updateData({ residenceState: e.target.value })} />
          <Input label={t('zip')} value={data.residenceZip} onChange={e => updateData({ residenceZip: e.target.value })} />
          <Input label={t('country')} value={data.residenceCountry} onChange={e => updateData({ residenceCountry: e.target.value })} />
        </div>
        
        <div className="mt-6 space-y-4">
          <Checkbox 
            label={t('reside_quebec')} 
            checked={data.residesInQuebec} 
            onChange={e => updateData({ residesInQuebec: e.target.checked })} 
          />
          {data.residesInQuebec && (
            <Input label={t('quebec_status')} value={data.quebecStatus} onChange={e => updateData({ quebecStatus: e.target.value })} />
          )}
        </div>
      </div>
    </div>
  );
}

export function ImmigrationHistory({ data, updateData }: StepProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('prev_apps')}</h3>
        <Checkbox 
          label={t('prev_apps_q')} 
          checked={data.previousApplication} 
          onChange={e => updateData({ previousApplication: e.target.checked })} 
        />
        {data.previousApplication && (
          <div className="mt-4">
            <Input label={t('prev_app_num')} value={data.previousAppNumber} onChange={e => updateData({ previousAppNumber: e.target.value })} />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{t('quebec_stays')}</h3>
          <Button variant="outline" type="button" onClick={() => updateData({ quebecStays: [...data.quebecStays, { type: '', startDate: '', endDate: '' }] })}>
            <Plus className="w-4 h-4 mr-2" /> {t('add_stay')}
          </Button>
        </div>
        
        {data.quebecStays.length === 0 ? (
          <p className="text-sm text-slate-500 italic">{t('no_stays')}</p>
        ) : (
          <div className="space-y-4">
            {data.quebecStays.map((stay, index) => (
              <div key={index} className="flex items-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <Select 
                  label={t('permit_type')} 
                  value={stay.type} 
                  onChange={e => {
                    const newStays = [...data.quebecStays];
                    newStays[index].type = e.target.value;
                    updateData({ quebecStays: newStays });
                  }}
                  options={[
                    { value: 'Study Permit', label: 'Study Permit' },
                    { value: 'Work Permit', label: 'Work Permit' },
                    { value: 'Visitor Record', label: 'Visitor Record' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  className="flex-1"
                />
                <Input type="date" label={t('start_date')} value={stay.startDate} onChange={e => {
                  const newStays = [...data.quebecStays];
                  newStays[index].startDate = e.target.value;
                  updateData({ quebecStays: newStays });
                }} />
                <Input type="date" label={t('end_date')} value={stay.endDate} onChange={e => {
                  const newStays = [...data.quebecStays];
                  newStays[index].endDate = e.target.value;
                  updateData({ quebecStays: newStays });
                }} />
                <Button variant="danger" type="button" onClick={() => {
                  const newStays = data.quebecStays.filter((_, i) => i !== index);
                  updateData({ quebecStays: newStays });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmploymentDetails({ data, updateData }: StepProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('tfwp_stream')}</h3>
        <Select 
          label={t('select_stream')} 
          value={data.tfwpStream} 
          onChange={e => updateData({ tfwpStream: e.target.value })}
          options={[
            { value: 'Global Talent Stream', label: 'Global Talent Stream' },
            { value: 'Home Child Care Provider', label: 'Home Child Care Provider' },
            { value: 'Primary Agriculture', label: 'Primary Agriculture' },
            { value: 'High-wage', label: 'High-wage' },
            { value: 'Low-wage', label: 'Low-wage' }
          ]}
        />
        {(data.tfwpStream === 'High-wage' || data.tfwpStream === 'Low-wage') && (
          <div className="mt-4">
            <Checkbox 
              label={t('simplified_processing')} 
              checked={data.simplifiedProcessing} 
              onChange={e => updateData({ simplifiedProcessing: e.target.checked })} 
            />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('employer_info')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t('company_name')} value={data.companyName} onChange={e => updateData({ companyName: e.target.value })} />
          <Input label={t('req_number')} value={data.reqNumber} onChange={e => updateData({ reqNumber: e.target.value })} />
          <Input label={t('company_address')} className="md:col-span-2" value={data.companyAddress} onChange={e => updateData({ companyAddress: e.target.value })} />
        </div>
        <div className="mt-4">
          <Checkbox 
            label={t('control_company')} 
            checked={data.controlOverCompany} 
            onChange={e => updateData({ controlOverCompany: e.target.checked })} 
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('job_offer_details')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t('job_title')} value={data.jobTitle} onChange={e => updateData({ jobTitle: e.target.value })} />
          <Input label={t('noc_code')} value={data.nocCode} onChange={e => updateData({ nocCode: e.target.value })} />
          <Input label={t('noc_name')} className="md:col-span-2" value={data.nocName} onChange={e => updateData({ nocName: e.target.value })} />
          <Textarea label={t('job_tasks')} className="md:col-span-2" value={data.jobTasks} onChange={e => updateData({ jobTasks: e.target.value })} />
          <Input label={t('job_address')} className="md:col-span-2" value={data.jobAddress} onChange={e => updateData({ jobAddress: e.target.value })} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('current_employment')}</h3>
        <Checkbox 
          label={t('currently_employed')} 
          checked={data.currentlyEmployed} 
          onChange={e => updateData({ currentlyEmployed: e.target.checked })} 
        />
        {data.currentlyEmployed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input type="date" label={t('since_when')} value={data.currentEmploymentStartDate} onChange={e => updateData({ currentEmploymentStartDate: e.target.value })} />
            <Input label={t('hourly_wage')} type="number" step="0.01" value={data.currentHourlyWage} onChange={e => updateData({ currentHourlyWage: e.target.value })} />
            <Input label={t('hours_per_week')} type="number" value={data.currentHoursPerWeek} onChange={e => updateData({ currentHoursPerWeek: e.target.value })} />
          </div>
        )}
      </div>

      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <Checkbox 
          label={t('commit_stay')} 
          checked={data.commitToStay} 
          onChange={e => updateData({ commitToStay: e.target.checked })} 
        />
      </div>
    </div>
  );
}

export function EducationExperience({ data, updateData }: StepProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{t('education')}</h3>
          <Button variant="outline" type="button" onClick={() => updateData({ education: [...data.education, { institution: '', country: '', diploma: '', field: '', startDate: '', endDate: '' }] })}>
            <Plus className="w-4 h-4 mr-2" /> {t('add_education')}
          </Button>
        </div>
        
        {data.education.length === 0 ? (
          <p className="text-sm text-slate-500 italic">{t('no_education')}</p>
        ) : (
          <div className="space-y-6">
            {data.education.map((edu, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                <Button variant="danger" type="button" className="absolute top-4 right-4 px-2 py-1" onClick={() => {
                  const newEdu = data.education.filter((_, i) => i !== index);
                  updateData({ education: newEdu });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                  <Input label={t('institution')} value={edu.institution} onChange={e => {
                    const newEdu = [...data.education]; newEdu[index].institution = e.target.value; updateData({ education: newEdu });
                  }} />
                  <Input label={t('country')} value={edu.country} onChange={e => {
                    const newEdu = [...data.education]; newEdu[index].country = e.target.value; updateData({ education: newEdu });
                  }} />
                  <Input label={t('diploma')} value={edu.diploma} onChange={e => {
                    const newEdu = [...data.education]; newEdu[index].diploma = e.target.value; updateData({ education: newEdu });
                  }} />
                  <Input label={t('field')} value={edu.field} onChange={e => {
                    const newEdu = [...data.education]; newEdu[index].field = e.target.value; updateData({ education: newEdu });
                  }} />
                  <Input type="month" label={t('start_date')} value={edu.startDate} onChange={e => {
                    const newEdu = [...data.education]; newEdu[index].startDate = e.target.value; updateData({ education: newEdu });
                  }} />
                  <Input type="month" label={t('end_date')} value={edu.endDate} onChange={e => {
                    const newEdu = [...data.education]; newEdu[index].endDate = e.target.value; updateData({ education: newEdu });
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{t('work_experience')}</h3>
          <Button variant="outline" type="button" onClick={() => updateData({ experience: [...data.experience, { company: '', city: '', country: '', jobTitle: '', hoursPerWeek: '', startDate: '', endDate: '', tasks: '' }] })}>
            <Plus className="w-4 h-4 mr-2" /> {t('add_experience')}
          </Button>
        </div>
        
        {data.experience.length === 0 ? (
          <p className="text-sm text-slate-500 italic">{t('no_experience')}</p>
        ) : (
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                <Button variant="danger" type="button" className="absolute top-4 right-4 px-2 py-1" onClick={() => {
                  const newExp = data.experience.filter((_, i) => i !== index);
                  updateData({ experience: newExp });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                  <Input label={t('company_name')} className="md:col-span-2" value={exp.company} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].company = e.target.value; updateData({ experience: newExp });
                  }} />
                  <Input label={t('city')} value={exp.city} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].city = e.target.value; updateData({ experience: newExp });
                  }} />
                  <Input label={t('country')} value={exp.country} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].country = e.target.value; updateData({ experience: newExp });
                  }} />
                  <Input label={t('job_title')} value={exp.jobTitle} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].jobTitle = e.target.value; updateData({ experience: newExp });
                  }} />
                  <Input label={t('hours_per_week')} type="number" value={exp.hoursPerWeek} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].hoursPerWeek = e.target.value; updateData({ experience: newExp });
                  }} />
                  <Input type="month" label={t('start_date')} value={exp.startDate} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].startDate = e.target.value; updateData({ experience: newExp });
                  }} />
                  <Input type="month" label={t('end_date')} value={exp.endDate} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].endDate = e.target.value; updateData({ experience: newExp });
                  }} />
                  <Textarea label={t('main_tasks')} className="md:col-span-2" value={exp.tasks} onChange={e => {
                    const newExp = [...data.experience]; newExp[index].tasks = e.target.value; updateData({ experience: newExp });
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentChecklist({ data, updateData }: StepProps) {
  const { t } = useTranslation();
  
  const documentsList = [
    { id: 'passport', title: t('doc_passport'), desc: t('doc_passport_desc') },
    { id: 'permits', title: t('doc_permits'), desc: t('doc_permits_desc') },
    { id: 'diplomas', title: t('doc_diplomas'), desc: t('doc_diplomas_desc') },
    { id: 'tax_returns', title: t('doc_tax'), desc: t('doc_tax_desc') },
    { id: 'employment_letters', title: t('doc_emp_letters'), desc: t('doc_emp_letters_desc') },
    { id: 'legal_experience', title: t('doc_legal_exp'), desc: t('doc_legal_exp_desc') },
    { id: 'cv', title: t('doc_cv'), desc: t('doc_cv_desc') },
    { id: 'employment_contract', title: t('doc_contract'), desc: t('doc_contract_desc') },
    { id: 'professional_license', title: t('doc_license'), desc: t('doc_license_desc') },
    { id: 'drivers_license', title: t('doc_drivers'), desc: t('doc_drivers_desc') },
    { id: 'language_proof', title: t('doc_language'), desc: t('doc_language_desc') },
    { id: 'pay_stubs', title: t('doc_paystubs'), desc: t('doc_paystubs_desc') },
    { id: 'proof_relationship', title: t('doc_relationship'), desc: t('doc_relationship_desc') },
  ];

  const handleFileChange = (id: string, file: File | null) => {
    updateData({
      documents: {
        ...data.documents,
        [id]: file
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('documents_title')}</h3>
        <p className="text-slate-600 mb-6">{t('documents_desc')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documentsList.map((doc) => {
          const file = data.documents[doc.id];
          return (
            <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{doc.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{doc.desc}</p>
              </div>
              <div className="shrink-0">
                <input
                  type="file"
                  id={`file-${doc.id}`}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg max-w-[200px] truncate">
                      <FileIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button variant="outline" onClick={() => handleFileChange(doc.id, null)} className="px-2 py-1.5 h-auto">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => document.getElementById(`file-${doc.id}`)?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> {t('upload_btn')}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Review({ data }: { data: FormData }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('review_title')}</h3>
        <p className="text-slate-600 mb-4">{t('review_desc')}</p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-slate-500">{t('full_name')}</div>
            <div className="font-medium text-slate-900">{data.firstName} {data.lastName}</div>
            
            <div className="text-slate-500">{t('passport_num')}</div>
            <div className="font-medium text-slate-900">{data.passportNumber || '-'}</div>
            
            <div className="text-slate-500">{t('job_offer')}</div>
            <div className="font-medium text-slate-900">{data.jobTitle || '-'} at {data.companyName || '-'}</div>
            
            <div className="text-slate-500">{t('tfwp_stream')}</div>
            <div className="font-medium text-slate-900">{data.tfwpStream || '-'}</div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm">
        <p className="font-semibold mb-2">{t('declaration')}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('dec_1')}</li>
          <li>{t('dec_2')}</li>
          <li>{t('dec_3')}</li>
        </ul>
      </div>
    </div>
  );
}
