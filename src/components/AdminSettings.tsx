"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  getAdmins,
  addAdmin,
  removeAdmin,
  getAdminPassword,
  setAdminPassword,
  type Admin,
} from "@/lib/auth";
import { Trash2, Plus, Loader2, Users, Key, Save } from "lucide-react";
import type { User } from "firebase/auth";

interface AdminSettingsProps {
  currentUser: User;
  onClose: () => void;
}

export function AdminSettings({ currentUser, onClose }: AdminSettingsProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [adminList, pwd] = await Promise.all([
        getAdmins(),
        getAdminPassword(),
      ]);
      setAdmins(adminList);
      setCurrentPassword(pwd);
      if (pwd) setPassword(pwd);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setIsSaving(true);
    try {
      await addAdmin(
        newAdminEmail.trim(),
        newAdminName.trim() || newAdminEmail.trim(),
        currentUser.email || ""
      );
      await loadData();
      setNewAdminEmail("");
      setNewAdminName("");
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("관리자 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveAdmin(email: string) {
    if (email === currentUser.email) {
      alert("자기 자신은 삭제할 수 없습니다.");
      return;
    }

    if (!confirm(`${email}을(를) 관리자에서 삭제할까요?`)) return;

    try {
      await removeAdmin(email);
      await loadData();
    } catch (error) {
      console.error("Error removing admin:", error);
      alert("관리자 삭제 중 오류가 발생했습니다.");
    }
  }

  async function handleSavePassword() {
    setIsSaving(true);
    try {
      await setAdminPassword(password);
      setCurrentPassword(password);
      alert("비밀번호가 저장되었습니다.");
    } catch (error) {
      console.error("Error saving password:", error);
      alert("비밀번호 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admins Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            관리자 목록
          </CardTitle>
          <CardDescription>
            관리자만 다른 관리자를 추가/삭제할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Admin list */}
          <div className="space-y-2">
            {admins.map((admin) => (
              <div
                key={admin.email}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{admin.name}</span>
                    {admin.email === currentUser.email && (
                      <Badge variant="secondary">나</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {admin.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAdmin(admin.email)}
                  disabled={admin.email === currentUser.email}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Add admin form */}
          <form onSubmit={handleAddAdmin} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>이메일</Label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>이름 (선택)</Label>
                <Input
                  placeholder="홍길동"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSaving || !newAdminEmail.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              관리자 추가
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            관리자 비밀번호
          </CardTitle>
          <CardDescription>
            로그인 없이 이 비밀번호로 관리 페이지에 접근할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label>비밀번호</Label>
              <Input
                type="text"
                placeholder="비밀번호를 설정하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSavePassword} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                저장
              </Button>
            </div>
          </div>
          {currentPassword ? (
            <p className="text-sm text-muted-foreground">
              현재 비밀번호가 설정되어 있습니다
            </p>
          ) : (
            <p className="text-sm text-orange-500">
              비밀번호가 설정되지 않았습니다. 비밀번호로 접속하려면 먼저 설정하세요.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
