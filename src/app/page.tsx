"use client";

import React, { useState, useRef } from 'react';
import { Card, AppMode } from '../types';
import { CardRow } from '../components/CardRow';
import { Plus, Trash2, CopyPlus, Filter, Battery, Wifi, Signal } from 'lucide-react';

const SAMPLE_DECK: Card[] = [
  { id: '1', question: 'Apple', answer: 'Ringo' },
  { id: '2', question: 'Water', answer: 'Mizu' },
  { id: '3', question: 'Book', answer: 'Hon' },
];

export default function App() {
  const [cards, setCards] = useState<Card[]>(SAMPLE_DECK);
  const [mode, setMode] = useState<AppMode>(AppMode.STUDY);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addCount, setAddCount] = useState(1);
  
  // Highlight / Filter State
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  const listEndRef = useRef<HTMLDivElement>(null);

  const addCard = () => {
    // If in delete mode, exit it first
    if (isDeleteMode) {
        setIsDeleteMode(false);
        setSelectedIds(new Set());
    }
    
    // Automatically turn off filter so user can see new cards
    setIsFilterActive(false);
    
    const newCards = Array.from({ length: addCount }).map(() => ({
      id: crypto.randomUUID(),
      question: '',
      answer: ''
    }));

    setCards(prev => [...prev, ...newCards]);
    setMode(AppMode.EDIT);
    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const updateCard = (id: string, field: 'question' | 'answer', value: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Toggle Selection for Delete Mode
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle Highlight (Study Mode)
  const toggleHighlight = (id: string) => {
    const newHighlights = new Set(highlightedIds);
    if (newHighlights.has(id)) {
      newHighlights.delete(id);
    } else {
      newHighlights.add(id);
    }
    setHighlightedIds(newHighlights);
  };

  const deleteSelectedCards = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} cards?`)) {
        const newCards = cards.filter(c => !selectedIds.has(c.id));
        setCards(newCards);
        
        // Clean up highlights if deleted
        const newHighlights = new Set(highlightedIds);
        selectedIds.forEach(id => newHighlights.delete(id));
        setHighlightedIds(newHighlights);

        setIsDeleteMode(false);
        setSelectedIds(new Set());
    }
  };

  const toggleDeleteMode = () => {
    if (isDeleteMode) {
        // Cancel
        setIsDeleteMode(false);
        setSelectedIds(new Set());
    } else {
        // Start
        setIsDeleteMode(true);
    }
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    
    const lines = bulkInput.split('\n');
    const newCards: Card[] = [];
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        // Split by first comma, tab, or colon
        // Use regex to find the separator
        const parts = line.split(/,|:|\t/);
        
        const question = parts[0]?.trim() || '';
        // Join the rest back together in case the answer contained commas
        const answer = parts.slice(1).join(',').trim() || '';
        
        if (question) {
            newCards.push({
                id: crypto.randomUUID(),
                question,
                answer
            });
        }
    });

    if (newCards.length > 0) {
        setCards([...cards, ...newCards]);
        setShowBulkModal(false);
        setBulkInput('');
        setMode(AppMode.EDIT);
        setIsFilterActive(false); // Reset filter
        setTimeout(() => {
            listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  };

  // Determine which cards to display
  const visibleCards = cards.filter(c => {
    // 1. In Study Mode, hide completely empty cards (both fields empty)
    if (mode === AppMode.STUDY) {
        if (!c.question.trim() && !c.answer.trim()) return false;
    }

    // 2. If Filter is Active, must be highlighted
    if (isFilterActive) {
        return highlightedIds.has(c.id);
    }

    return true;
  });

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto bg-[#F2F2F7] relative overflow-hidden text-black">
      {/* Navigation Bar */}
      <nav className="bg-[#F2F2F7]/85 backdrop-blur-md border-b border-[#C6C6C8]/50 shrink-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="h-[44px] flex items-center justify-between px-4">
          <div className="w-16"></div>
          <div className="font-semibold text-[17px]">
            {isDeleteMode ? 'Select Items' : 'MemoFlash'}
          </div>
          <div className="w-16"></div>
        </div>

        {/* Segmented Control */}
        <div className={`px-4 pb-3 pt-1 transition-all duration-300 ease-in-out overflow-hidden ${isDeleteMode ? 'max-h-0 opacity-0' : 'max-h-[60px] opacity-100'}`}>
          <div className="relative bg-[#767680]/12 rounded-full p-[3px] flex h-[40px] w-full max-w-[340px] mx-auto shadow-inner">
            <div 
              className={`absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] bg-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.12)] segment-transition pointer-events-none`}
              style={{ 
                transform: mode === AppMode.EDIT ? 'translateX(0)' : 'translateX(100%)' 
              }}
            />
            <button
              onClick={() => {
                setMode(AppMode.EDIT);
                setIsFilterActive(false); // Reset filter when switching to Edit
              }}
              className={`flex-1 relative z-10 text-[14px] font-semibold leading-none transition-colors duration-200 ${mode === AppMode.EDIT ? 'text-black' : 'text-[#3C3C43]/70'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setMode(AppMode.STUDY)}
              className={`flex-1 relative z-10 text-[14px] font-semibold leading-none transition-colors duration-200 ${mode === AppMode.STUDY ? 'text-black' : 'text-[#3C3C43]/70'}`}
            >
              Study
            </button>
          </div>
        </div>
      </nav>

      {/* Scrollable Main Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-4 pt-4">
        {/* List Container */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-sm border border-[#C6C6C8]/30 transition-all">
          {visibleCards.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <p className="text-[17px] text-gray-400 font-normal">
                {isFilterActive 
                  ? 'No highlighted cards' 
                  : (mode === AppMode.STUDY ? 'No cards to study' : 'No Cards')}
              </p>
              {mode === AppMode.EDIT && !isFilterActive && <p className="text-[13px] text-gray-400 mt-2">Tap + to add new</p>}
            </div>
          ) : (
            visibleCards.map((card, idx) => (
              <CardRow
                key={card.id}
                index={idx}
                card={card}
                mode={mode}
                isDeleteMode={isDeleteMode}
                isSelected={selectedIds.has(card.id)}
                isHighlighted={highlightedIds.has(card.id)}
                onUpdate={updateCard}
                onToggleSelect={toggleSelection}
                onToggleHighlight={toggleHighlight}
                isLast={idx === visibleCards.length - 1}
              />
            ))
          )}
        </div>

        {/* Add Button Section */}
        {mode === AppMode.EDIT && (
          <div className={`mt-6 transition-all duration-300 ${isDeleteMode ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className="flex justify-center mb-3">
              <div className="bg-[#767680]/12 p-[2px] rounded-[9px] flex gap-[1px]">
                {[1, 3, 5, 10].map(num => (
                  <button
                    key={num}
                    onClick={() => setAddCount(num)}
                    className={`
                      w-[45px] h-[28px] text-[13px] font-medium rounded-[7px] transition-all duration-200 flex items-center justify-center
                      ${addCount === num 
                        ? 'bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.12)]' 
                        : 'text-[#3C3C43]/60 hover:bg-black/5'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={addCard}
              className="w-full bg-white active:bg-gray-100 text-[#007AFF] text-[17px] font-semibold py-3.5 rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-colors border border-[#C6C6C8]/30"
            >
              <Plus size={22} strokeWidth={2.5} />
              <span>Add {addCount > 1 ? `${addCount} Cards` : 'New Card'}</span>
            </button>
          </div>
        )}
        
        {/* Spacer for scroll */}
        <div ref={listEndRef} className="h-4" />
      </main>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F2F2F7]/85 backdrop-blur-md border-t border-[#C6C6C8]/50 z-40 pb-[env(safe-area-inset-bottom)] pt-1">
        <div className="h-[49px] flex items-center justify-between px-6">
          <div className="flex-1 text-left">
            {isDeleteMode ? (
              <button 
                onClick={toggleDeleteMode}
                className="text-[#007AFF] text-[17px] font-normal active:opacity-50"
              >
                Cancel
              </button>
            ) : (
              mode === AppMode.STUDY ? (
                <button
                  onClick={() => setIsFilterActive(!isFilterActive)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${isFilterActive ? 'bg-[#007AFF] text-white shadow-sm' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}
                >
                  <Filter size={15} fill={isFilterActive ? 'currentColor' : 'none'} strokeWidth={2.5} />
                  <span className="text-[13px] font-semibold">
                    {isFilterActive ? 'Filtered' : 'Filter'}
                  </span>
                </button>
              ) : (
                <span className="text-[11px] text-gray-500 font-medium ml-1">
                  {cards.length} cards
                </span>
              )
            )}
          </div>

          <div className="flex gap-6 items-center">
            {isDeleteMode ? (
              <button 
                onClick={deleteSelectedCards}
                disabled={selectedIds.size === 0}
                className="text-red-500 text-[17px] font-semibold active:opacity-50 disabled:opacity-30 disabled:text-gray-400 transition-all"
              >
                Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </button>
            ) : (
              mode === AppMode.EDIT && (
                <>
                  <button 
                    onClick={() => setShowBulkModal(true)}
                    className="text-[#007AFF] active:opacity-40 transition-opacity"
                  >
                    <CopyPlus size={24} strokeWidth={1.5} />
                  </button>

                  <button 
                    onClick={toggleDeleteMode}
                    className="text-[#007AFF] active:opacity-40 transition-opacity"
                  >
                    <Trash2 size={24} strokeWidth={1.5} />
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showBulkModal && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-[60] flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-[#F2F2F7]/95 backdrop-blur-xl w-full max-w-[270px] rounded-[14px] overflow-hidden text-center shadow-xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-4 pb-3">
              <h3 className="text-[17px] font-semibold text-black mb-1">Bulk Add</h3>
              <p className="text-[13px] text-black/80">Paste list. Format: "Question, Answer"</p>
            </div>
            
            <div className="px-4 pb-4">
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={"Dog, Inu\nCat, Neko"}
                className="w-full bg-white border-[0.5px] border-gray-300 rounded-[7px] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 placeholder-gray-400 min-h-[100px] resize-none"
                autoFocus
              />
            </div>

            <div className="flex border-t border-[#3C3C43]/36">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-3 text-[17px] text-[#007AFF] active:bg-gray-200/50 border-r border-[#3C3C43]/36 font-normal"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAdd}
                disabled={!bulkInput.trim()}
                className="flex-1 py-3 text-[17px] text-[#007AFF] active:bg-gray-200/50 font-semibold disabled:text-gray-400"
              >
                Add All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
