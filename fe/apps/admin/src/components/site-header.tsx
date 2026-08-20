import { Separator } from "@fe/components/ui/separator"
import { SidebarTrigger } from "@fe/components/ui/sidebar"
import {ThemeProvider, useTheme} from "@/components/theme-provider.tsx";
import {Button} from "@fe/components/ui/button.tsx";
import {Moon, Sun} from "lucide-react";

export function SiteHeader() {
    const { theme, setTheme } = useTheme()
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">Documents</h1>
          <div  className="ms-auto me-0">
              <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                  <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                      <span className="sr-only">Toggle theme</span>
                  </Button>
              </ThemeProvider>
          </div>

      </div>

    </header>
  )
}
