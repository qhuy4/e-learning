import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
    ConnectionState,
    Room,
    RoomEvent,
    Track,
    type Participant,
} from "livekit-client";
import {
    Loader2,
    Mic,
    MicOff,
    PhoneOff,
    ScreenShare,
    ScreenShareOff,
    StickyNote,
    Users,
    Video,
    VideoOff,
    Wifi,
    WifiOff,
    X,
} from "lucide-react";
import { joinMeetingRoom } from "@/pages/meeting/booking.service.ts";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Textarea } from "@fe/components/ui/textarea";

interface MeetingRoomProps {
    meetingRoomId: number;
}

interface ParticipantView {
    identity: string;
    name: string;
    isLocal: boolean;
    hasMic: boolean;
    hasCam: boolean;
    isSpeaking: boolean;
}

const statusConfig: Record<
    ConnectionState,
    { label: string; dot: string; text: string }
> = {
    [ConnectionState.Connected]: {
        label: "Đã kết nối",
        dot: "bg-[#89d4c7]",
        text: "text-[#89d4c7]",
    },
    [ConnectionState.Reconnecting]: {
        label: "Đang kết nối lại",
        dot: "bg-[#fae189]",
        text: "text-[#fae189]",
    },
    [ConnectionState.SignalReconnecting]: {
        label: "Đang kết nối lại",
        dot: "bg-[#fae189]",
        text: "text-[#fae189]",
    },
    [ConnectionState.Connecting]: {
        label: "Đang kết nối",
        dot: "bg-[#a4f1e3]",
        text: "text-[#a4f1e3]",
    },
    [ConnectionState.Disconnected]: {
        label: "Đã ngắt kết nối",
        dot: "bg-[#F38181]",
        text: "text-[#F38181]",
    },
};

