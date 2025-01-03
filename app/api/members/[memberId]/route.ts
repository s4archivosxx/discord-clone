import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string }}
) {
    try{
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const serverId = searchParams.get("serverId");
        if (!serverId) {
            return new NextResponse("[SERVER_MISSING]", { status: 400 });
        }

        if (!params.memberId) {
            return new NextResponse("[MEMBER_MISSING]", { status: 400 });
        }
        
        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        });
        return NextResponse.json(server);
    } catch (error){
        console.log("[MEMBERS_ID_DELETE", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
};

export async function PATCH(
    req: Request,
    { params }: { params: { membersId: string } }
 ) {
    try{
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const { role } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const serverId = searchParams.get("serverId");
        if (!serverId) {
            return new NextResponse("[SERVER_MISSING]", { status: 400 });
        }

        if (!params.membersId) {
            return new NextResponse("[MEMBER_MISSING]", { status: 400 });
        }
        
        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: params.membersId,
                            profileId: {
                                not: profile.id
                            }
                        },
                        data: {
                            role
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        });
        return NextResponse.json(server);
    } catch (error){
        console.log("[MEMBERS_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
 }