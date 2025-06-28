import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="card-secondary">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-green-light rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                Welcome to ProLink!
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Your account has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm font-medium">Check your email</span>
                </div>
                <p className="text-sm text-text-secondary">
                  We've sent you a confirmation email. Please click the link in the email to verify your account, then come back to complete your profile setup.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-text-tertiary text-center">
                  After confirming your email, you'll be redirected to:
                </p>
                <Link href="/auth/setup">
                  <Button className="w-full mt-4">
                    Complete Profile Setup
                  </Button>
                </Link>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-text-muted">
                  Already confirmed your email?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
