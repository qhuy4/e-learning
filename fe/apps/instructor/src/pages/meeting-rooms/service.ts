import {instructorRootApi} from "@/shared/lib/axios.ts";

export interface JoinMeetingRoomResponse {
    token: string;
    roomName: string;
    serverUrl: string;
    endsAt: string;
}

export async function joinMeetingRoom(meetingRoomId: number) {
    const { data } = await instructorRootApi.post<{
        data: JoinMeetingRoomResponse;
    }>(`/meeting/${meetingRoomId}/join`);

    return data.data;
}