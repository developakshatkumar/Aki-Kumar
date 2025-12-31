
import React, { useState } from 'react';
import { AnalysisResult, Medication } from '../types';

interface ReportDisplayProps {
  analysis: AnalysisResult;
  onBack: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ analysis, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'action'>('summary');

  const exportAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `DocAssist_${analysis.docType}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportToCalendar = (med: Medication) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Take ${med.name}
DESCRIPTION:${med.use} - ${med.frequency}
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DURATION:PT10M
RRULE:FREQ=DAILY;COUNT=30
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${med.name.replace(/\s+/g, '_')}_Schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUrgencyBadge = () => {
    const base = "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ";
    switch (analysis.urgencyLevel) {
      case 'urgent': return <span className={base + "bg-[#fce8e6] text-[#d93025]"}>Urgent</span>;
      case 'soon': return <span className={base + "bg-[#fff4e5] text-[#e67c00]"}>Soon</span>;
      default: return <span className={base + "bg-[#e6f4ea] text-[#1e8e3e]"}>Routine</span>;
    }
  };

  const isMedical = analysis.docType === 'report' || analysis.docType === 'prescription';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-xl shadow-sm border border-[#dadce0] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors text-[#5f6368]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl md:text-2xl font-medium text-[#202124]">
                  {analysis.docType === 'prescription' ? 'Prescription Insight' : 
                   analysis.docType === 'report' ? 'Medical Findings' : 'Document Insight'}
                </h2>
                {isMedical && getUrgencyBadge()}
              </div>
              <p className="text-xs text-[#70757a] font-medium mt-1">
                Analyzed on {analysis.reportDate || new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] rounded-md transition-colors border border-[#dadce0]">Print</button>
            <button onClick={exportAsJson} className="btn-primary px-5 py-2 text-sm font-medium rounded-md shadow-sm transition-all">Export JSON</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#dadce0] overflow-hidden">
        <div className="flex border-b border-[#dadce0] bg-[#f8f9fa] overflow-x-auto no-scrollbar">
          {[
            { id: 'summary', label: 'Overview' },
            { id: 'details', label: analysis.docType === 'prescription' ? 'Medications' : 'Key Findings' },
            { id: 'action', label: 'Prep Guide' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {activeTab === 'summary' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-medium text-[#202124] mb-4">Summary</h3>
                    <div className="bg-[#f8f9fa] p-6 rounded-lg border border-[#dadce0] relative">
                      <p className="text-[#3c4043] leading-relaxed text-base italic">"{analysis.summary}"</p>
                    </div>
                  </section>

                  {analysis.groundingLinks && analysis.groundingLinks.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-[#70757a] uppercase tracking-wider mb-3">Verified Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.groundingLinks.map((link, i) => (
                          <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f3f4] text-[#1a73e8] text-xs font-medium rounded-md hover:bg-[#e8f0fe] border border-[#dadce0] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            {link.title}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {analysis.redFlags.length > 0 && (
                    <section className="bg-[#fce8e6] p-6 rounded-lg border border-[#f5c6cb]">
                      <h3 className="text-base font-bold text-[#d93025] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" clipRule="evenodd" /></svg>
                        Urgent Red Flags
                      </h3>
                      <ul className="list-disc list-inside text-[#3c4043] space-y-2 text-sm font-medium">
                        {analysis.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                      </ul>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  {analysis.docType === 'prescription' && analysis.medicines ? (
                    <div className="grid gap-6">
                      {analysis.medicines.map((med, i) => (
                        <div key={i} className="bg-white border border-[#dadce0] rounded-xl overflow-hidden card">
                          <div className="bg-[#f8f9fa] p-5 border-b border-[#dadce0] flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-medium text-[#1a73e8]">{med.name}</h4>
                              <p className="text-xs text-[#5f6368] mt-1 uppercase font-bold tracking-wider">{med.use}</p>
                            </div>
                            <button 
                              onClick={() => exportToCalendar(med)}
                              className="text-[#1a73e8] hover:bg-[#e8f0fe] p-2 rounded-full transition-colors"
                              title="Add schedule to calendar"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </button>
                          </div>
                          <div className="p-6">
                            <div className="flex gap-8 mb-6">
                              <div>
                                <p className="text-[10px] font-bold text-[#70757a] uppercase mb-1">Frequency</p>
                                <p className="text-sm font-medium text-[#202124]">{med.frequency}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-[#70757a] uppercase mb-1">Duration</p>
                                <p className="text-sm font-medium text-[#202124]">{med.duration || 'As prescribed'}</p>
                              </div>
                            </div>
                            {med.alternatives.length > 0 && (
                              <div className="pt-4 border-t border-[#f1f3f4]">
                                <p className="text-[10px] font-bold text-[#70757a] uppercase mb-3">Educational Alternatives</p>
                                <div className="flex flex-wrap gap-2">
                                  {med.alternatives.map((alt, j) => (
                                    <span key={j} className="px-3 py-1 bg-[#f8f9fa] text-[#3c4043] rounded border border-[#dadce0] text-xs font-medium">{alt}</span>
                                  ))}
                                </div>
                                <p className="text-[10px] text-[#5f6368] mt-3 italic">Consult with your doctor before considering any medication changes.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-hidden border border-[#dadce0] rounded-lg">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#f8f9fa] text-[#5f6368] font-medium uppercase text-[11px] tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Finding</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Explanation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dadce0]">
                          {analysis.findings.map((finding, i) => (
                            <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
                              <td className="px-6 py-5">
                                <span className="font-medium text-[#202124] block">{finding.itemName}</span>
                                <div className="text-[11px] text-[#70757a] font-mono mt-1">{finding.observedValue}</div>
                              </td>
                              <td className="px-6 py-5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                  finding.status === 'high' ? 'bg-[#fff4e5] text-[#e67c00]' :
                                  finding.status === 'low' ? 'bg-[#e8f0fe] text-[#1a73e8]' :
                                  'bg-[#e6f4ea] text-[#1e8e3e]'
                                }`}>{finding.status}</span>
                              </td>
                              <td className="px-6 py-5 text-[#3c4043] leading-snug">{finding.whatItMeansSimple}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'action' && (
                <div className="space-y-10">
                  <section>
                    <h3 className="text-lg font-medium text-[#202124] mb-5">Personalized Follow-up Questions</h3>
                    <div className="grid gap-3">
                      {analysis.doctorQuestions.map((q, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-[#f8f9fa] rounded-lg border border-[#dadce0] hover:border-[#1a73e8] transition-colors">
                          <span className="font-bold text-[#1a73e8] opacity-60">Q{i + 1}</span>
                          <p className="text-sm text-[#202124] font-medium">{q}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-medium text-[#202124] mb-5">What to do before your visit</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {analysis.immediateSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white border border-[#dadce0] rounded-lg text-[#3c4043] text-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] flex-shrink-0"></div>
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 p-5 bg-[#e6f4ea] border border-[#ceead6] rounded-lg">
                      <p className="text-sm font-bold text-[#1e8e3e]">Target Action Timeline: {analysis.timeline}</p>
                    </div>
                  </section>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-[#f8f9fa] border border-[#dadce0] rounded-xl">
                <h3 className="text-xs font-bold text-[#70757a] uppercase mb-5 tracking-widest">Recommended Specialties</h3>
                <div className="space-y-5">
                  {analysis.recommendedSpecialists.map((spec, i) => (
                    <div key={i} className="pb-5 border-b border-[#dadce0] last:border-0 last:pb-0">
                      <h4 className="text-sm font-bold text-[#1a73e8] mb-1">{spec.specialty}</h4>
                      <p className="text-[11px] text-[#5f6368] leading-relaxed italic">{spec.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-[#e8f0fe] border border-[#d2e3fc] rounded-xl">
                <h3 className="text-sm font-bold text-[#1967d2] mb-3 uppercase tracking-wide">DocAssist Guidance</h3>
                <p className="text-[11px] text-[#1967d2] leading-relaxed">
                  This analysis is strictly educational. Always seek direct medical confirmation. 
                  {analysis.docType === 'prescription' && " Never adjust medication schedules or dosages independently."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
