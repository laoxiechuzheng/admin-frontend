import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useNavigate, useRouteError } from "react-router-dom"

interface RouterError {
    statusText?: string
    message?: string
    status?: number
}

export default function ErrorPage() {
    const error = useRouteError() as RouterError
    const navigate = useNavigate()
    console.error(error)

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md rounded-xl">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="flex justify-center">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-semibold">Oops!</h1>
                    <p className="text-sm text-muted-foreground">
                        Sorry, an unexpected error has occurred.
                    </p>
                    <div className="rounded-md border bg-muted/60 p-3">
                        <p className="font-mono text-xs text-destructive">
                            {error.statusText || error.message}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <Button variant="default" size="lg" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
