"use client"

import * as React from "react"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { PGlite } from "@electric-sql/pglite"
import { PGliteWithLive, live } from "@electric-sql/pglite/live"
import { PGliteProvider } from "@electric-sql/pglite-react"

const queryClient = new QueryClient()

export function Providers({ children, ...props }: ThemeProviderProps) {
  const [ db, setDb] = React.useState<PGliteWithLive | undefined>()

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !db) {
      const runMigrations = async () => {
        const db = await PGlite.create({ 
          dataDir: 'idb://shadcn-playground-db',
          extensions: { live } 
        })
        
        const result = await db.exec(`
          create table if not exists products (
            id bigint primary key generated always as identity,
            name text not null,
            description text,
            price numeric(10, 2) not null,
            stock_quantity int not null,
            category text,
            sku text unique,
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp
          );
        `);

        console.log('PROVIDERS result', result)
        
        setDb(db)
      }
      runMigrations()
    }
  })

  if (!db) return (
    <div> Loading... </div>
  )

  return (
    <PGliteProvider db={db}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider {...props}>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </NextThemesProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PGliteProvider>
  )  
}
