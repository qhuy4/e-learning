import { Badge } from "@fe/components/ui/badge";
import { ShieldCheck, Clock, Video } from "lucide-react";

interface BookingHeroProps {
    mentorName: string;
}

export function BookingHero({ mentorName }: BookingHeroProps) {
    return (
        <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground font-semibold px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5"
                >
                    <ShieldCheck className="size-3.5" />
                    100% Free · No Card Required
                </Badge>
                <Badge
                    variant="outline"
                    className="bg-card text-foreground border-border font-semibold px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5"
                >
                    <Clock className="size-3.5 text-muted-foreground" />
                    Flexible Duration
                </Badge>
                <Badge
                    variant="outline"
                    className="bg-card text-foreground border-border font-semibold px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5"
                >
                    <Video className="size-3.5 text-muted-foreground" />
                    Live 1-on-1 Web Video Room
                </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Book Free Discovery Session
            </h1>
            <p className="mt-2.5 max-w-3xl text-muted-foreground text-base leading-relaxed">
                Meet 1-on-1 with {mentorName} to assess your conversational flow,
                pinpoint hesitation blockers, and map your personalized roadmap
                with zero commitment.
            </p>
        </header>
    );
}
