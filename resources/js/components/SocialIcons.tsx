import { cn } from '@/lib/utils';

type Props = { className?: string };

export function FacebookIcon({ className }: Props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn('size-4', className)}
            aria-hidden="true"
        >
            <path d="M13.6 21v-7.4h2.5l.4-2.9h-2.9V8.9c0-.8.2-1.4 1.4-1.4h1.6V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2h-2.6v2.9h2.6V21z" />
        </svg>
    );
}

export function InstagramIcon({ className }: Props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-4', className)}
            aria-hidden="true"
        >
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
    );
}

export function YoutubeIcon({ className }: Props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn('size-4', className)}
            aria-hidden="true"
        >
            <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z" />
        </svg>
    );
}
