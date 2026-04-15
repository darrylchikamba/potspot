import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
        PotSpot Setup Complete
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        React 18 + Vite + Tailwind 4 + shadcn/ui.
        The backend is also ready for development.
      </p>
      <div className="flex gap-4">
        <Button>Report a Hazard</Button>
        <Button variant="outline">View Map</Button>
      </div>
    </div>
  )
}

export default App
