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
import { getAppSettings, updateClockSize, updateFontScale } from "@/lib/firestore";
import { Trash2, Plus, Loader2, Users, Key, Save, Clock, Type, Settings } from "lucide-react";
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
  const [clockSize, setClockSize] = useState(16);
  const [fontScale, setFontScale] = useState(1.0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [adminList, pwd, settings] = await Promise.all([
        getAdmins(),
        getAdminPassword(),
        getAppSettings(),
      ]);
      setAdmins(adminList);
      setCurrentPassword(pwd);
      if (pwd) setPassword(pwd);
      setClockSize(settings.clockSize);
      setFontScale(settings.fontScale);
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

  async function handleClockSizeChange(value: string) {
    const size = parseInt(value);
    setClockSize(size);
    try {
      await updateClockSize(size);
    } catch (error) {
      console.error("Error updating clock size:", error);
      alert("시계 크기 저장 중 오류가 발생했습니다.");
    }
  }

  async function handleFontScaleChange(value: string) {
    const scale = parseFloat(value);
    setFontScale(scale);
    try {
      await updateFontScale(scale);
    } catch (error) {
      console.error("Error updating font scale:", error);
      alert("글자 크기 저장 중 오류가 발생했습니다.");
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

      {/* Display Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            화면 크기 기본값
          </CardTitle>
          <CardDescription>
            모든 디스플레이의 기본 크기를 설정합니다. 각 강의실에서는 화면 우하단 설정 버튼으로 로컬 크기를 조절할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Clock Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <Label>시계 크기: {clockSize}vw</Label>
            </div>
            <input
              type="range"
              min="8"
              max="24"
              step="1"
              value={clockSize}
              onChange={(e) => handleClockSizeChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8vw (작게)</span>
              <span>16vw (권장)</span>
              <span>24vw (크게)</span>
            </div>
          </div>

          <Separator />

          {/* Font Scale */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <Label>글자 크기: {fontScale.toFixed(1)}x</Label>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={fontScale}
              onChange={(e) => handleFontScaleChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x (작게)</span>
              <span>1.0x (권장)</span>
              <span>2.0x (크게)</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 팁: 각 강의실에서 로컬 설정을 하지 않은 경우 이 기본값이 적용됩니다.
          </p>
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
