"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  signInWithGoogle,
  verifyAdminPassword,
  isAdmin,
  isFirstTimeSetup,
  setupFirstAdmin,
} from "@/lib/auth";
import { Loader2, LogIn, Key } from "lucide-react";
import type { User } from "firebase/auth";

interface AdminAuthProps {
  onAuthenticated: (type: "admin" | "password", user?: User) => void;
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"choose" | "password">("choose");

  async function handleGoogleLogin() {
    setIsLoading(true);
    setError("");

    try {
      const user = await signInWithGoogle();

      // 첫 사용자인지 확인
      const firstTime = await isFirstTimeSetup();
      if (firstTime) {
        await setupFirstAdmin(user);
        onAuthenticated("admin", user);
        return;
      }

      // 관리자인지 확인
      const adminCheck = await isAdmin(user.email || "");
      if (!adminCheck) {
        setError("관리자로 등록되지 않은 계정입니다.");
        return;
      }

      onAuthenticated("admin", user);
    } catch (err) {
      console.error("Login error:", err);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const valid = await verifyAdminPassword(password);
      if (!valid) {
        setError("비밀번호가 올바르지 않습니다.");
        return;
      }
      onAuthenticated("password");
    } catch (err) {
      console.error("Password error:", err);
      setError("인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  if (mode === "password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Key className="w-6 h-6" />
              관리자 비밀번호
            </CardTitle>
            <CardDescription>
              관리자 비밀번호를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode("choose")}
                >
                  뒤로
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  확인
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>관리자 인증</CardTitle>
          <CardDescription>
            시험을 관리하려면 인증이 필요합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            Google 계정으로 로그인
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => setMode("password")}
          >
            <Key className="w-4 h-4 mr-2" />
            관리자 비밀번호로 접속
          </Button>

          {error && (
            <p className="text-sm text-center text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
