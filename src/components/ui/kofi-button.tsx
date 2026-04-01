import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface KofiButtonProps {
  variant?: "card" | "button" | "alert"
}

export function KofiButton({ variant = "button" }: KofiButtonProps) {
  // TODO: Replace with your actual Ko-fi URL after creating account
  const kofiUrl = "https://ko-fi.com/prolifictracker"

  if (variant === "card") {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">☕</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Enjoying ProlificTracker?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This tool is 100% free. If it saved you time tracking earnings, consider buying me a coffee!
              </p>
            </div>
            <Button asChild variant="default" className="bg-orange-500 hover:bg-orange-600 shrink-0">
              <a href={kofiUrl} target="_blank" rel="noopener noreferrer">
                <Coffee className="mr-2 h-4 w-4" />
                Buy Me a Coffee
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === "alert") {
    return (
      <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
        <Coffee className="h-4 w-4" />
        <AlertTitle>Enjoying ProlificTracker?</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            This tool is 100% free. If it saves you time, consider supporting development!
          </span>
          <Button asChild variant="outline" size="sm" className="ml-4 shrink-0">
            <a href={kofiUrl} target="_blank" rel="noopener noreferrer">
              <Coffee className="mr-2 h-4 w-4" />
              Support
            </a>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Button asChild variant="outline" size="sm">
      <a href={kofiUrl} target="_blank" rel="noopener noreferrer">
        <Coffee className="mr-2 h-4 w-4" />
        Support
      </a>
    </Button>
  )
}
