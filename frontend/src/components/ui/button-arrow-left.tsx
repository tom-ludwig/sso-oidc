import { ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonIcon() {
  return (
    <Button variant="secondary" size="icon" className="size-8">
      <ChevronLeftIcon />
    </Button>
  )
}
