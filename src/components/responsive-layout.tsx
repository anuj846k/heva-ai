'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';
import React, { useState } from 'react';

export function ResponsiveLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex h-screen w-full overflow-hidden bg-background'>
      <div className='hidden md:flex h-full w-56 flex-col shrink-0 border-r'>
        {sidebar}
      </div>

      <div className='flex-1 flex flex-col min-w-0 h-full overflow-hidden relative'>
        <header className='flex md:hidden items-center justify-between border-b px-4 py-2.5 shrink-0 bg-background z-20'>
          <div className='flex items-center gap-2'>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    className='-ml-2 h-8 w-8'
                  >
                    <MenuIcon className='size-5' />
                    <span className='sr-only'>Toggle Sidebar</span>
                  </Button>
                }
              />
              <SheetContent
                side='left'
                className='p-0 w-56 h-full flex flex-col'
                showCloseButton={false}
              >
                <div onClick={() => setOpen(false)} className='h-full'>
                  {sidebar}
                </div>
              </SheetContent>
            </Sheet>
            <span className='font-semibold text-sm'>Heva AI</span>
          </div>
        </header>

        <main className='flex-1 min-w-0 h-full overflow-hidden'>
          {children}
        </main>
      </div>
    </div>
  );
}
