export declare class CreateFacilityDto {
    name: string;
    type: string;
    registrationNo?: string;
    licenseNo?: string;
    licenseExpiry?: string;
    address?: string;
    phone?: string;
    email?: string;
    status?: string;
    services?: string[];
    legalInfo?: Record<string, unknown>;
}
