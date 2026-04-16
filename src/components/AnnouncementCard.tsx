"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Announcement } from "@/types/exam";
import { Bell, AlertTriangle, PenLine } from "lucide-react";

interface AnnouncementCardProps {
  announcements: Announcement[];
  fontScale?: number;
}

function getAnnouncementIcon(type: Announcement["type"], fontScale: number) {
  const iconSize = `${1.8 * fontScale}vw`;
  const iconStyle = { width: iconSize, height: iconSize };
  const className = "flex-shrink-0";
  switch (type) {
    case "correction":
      return <PenLine className={`${className} text-orange-500`} style={iconStyle} />;
    case "warning":
      return <AlertTriangle className={`${className} text-red-500`} style={iconStyle} />;
    default:
      return <Bell className={`${className} text-blue-500`} style={iconStyle} />;
  }
}

function getAnnouncementBg(type: Announcement["type"]) {
  switch (type) {
    case "correction":
      return "bg-orange-500/10 border-orange-500/30";
    case "warning":
      return "bg-red-500/10 border-red-500/30";
    default:
      return "bg-blue-500/10 border-blue-500/30";
  }
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function AnnouncementCard({ announcements, fontScale = 1.0 }: AnnouncementCardProps) {
  const iconSize = `${2 * fontScale}vw`;

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader
        style={{ paddingBottom: `${1 * fontScale}vh`, paddingTop: `${1.5 * fontScale}vh`, paddingLeft: `${1.5 * fontScale}vw`, paddingRight: `${1.5 * fontScale}vw` }}
      >
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center" style={{ gap: `${0.5 * fontScale}vw`, fontSize: `${1.8 * fontScale}vw` }}>
            <Bell style={{ width: iconSize, height: iconSize }} />
            공지사항
          </span>
          {announcements.length > 0 && (
            <Badge
              variant="destructive"
              style={{ fontSize: `${1.3 * fontScale}vw`, padding: `${0.3 * fontScale}vh ${1 * fontScale}vw` }}
            >
              {announcements.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent
        className="flex-1 overflow-hidden"
        style={{ paddingLeft: `${1.5 * fontScale}vw`, paddingRight: `${1.5 * fontScale}vw`, paddingBottom: `${1.5 * fontScale}vh` }}
      >
        {announcements.length === 0 ? (
          <div
            className="flex h-full items-center justify-center text-muted-foreground"
            style={{ fontSize: `${1.8 * fontScale}vw` }}
          >
            공지사항이 없습니다
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div style={{ display: "flex", flexDirection: "column", gap: `${1.2 * fontScale}vh`, paddingRight: `${1 * fontScale}vw` }}>
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`rounded-lg border ${getAnnouncementBg(announcement.type)}`}
                  style={{ padding: `${1.2 * fontScale}vw` }}
                >
                  <div className="flex items-start" style={{ gap: `${1 * fontScale}vw` }}>
                    {getAnnouncementIcon(announcement.type, fontScale)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between" style={{ gap: `${1 * fontScale}vw` }}>
                        <span
                          className="font-semibold flex items-center"
                          style={{ fontSize: `${1.6 * fontScale}vw`, gap: `${0.5 * fontScale}vw` }}
                        >
                          {announcement.title}
                          {announcement.questionNumber && (
                            <Badge
                              variant="outline"
                              className="bg-background"
                              style={{ fontSize: `${1.2 * fontScale}vw`, padding: `0 ${0.6 * fontScale}vw` }}
                            >
                              {announcement.questionNumber}
                            </Badge>
                          )}
                        </span>
                        <span
                          className="text-muted-foreground tabular-nums flex-shrink-0"
                          style={{ fontSize: `${1.2 * fontScale}vw` }}
                        >
                          {formatTimestamp(announcement.timestamp)}
                        </span>
                      </div>
                      <p
                        className="leading-snug"
                        style={{ fontSize: `${1.5 * fontScale}vw`, marginTop: `${0.5 * fontScale}vh` }}
                      >
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
