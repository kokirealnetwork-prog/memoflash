"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, AppMode } from '../types';
import { useLongPress } from '../hooks/useLongPress';
import { Check } from 'lucide-react';

interface CardRowProps {
  card: Card;
  mode: AppMode;
  isDeleteMode: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  onUpdate: (id: string, field: 'question' | 'answer', value: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleHighlight: (id: string) => void;
  index: number;
  isLast: boolean;
}

export const CardRow: React.FC<CardRowProps> = ({ 
  card, 
  mode, 
  isDeleteMode, 
  isSelected,
  isHighlighted,
  onUpdate, 
  onToggleSelect, 
  onToggleHighlight,
  index, 
  isLast 
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Auto-resize textareas
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight(questionRef.current);
    adjustHeight(answerRef.current);
  }, [card.question, card.answer]);

  // Long press logic
  const { onMouseDown, onTouchStart, onMouseUp, onMouseLeave, onTouchEnd } = useLongPress(
    () => setIsRevealed(true),
    () => setIsRevealed(false),
    { delay: 100 }
  );

  // Determine visibility
  // Edit Mode OR Delete Mode OR Focused OR Revealed -> Visible
  // Study Mode (not revealed/focused) -> Hidden
  const isAnswerVisible = mode === AppMode.EDIT || isDeleteMode || isRevealed || isFocused;

  return (
    <div 
      className={`relative group min-h-[52px] transition-colors duration-200 
        ${isDeleteMode ? 'cursor-pointer active:bg-gray-50 bg-white' : ''}
        ${!isDeleteMode && isHighlighted ? 'bg-[#007AFF]/10' : 'bg-white'}
      `}
      onClick={() => {
        if (isDeleteMode) {
          onToggleSelect(card.id);
        }
      }}
    >
      <div className="flex items-stretch py-3.5 pl-0 pr-0">
        
        {/* Selection Checkbox (Appears in Delete Mode) */}
        <div 
            className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${isDeleteMode ? 'w-[44px] opacity-100' : 'w-0 opacity-0'}`}
        >
             <div className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${isSelected ? 'bg-[#007AFF] border-[#007AFF]' : 'border-[#C6C6C8] bg-transparent'}`}>
                {isSelected && <Check size={14} color="white" strokeWidth={3} />}
             </div>
        </div>

        {/* Index Number */}
        <div className={`flex items-start justify-center pt-[2px] transition-all duration-300 ${isDeleteMode ? 'w-[28px] pl-2 opacity-100' : 'w-[28px] pl-2 opacity-100'}`}>
            <span className="text-[13px] font-normal text-gray-400 select-none">
                {index + 1}
            </span>
        </div>

        {/* Inputs Container */}
        <div className={`flex flex-1 ${isDeleteMode ? 'pointer-events-none' : ''}`}>
            {/* Question Input (Left) - Tap to highlight in Study Mode */}
            <div 
              className="w-1/2 relative border-r border-[#C6C6C8]/30 pr-3 pl-4"
              onClick={() => {
                if (mode === AppMode.STUDY && !isDeleteMode) {
                  onToggleHighlight(card.id);
                }
              }}
            >
              <textarea
                  ref={questionRef}
                  value={card.question}
                  onChange={(e) => onUpdate(card.id, 'question', e.target.value)}
                  placeholder="Question"
                  className="w-full bg-transparent p-0 resize-none focus:outline-none text-[17px] leading-[22px] font-normal text-[#3C3C43] placeholder-gray-300 overflow-hidden relative z-10 cursor-text select-text"
                  rows={1}
                  spellCheck={false}
                  readOnly={isDeleteMode || mode === AppMode.STUDY}
              />
            </div>

            {/* Answer Input (Right) - Takes remaining space */}
            <div className="w-1/2 relative pl-3 pr-4 group/answer">
              <textarea
                  ref={answerRef}
                  value={card.answer}
                  onChange={(e) => onUpdate(card.id, 'answer', e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Answer"
                  className={`w-full bg-transparent p-0 resize-none focus:outline-none text-[17px] leading-[22px] font-normal text-[#3C3C43] overflow-hidden transition-opacity duration-200 relative z-10 cursor-text select-text
                  ${isAnswerVisible ? 'opacity-100' : 'opacity-0 select-none'} 
                  ${mode === AppMode.EDIT ? 'placeholder-gray-300' : 'placeholder-transparent'}
                  `}
                  rows={1}
                  readOnly={isDeleteMode || (mode === AppMode.STUDY && !isAnswerVisible && !isFocused)}
                  spellCheck={false}
              />
              
              {/* Mask Overlay for Study Mode (Triggers Long Press) */}
              {!isDeleteMode && mode === AppMode.STUDY && !isFocused && (
                  <div
                  className="absolute inset-0 cursor-pointer touch-none z-10 active:bg-gray-50/50"
                  onMouseDown={onMouseDown}
                  onTouchStart={onTouchStart}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseLeave}
                  onTouchEnd={onTouchEnd}
                  />
              )}
            </div>
        </div>
      </div>

      {/* iOS Style Separator */}
      {!isLast && (
        <div className={`absolute bottom-0 right-0 h-[1px] bg-[#C6C6C8]/60 transition-all duration-300 ${isDeleteMode ? 'left-[50px]' : 'left-[36px]'}`} />
      )}
    </div>
  );
};