function formatElapsed(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function initialsOf(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join("");
}

function displayName(participant: Participant, roleLabel: string) {
    if (participant.name) return participant.name;
    if (participant.identity.startsWith("user-")) {
        return `${roleLabel} ${participant.identity.slice(5)}`;
    }
    return participant.identity;
}

function isMicEnabled(participant: Participant) {
    const publication = participant.getTrackPublication(Track.Source.Microphone);
    if (publication) return !publication.isMuted && participant.isMicrophoneEnabled;
    return participant.isMicrophoneEnabled;
}

function isCamEnabled(participant: Participant) {
    const publication = participant.getTrackPublication(Track.Source.Camera);
    if (publication) return !publication.isMuted && participant.isCameraEnabled;
    return participant.isCameraEnabled;
}

export function MeetingRoom({ meetingRoomId }: MeetingRoomProps) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const roomRef = useRef<Room | null>(null);
    const remoteStageRef = useRef<HTMLDivElement>(null);
    const remoteFeedRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLDivElement>(null);
    const attachedRef = useRef<HTMLMediaElement[]>([]);
    const connectTokenRef = useRef(0);

    const [connectionState, setConnectionState] = useState<ConnectionState>(
        ConnectionState.Disconnected,
    );
    const [isJoining, setIsJoining] = useState(true);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [roomName, setRoomName] = useState("");
    const [elapsed, setElapsed] = useState(0);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCamOn, setIsCamOn] = useState(false);
    const [isScreenShareOn, setIsScreenShareOn] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [participants, setParticipants] = useState<ParticipantView[]>([]);
    const [notes, setNotes] = useState("");
    const [endsAt, setEndsAt] = useState<number | null>(null);
    const [hasEnded, setHasEnded] = useState(false);

    const syncFromRoom = useCallback((room: Room) => {
        const local = room.localParticipant;
        const seen = new Set<string>([local.identity]);
        const views: ParticipantView[] = [
            {
                identity: local.identity,
                name: user?.name || "Bạn",
                isLocal: true,
                hasMic: isMicEnabled(local),
                hasCam: isCamEnabled(local),
                isSpeaking: false,
            },
        ];

        room.remoteParticipants.forEach((participant) => {
            if (seen.has(participant.identity)) return;
            seen.add(participant.identity);
            views.push({
                identity: participant.identity,
                name: displayName(participant, "Giáo viên"),
                isLocal: false,
                hasMic: isMicEnabled(participant),
                hasCam: isCamEnabled(participant),
                isSpeaking: false,
            });
        });

        setParticipants((prev) => {
            const speakingMap = new Map(
                prev.map((item) => [item.identity, item.isSpeaking]),
            );
            return views.map((view) => ({
                ...view,
                isSpeaking: speakingMap.get(view.identity) ?? false,
            }));
        });

        setIsMicOn(isMicEnabled(local));
        setIsCamOn(isCamEnabled(local));
        setIsScreenShareOn(local.isScreenShareEnabled);
    }, [user?.name]);

    const clearAttachments = useCallback(() => {
        attachedRef.current.forEach((element) => element.remove());
        attachedRef.current = [];
    }, []);

    const attachRemoteTrack = useCallback(
        (
            track: {
                kind: string;
                attach: () => HTMLMediaElement;
                sid?: string;
            },
            isScreen: boolean,
        ) => {
            const stage = remoteFeedRef.current;
            if (!stage) return;

            if (track.kind === "audio") {
                const element = track.attach();
                element.autoplay = true;
                if (track.sid) element.dataset.sid = track.sid;
                document.body.appendChild(element);
                attachedRef.current.push(element);
                return;
            }

            if (track.kind === "video") {
                const element = track.attach() as HTMLVideoElement;
                element.autoplay = true;
                element.playsInline = true;
                element.className = "w-full h-full object-contain bg-black";

                const feed = isScreen ? "screen" : "camera";
                stage
                    .querySelectorAll(`[data-feed='${feed}']`)
                    .forEach((node) => node.remove());
                if (isScreen) {
                    stage
                        .querySelectorAll("[data-feed='camera']")
                        .forEach((node) => node.remove());
                }

                element.dataset.feed = feed;
                if (track.sid) element.dataset.sid = track.sid;
                stage.appendChild(element);
                attachedRef.current.push(element);
            }
        },
        [],
    );

    const attachLocalCamera = useCallback(async (room: Room) => {
        const container = localVideoRef.current;
        if (!container) return;

        container.querySelectorAll("video").forEach((node) => node.remove());

        const publication =
            room.localParticipant.getTrackPublication(Track.Source.Camera) ??
            [...room.localParticipant.videoTrackPublications.values()][0];

        const track = publication?.videoTrack;
        if (!track) return;

        const element = track.attach() as HTMLVideoElement;
        element.autoplay = true;
        element.playsInline = true;
        element.muted = true;
        element.className = "w-full h-full object-cover scale-x-[-1]";
        container.appendChild(element);
    }, []);

    const leaveMeeting = useCallback(() => {
        roomRef.current?.disconnect();
        roomRef.current = null;
        clearAttachments();
        navigate("/", { replace: true });
    }, [clearAttachments, navigate]);

    const toggleMicrophone = useCallback(async () => {
        const room = roomRef.current;
        if (!room || room.state !== ConnectionState.Connected) return;
        try {
            const enabled = !room.localParticipant.isMicrophoneEnabled;
            await room.localParticipant.setMicrophoneEnabled(enabled);
            syncFromRoom(room);
        } catch (error) {
            console.error("Toggle microphone failed:", error);
        }
    }, [syncFromRoom]);

    const toggleCamera = useCallback(async () => {
        const room = roomRef.current;
        if (!room || room.state !== ConnectionState.Connected) return;
        try {
            const enabled = !room.localParticipant.isCameraEnabled;
            await room.localParticipant.setCameraEnabled(enabled);
            if (enabled) {
                await attachLocalCamera(room);
            } else {
                localVideoRef.current
                    ?.querySelectorAll("video")
                    .forEach((node) => node.remove());
            }
            syncFromRoom(room);
        } catch (error) {
            console.error("Toggle camera failed:", error);
        }
    }, [attachLocalCamera, syncFromRoom]);

    const toggleScreenShare = useCallback(async () => {
        const room = roomRef.current;
        if (!room || room.state !== ConnectionState.Connected) return;
        try {
            const enabled = !room.localParticipant.isScreenShareEnabled;
            await room.localParticipant.setScreenShareEnabled(enabled);
            syncFromRoom(room);
        } catch (error) {
            console.error("Toggle screen share failed:", error);
        }
    }, [syncFromRoom]);

    const connect = useCallback(async () => {
        const token = ++connectTokenRef.current;
        clearAttachments();

        try {
            const response = await joinMeetingRoom(meetingRoomId);
            if (connectTokenRef.current !== token) return;
            setRoomName(response.roomName);
            setEndsAt(response.endsAt ? new Date(response.endsAt).getTime() : null);

            const room = new Room();
            roomRef.current = room;

            room.on(RoomEvent.ConnectionStateChanged, (state) => {
                setConnectionState(state);
                if (state === ConnectionState.Connected) {
                    setIsJoining(false);
                }
            });

            room.on(RoomEvent.Reconnecting, () => {
                setConnectionState(ConnectionState.Reconnecting);
            });

            room.on(RoomEvent.Reconnected, () => {
                setConnectionState(ConnectionState.Connected);
                if (roomRef.current) syncFromRoom(roomRef.current);
            });

            room.on(RoomEvent.Disconnected, () => {
                setConnectionState(ConnectionState.Disconnected);
            });

            room.on(RoomEvent.ParticipantConnected, (participant) => {
                void participant;
                if (roomRef.current) syncFromRoom(roomRef.current);
            });

            room.on(RoomEvent.ParticipantDisconnected, () => {
                if (roomRef.current) syncFromRoom(roomRef.current);
            });

            room.on(RoomEvent.TrackSubscribed, (track, publication) => {
                attachRemoteTrack(
                    track as Parameters<typeof attachRemoteTrack>[0],
                    publication.source === Track.Source.ScreenShare,
                );
                if (roomRef.current) syncFromRoom(roomRef.current);
            });

            room.on(RoomEvent.TrackUnsubscribed, (track) => {
                const sid = track.sid;
                const remaining: HTMLMediaElement[] = [];
                attachedRef.current.forEach((element) => {
                    if (sid && element.dataset.sid === sid) {
                        element.remove();
                        return;
                    }
                    if (
                        document.body.contains(element) ||
                        remoteFeedRef.current?.contains(element)
                    ) {
                        remaining.push(element);
                    } else {
                        element.remove();
                    }
                });
                attachedRef.current = remaining;
            });

            room.on(RoomEvent.LocalTrackPublished, () => {
                if (roomRef.current) {
                    void attachLocalCamera(roomRef.current);
                    syncFromRoom(roomRef.current);
                }
            });

            room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
                if (publication.source === Track.Source.Camera) {
                    localVideoRef.current
                        ?.querySelectorAll("video")
                        .forEach((node) => node.remove());
                }
                if (roomRef.current) syncFromRoom(roomRef.current);
            });

            room.on(RoomEvent.TrackMuted, (publication, participant) => {
                if (publication.source !== Track.Source.Microphone) return;
                void participant;
                if (roomRef.current) syncFromRoom(roomRef.current);
            });

            room.on(RoomEvent.TrackUnmuted, (publication, participant) => {
                if (publication.source !== Track.Source.Microphone) return;
                void participant;
                if (roomRef.current) syncFromRoom(roomRef.current);
            });

            room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
                const speakingIds = new Set(speakers.map((s) => s.identity));
                setParticipants((prev) =>
                    prev.map((item) => ({
                        ...item,
                        isSpeaking: speakingIds.has(item.identity),
                    })),
                );
            });

            await room.connect(response.serverUrl, response.token);
            if (connectTokenRef.current !== token) {
                room.disconnect();
                return;
            }

            try {
                await room.localParticipant.setCameraEnabled(true);
            } catch (error) {
                console.warn("Camera unavailable:", error);
            }
            try {
                await room.localParticipant.setMicrophoneEnabled(true);
            } catch (error) {
                console.warn("Microphone unavailable:", error);
            }

            if (connectTokenRef.current !== token) {
                room.disconnect();
                return;
            }

            await attachLocalCamera(room);
            syncFromRoom(room);
            setElapsed(0);
            setIsJoining(false);
        } catch (error) {
            if (connectTokenRef.current !== token) return;
            const message =
                error instanceof Error ? error.message : "Không thể tham gia cuộc họp";
            setJoinError(message);
            setIsJoining(false);
            setConnectionState(ConnectionState.Disconnected);
        }
    }, [
        attachLocalCamera,
        attachRemoteTrack,
        clearAttachments,
        meetingRoomId,
        syncFromRoom,
    ]);

    useEffect(() => {
        // LiveKit join is an external async session; first setState runs after await.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void connect();
        return () => {
            connectTokenRef.current += 1;
            clearAttachments();
            roomRef.current?.disconnect();
            roomRef.current = null;
        };
    }, [connect, clearAttachments]);

    useEffect(() => {
        if (
            connectionState !== ConnectionState.Connected ||
            joinError ||
            hasEnded
        ) {
            return;
        }
        const interval = window.setInterval(() => {
            setElapsed((value) => value + 1);
            if (endsAt && Date.now() >= endsAt) {
                setHasEnded(true);
                roomRef.current?.disconnect();
                roomRef.current = null;
                clearAttachments();
            }
        }, 1000);
        return () => window.clearInterval(interval);
    }, [connectionState, joinError, hasEnded, endsAt, clearAttachments]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setShowLeaveModal(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const status = statusConfig[connectionState] ?? statusConfig[ConnectionState.Disconnected];
    const remoteParticipants = participants.filter((item) => !item.isLocal);
    const activeRemote =
        remoteParticipants.find((item) => item.isSpeaking) ?? remoteParticipants[0];
    const localName = user?.name || "Bạn";
    const localInitials = initialsOf(localName);

    if (hasEnded) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-[#2b3234] p-6 text-center text-[#f4fafd]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F38181]/20 text-[#F38181]">
                    <PhoneOff className="h-7 w-7" />
                </div>
                <h1 className="text-xl font-bold">Buổi học đã kết thúc</h1>
                <p className="max-w-md text-sm text-[#dcc0bf]">
                    Khung giờ học đã hết. Cảm ơn bạn đã tham gia.
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/", { replace: true })}
                    className="rounded-full bg-[#F38181] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#9e3f42]"
                >
                    Về trang chủ
                </button>
            </div>
        );
    }

    if (joinError) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-[#2b3234] p-6 text-center text-[#f4fafd]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F38181]/20 text-[#F38181]">
                    <WifiOff className="h-7 w-7" />
                </div>
                <h1 className="text-xl font-bold">Không thể tham gia buổi học</h1>
                <p className="max-w-md text-sm text-[#dcc0bf]">{joinError}</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setJoinError(null);
                            setIsJoining(true);
                            void connect();
                        }}
                        className="rounded-full bg-[#F38181] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#9e3f42]"
                    >
                        Thử lại
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex select-none flex-col overflow-hidden bg-[#2b3234] text-[#f4fafd]">
            <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#2b3234]/90 px-4 backdrop-blur-md sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-md">
                            <span className="text-sm font-black text-[#9e3f42]">PiE</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-none tracking-tight text-white">
                                PiEMind
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a4f1e3]">
                                Lớp học trực tiếp
                            </span>
                        </div>
                    </div>
                    <div className="hidden h-5 w-px bg-white/10 md:block" />
                    <div className="hidden items-center gap-3 lg:flex">
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#89d4c7]" />
                            <span>Tiếng Anh 1 kèm 1</span>
                            {roomName && (
                                <>
                                    <span className="text-white/40">•</span>
                                    <span className="text-white/80">Phòng {roomName}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-bold tracking-wide text-[#fae189]">
                            <span>{formatElapsed(elapsed)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                        <div className="flex h-3.5 items-end gap-0.5">
                            <span
                                className={`h-1.5 w-1 rounded-full ${
                                    connectionState === ConnectionState.Connected
                                        ? "bg-[#a4f1e3]"
                                        : "bg-white/30"
                                }`}
                            />
                            <span
                                className={`h-2 w-1 rounded-full ${
                                    connectionState === ConnectionState.Connected
                                        ? "bg-[#a4f1e3]"
                                        : "bg-white/30"
                                }`}
                            />
                            <span
                                className={`h-2.5 w-1 rounded-full ${
                                    connectionState === ConnectionState.Connected
                                        ? "bg-[#a4f1e3]"
                                        : "bg-white/30"
                                }`}
                            />
                            <span
                                className={`h-3.5 w-1 rounded-full ${
                                    connectionState === ConnectionState.Connected
                                        ? "bg-[#a4f1e3]"
                                        : "bg-white/30"
                                }`}
                            />
                        </div>
                        <span className={`flex items-center gap-1 font-semibold ${status.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot} animate-pulse`} />
                            {status.label}
                        </span>
                        <Wifi className={`h-3.5 w-3.5 ${status.text}`} />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen((open) => !open)}
                        title="Bật/tắt ghi chú bài học"
                        className="relative rounded-full bg-white/10 p-2 text-white/90 transition hover:bg-white/20"
                    >
                        <StickyNote className="h-5 w-5" />
                        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#F38181] ring-2 ring-[#2b3234]" />
                    </button>
                </div>
            </header>

            <div className="relative flex min-h-0 flex-1 gap-3 p-3">
                <div
                    ref={remoteStageRef}
                    className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/50 shadow-2xl ring-2 ring-[#a4f1e3]/60"
                >
                    <div
                        ref={remoteFeedRef}
                        className="absolute inset-0 flex items-center justify-center bg-black/60"
                    />

                    {isJoining && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#2b3234]/80">
                            <Loader2 className="h-8 w-8 animate-spin text-[#a4f1e3]" />
                            <p className="text-sm text-white/80">Đang tham gia lớp học…</p>
                        </div>
                    )}

                    {!isJoining && !activeRemote && (
                        <div className="flex flex-col items-center gap-3 text-white/70">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-2xl font-bold">
                                …
                            </div>
                            <p className="text-sm">Đang chờ người tham gia còn lại…</p>
                        </div>
                    )}

                    {activeRemote?.isSpeaking && (
                        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3.5 py-1.5 shadow-lg backdrop-blur">
                            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#a4f1e3]" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#a4f1e3]">
                                {activeRemote.isLocal ? "Bạn" : "Giáo viên"} đang nói
                            </span>
                        </div>
                    )}

                    {activeRemote && (
                        <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 rounded-xl border border-white/10 bg-black/70 px-4 py-2.5 shadow-lg backdrop-blur">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9e3f42]/30 text-sm font-bold text-[#ffb3b1]">
                                {initialsOf(activeRemote.name)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">
                                    {activeRemote.name}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-white/70">
                                    {activeRemote.hasMic ? (
                                        <Mic className="h-3 w-3 text-[#a4f1e3]" />
                                    ) : (
                                        <MicOff className="h-3 w-3 text-[#F38181]" />
                                    )}
                                    {activeRemote.hasCam ? "Đã bật camera" : "Đã tắt camera"}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="absolute right-6 top-6 z-20 h-40 w-56 overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-xl sm:bottom-24 sm:right-8 sm:top-auto">
                        <div
                            ref={localVideoRef}
                            className="absolute inset-0 flex items-center justify-center bg-[#2b3234]"
                        />
                        {!isCamOn && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2b3234]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                                    {localInitials}
                                </div>
                                <span className="text-xs font-semibold text-white">
                                    {localName}
                                </span>
                                <span className="text-[10px] text-white/60">Đã tắt camera</span>
                            </div>
                        )}
                        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                            <span className="h-2 w-2 rounded-full bg-[#a4f1e3]" />
                            <span>Bạn ({localName})</span>
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-white/90">
                                {isMicOn ? (
                                    <Mic className="h-3.5 w-3.5 text-[#a4f1e3]" />
                                ) : (
                                    <MicOff className="h-3.5 w-3.5 text-[#F38181]" />
                                )}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-white/60">
                                Học viên
                            </span>
                        </div>
                    </div>
                </div>

                {isDrawerOpen && (
                    <aside className="hidden h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#2b3234]/95 shadow-2xl backdrop-blur-xl md:flex xl:w-96">
                        <div className="flex items-center justify-between border-b border-white/10 p-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fae189]/20 text-[#fae189]">
                                    <StickyNote className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold leading-none text-white">
                                        Ghi chú bài học
                                    </h4>
                                    <span className="text-[10px] text-[#a4f1e3]">
                                        Chỉ mình bạn thấy
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="rounded-full p-1 text-white/60 transition hover:text-white"
                                title="Đóng bảng"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
                            <section className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-bold text-white">
                                        <Users className="h-4 w-4 text-[#a4f1e3]" />
                                        Người tham gia
                                    </span>
                                    <span className="rounded-full bg-[#89d4c7]/20 px-2 py-0.5 text-[10px] font-bold text-[#a4f1e3]">
                                        {participants.length} trong phòng
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                    {participants.map((participant) => (
                                        <li
                                            key={participant.identity}
                                            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                                                participant.isSpeaking
                                                    ? "bg-[#a4f1e3]/15 ring-1 ring-[#a4f1e3]/40"
                                                    : "bg-white/5"
                                            }`}
                                        >
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9e3f42]/25 text-[10px] font-bold text-[#ffb3b1]">
                                                {initialsOf(participant.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-white">
                                                    {participant.name}
                                                    {participant.isLocal && (
                                                        <span className="ml-1 text-[10px] font-normal text-white/50">
                                                            (bạn)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {participant.hasMic ? (
                                                <Mic className="h-3.5 w-3.5 text-[#a4f1e3]" />
                                            ) : (
                                                <MicOff className="h-3.5 w-3.5 text-[#F38181]" />
                                            )}
                                            {participant.hasCam ? (
                                                <Video className="h-3.5 w-3.5 text-[#a4f1e3]" />
                                            ) : (
                                                <VideoOff className="h-3.5 w-3.5 text-white/40" />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                                <div className="mb-2 font-bold text-white">
                                    Ghi chú chung
                                </div>
                                <Textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Nhập ghi chú riêng hoặc các biểu đạt hữu ích tại đây…"
                                    className="h-36 resize-none border-white/10 bg-black/30 text-xs text-white placeholder:text-white/40 focus-visible:ring-[#a4f1e3]/40"
                                />
                            </section>
                        </div>
                    </aside>
                )}
            </div>

            <footer className="z-30 flex h-20 shrink-0 items-center justify-center px-4 pb-2">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#2b3234]/90 px-4 py-2.5 shadow-2xl backdrop-blur-2xl">
                    <button
                        type="button"
                        onClick={() => void toggleMicrophone()}
                        disabled={connectionState !== ConnectionState.Connected}
                        title="Bật/tắt mic"
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                            isMicOn
                                ? "bg-white/10 text-[#a4f1e3] hover:bg-white/20"
                                : "bg-[#F38181] text-white hover:bg-[#9e3f42]"
                        } disabled:opacity-50`}
                    >
                        {isMicOn ? (
                            <Mic className="h-5 w-5" />
                        ) : (
                            <MicOff className="h-5 w-5" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => void toggleCamera()}
                        disabled={connectionState !== ConnectionState.Connected}
                        title="Bật/tắt camera"
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                            isCamOn
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-[#F38181] text-white hover:bg-[#9e3f42]"
                        } disabled:opacity-50`}
                    >
                        {isCamOn ? (
                            <Video className="h-5 w-5" />
                        ) : (
                            <VideoOff className="h-5 w-5" />
                        )}
                    </button>

                    <div className="mx-1 h-6 w-px bg-white/20" />

                    <button
                        type="button"
                        onClick={() => void toggleScreenShare()}
                        disabled={connectionState !== ConnectionState.Connected}
                        title="Chia sẻ màn hình"
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                            isScreenShareOn
                                ? "bg-[#a4f1e3] text-[#00201c] hover:bg-[#89d4c7]"
                                : "bg-white/10 text-white hover:bg-white/20"
                        } disabled:opacity-50`}
                    >
                        {isScreenShareOn ? (
                            <ScreenShareOff className="h-5 w-5" />
                        ) : (
                            <ScreenShare className="h-5 w-5" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen((open) => !open)}
                        title="Bật/tắt ghi chú"
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                            isDrawerOpen
                                ? "bg-[#fae189]/25 text-[#fae189]"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                    >
                        <StickyNote className="h-5 w-5" />
                    </button>

                    <div className="mx-1 h-6 w-px bg-white/20" />

                    <button
                        type="button"
                        onClick={() => setShowLeaveModal(true)}
                        title="Rời buổi học"
                        className="flex h-12 items-center gap-2 rounded-full bg-[#F38181] px-5 font-bold text-white shadow-lg shadow-[#9e3f42]/40 transition hover:scale-105 hover:bg-[#9e3f42] active:scale-95"
                    >
                        <PhoneOff className="h-5 w-5" />
                        <span className="hidden text-sm tracking-wide sm:inline">Rời</span>
                    </button>
                </div>
            </footer>

            {showLeaveModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#2b3234] p-6 text-center shadow-2xl">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F38181]/20 text-[#F38181]">
                            <PhoneOff className="h-6 w-6" />
                        </div>
                        <h3 className="mb-1 text-lg font-bold text-white">Rời buổi học?</h3>
                        <p className="mb-6 text-xs text-white/60">
                            Phiên học sẽ kết thúc đối với tất cả mọi người. Bạn vẫn có thể tham
                            gia lại trong khi khung giờ đặt lịch còn hiệu lực.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLeaveModal(false)}
                                className="flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                            >
                                Ở lại lớp
                            </button>
                            <button
                                type="button"
                                onClick={leaveMeeting}
                                className="flex-1 rounded-xl bg-[#F38181] px-3 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#9e3f42]"
                            >
                                Rời ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
