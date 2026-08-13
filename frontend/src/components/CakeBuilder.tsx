'use client';
import React, { useState } from 'react';

type Step = 'size' | 'flavor' | 'finish' | 'date';

export default function CakeBuilder() {
  const [currentStep, setCurrentStep] = useState<Step>('size');
  const [selection, setSelection] = useState({
    size: '',
    flavor: '',
    finish: '',
    date: ''
  });

  const nextStep = (step: Step) => setCurrentStep(step);

  const calculatePrice = () => {
    let base = 0;
    if (selection.size === '0.5kg') base += 500;
    if (selection.size === '1kg') base += 900;
    if (selection.size === '2kg') base += 1700;
    
    if (selection.flavor === 'Chocolate Truffle') base += 100;
    if (selection.flavor === 'Red Velvet') base += 150;
    
    if (selection.finish === 'Fondant') base += 300;
    if (selection.finish === 'Buttercream') base += 100;

    return base;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="bg-orange-50 px-8 py-6 border-b border-orange-100">
        <h2 className="text-2xl font-bold text-gray-900">Custom Cake Builder</h2>
        <p className="text-orange-600 font-medium mt-1">Design your perfect cake in 4 simple steps.</p>
      </div>
      
      <div className="p-8">
        {/* Progress Bar */}
        <div className="flex mb-8 space-x-2">
          {['size', 'flavor', 'finish', 'date'].map((step, idx) => (
            <div key={step} className="flex-1">
              <div className={`h-2 rounded-full ${['size', 'flavor', 'finish', 'date'].indexOf(currentStep) >= idx ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">{step}</p>
            </div>
          ))}
        </div>

        {/* Steps Content */}
        <div className="min-h-[300px]">
          {currentStep === 'size' && (
            <div className="grid grid-cols-3 gap-4">
              {['0.5kg', '1kg', '2kg'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelection({...selection, size: s})}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${selection.size === s ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                >
                  <div className="text-xl font-bold text-gray-900">{s}</div>
                  <div className="text-sm text-gray-500 mt-1">Serves {s === '0.5kg' ? '4-6' : s === '1kg' ? '10-12' : '20-24'}</div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 'flavor' && (
            <div className="grid grid-cols-2 gap-4">
              {['Chocolate Truffle', 'Red Velvet', 'Vanilla Bean', 'Black Forest'].map(f => (
                <button
                  key={f}
                  onClick={() => setSelection({...selection, flavor: f})}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${selection.flavor === f ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                >
                  <div className="font-bold text-gray-900">{f}</div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 'finish' && (
            <div className="grid grid-cols-2 gap-4">
              {['Buttercream', 'Fondant', 'Naked', 'Ganache'].map(f => (
                <button
                  key={f}
                  onClick={() => setSelection({...selection, finish: f})}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${selection.finish === f ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                >
                  <div className="font-bold text-gray-900">{f}</div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 'date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Date</label>
              <input 
                type="date" 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-3 border"
                value={selection.date}
                onChange={(e) => setSelection({...selection, date: e.target.value})}
              />
            </div>
          )}
        </div>

        {/* Navigation & Pricing */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ₹{calculatePrice()} <span className="text-sm font-normal text-gray-500">estimated total</span>
          </div>
          <div className="space-x-3">
            {currentStep === 'flavor' && <button onClick={() => nextStep('size')} className="px-6 py-2 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">Back</button>}
            {currentStep === 'finish' && <button onClick={() => nextStep('flavor')} className="px-6 py-2 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">Back</button>}
            {currentStep === 'date' && <button onClick={() => nextStep('finish')} className="px-6 py-2 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">Back</button>}
            
            {currentStep === 'size' && <button disabled={!selection.size} onClick={() => nextStep('flavor')} className="px-6 py-2 rounded-lg font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50">Next: Flavor</button>}
            {currentStep === 'flavor' && <button disabled={!selection.flavor} onClick={() => nextStep('finish')} className="px-6 py-2 rounded-lg font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50">Next: Finish</button>}
            {currentStep === 'finish' && <button disabled={!selection.finish} onClick={() => nextStep('date')} className="px-6 py-2 rounded-lg font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50">Next: Date</button>}
            {currentStep === 'date' && <button disabled={!selection.date} onClick={() => alert('Order Placed!')} className="px-8 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">Complete Order</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
