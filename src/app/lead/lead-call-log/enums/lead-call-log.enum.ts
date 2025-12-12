export enum CallDirection {
    INCOMING = 'INCOMING',
    OUTGOING = 'OUTGOING',
}

export enum CallStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    MISSED = 'MISSED',
}

export enum UserRoles {
    ADMIN = 'ADMIN',
    RM = 'RM',
    STAFF = 'STAFF',
    MARKETING = 'MARKETING',
}

export enum CallSource {
    SYSTEM = 'SYSTEM',
    INCOMING = 'INCOMING',
}

export enum CallFailReason {
    NO_ANSWER = 'NO_ANSWER',
    BUSY = 'BUSY',
    SWITCHED_OFF = 'SWITCHED_OFF',
    NOT_REACHABLE = 'NOT_REACHABLE',
}
