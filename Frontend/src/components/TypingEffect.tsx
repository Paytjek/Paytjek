import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayAfterTyping?: number;
  delayAfterDeleting?: number;
  className?: string;
  showCursor?: boolean;
  loop?: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  texts,
  typingSpeed = 80,
  deletingSpeed = 50,
  delayAfterTyping = 2000,
  delayAfterDeleting = 500,
  className = '',
  showCursor = true,
  loop = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    // Blink cursor effect
    const blinkInterval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 500);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const currentText = texts[currentTextIndex];
    
    if (!isDeleting) {
      // Typing mode
      if (currentIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + currentText[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, typingSpeed);
        
        return () => clearTimeout(timeout);
      } else {
        // Finished typing
        const timeout = setTimeout(() => {
          if (loop || currentTextIndex < texts.length - 1) {
            setIsDeleting(true);
          }
        }, delayAfterTyping);
        
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting mode
      if (currentIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev.slice(0, -1));
          setCurrentIndex(prev => prev - 1);
        }, deletingSpeed);
        
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting
        const timeout = setTimeout(() => {
          setIsDeleting(false);
          setCurrentTextIndex(prev => 
            loop ? (prev + 1) % texts.length : Math.min(prev + 1, texts.length - 1)
          );
        }, delayAfterDeleting);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, currentTextIndex, isDeleting, texts, typingSpeed, deletingSpeed, delayAfterTyping, delayAfterDeleting, loop]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span className={`border-r-2 ml-1 h-5 inline-block ${isBlinking ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 0.2s' }}></span>}
    </span>
  );
};

export default TypingEffect; 