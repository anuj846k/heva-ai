'use client';

import { useCallback, useRef, useState } from 'react';
import { DocumentCard } from '@/components/document-card';
import { PanelRightCloseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DocType = 'markdown' | 'html' | 'json' | 'csv';

export interface ArtifactDoc {
  docType: DocType;
  title: string;
  content: string;
}

interface ArtifactPanelProps {
  doc: ArtifactDoc | null;
  onClose: () => void;
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 900;
const DEFAULT_WIDTH = 420;

export function ArtifactPanel({ doc, onClose }: ArtifactPanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMove = (mv: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX.current - mv.clientX;
        setWidth(
          Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)),
        );
      };

      const onUp = () => {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [width],
  );

  if (!doc) return null;

  return (
    <aside
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-background', // Mobile styles: full screen overlay
        'lg:relative lg:inset-auto lg:z-0 lg:flex lg:flex-row lg:shrink-0 lg:border-l lg:h-full lg:overflow-hidden', // Desktop override
      )}
      style={{
        width:
          typeof window !== 'undefined' && window.innerWidth >= 1024
            ? width
            : '100%',
      }}
    >
      <div
        className='hidden lg:block w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors shrink-0 h-full'
        onMouseDown={onMouseDown}
      />
      <div className='flex flex-col flex-1 overflow-hidden min-w-0 h-full'>
        <div className='flex items-center justify-between px-3 py-2 border-b shrink-0 bg-muted/40 lg:bg-transparent'>
          <span className='text-xs font-medium text-muted-foreground truncate'>
            Artifact
          </span>
          <Button
            size='icon'
            variant='ghost'
            className='size-6'
            onClick={onClose}
          >
            <PanelRightCloseIcon className='size-3.5' />
          </Button>
        </div>
        <div className='flex-1 flex flex-col min-h-0'>
          <DocumentCard
            docType={doc.docType}
            title={doc.title}
            content={doc.content}
          />
        </div>
      </div>
    </aside>
  );
}
