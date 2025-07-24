import { Injectable } from "@nestjs/common";

@Injectable()
export class HelperService {
    public parseGpsCode(gps_code: string): { latitude: number; longitude: number } {
        const [latStr, lonStr] = gps_code.split(',').map((s) => s.trim());

        const parseCoord = (coordStr: string): number => {
            const value = parseFloat(coordStr);
            const isSouthOrWest = /[SW]$/.test(coordStr.toUpperCase());
            return isSouthOrWest ? -value : value;
        };

        return {
            latitude: parseCoord(latStr),
            longitude: parseCoord(lonStr),
        };
    }

    public haversineDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371; // Earth's radius in km
        const toRad = (value: number) => (value * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // distance in km
    }

}